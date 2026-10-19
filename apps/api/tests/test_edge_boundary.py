"""Boundary & extreme value tests (QA-002.1, TASK.md QA-001 / QA-002).

Offline/deterministic: no DB, no network. Covers TC-EXT-01..08:
- Schema boundaries/extremes -> accepted at the edge, HTTP 422 / ValidationError beyond
- BMI calculation at extreme height/weight combinations
- Blood pressure parsing with malformed / extreme strings
- Risk engine (risks, scores, factors, recommendations, simulations) never
  produces NaN/Infinity or out-of-range output for extreme profiles
- What-if endpoint never answers HTTP 500 for extreme-but-valid inputs
"""

import math
import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from app.api.dependencies import get_current_user, get_db, require_active_consent
from app.core.risk_engine import risk_engine
from app.core.vitals import parse_blood_pressure
from app.db.models.consent import Consent
from app.db.models.health_profile import HealthProfile
from app.db.models.user import User
from app.main import app
from app.schemas.health_profile import (
    GenderEnum,
    HealthProfileCreateRequest,
    SmokingStatusEnum,
    calculate_bmi,
    get_bmi_category,
)
from app.schemas.simulation import WhatIfSimulationRequest
from app.services.simulation_service import simulation_service

# ── Helpers ──────────────────────────────────────────────────────────────────


def _create_payload(**overrides) -> HealthProfileCreateRequest:
    data = {
        "age": 30,
        "gender": GenderEnum.MALE,
        "height_cm": 170.0,
        "weight_kg": 65.0,
        "physical_activity_min_per_week": 120.0,
        "sleep_duration_hours": 7.5,
        "smoking_status": SmokingStatusEnum.NEVER,
    }
    data.update(overrides)
    return HealthProfileCreateRequest(**data)


def _profile(**overrides) -> HealthProfile:
    height = overrides.pop("height_cm", "170.0")
    weight = overrides.pop("weight_kg", "65.0")
    bmi = overrides.pop("bmi", None)
    data = {
        "id": uuid.uuid4(),
        "user_id": uuid.uuid4(),
        "age": 35,
        "gender": "male",
        "height_cm": Decimal(str(height)),
        "weight_kg": Decimal(str(weight)),
        "bmi": Decimal(str(bmi)) if bmi is not None else None,
        "physical_activity_min_per_week": Decimal("120.0"),
        "sleep_duration_hours": Decimal("7.5"),
        "smoking_status": "never",
        "family_history": False,
    }
    data.update(overrides)
    return HealthProfile(**data)


def _assert_finite_unit(value: float) -> None:
    assert isinstance(value, float)
    assert math.isfinite(value)
    assert 0.0 <= value <= 1.0


def _assert_finite_score(value: float) -> None:
    assert math.isfinite(value)
    assert 0.0 <= value <= 100.0


def _assert_engine_outputs_sane(profile: HealthProfile) -> None:
    """Run the same engine pipeline as the assessment flow and check output."""
    risks = risk_engine.estimate_risks(profile)
    assert set(risks) == {"diabetes_risk", "hypertension_risk", "cardiovascular_risk"}
    for value in risks.values():
        _assert_finite_unit(value)
        assert 0.01 <= value <= 0.95

    _assert_finite_score(risk_engine.calculate_health_score(profile, risks))
    _assert_finite_score(risk_engine.calculate_lifestyle_score(profile))

    assert isinstance(risk_engine.extract_top_factors(profile, risks), list)
    assert isinstance(risk_engine.generate_recommendations(profile), list)

    for horizon in (30, 90, 180):
        result = risk_engine.simulate_future_trajectory(profile, horizon)
        _assert_finite_score(result["baseline_health_score"])
        _assert_finite_score(result["projected_health_score"])
        for trajectory in result["risk_trajectories"]:
            _assert_finite_unit(trajectory["projected_probability"])
            assert math.isfinite(trajectory["delta_percentage"])
            assert trajectory["trend"] in {"stable", "increasing", "decreasing"}


