"""Tests for Simulation APIs (SIM-001–SIM-004, PRD BR-SIM-001–004/007/008, BR-WHATIF-001–006, AC-SIM-01/02, AC-WHATIF-01/02).

Covers:
- Simulation engine logic across horizons (30, 90, 180 days).
- What-if engine recalculation and baseline comparison.
- Service-level error handling and profile validation.
- Route security (401 unauthenticated, 403 missing consent, 404 missing profile).
- Request validation (422) and future default horizon (90 days).
- Response contract consistency (AC-SIM-02, SIM-004: "Response konsisten").
- What-if performance target < 1 second (SIM-004, PRD §13.2.2).
- Non-mutation of user's persistent profile (BR-SIM-007, BR-WHATIF-003).
"""

import time
import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from app.core.risk_engine import risk_engine
from app.db.models.consent import Consent
from app.db.models.health_profile import HealthProfile
from app.db.models.user import User
from app.main import app
from app.schemas.simulation import (
    MANDATORY_MEDICAL_DISCLAIMER,
    FutureSimulationRequest,
    WhatIfSimulationRequest,
)
from app.services.simulation_service import simulation_service

# ── 1. Simulation Engine Unit Tests ──────────────────────────────────────────


def test_simulation_engine_30_90_180_days():
    """Future simulation calculates trajectories correctly for 30, 90, and 180 days."""
    profile = HealthProfile(
        age=35,
        gender="male",
        height_cm=Decimal("172.0"),
        weight_kg=Decimal("70.0"),
        bmi=Decimal("23.6"),
        physical_activity_min_per_week=Decimal("180.0"),
        sleep_duration_hours=Decimal("7.5"),
        smoking_status="never",
        family_history=False,
        stress_level=3,
    )

    for horizon in [30, 90, 180]:
        result = risk_engine.simulate_future_trajectory(profile, horizon)
        assert result["horizon_days"] == horizon
        assert len(result["assumptions"]) >= 3
        assert 0.0 <= result["baseline_health_score"] <= 100.0
        assert 0.0 <= result["projected_health_score"] <= 100.0
        assert 0.0 <= result["baseline_lifestyle_score"] <= 100.0
        assert 0.0 <= result["projected_lifestyle_score"] <= 100.0
        assert result["is_model_estimated"] is True
        assert result["disclaimer"] == MANDATORY_MEDICAL_DISCLAIMER

        trajectories = result["risk_trajectories"]
        assert len(trajectories) == 3
        conditions = {t["condition"] for t in trajectories}
        assert conditions == {"diabetes", "hypertension", "cardiovascular"}

        for t in trajectories:
            assert 0.0 <= t["baseline_probability"] <= 1.0
            assert 0.0 <= t["projected_probability"] <= 1.0
            assert t["risk_level"] in ("low", "moderate", "high")
            assert t["risk_label"] in ("Lower", "Moderate", "Higher")
            assert t["trend"] in ("stable", "decreasing", "increasing")


def test_simulation_engine_high_risk_compounding():
    """High-risk habits show compounding trajectory over 180 days."""
    profile = HealthProfile(
        age=55,
        gender="male",
        height_cm=Decimal("170.0"),
        weight_kg=Decimal("92.0"),
        bmi=Decimal("31.8"),
        physical_activity_min_per_week=Decimal("30.0"),
        sleep_duration_hours=Decimal("5.0"),
        smoking_status="current",
        family_history=True,
        stress_level=8,
    )

    res_30 = risk_engine.simulate_future_trajectory(profile, 30)
    res_180 = risk_engine.simulate_future_trajectory(profile, 180)

    # Over 180 days with sustained risk factors, health score does not improve
    assert res_180["projected_health_score"] <= res_30["projected_health_score"]


