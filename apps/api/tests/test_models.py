"""Tests for SQLAlchemy models and metadata completeness (DB-001)."""

import uuid

from app.db.base import Base
from app.db.models import (
    Assessment,
    Evidence,
    HealthProfile,
    Recommendation,
    RiskResult,
    Simulation,
    User,
    XAIResult,
)


def test_models_metadata():
    """Verify all 9 core entities are registered in Base.metadata."""
    expected_tables = {
        "users",
        "consents",
        "health_profiles",
        "assessments",
        "risk_results",
        "xai_results",
        "simulations",
        "recommendations",
        "evidence",
    }
    actual_tables = set(Base.metadata.tables.keys())
    assert expected_tables.issubset(actual_tables), (
        f"Missing tables: {expected_tables - actual_tables}"
    )


def test_model_instantiation():
    """Verify models can be instantiated with appropriate attributes."""
    user = User(
        email="test@heliora.health",
        password_hash="hashed_pw_test",
        full_name="Dr. Jane Doe",
    )
    assert user.email == "test@heliora.health"
    assert user.full_name == "Dr. Jane Doe"

    profile = HealthProfile(
        user_id=uuid.uuid4(),
        age=32,
        gender="female",
        height_cm=165.0,
        weight_kg=60.0,
        physical_activity_min_per_week=180.0,
        sleep_duration_hours=7.5,
        smoking_status="never",
        family_history=False,
    )
    assert profile.age == 32
    assert profile.gender == "female"
    assert profile.smoking_status == "never"

    assessment = Assessment(
        user_id=uuid.uuid4(),
        health_profile_id=uuid.uuid4(),
        status="pending",
    )
    assert assessment.status == "pending"

    risk = RiskResult(
        assessment_id=uuid.uuid4(),
        diabetes_risk=0.12,
        hypertension_risk=0.18,
        cardiovascular_risk=0.08,
        health_score=85.0,
        lifestyle_score=88.5,
        model_version="1.0.0",
    )
    assert risk.health_score == 85.0
    assert risk.lifestyle_score == 88.5

    xai = XAIResult(
        risk_result_id=uuid.uuid4(),
        feature_name="physical_activity_min_per_week",
        contribution=-0.15,
        direction="negative",
        rank=1,
    )
    assert xai.direction == "negative"
    assert xai.rank == 1

    sim = Simulation(
        assessment_id=uuid.uuid4(),
        simulation_type="what_if",
        horizon_days=90,
        input_snapshot={"physical_activity_min_per_week": 240.0},
        output_snapshot={"simulated_health_score": 90.0},
    )
    assert sim.simulation_type == "what_if"

    rec = Recommendation(
        assessment_id=uuid.uuid4(),
        rule_id="REC-ACT-001",
        title="Maintain Aerobic Activity",
        description="Aim for at least 150-300 minutes of moderate activity weekly.",
        guideline_source="WHO 2020 Physical Activity Guidelines",
        priority="medium",
    )
    assert rec.rule_id == "REC-ACT-001"

    ev = Evidence(
        recommendation_id=uuid.uuid4(),
        title="WHO Guidelines on Physical Activity and Sedentary Behaviour",
        publisher="World Health Organization",
        source_url="https://www.who.int/publications/i/item/9789240015128",
        summary=(
            "Regular physical activity is proven to prevent and help "
            "manage noncommunicable diseases."
        ),
    )
    assert ev.publisher == "World Health Organization"