def _override_dependencies(user_id: uuid.UUID) -> None:
    user = User(
        id=user_id,
        email=f"edge_{user_id.hex[:8]}@heliora.health",
        password_hash="hashed",
        full_name="Edge Case Tester",
    )
    consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[require_active_consent] = lambda: consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()


async def _post_what_if(profile: HealthProfile | None, body: dict):
    _override_dependencies(uuid.uuid4())
    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                return await client.post("/api/v1/simulation/what-if", json=body)
    finally:
        app.dependency_overrides.clear()


# ── TC-EXT-01 / TC-EXT-02 / TC-EXT-03: BMI extremes ──────────────────────────


def test_bmi_extreme_high_is_computed_and_obese():
    """TC-EXT-01: 300 kg at 140 cm -> BMI 153.1, Obesity."""
    bmi = calculate_bmi(140.0, 300.0)
    assert bmi == 153.1
    assert get_bmi_category(bmi) == "Obesity"


def test_bmi_extreme_low_is_computed_and_underweight():
    """TC-EXT-02: 30 kg at 200 cm -> BMI 7.5, Underweight."""
    bmi = calculate_bmi(200.0, 30.0)
    assert bmi == 7.5
    assert get_bmi_category(bmi) == "Underweight"


@pytest.mark.parametrize(
    ("height", "weight"), [(0, 70.0), (170.0, 0), (-1, 70.0), (170.0, -5.0), (0, 0)]
)
def test_bmi_non_positive_inputs_return_zero_not_error(height, weight):
    """TC-EXT-03: zero/negative never divides by zero; returns 0.0."""
    assert calculate_bmi(height, weight) == 0.0


@pytest.mark.parametrize("bmi", [None, 0, -3.0])
def test_bmi_category_none_for_missing_or_invalid(bmi):
    assert get_bmi_category(bmi) is None


@pytest.mark.parametrize(
    ("bmi", "expected"),
    [
        (18.4, "Underweight"),
        (18.5, "Normal"),
        (24.9, "Normal"),
        (25.0, "Overweight"),
        (29.9, "Overweight"),
        (30.0, "Obesity"),
    ],
)
def test_bmi_category_boundaries(bmi, expected):
    assert get_bmi_category(bmi) == expected


@pytest.mark.parametrize(
    "overrides",
    [
        {"height_cm": 0},
        {"height_cm": -170.0},
        {"weight_kg": 0},
        {"weight_kg": -5.0},
    ],
)
def test_create_schema_rejects_zero_and_negative_body_metrics(overrides):
    """TC-EXT-03: schema rejects (HTTP 422 at the route layer)."""
    with pytest.raises(ValidationError):
        _create_payload(**overrides)


# ── TC-EXT-07 / TC-EXT-08: profile schema boundaries ─────────────────────────


@pytest.mark.parametrize(
    "overrides",
    [
        {"age": 1},
        {"age": 120},
        {"height_cm": 300.0},
        {"weight_kg": 500.0},
        {"physical_activity_min_per_week": 0.0},
        {"physical_activity_min_per_week": 10080.0},
        {"sleep_duration_hours": 0.0},
        {"sleep_duration_hours": 24.0},
        {"stress_level": 1},
        {"stress_level": 10},
    ],
)
def test_create_schema_accepts_inclusive_boundaries(overrides):
    assert _create_payload(**overrides) is not None


@pytest.mark.parametrize(
    "overrides",
    [
        {"age": 0},
        {"age": 121},
        {"height_cm": 300.1},
        {"weight_kg": 500.1},
        {"physical_activity_min_per_week": -0.1},
        {"physical_activity_min_per_week": 10080.1},
        {"sleep_duration_hours": -0.1},
        {"sleep_duration_hours": 24.1},
        {"stress_level": 0},
        {"stress_level": 11},
        {"bmi": 100.1},
        {"blood_sugar_mg_dl": 1000.1},
        {"cholesterol_mg_dl": 1000.1},
    ],
)
def test_create_schema_rejects_values_just_beyond_boundaries(overrides):
    with pytest.raises(ValidationError):
        _create_payload(**overrides)


# ── TC-EXT-04 / TC-EXT-05: blood pressure parsing ────────────────────────────