# ── 2. Service Layer Tests ───────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_service_profile_not_found():
    """Requesting simulation when user has no health profile raises 404."""
    user_id = uuid.uuid4()
    mock_db = AsyncMock()

    with patch(
        "app.services.simulation_service.health_profile_repo.get_by_user_id",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await simulation_service.simulate_future_trajectory(
                mock_db, user_id, FutureSimulationRequest(horizon_days=90)
            )
        assert exc_info.value.status_code == 404
        assert "profil kesehatan belum ditemukan" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_service_successful_simulation():
    """Service returns validated FutureSimulationResponse."""
    user_id = uuid.uuid4()
    mock_db = AsyncMock()
    profile = HealthProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        age=28,
        gender="female",
        height_cm=Decimal("160.0"),
        weight_kg=Decimal("52.0"),
        bmi=Decimal("20.3"),
        physical_activity_min_per_week=Decimal("160.0"),
        sleep_duration_hours=Decimal("7.5"),
        smoking_status="never",
        family_history=False,
    )

    with patch(
        "app.services.simulation_service.health_profile_repo.get_by_user_id",
        new_callable=AsyncMock,
        return_value=profile,
    ):
        res = await simulation_service.simulate_future_trajectory(
            mock_db, user_id, FutureSimulationRequest(horizon_days=90)
        )
        assert res.horizon_days == 90
        assert len(res.risk_trajectories) == 3
        assert res.is_model_estimated is True
        assert len(res.daily_trajectories) == 91
        assert res.daily_trajectories[0].day == 0
        assert res.daily_trajectories[0].health_score == res.baseline_health_score
        assert res.daily_trajectories[-1].day == 90
        assert res.daily_trajectories[-1].health_score == res.projected_health_score


# ── 3. Route Layer Tests (FastAPI Endpoints) ─────────────────────────────────


@pytest.mark.asyncio
async def test_route_simulation_require_auth_401():
    """POST /simulation/future without authentication token returns 401."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        res = await client.post("/api/v1/simulation/future", json={"horizon_days": 90})
        assert res.status_code in (401, 403)


@pytest.mark.asyncio
async def test_route_simulation_invalid_horizon_422():
    """POST /simulation/future with invalid horizon (e.g. 45 days) returns 422."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="sim_test@heliora.health",
        password_hash="hashed",
        full_name="Simulation Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            res = await client.post(
                "/api/v1/simulation/future", json={"horizon_days": 45}
            )
            assert res.status_code == 422
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_route_simulation_success_and_no_mutation():
    """POST /simulation/future succeeds and proves zero profile mutation (BR-SIM-007)."""
    user_id = uuid.uuid4()
    profile_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="sim_valid@heliora.health",
        password_hash="hashed",
        full_name="Simulation Non-Mutation Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=profile_id,
        user_id=user_id,
        age=32,
        gender="male",
        height_cm=Decimal("175.0"),
        weight_kg=Decimal("72.0"),
        bmi=Decimal("23.5"),
        physical_activity_min_per_week=Decimal("150.0"),
        sleep_duration_hours=Decimal("7.0"),
        smoking_status="never",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    "/api/v1/simulation/future", json={"horizon_days": 180}
                )
                assert res.status_code == 200
                data = res.json()
                assert data["horizon_days"] == 180
                assert data["is_model_estimated"] is True
                assert len(data["risk_trajectories"]) == 3

                # Verify profile remains unmodified (BR-SIM-007)
                assert profile.age == 32
                assert profile.weight_kg == Decimal("72.0")
                assert profile.bmi == Decimal("23.5")
                assert profile.physical_activity_min_per_week == Decimal("150.0")
                assert profile.smoking_status == "never"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_route_future_require_consent_403():
    """POST /simulation/future without active consent returns 403 Forbidden."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="consent_sim@heliora.health",
        password_hash="hashed",
        full_name="Simulation Consent Tester",
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user

    async def override_missing_consent():
        raise HTTPException(
            status_code=403,
            detail="Active consent and medical disclaimer agreement required",
        )

    app.dependency_overrides[require_active_consent] = override_missing_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            res = await client.post(
                "/api/v1/simulation/future", json={"horizon_days": 90}
            )
            assert res.status_code == 403
            assert "consent" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_route_future_profile_not_found_404():
    """POST /simulation/future returns 404 when user has no health profile."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="sim_noprof@heliora.health",
        password_hash="hashed",
        full_name="Simulation No-Profile Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=None,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    "/api/v1/simulation/future", json={"horizon_days": 90}
                )
                assert res.status_code == 404
                assert "profil kesehatan" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_route_future_default_horizon_90():
    """POST /simulation/future without horizon_days defaults to 90 days."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="sim_defh@heliora.health",
        password_hash="hashed",
        full_name="Simulation Default Horizon Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        age=35,
        gender="male",
        height_cm=Decimal("172.0"),
        weight_kg=Decimal("70.0"),
        bmi=Decimal("23.6"),
        physical_activity_min_per_week=Decimal("180.0"),
        sleep_duration_hours=Decimal("7.5"),
        smoking_status="never",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post("/api/v1/simulation/future", json={})
                assert res.status_code == 200
                assert res.json()["horizon_days"] == 90
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_route_future_response_contract_consistent():
    """POST /simulation/future returns a stable response contract (AC-SIM-02)."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="sim_contract@heliora.health",
        password_hash="hashed",
        full_name="Simulation Contract Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        age=35,
        gender="male",
        height_cm=Decimal("172.0"),
        weight_kg=Decimal("70.0"),
        bmi=Decimal("23.6"),
        physical_activity_min_per_week=Decimal("180.0"),
        sleep_duration_hours=Decimal("7.5"),
        smoking_status="never",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    "/api/v1/simulation/future", json={"horizon_days": 30}
                )
                assert res.status_code == 200
                data = res.json()

                # Top-level contract: horizon echoed, score pairs, trajectories,
                # assumptions, model-estimated flag, and mandatory disclaimer.
                expected_keys = {
                    "horizon_days",
                    "baseline_health_score",
                    "projected_health_score",
                    "baseline_lifestyle_score",
                    "projected_lifestyle_score",
                    "risk_trajectories",
                    "assumptions",
                    "is_model_estimated",
                    "disclaimer",
                }
                assert expected_keys <= set(data.keys())
                assert data["horizon_days"] == 30
                assert data["is_model_estimated"] is True
                assert len(data["assumptions"]) >= 3
                assert data["disclaimer"] == MANDATORY_MEDICAL_DISCLAIMER

                # Per-condition contract mirrors the FutureSimulationResponse schema.
                assert len(data["risk_trajectories"]) == 3
                for item in data["risk_trajectories"]:
                    assert {
                        "condition",
                        "baseline_probability",
                        "projected_probability",
                        "risk_level",
                        "risk_label",
                        "trend",
                    } <= set(item.keys())
    finally:
        app.dependency_overrides.clear()


