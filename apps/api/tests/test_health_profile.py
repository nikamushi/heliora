"""Tests for Health Profile API (BE-003, PRD FR-006, FR-007, FR-008).

Covers biometric input validation, BMI auto-calculation, categories,
CRUD repository/service operations, and endpoint access controls.
"""

import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from app.db.models.consent import Consent
from app.db.models.health_profile import HealthProfile
from app.db.models.user import User
from app.main import app
from app.schemas.health_profile import (
    GenderEnum,
    HealthProfileCreateRequest,
    HealthProfileUpdateRequest,
    SmokingStatusEnum,
    calculate_bmi,
    get_bmi_category,
)
from app.services.health_profile_service import health_profile_service


# ── 1. BMI Calculation & Category Unit Tests ─────────────────────────────────

def test_calculate_bmi():
    """BMI formula: weight (kg) / (height (m) ^ 2) rounded to 1 decimal place."""
    # 70 kg, 175 cm -> 70 / (1.75^2) = 22.857... -> 22.9
    assert calculate_bmi(175.0, 70.0) == 22.9
    # 50 kg, 160 cm -> 50 / (1.6^2) = 19.53... -> 19.5
    assert calculate_bmi(160.0, 50.0) == 19.5
    # Boundary checks
    assert calculate_bmi(0, 70.0) == 0.0
    assert calculate_bmi(175.0, 0) == 0.0


def test_get_bmi_category():
    """WHO and Kemenkes BMI classification ranges."""
    assert get_bmi_category(17.5) == "Underweight"
    assert get_bmi_category(22.0) == "Normal"
    assert get_bmi_category(27.5) == "Overweight"
    assert get_bmi_category(32.0) == "Obesity"
    assert get_bmi_category(None) is None


# ── 2. Pydantic Schema Validation Tests (FR-007) ─────────────────────────────

def test_health_profile_valid_payload():
    """Valid payload instantiates cleanly with default family_history."""
    payload = HealthProfileCreateRequest(
        age=30,
        gender=GenderEnum.MALE,
        height_cm=175.0,
        weight_kg=70.0,
        physical_activity_min_per_week=150.0,
        sleep_duration_hours=7.5,
        smoking_status=SmokingStatusEnum.NEVER,
    )
    assert payload.age == 30
    assert payload.gender == "male"
    assert payload.family_history is False


def test_health_profile_invalid_age():
    """Age must be between 1 and 120."""
    with pytest.raises(ValidationError):
        HealthProfileCreateRequest(
            age=0,
            gender=GenderEnum.MALE,
            height_cm=170.0,
            weight_kg=65.0,
            physical_activity_min_per_week=120.0,
            sleep_duration_hours=8.0,
            smoking_status=SmokingStatusEnum.NEVER,
        )

    with pytest.raises(ValidationError):
        HealthProfileCreateRequest(
            age=150,
            gender=GenderEnum.MALE,
            height_cm=170.0,
            weight_kg=65.0,
            physical_activity_min_per_week=120.0,
            sleep_duration_hours=8.0,
            smoking_status=SmokingStatusEnum.NEVER,
        )


def test_health_profile_invalid_height_and_weight():
    """Height and weight must be strictly positive."""
    with pytest.raises(ValidationError):
        HealthProfileCreateRequest(
            age=25,
            gender=GenderEnum.FEMALE,
            height_cm=0,
            weight_kg=55.0,
            physical_activity_min_per_week=120.0,
            sleep_duration_hours=8.0,
            smoking_status=SmokingStatusEnum.NEVER,
        )

    with pytest.raises(ValidationError):
        HealthProfileCreateRequest(
            age=25,
            gender=GenderEnum.FEMALE,
            height_cm=165.0,
            weight_kg=-5.0,
            physical_activity_min_per_week=120.0,
            sleep_duration_hours=8.0,
            smoking_status=SmokingStatusEnum.NEVER,
        )


def test_health_profile_invalid_sleep_hours():
    """Sleep duration cannot exceed 24 hours per day."""
    with pytest.raises(ValidationError):
        HealthProfileCreateRequest(
            age=25,
            gender=GenderEnum.MALE,
            height_cm=170.0,
            weight_kg=65.0,
            physical_activity_min_per_week=120.0,
            sleep_duration_hours=25.0,
            smoking_status=SmokingStatusEnum.NEVER,
        )


