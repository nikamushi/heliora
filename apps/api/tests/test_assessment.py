"""Tests for Health Assessment API (BE-004, PRD FR-042, Architecture §6.6, §8).

Covers Preventive Lifestyle Risk Engine calculations, score derivations,
top factor attribution, recommendation generation, and API endpoint security/access controls.
"""

import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from app.core.risk_engine import risk_engine
from app.db.models.assessment import Assessment
from app.db.models.consent import Consent
from app.db.models.health_profile import HealthProfile
from app.db.models.recommendation import Recommendation
from app.db.models.risk_result import RiskResult
from app.db.models.user import User
from app.main import app
from app.services.assessment_service import assessment_service


# ── 1. Risk Engine Unit Tests ────────────────────────────────────────────────

def test_risk_engine_healthy_profile():
    """Healthy profile produces low risk and high health/lifestyle scores."""
    profile = HealthProfile(
        age=26,
        gender="female",
        height_cm=Decimal("165.0"),
        weight_kg=Decimal("54.0"),
        bmi=Decimal("19.8"),
        physical_activity_min_per_week=Decimal("200.0"),
        sleep_duration_hours=Decimal("8.0"),
        smoking_status="never",
        family_history=False,
        stress_level=2,
    )

    risks = risk_engine.estimate_risks(profile)
    assert 0.01 <= risks["diabetes_risk"] <= 0.20
    assert 0.01 <= risks["hypertension_risk"] <= 0.20
    assert 0.01 <= risks["cardiovascular_risk"] <= 0.20

    health_score = risk_engine.calculate_health_score(risks)
    assert health_score >= 80.0

    lifestyle_score = risk_engine.calculate_lifestyle_score(profile)
    assert lifestyle_score >= 85.0


def test_risk_engine_high_risk_profile():
    """Unhealthy profile produces elevated risks and lower scores."""
    profile = HealthProfile(
        age=58,
        gender="male",
        height_cm=Decimal("170.0"),
        weight_kg=Decimal("98.0"),
        bmi=Decimal("33.9"),
        physical_activity_min_per_week=Decimal("30.0"),
        sleep_duration_hours=Decimal("5.0"),
        smoking_status="current",
        family_history=True,
        stress_level=8,
        blood_pressure="150/95",
        blood_sugar_mg_dl=Decimal("140.0"),
        cholesterol_mg_dl=Decimal("250.0"),
    )

    risks = risk_engine.estimate_risks(profile)
    assert risks["diabetes_risk"] > 0.40
    assert risks["hypertension_risk"] > 0.40
    assert risks["cardiovascular_risk"] > 0.40

    health_score = risk_engine.calculate_health_score(risks)
    assert health_score < 60.0

    lifestyle_score = risk_engine.calculate_lifestyle_score(profile)
    assert lifestyle_score < 40.0


def test_risk_engine_factors_and_recommendations():
    """Factors and recommendations capture primary lifestyle deficits."""
    profile = HealthProfile(
        age=45,
        gender="male",
        height_cm=Decimal("172.0"),
        weight_kg=Decimal("85.0"),
        bmi=Decimal("28.7"),
        physical_activity_min_per_week=Decimal("45.0"),
        sleep_duration_hours=Decimal("5.5"),
        smoking_status="current",
        family_history=True,
        stress_level=8,
    )

    risks = risk_engine.estimate_risks(profile)
    factors = risk_engine.extract_top_factors(profile, risks)
    assert len(factors) >= 3
    # Check that BMI and smoking are among top risk factors
    features = [f.feature for f in factors]
    assert "bmi" in features
    assert "smoking_status" in features

    recs = risk_engine.generate_recommendations(profile)
    assert len(recs) >= 3
    rec_rules = [r["rule_id"] for r in recs]
    assert "REC-ACT-01" in rec_rules  # Activity
    assert "REC-SMK-01" in rec_rules  # Smoking
    assert "REC-NUT-01" in rec_rules  # Nutrition/BMI