# ── 4. What-If Simulation Tests ──────────────────────────────────────────────


def test_what_if_simulation_lifestyle_improvement():
    """What-if simulation recalculates BMI, scores, and deltas when lifestyle improves."""
    profile = HealthProfile(
        age=45,
        gender="male",
        height_cm=Decimal("170.0"),
        weight_kg=Decimal("90.0"),
        bmi=Decimal("31.1"),
        physical_activity_min_per_week=Decimal("45.0"),
        sleep_duration_hours=Decimal("5.5"),
        smoking_status="current",
        family_history=True,
        stress_level=6,
    )

    overrides = {
        "weight_kg": 75.0,
        "physical_activity_min_per_week": 180.0,
        "sleep_duration_hours": 7.5,
        "smoking_status": "never",
    }

    result = risk_engine.simulate_what_if(profile, overrides)

    assert result["derived_bmi"] < float(profile.bmi)
    assert result["simulated_health_score"] > result["baseline_health_score"]
    assert result["simulated_lifestyle_score"] > result["baseline_lifestyle_score"]
    assert result["health_score_delta"] > 0
    assert result["is_model_estimated"] is True
    assert result["disclaimer"] == MANDATORY_MEDICAL_DISCLAIMER

    # All condition risks should decrease
    for comp in result["condition_comparisons"]:
        assert comp["delta_percentage"] <= 0.0
        assert comp["simulated_probability"] <= comp["baseline_probability"]
        assert comp["trend"] in ("decreasing", "stable")


def test_what_if_simulation_no_overrides():
    """What-if simulation without overrides matches baseline values with zero deltas."""
    profile = HealthProfile(
        age=30,
        gender="female",
        height_cm=Decimal("165.0"),
        weight_kg=Decimal("58.0"),
        bmi=Decimal("21.3"),
        physical_activity_min_per_week=Decimal("150.0"),
        sleep_duration_hours=Decimal("7.5"),
        smoking_status="never",
        family_history=False,
    )

    result = risk_engine.simulate_what_if(profile, {})

    assert result["health_score_delta"] == 0.0
    assert result["lifestyle_score_delta"] == 0.0
    assert result["simulated_health_score"] == result["baseline_health_score"]
    for comp in result["condition_comparisons"]:
        assert comp["delta_percentage"] == 0.0
        assert comp["trend"] == "stable"