def test_health_profile_invalid_enums():
    """Gender and smoking status must be valid enum members."""
    with pytest.raises(ValidationError):
        HealthProfileCreateRequest(
            age=25,
            gender="alien",  # invalid
            height_cm=170.0,
            weight_kg=65.0,
            physical_activity_min_per_week=120.0,
            sleep_duration_hours=8.0,
            smoking_status=SmokingStatusEnum.NEVER,
        )

    with pytest.raises(ValidationError):
        HealthProfileCreateRequest(
            age=25,
            gender=GenderEnum.MALE,
            height_cm=170.0,
            weight_kg=65.0,
            physical_activity_min_per_week=120.0,
            sleep_duration_hours=8.0,
            smoking_status="occasional",  # invalid
        )


# ── 3. Service Layer Unit Tests (Mock DB) ────────────────────────────────────

@pytest.mark.asyncio
async def test_service_create_profile():
    """Service creates profile, auto-computes BMI, and enriches category."""
    user_id = uuid.uuid4()
    profile_id = uuid.uuid4()
    mock_session = AsyncMock()

    payload = HealthProfileCreateRequest(
        age=32,
        gender=GenderEnum.MALE,
        height_cm=180.0,
        weight_kg=80.0,
        physical_activity_min_per_week=180.0,
        sleep_duration_hours=7.0,
        smoking_status=SmokingStatusEnum.NEVER,
        family_history=True,
        family_history_details="Father had Type 2 Diabetes",
    )

    dummy_profile = HealthProfile(
        id=profile_id,
        user_id=user_id,
        age=32,
        gender="male",
        height_cm=Decimal("180.0"),
        weight_kg=Decimal("80.0"),
        physical_activity_min_per_week=Decimal("180.0"),
        sleep_duration_hours=Decimal("7.0"),
        smoking_status="never",
        family_history=True,
        bmi=Decimal("24.7"),
    )

    with patch(
        "app.services.health_profile_service.health_profile_repo.create_or_update",
        new_callable=AsyncMock,
        return_value=dummy_profile,
    ):
        result = await health_profile_service.create_profile(
            mock_session, user_id, payload
        )
        assert result.id == profile_id
        assert result.bmi == 24.7
        assert result.bmi_category == "Normal"
        assert result.family_history_details == "Father had Type 2 Diabetes"


@pytest.mark.asyncio
async def test_service_update_profile():
    """Service updates existing profile and recalculates BMI."""
    user_id = uuid.uuid4()
    profile_id = uuid.uuid4()
    mock_session = AsyncMock()

    existing_profile = HealthProfile(
        id=profile_id,
        user_id=user_id,
        age=32,
        gender="male",
        height_cm=Decimal("180.0"),
        weight_kg=Decimal("80.0"),
        physical_activity_min_per_week=Decimal("180.0"),
        sleep_duration_hours=Decimal("7.0"),
        smoking_status="never",
        family_history=False,
        bmi=Decimal("24.7"),
    )

    updated_profile = HealthProfile(
        id=profile_id,
        user_id=user_id,
        age=32,
        gender="male",
        height_cm=Decimal("180.0"),
        weight_kg=Decimal("95.0"),  # increased weight
        physical_activity_min_per_week=Decimal("180.0"),
        sleep_duration_hours=Decimal("7.0"),
        smoking_status="never",
        family_history=False,
        bmi=Decimal("29.3"),  # now Overweight
    )

    update_payload = HealthProfileUpdateRequest(weight_kg=95.0)

    with (
        patch(
            "app.services.health_profile_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=existing_profile,
        ),
        patch(
            "app.services.health_profile_service.health_profile_repo.update",
            new_callable=AsyncMock,
            return_value=updated_profile,
        ),
    ):
        result = await health_profile_service.update_profile(
            mock_session, user_id, update_payload
        )
        assert result.weight_kg == 95.0
        assert result.bmi == 29.3
        assert result.bmi_category == "Overweight"