@pytest.mark.parametrize(
    "raw",
    ["120", "abc/def", "120/", "/80", "120-80", "", None, "   ", "abc", "/"],
)
def test_parse_blood_pressure_malformed_yields_none_pair(raw):
    """TC-EXT-04 / AC-03."""
    assert parse_blood_pressure(raw) == (None, None)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [("260/160", (260.0, 160.0)), ("40/20", (40.0, 20.0)), ("0/0", (0.0, 0.0))],
)
def test_parse_blood_pressure_extreme_values_parse(raw, expected):
    """TC-EXT-05."""
    assert parse_blood_pressure(raw) == expected


# ── Engine robustness for extreme profiles (AC-02, AC-03, AC-04) ─────────────


@pytest.mark.parametrize(
    "overrides",
    [
        pytest.param(
            {"height_cm": "140.0", "weight_kg": "300.0", "bmi": "153.1"},
            id="bmi-153",
        ),
        pytest.param(
            {"height_cm": "200.0", "weight_kg": "30.0", "bmi": "7.5"}, id="bmi-7.5"
        ),
        pytest.param({"bmi": None}, id="bmi-missing"),
        pytest.param({"age": 1}, id="age-1"),
        pytest.param({"age": 120}, id="age-120"),
        pytest.param(
            {"physical_activity_min_per_week": Decimal("0.0")}, id="activity-0"
        ),
        pytest.param(
            {"physical_activity_min_per_week": Decimal("10080.0")}, id="activity-max"
        ),
        pytest.param({"sleep_duration_hours": Decimal("0.0")}, id="sleep-0"),
        pytest.param({"sleep_duration_hours": Decimal("24.0")}, id="sleep-24"),
        pytest.param({"blood_pressure": "260/160"}, id="bp-extreme-high"),
        pytest.param({"blood_pressure": "40/20"}, id="bp-extreme-low"),
        pytest.param({"blood_pressure": "abc/def"}, id="bp-garbage"),
        pytest.param({"blood_pressure": "120-80"}, id="bp-wrong-separator"),
        pytest.param({"blood_pressure": ""}, id="bp-empty"),
        pytest.param({"blood_pressure": "nan/nan"}, id="bp-nan"),
        pytest.param({"blood_pressure": "inf/inf"}, id="bp-inf"),
        pytest.param({"blood_sugar_mg_dl": Decimal("1000.0")}, id="sugar-max"),
        pytest.param({"cholesterol_mg_dl": Decimal("1000.0")}, id="cholesterol-max"),
        pytest.param(
            {
                "age": 120,
                "height_cm": "140.0",
                "weight_kg": "300.0",
                "bmi": "153.1",
                "physical_activity_min_per_week": Decimal("0.0"),
                "sleep_duration_hours": Decimal("0.0"),
                "smoking_status": "current",
                "family_history": True,
                "stress_level": 10,
                "blood_pressure": "260/160",
                "blood_sugar_mg_dl": Decimal("1000.0"),
                "cholesterol_mg_dl": Decimal("1000.0"),
            },
            id="everything-worst-case",
        ),
    ],
)
def test_engine_outputs_stay_finite_and_bounded(overrides):
    _assert_engine_outputs_sane(_profile(**overrides))


def test_engine_extreme_obesity_is_not_lower_risk_than_normal_bmi():
    normal = risk_engine.estimate_risks(_profile(bmi="22.0"))
    extreme = risk_engine.estimate_risks(
        _profile(height_cm="140.0", weight_kg="300.0", bmi="153.1")
    )
    assert extreme["diabetes_risk"] >= normal["diabetes_risk"]
    assert extreme["hypertension_risk"] >= normal["hypertension_risk"]


def test_engine_extreme_high_blood_pressure_raises_hypertension_risk():
    baseline = risk_engine.estimate_risks(_profile(blood_pressure="115/75"))
    extreme = risk_engine.estimate_risks(_profile(blood_pressure="260/160"))
    assert extreme["hypertension_risk"] > baseline["hypertension_risk"]


def test_engine_unparseable_blood_pressure_equals_missing_blood_pressure():
    missing = risk_engine.estimate_risks(_profile(blood_pressure=None))
    for raw in ("abc/def", "120-80", "", "120/"):
        assert risk_engine.estimate_risks(_profile(blood_pressure=raw)) == missing