@pytest.mark.asyncio
async def test_what_if_service_profile_not_found():
    """What-if service raises 404 when profile does not exist."""
    user_id = uuid.uuid4()
    mock_db = AsyncMock()

    with patch(
        "app.services.simulation_service.health_profile_repo.get_by_user_id",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await simulation_service.simulate_what_if(
                mock_db,
                user_id,
                WhatIfSimulationRequest(sleep_duration_hours=8.0),
            )
        assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_what_if_route_require_auth_401():
    """POST /simulation/what-if requires authentication."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        res = await client.post(
            "/api/v1/simulation/what-if", json={"weight_kg": 70.0}
        )
        assert res.status_code in (401, 403)


@pytest.mark.asyncio
async def test_what_if_route_invalid_params_422():
    """POST /simulation/what-if validates parameter bounds."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="whatif_val@heliora.health",
        password_hash="hashed",
        full_name="What-If Validator",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            # sleep_duration_hours must be <= 14.0
            res = await client.post(
                "/api/v1/simulation/what-if",
                json={"sleep_duration_hours": 24.0},
            )
            assert res.status_code == 422

            # weight_kg must be >= 30.0
            res = await client.post(
                "/api/v1/simulation/what-if",
                json={"weight_kg": 15.0},
            )
            assert res.status_code == 422
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_what_if_route_success_and_zero_mutation():
    """POST /simulation/what-if returns comparative response and proves zero DB mutation."""
    user_id = uuid.uuid4()
    profile_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="whatif_exec@heliora.health",
        password_hash="hashed",
        full_name="What-If Exec",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=profile_id,
        user_id=user_id,
        age=40,
        gender="female",
        height_cm=Decimal("160.0"),
        weight_kg=Decimal("78.0"),
        bmi=Decimal("30.5"),
        physical_activity_min_per_week=Decimal("60.0"),
        sleep_duration_hours=Decimal("6.0"),
        smoking_status="current",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    "/api/v1/simulation/what-if",
                    json={
                        "weight_kg": 65.0,
                        "physical_activity_min_per_week": 180.0,
                        "sleep_duration_hours": 8.0,
                        "smoking_status": "never",
                    },
                )
                assert res.status_code == 200
                data = res.json()

                assert data["is_model_estimated"] is True
                assert data["derived_bmi"] < 30.5
                assert data["health_score_delta"] > 0
                assert len(data["condition_comparisons"]) == 3

                # CRITICAL: Verify profile object in memory remains strictly unmodified
                assert profile.weight_kg == Decimal("78.0")
                assert profile.bmi == Decimal("30.5")
                assert profile.physical_activity_min_per_week == Decimal("60.0")
                assert profile.sleep_duration_hours == Decimal("6.0")
                assert profile.smoking_status == "current"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_what_if_route_require_consent_403():
    """POST /simulation/what-if without active consent returns 403 Forbidden."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="consent_whatif@heliora.health",
        password_hash="hashed",
        full_name="What-If Consent Tester",
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user

    async def override_missing_consent():
        raise HTTPException(
            status_code=403,
            detail="Active consent and medical disclaimer agreement required",
        )

    app.dependency_overrides[require_active_consent] = override_missing_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            res = await client.post(
                "/api/v1/simulation/what-if", json={"weight_kg": 70.0}
            )
            assert res.status_code == 403
            assert "consent" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_what_if_route_profile_not_found_404():
    """POST /simulation/what-if returns 404 when user has no health profile."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="whatif_noprof@heliora.health",
        password_hash="hashed",
        full_name="What-If No-Profile Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=None,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    "/api/v1/simulation/what-if", json={"weight_kg": 70.0}
                )
                assert res.status_code == 404
                assert "profil kesehatan" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_what_if_applied_parameters_echo():
    """Only sent overrides are applied; the rest follow the profile (AC-WHATIF-01)."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="whatif_echo@heliora.health",
        password_hash="hashed",
        full_name="What-If Echo Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        age=40,
        gender="female",
        height_cm=Decimal("160.0"),
        weight_kg=Decimal("78.0"),
        bmi=Decimal("30.5"),
        physical_activity_min_per_week=Decimal("60.0"),
        sleep_duration_hours=Decimal("6.0"),
        smoking_status="current",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    "/api/v1/simulation/what-if",
                    json={"sleep_duration_hours": 8.0},
                )
                assert res.status_code == 200
                data = res.json()

                applied = data["applied_parameters"]
                assert applied["sleep_duration_hours"] == 8.0
                assert applied["physical_activity_min_per_week"] == 60.0
                assert applied["weight_kg"] == 78.0
                assert applied["smoking_status"] == "current"
                assert data["derived_bmi"] == 30.5
                assert data["is_model_estimated"] is True
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_what_if_repeated_changes_stable():
    """Repeated what-if calls are stable and never mutate the profile (AC-WHATIF-02)."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="whatif_repeat@heliora.health",
        password_hash="hashed",
        full_name="What-If Repeat Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        age=40,
        gender="female",
        height_cm=Decimal("160.0"),
        weight_kg=Decimal("78.0"),
        bmi=Decimal("30.5"),
        physical_activity_min_per_week=Decimal("60.0"),
        sleep_duration_hours=Decimal("6.0"),
        smoking_status="current",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    payload = {
        "weight_kg": 65.0,
        "physical_activity_min_per_week": 180.0,
        "sleep_duration_hours": 8.0,
        "smoking_status": "never",
    }

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                results = []
                for _ in range(3):
                    res = await client.post("/api/v1/simulation/what-if", json=payload)
                    assert res.status_code == 200
                    results.append(res.json())

                assert results[0] == results[1] == results[2]
                assert results[0]["health_score_delta"] > 0

                # Profile remains strictly unmodified across repeated calls.
                assert profile.weight_kg == Decimal("78.0")
                assert profile.bmi == Decimal("30.5")
                assert profile.physical_activity_min_per_week == Decimal("60.0")
                assert profile.sleep_duration_hours == Decimal("6.0")
                assert profile.smoking_status == "current"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_what_if_route_response_contract_consistent():
    """What-if response carries the stable contract (SIM-004: response konsisten)."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="whatif_contract@heliora.health",
        password_hash="hashed",
        full_name="What-If Contract Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        age=40,
        gender="female",
        height_cm=Decimal("160.0"),
        weight_kg=Decimal("78.0"),
        bmi=Decimal("30.5"),
        physical_activity_min_per_week=Decimal("60.0"),
        sleep_duration_hours=Decimal("6.0"),
        smoking_status="current",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    "/api/v1/simulation/what-if",
                    json={
                        "weight_kg": 65.0,
                        "physical_activity_min_per_week": 180.0,
                        "sleep_duration_hours": 8.0,
                        "smoking_status": "never",
                    },
                )
                assert res.status_code == 200
                data = res.json()

                # Stable raw response_model keys — no envelope.
                assert set(data.keys()) == {
                    "applied_parameters",
                    "derived_bmi",
                    "baseline_health_score",
                    "simulated_health_score",
                    "health_score_delta",
                    "baseline_lifestyle_score",
                    "simulated_lifestyle_score",
                    "lifestyle_score_delta",
                    "condition_comparisons",
                    "is_model_estimated",
                    "disclaimer",
                }
                assert "success" not in data
                assert data["is_model_estimated"] is True
                assert data["disclaimer"] == MANDATORY_MEDICAL_DISCLAIMER

                assert set(data["applied_parameters"].keys()) == {
                    "sleep_duration_hours",
                    "physical_activity_min_per_week",
                    "weight_kg",
                    "smoking_status",
                    "bmi",
                }

                comparisons = data["condition_comparisons"]
                assert len(comparisons) == 3
                assert {c["condition"] for c in comparisons} == {
                    "diabetes",
                    "hypertension",
                    "cardiovascular",
                }
                for c in comparisons:
                    assert 0.0 <= c["baseline_probability"] <= 1.0
                    assert 0.0 <= c["simulated_probability"] <= 1.0
                    assert c["risk_level"] in ("low", "moderate", "high")
                    assert c["risk_label"] in ("Lower", "Moderate", "Higher")
                    assert c["trend"] in ("stable", "increasing", "decreasing")
                    assert isinstance(c["impact_summary"], str)
                    assert len(c["impact_summary"]) > 0
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_what_if_route_performance_target():
    """What-if endpoint answers within the <1s NFR (SIM-004, PRD §13.2.2)."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="whatif_perf@heliora.health",
        password_hash="hashed",
        full_name="What-If Perf Tester",
    )
    dummy_consent = Consent(id=uuid.uuid4(), user_id=user_id, consent_version="1.0")
    profile = HealthProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        age=40,
        gender="female",
        height_cm=Decimal("160.0"),
        weight_kg=Decimal("78.0"),
        bmi=Decimal("30.5"),
        physical_activity_min_per_week=Decimal("60.0"),
        sleep_duration_hours=Decimal("6.0"),
        smoking_status="current",
        family_history=False,
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with patch(
            "app.services.simulation_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                start = time.perf_counter()
                res = await client.post(
                    "/api/v1/simulation/what-if",
                    json={
                        "weight_kg": 65.0,
                        "physical_activity_min_per_week": 180.0,
                        "sleep_duration_hours": 8.0,
                        "smoking_status": "never",
                    },
                )
                elapsed = time.perf_counter() - start

                assert res.status_code == 200
                assert elapsed < 1.0, f"What-if exceeded 1s budget: {elapsed:.3f}s"
    finally:
        app.dependency_overrides.clear()