@pytest.mark.asyncio
async def test_service_update_not_found():
    """Updating a non-existent profile raises 404 HTTPException."""
    user_id = uuid.uuid4()
    mock_session = AsyncMock()

    with patch(
        "app.services.health_profile_service.health_profile_repo.get_by_user_id",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await health_profile_service.update_profile(
                mock_session, user_id, HealthProfileUpdateRequest(age=25)
            )
        assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_service_get_profile_not_found():
    """Retrieving a non-existent profile raises 404 HTTPException."""
    user_id = uuid.uuid4()
    mock_session = AsyncMock()

    with patch(
        "app.services.health_profile_service.health_profile_repo.get_by_user_id",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await health_profile_service.get_profile(mock_session, user_id)
        assert exc_info.value.status_code == 404


# ── 4. Route Layer Tests (Dependency Injection / Overrides) ──────────────────

@pytest.mark.asyncio
async def test_routes_require_consent_403():
    """Accessing POST /health-profile without active consent returns 403."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="consent_test@heliora.health",
        password_hash="hashed",
        full_name="Consent Tester",
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    # Simulate missing/revoked consent
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
                "/api/v1/health-profile",
                json={
                    "age": 30,
                    "gender": "male",
                    "height_cm": 175.0,
                    "weight_kg": 70.0,
                    "physical_activity_min_per_week": 150.0,
                    "sleep_duration_hours": 7.0,
                    "smoking_status": "never",
                },
            )
            assert res.status_code == 403
            assert "consent" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_routes_crud_flow_with_consent():
    """End-to-end endpoint test: POST, GET, PUT with active consent."""
    user_id = uuid.uuid4()
    profile_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="flow_test@heliora.health",
        password_hash="hashed",
        full_name="Flow Tester",
    )
    dummy_consent = Consent(
        id=uuid.uuid4(),
        user_id=user_id,
        consent_version="1.0",
    )

    mock_profile = HealthProfile(
        id=profile_id,
        user_id=user_id,
        age=28,
        gender="female",
        height_cm=Decimal("165.0"),
        weight_kg=Decimal("55.0"),
        physical_activity_min_per_week=Decimal("120.0"),
        sleep_duration_hours=Decimal("8.0"),
        smoking_status="never",
        family_history=False,
        bmi=Decimal("20.2"),
    )

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            # 1. POST /api/v1/health-profile
            with patch(
                "app.services.health_profile_service.health_profile_repo.create_or_update",
                new_callable=AsyncMock,
                return_value=mock_profile,
            ):
                post_res = await client.post(
                    "/api/v1/health-profile",
                    json={
                        "age": 28,
                        "gender": "female",
                        "height_cm": 165.0,
                        "weight_kg": 55.0,
                        "physical_activity_min_per_week": 120.0,
                        "sleep_duration_hours": 8.0,
                        "smoking_status": "never",
                    },
                )
                assert post_res.status_code == 201
                data = post_res.json()
                assert data["bmi"] == 20.2
                assert data["bmi_category"] == "Normal"

            # 2. GET /api/v1/health-profile
            with patch(
                "app.services.health_profile_service.health_profile_repo.get_by_user_id",
                new_callable=AsyncMock,
                return_value=mock_profile,
            ):
                get_res = await client.get("/api/v1/health-profile")
                assert get_res.status_code == 200
                assert get_res.json()["age"] == 28

            # 3. PUT /api/v1/health-profile
            updated_profile = HealthProfile(
                id=profile_id,
                user_id=user_id,
                age=29,  # aged 1 year
                gender="female",
                height_cm=Decimal("165.0"),
                weight_kg=Decimal("55.0"),
                physical_activity_min_per_week=Decimal("120.0"),
                sleep_duration_hours=Decimal("8.0"),
                smoking_status="never",
                family_history=False,
                bmi=Decimal("20.2"),
            )
            with (
                patch(
                    "app.services.health_profile_service.health_profile_repo.get_by_user_id",
                    new_callable=AsyncMock,
                    return_value=mock_profile,
                ),
                patch(
                    "app.services.health_profile_service.health_profile_repo.update",
                    new_callable=AsyncMock,
                    return_value=updated_profile,
                ),
            ):
                put_res = await client.put(
                    "/api/v1/health-profile",
                    json={"age": 29},
                )
                assert put_res.status_code == 200
                assert put_res.json()["age"] == 29
    finally:
        app.dependency_overrides.clear()