# ── TC-EXT-06: what-if activity boundaries (engine) ──────────────────────────


@pytest.mark.parametrize("activity", [0.0, 1000.0])
def test_what_if_activity_boundaries_produce_valid_deltas(activity):
    result = risk_engine.simulate_what_if(
        _profile(), {"physical_activity_min_per_week": activity}
    )
    assert math.isfinite(result["health_score_delta"])
    assert math.isfinite(result["lifestyle_score_delta"])
    assert result["applied_parameters"]["physical_activity_min_per_week"] == activity
    for comparison in result["condition_comparisons"]:
        assert math.isfinite(comparison["delta_percentage"])
        assert comparison["trend"] in {"stable", "increasing", "decreasing"}
        _assert_finite_unit(comparison["simulated_probability"])


def test_what_if_1000_minutes_is_not_worse_than_0_minutes():
    zero = risk_engine.simulate_what_if(
        _profile(), {"physical_activity_min_per_week": 0.0}
    )
    full = risk_engine.simulate_what_if(
        _profile(), {"physical_activity_min_per_week": 1000.0}
    )
    assert full["simulated_health_score"] >= zero["simulated_health_score"]
    assert full["simulated_lifestyle_score"] >= zero["simulated_lifestyle_score"]
    by_cond_zero = {c["condition"]: c for c in zero["condition_comparisons"]}
    by_cond_full = {c["condition"]: c for c in full["condition_comparisons"]}
    for cond in ("diabetes", "cardiovascular"):
        assert (
            by_cond_full[cond]["simulated_probability"]
            <= by_cond_zero[cond]["simulated_probability"]
        )


def test_what_if_activity_zero_trend_is_increasing_for_active_user():
    """An active user dropping to 0 min/week must not read as improvement."""
    active = _profile(physical_activity_min_per_week=Decimal("300.0"))
    result = risk_engine.simulate_what_if(active, {"physical_activity_min_per_week": 0})
    assert result["health_score_delta"] < 0
    trends = {c["trend"] for c in result["condition_comparisons"]}
    assert "increasing" in trends
    assert "decreasing" not in trends


def test_what_if_does_not_mutate_profile():
    profile = _profile()
    before = (profile.weight_kg, profile.physical_activity_min_per_week)
    risk_engine.simulate_what_if(
        profile, {"weight_kg": 300.0, "physical_activity_min_per_week": 1000.0}
    )
    assert (profile.weight_kg, profile.physical_activity_min_per_week) == before


# ── What-if request schema boundaries (TC-EXT-06 / TC-EXT-08) ────────────────


@pytest.mark.parametrize(
    "body",
    [
        {"physical_activity_min_per_week": 0.0},
        {"physical_activity_min_per_week": 1000.0},
        {"sleep_duration_hours": 3.0},
        {"sleep_duration_hours": 14.0},
        {"weight_kg": 30.0},
        {"weight_kg": 300.0},
        {},
    ],
)
def test_what_if_schema_accepts_inclusive_boundaries(body):
    assert WhatIfSimulationRequest(**body) is not None


@pytest.mark.parametrize(
    "body",
    [
        {"physical_activity_min_per_week": -0.1},
        {"physical_activity_min_per_week": 1000.1},
        {"physical_activity_min_per_week": 1001},
        {"sleep_duration_hours": 2.9},
        {"sleep_duration_hours": 14.1},
        {"sleep_duration_hours": 0},
        {"sleep_duration_hours": 24},
        {"weight_kg": 29.9},
        {"weight_kg": 300.1},
        {"weight_kg": 0},
        {"weight_kg": -5},
        {"smoking_status": "occasional"},
        {"smoking_status": ""},
    ],
)
async def test_what_if_route_rejects_out_of_range_with_422(body):
    """AC-01: out-of-range -> 422 (never 500)."""
    response = await _post_what_if(_profile(), body)
    assert response.status_code == 422