# ── 2. Service Layer Tests (Mock DB) ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_service_run_assessment_no_profile_raises_400():
    """Running assessment without health profile raises 400 Bad Request."""
    user_id = uuid.uuid4()
    mock_session = AsyncMock()

    with patch(
        "app.services.assessment_service.health_profile_repo.get_by_user_id",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await assessment_service.run_assessment(mock_session, user_id)
        assert exc_info.value.status_code == 400
        assert "profil kesehatan" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_service_run_assessment_success():
    """Running assessment persists session, risk result, and recommendations."""
    user_id = uuid.uuid4()
    profile_id = uuid.uuid4()
    assessment_id = uuid.uuid4()
    mock_session = AsyncMock()

    profile = HealthProfile(
        id=profile_id,
        user_id=user_id,
        age=30,
        gender="male",
        height_cm=Decimal("175.0"),
        weight_kg=Decimal("70.0"),
        bmi=Decimal("22.9"),
        physical_activity_min_per_week=Decimal("150.0"),
        sleep_duration_hours=Decimal("7.5"),
        smoking_status="never",
        family_history=False,
    )

    assessment = Assessment(
        id=assessment_id,
        user_id=user_id,
        health_profile_id=profile_id,
        status="completed",
    )

    risk_result = RiskResult(
        assessment_id=assessment_id,
        diabetes_risk=Decimal("0.0500"),
        hypertension_risk=Decimal("0.0800"),
        cardiovascular_risk=Decimal("0.0400"),
        health_score=Decimal("89.5"),
        lifestyle_score=Decimal("92.0"),
    )

    recs = [
        Recommendation(
            id=uuid.uuid4(),
            assessment_id=assessment_id,
            rule_id="REC-GEN-01",
            title="Pertahankan Pola Hidup Sehat",
            description="Lanjutkan rutinitas aktivitas fisik.",
            guideline_source="Kemenkes RI",
            priority="low",
        )
    ]

    with (
        patch(
            "app.services.assessment_service.health_profile_repo.get_by_user_id",
            new_callable=AsyncMock,
            return_value=profile,
        ),
        patch(
            "app.services.assessment_service.assessment_repo.create_assessment",
            new_callable=AsyncMock,
            return_value=assessment,
        ),
        patch(
            "app.services.assessment_service.assessment_repo.create_risk_result",
            new_callable=AsyncMock,
            return_value=risk_result,
        ),
        patch(
            "app.services.assessment_service.assessment_repo.create_recommendations",
            new_callable=AsyncMock,
            return_value=recs,
        ),
        patch(
            "app.services.assessment_service.assessment_repo.commit_assessment_transaction",
            new_callable=AsyncMock,
            return_value=assessment,
        ),
    ):
        result = await assessment_service.run_assessment(mock_session, user_id)
        assert result.id == str(assessment_id)
        assert result.user_id == str(user_id)
        assert result.health_score > 0
        assert len(result.risks) == 3


@pytest.mark.asyncio
async def test_service_get_latest_not_found():
    """Retrieving latest assessment when none exist raises 404."""
    user_id = uuid.uuid4()
    mock_session = AsyncMock()

    with patch(
        "app.services.assessment_service.assessment_repo.get_latest_by_user_id",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await assessment_service.get_latest_assessment(mock_session, user_id)
        assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_service_get_by_id_not_found():
    """Retrieving non-existent assessment by ID raises 404."""
    user_id = uuid.uuid4()
    assessment_id = uuid.uuid4()
    mock_session = AsyncMock()

    with patch(
        "app.services.assessment_service.assessment_repo.get_by_id_and_user_id",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await assessment_service.get_assessment_by_id(
                mock_session, assessment_id, user_id
            )
        assert exc_info.value.status_code == 404


# ── 3. Route Layer Tests (FastAPI Dependency Injection) ──────────────────────

@pytest.mark.asyncio
async def test_routes_assessment_require_consent_403():
    """POST /assessment without active consent returns 403 Forbidden."""
    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="consent_ass@heliora.health",
        password_hash="hashed",
        full_name="Assessment Consent Tester",
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
            res = await client.post("/api/v1/assessment")
            assert res.status_code == 403
            assert "consent" in res.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_routes_assessment_e2e_flow():
    """E2E flow: POST /assessment, GET /assessment/latest, and GET /assessment/{id}."""
    user_id = uuid.uuid4()
    assessment_id = uuid.uuid4()
    profile_id = uuid.uuid4()

    dummy_user = User(
        id=user_id,
        email="ass_flow@heliora.health",
        password_hash="hashed",
        full_name="Assessment Flow Tester",
    )
    dummy_consent = Consent(
        id=uuid.uuid4(),
        user_id=user_id,
        consent_version="1.0",
    )

    assessment = Assessment(
        id=assessment_id,
        user_id=user_id,
        health_profile_id=profile_id,
        status="completed",
    )
    assessment.risk_result = RiskResult(
        assessment_id=assessment_id,
        diabetes_risk=Decimal("0.1200"),
        hypertension_risk=Decimal("0.1500"),
        cardiovascular_risk=Decimal("0.0800"),
        health_score=Decimal("88.0"),
        lifestyle_score=Decimal("85.0"),
    )
    assessment.recommendations = []
    assessment.health_profile = None

    from app.api.dependencies import get_current_user, get_db, require_active_consent

    app.dependency_overrides[get_current_user] = lambda: dummy_user
    app.dependency_overrides[require_active_consent] = lambda: dummy_consent
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            # 1. POST /api/v1/assessment
            with patch(
                "app.services.assessment_service.assessment_service.run_assessment",
                new_callable=AsyncMock,
                return_value=assessment_service._format_assessment_response(assessment),
            ):
                post_res = await client.post("/api/v1/assessment")
                assert post_res.status_code == 201
                post_data = post_res.json()
                assert post_data["id"] == str(assessment_id)
                assert post_data["health_score"] == 88.0
                assert len(post_data["risks"]) == 3

            # 2. GET /api/v1/assessment/latest
            with patch(
                "app.services.assessment_service.assessment_repo.get_latest_by_user_id",
                new_callable=AsyncMock,
                return_value=assessment,
            ):
                latest_res = await client.get("/api/v1/assessment/latest")
                assert latest_res.status_code == 200
                assert latest_res.json()["id"] == str(assessment_id)

            # 3. GET /api/v1/assessment/{assessment_id}
            with patch(
                "app.services.assessment_service.assessment_repo.get_by_id_and_user_id",
                new_callable=AsyncMock,
                return_value=assessment,
            ):
                by_id_res = await client.get(f"/api/v1/assessment/{assessment_id}")
                assert by_id_res.status_code == 200
                assert by_id_res.json()["id"] == str(assessment_id)
    finally:
        app.dependency_overrides.clear()
