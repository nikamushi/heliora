"""Tests for Lifestyle Score calculation (AI-005, PRD §11.5.2, BR-SCORE-004/005/006).

Covers PRD-aligned weighted scoring in
PreventiveLifestyleRiskEngine.calculate_lifestyle_score:
BMI 30%, activity 25%, sleep 20%, smoking 15%, Other (stress) 10%,
with weight renormalization when stress level is absent.
"""

from decimal import Decimal

from app.core.risk_engine import risk_engine
from app.db.models.health_profile import HealthProfile


def _profile(**overrides) -> HealthProfile:
    """Build a near-optimal profile; individual tests override single factors."""
    base = {
        "age": 30,
        "gender": "female",
        "height_cm": Decimal("165.0"),
        "weight_kg": Decimal("58.0"),
        "bmi": Decimal("21.3"),
        "physical_activity_min_per_week": Decimal("200.0"),
        "sleep_duration_hours": Decimal("8.0"),
        "smoking_status": "never",
        "family_history": False,
        "stress_level": 2,
    }
    base.update(overrides)
    return HealthProfile(**base)


def test_lifestyle_score_all_optimal_is_100():
    assert risk_engine.calculate_lifestyle_score(_profile()) == 100.0


def test_lifestyle_score_all_worst_is_11():
    profile = _profile(
        bmi=Decimal("35.0"),
        physical_activity_min_per_week=Decimal("0.0"),
        sleep_duration_hours=Decimal("3.0"),
        smoking_status="current",
        stress_level=10,
    )
    assert risk_engine.calculate_lifestyle_score(profile) == 11.0


def test_lifestyle_score_bmi_dominates_weight():
    optimal = risk_engine.calculate_lifestyle_score(_profile())
    obese = risk_engine.calculate_lifestyle_score(_profile(bmi=Decimal("32.0")))
    assert obese == 76.0
    assert optimal - obese == 24.0


def test_lifestyle_score_activity_linear_to_150_min():
    assert (
        risk_engine.calculate_lifestyle_score(
            _profile(physical_activity_min_per_week=Decimal("75.0"))
        )
        == 87.5
    )
    assert (
        risk_engine.calculate_lifestyle_score(
            _profile(physical_activity_min_per_week=Decimal("0.0"))
        )
        == 75.0
    )


def test_lifestyle_score_sleep_tiers():
    assert (
        risk_engine.calculate_lifestyle_score(
            _profile(sleep_duration_hours=Decimal("9.0"))
        )
        == 100.0
    )
    assert (
        risk_engine.calculate_lifestyle_score(
            _profile(sleep_duration_hours=Decimal("6.5"))
        )
        == 94.0
    )
    assert (
        risk_engine.calculate_lifestyle_score(
            _profile(sleep_duration_hours=Decimal("5.5"))
        )
        == 88.0
    )
    assert (
        risk_engine.calculate_lifestyle_score(
            _profile(sleep_duration_hours=Decimal("4.0"))
        )
        == 82.0
    )


def test_lifestyle_score_smoking_status():
    assert (
        risk_engine.calculate_lifestyle_score(_profile(smoking_status="former")) == 94.0
    )
    assert (
        risk_engine.calculate_lifestyle_score(_profile(smoking_status="current"))
        == 85.0
    )


def test_lifestyle_score_stress_tiers():
    assert risk_engine.calculate_lifestyle_score(_profile(stress_level=5)) == 96.0
    assert risk_engine.calculate_lifestyle_score(_profile(stress_level=8)) == 93.0


def test_lifestyle_score_renormalizes_when_stress_absent():
    assert risk_engine.calculate_lifestyle_score(_profile(stress_level=None)) == 100.0
    profile = _profile(
        physical_activity_min_per_week=Decimal("75.0"),
        sleep_duration_hours=Decimal("5.5"),
        smoking_status="former",
        stress_level=None,
    )
    assert risk_engine.calculate_lifestyle_score(profile) == 66.1


def test_lifestyle_score_falls_back_when_bmi_absent():
    assert risk_engine.calculate_lifestyle_score(_profile(bmi=None)) == 100.0


def test_lifestyle_score_deterministic_for_same_input():
    profile = _profile(
        bmi=Decimal("28.7"),
        physical_activity_min_per_week=Decimal("45.0"),
        sleep_duration_hours=Decimal("5.5"),
        smoking_status="current",
        stress_level=8,
    )
    assert risk_engine.calculate_lifestyle_score(
        profile
    ) == risk_engine.calculate_lifestyle_score(profile)