async def test_what_if_route_rejects_non_numeric_input_with_422():
    response = await _post_what_if(
        _profile(), {"physical_activity_min_per_week": "banyak"}
    )
    assert response.status_code == 422


# ── What-if route: valid extremes must never be HTTP 500 (AC-02/03/04) ───────


@pytest.mark.parametrize("activity", [0.0, 1000.0])
async def test_what_if_route_activity_boundaries_return_200(activity):
    response = await _post_what_if(
        _profile(), {"physical_activity_min_per_week": activity}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["applied_parameters"]["physical_activity_min_per_week"] == activity
    for comparison in data["condition_comparisons"]:
        assert math.isfinite(comparison["delta_percentage"])
        assert comparison["trend"] in {"stable", "increasing", "decreasing"}


async def test_what_if_route_extreme_bmi_high_beyond_range_returns_422():
    """TC-EXT-01 via what-if: 300 kg on a 140 cm profile -> BMI 153.1 (> 80).

    Valid on its own, but unsupported by the scenario model (What-If.md §3.3):
    must be a clear 422, never an HTTP 500.
    """
    profile = _profile(height_cm="140.0", weight_kg="60.0", bmi="30.6")
    response = await _post_what_if(profile, {"weight_kg": 300.0})
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert "153.1" in detail
    assert "10" in detail
    assert "80" in detail


async def test_what_if_route_extreme_bmi_low_beyond_range_returns_422():
    """TC-EXT-02 via what-if: 30 kg on a 200 cm profile -> BMI 7.5 (< 10)."""
    profile = _profile(height_cm="200.0", weight_kg="80.0", bmi="20.0")
    response = await _post_what_if(profile, {"weight_kg": 30.0})
    assert response.status_code == 422
    assert "7.5" in response.json()["detail"]


async def test_what_if_route_extreme_supported_bmi_high_returns_200():
    """300 kg on a 200 cm profile -> BMI 75.0: extreme but supported."""
    profile = _profile(height_cm="200.0", weight_kg="90.0", bmi="22.5")
    response = await _post_what_if(profile, {"weight_kg": 300.0})
    assert response.status_code == 200
    data = response.json()
    assert data["derived_bmi"] == 75.0
    for comparison in data["condition_comparisons"]:
        _assert_finite_unit(comparison["simulated_probability"])
        assert math.isfinite(comparison["delta_percentage"])


@pytest.mark.parametrize(
    ("height", "weight", "expected_bmi", "expected_status"),
    [
        ("200.0", 40.0, 10.0, 200),  # exact lower bound accepted
        ("200.0", 39.0, 9.8, 422),  # below lower bound rejected
        ("100.0", 80.0, 80.0, 200),  # exact upper bound accepted
        ("100.0", 80.1, 80.1, 422),  # above upper bound rejected
    ],
)
async def test_what_if_derived_bmi_exact_range_edges(
    height, weight, expected_bmi, expected_status
):
    """Derived BMI range is inclusive on 10.0 and 80.0 (docs/What-If.md §3.3)."""
    profile = _profile(height_cm=height, weight_kg="60.0", bmi="20.0")
    response = await _post_what_if(profile, {"weight_kg": weight})
    assert response.status_code == expected_status
    if expected_status == 200:
        assert response.json()["derived_bmi"] == expected_bmi
    else:
        assert str(expected_bmi) in response.json()["detail"]


@pytest.mark.parametrize("blood_pressure", ["abc", "120-80", "", "260/160", "40/20"])
async def test_what_if_route_weird_blood_pressure_on_profile_returns_200(
    blood_pressure,
):
    """AC-03: unusual stored blood pressure must not break simulation."""
    response = await _post_what_if(
        _profile(blood_pressure=blood_pressure), {"sleep_duration_hours": 8.0}
    )
    assert response.status_code == 200


@pytest.mark.parametrize("blood_pressure", ["abc", "120-80", "", "260/160", "40/20"])
async def test_future_route_weird_blood_pressure_on_profile_returns_200(
    blood_pressure,
):
    """AC-03 for the future-simulation endpoint."""
    _override_dependencies(uuid.uuid4())
    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=_profile(blood_pressure=blood_pressure),
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                response = await client.post(
                    "/api/v1/simulation/future", json={"horizon_days": 180}
                )
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 200


async def test_what_if_service_unsupported_bmi_raises_422_not_validation_error():
    """Service must raise HTTPException(422), never leak pydantic ValidationError."""
    profile = _profile(height_cm="140.0", weight_kg="60.0", bmi="30.6")
    with patch(
        "app.services.simulation_service.health_profile_repo.get_by_user_id",
        new_callable=AsyncMock,
        return_value=profile,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await simulation_service.simulate_what_if(
                AsyncMock(), uuid.uuid4(), WhatIfSimulationRequest(weight_kg=300.0)
            )
    assert exc_info.value.status_code == 422


# ── BMI storage overflow guard (NUMERIC(4,1) -> max 999.9) ───────────────────


@pytest.mark.parametrize(("height", "weight"), [(1.0, 500.0), (70.0, 500.0)])
def test_create_schema_rejects_bmi_beyond_storage_limit(height, weight):
    """Extreme height/weight combos would overflow health_profiles.bmi."""
    with pytest.raises(ValidationError) as exc_info:
        _create_payload(height_cm=height, weight_kg=weight)
    assert "BMI" in str(exc_info.value)


@pytest.mark.parametrize(
    ("height", "weight", "expected_bmi"),
    [(71.0, 500.0, 991.9), (140.0, 300.0, 153.1)],
)
def test_create_schema_accepts_extreme_but_storable_bmi(height, weight, expected_bmi):
    """TC-EXT-01: BMI 153.1 is accepted; limit is the storage ceiling only."""
    payload = _create_payload(height_cm=height, weight_kg=weight)
    assert calculate_bmi(payload.height_cm, payload.weight_kg) == expected_bmi


async def test_create_route_rejects_unstorable_bmi_with_422():
    """POST /health-profile must be 422, never a DB overflow 500."""
    _override_dependencies(uuid.uuid4())
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            response = await client.post(
                "/api/v1/health-profile",
                json={
                    "age": 30,
                    "gender": "male",
                    "height_cm": 1,
                    "weight_kg": 500,
                    "physical_activity_min_per_week": 0,
                    "sleep_duration_hours": 7,
                    "smoking_status": "never",
                },
            )
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 422
    assert "BMI" in response.text


def _stored_profile() -> HealthProfile:
    return _profile(height_cm="180.0", weight_kg="80.0", bmi="24.7")


@pytest.mark.parametrize(
    "update",
    [
        {"height_cm": 1.0},  # merged with stored 80 kg
        {"weight_kg": 500.0, "height_cm": 70.0},  # both sent
    ],
)
async def test_update_service_rejects_unstorable_merged_bmi(update):
    from app.schemas.health_profile import HealthProfileUpdateRequest
    from app.services.health_profile_service import health_profile_service

    repo_update = AsyncMock()
    with (
        patch(
            "app.services.health_profile_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=_stored_profile(),
        ),
        patch(
            "app.services.health_profile_service.health_profile_repo.update",
            repo_update,
        ),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await health_profile_service.update_profile(
                AsyncMock(), uuid.uuid4(), HealthProfileUpdateRequest(**update)
            )
    assert exc_info.value.status_code == 422
    assert "BMI" in exc_info.value.detail
    repo_update.assert_not_awaited()


async def test_update_service_allows_storable_and_non_bmi_updates():
    from app.schemas.health_profile import HealthProfileUpdateRequest
    from app.services.health_profile_service import health_profile_service

    stored = _stored_profile()
    for update in ({"weight_kg": 95.0}, {"age": 40}, {"sleep_duration_hours": 8.0}):
        repo_update = AsyncMock(return_value=stored)
        with (
            patch(
                "app.services.health_profile_service.health_profile_repo.get_by_user_id",
                new_callable=AsyncMock,
                return_value=stored,
            ),
            patch(
                "app.services.health_profile_service.health_profile_repo.update",
                repo_update,
            ),
        ):
            await health_profile_service.update_profile(
                AsyncMock(), uuid.uuid4(), HealthProfileUpdateRequest(**update)
            )
        repo_update.assert_awaited_once()
