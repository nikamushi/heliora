"""Tests for hybrid Health Score calculation (AI-004 rework, PRD §11.5.3, docs/Health-Score.md).

Covers PRD §11.5.3 hybrid scoring in
PreventiveLifestyleRiskEngine.calculate_health_score(profile, risks):

    Health Score = 0.50 * Lifestyle Component
                 + 0.35 * Risk Component
                 + 0.15 * Improvement Component

Lifestyle = calculate_lifestyle_score(profile) (0-100, AI-005).
Risk      = 100 - (diabetes*35 + hypertension*35 + cardiovascular*30) (0-100).
Improvement = family-history protective score: 100 without history, 40 with.

Range validity, boundary values, determinism, monotonicity, and finite
float output are verified against hand-computed expectations.
"""

import math
from decimal import Decimal

import pytest

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


def _worst_profile() -> HealthProfile:
    """Build a maximally burdened profile with family history present."""
    return _profile(
        bmi=Decimal("35.0"),
        physical_activity_min_per_week=Decimal("0.0"),
        sleep_duration_hours=Decimal("3.0"),
        smoking_status="current",
        family_history=True,
        stress_level=10,
    )


ZERO_RISKS = {
    "diabetes_risk": 0.0,
    "hypertension_risk": 0.0,
    "cardiovascular_risk": 0.0,
}
MAX_RISKS = {
    "diabetes_risk": 1.0,
    "hypertension_risk": 1.0,
    "cardiovascular_risk": 1.0,
}
MID_RISKS = {
    "diabetes_risk": 0.5,
    "hypertension_risk": 0.5,
    "cardiovascular_risk": 0.5,
}

# ── Boundaries ───────────────────────────────────────────────────────────────


def test_health_score_optimal_profile_zero_risks_is_100():
    """Optimal lifestyle and zero risk yield the maximum score."""
    # Lifestyle=100, Risk=100, Improvement=100 -> 50+35+15 = 100.
    assert risk_engine.calculate_health_score(_profile(), ZERO_RISKS) == 100.0


def test_health_score_optimal_profile_max_risks_is_65():
    """Even optimal habits cannot offset maximum risk entirely."""
    # Lifestyle=100, Risk=0, Improvement=100 -> 50+0+15 = 65.
    assert risk_engine.calculate_health_score(_profile(), MAX_RISKS) == 65.0


def test_health_score_worst_profile_max_risks():
    """Worst lifestyle, maximum risk, and family history yield 11.5."""
    # Lifestyle=11.0, Risk=0, Improvement=40 -> 5.5+0+6 = 11.5.
    assert risk_engine.calculate_health_score(_worst_profile(), MAX_RISKS) == 11.5


def test_health_score_weights_locked_for_mid_risks():
    """Hybrid weights 0.50/0.35/0.15 and risk weights 35/35/30 are locked."""
    # Lifestyle=100, Risk=50, Improvement=100 -> 50+17.5+15 = 82.5.
    assert risk_engine.calculate_health_score(_profile(), MID_RISKS) == 82.5


# ── Range, Type & Determinism ────────────────────────────────────────────────


def test_health_score_within_range_for_profile_risk_grid():
    """Score stays within 0.0-100.0 across profiles and a risk grid."""
    profiles = [
        _profile(),
        _worst_profile(),
        _profile(
            bmi=Decimal("27.0"),
            physical_activity_min_per_week=Decimal("75.0"),
            sleep_duration_hours=Decimal("6.5"),
            smoking_status="former",
            stress_level=None,
        ),
    ]
    for profile in profiles:
        for dm in (0.0, 0.25, 0.5, 1.0):
            for ht in (0.0, 0.25, 0.5, 1.0):
                for cvd in (0.0, 0.25, 0.5, 1.0):
                    risks = {
                        "diabetes_risk": dm,
                        "hypertension_risk": ht,
                        "cardiovascular_risk": cvd,
                    }
                    score = risk_engine.calculate_health_score(profile, risks)
                    assert 0.0 <= score <= 100.0


def test_health_score_returns_finite_float():
    """Score is always a finite float, never NaN, null, or an error."""
    score = risk_engine.calculate_health_score(
        _profile(),
        {"diabetes_risk": 0.4, "hypertension_risk": 0.3, "cardiovascular_risk": 0.2},
    )
    assert isinstance(score, float)
    assert math.isfinite(score)


def test_health_score_deterministic_for_same_input():
    """Same profile and risks always produce the same score."""
    profile = _profile(bmi=Decimal("28.7"), stress_level=8)
    risks = {
        "diabetes_risk": 0.31,
        "hypertension_risk": 0.42,
        "cardiovascular_risk": 0.17,
    }
    assert risk_engine.calculate_health_score(profile, risks) == (
        risk_engine.calculate_health_score(profile, dict(risks))
    )


# ── Monotonicity & Component Effects ─────────────────────────────────────────


def test_health_score_never_increases_when_risk_increases():
    """Raising any single risk component never raises the score."""
    profile = _profile()
    base = {"diabetes_risk": 0.2, "hypertension_risk": 0.3, "cardiovascular_risk": 0.1}
    base_score = risk_engine.calculate_health_score(profile, base)
    for key in base:
        worse = dict(base)
        worse[key] = min(1.0, worse[key] + 0.25)
        assert risk_engine.calculate_health_score(profile, worse) <= base_score


def test_health_score_lifestyle_improvement_raises_score():
    """Better lifestyle at identical risk is reflected in the score."""
    # Optimal profile -> 82.5; worst profile -> 29.0 at MID_RISKS.
    optimal = risk_engine.calculate_health_score(_profile(), MID_RISKS)
    worst = risk_engine.calculate_health_score(_worst_profile(), MID_RISKS)
    assert optimal == 82.5
    assert worst == 29.0
    assert worst < optimal


def test_health_score_family_history_context_lowers_score():
    """Family history reduces the Improvement component by 9.0 points."""
    risks = {"diabetes_risk": 0.2, "hypertension_risk": 0.3, "cardiovascular_risk": 0.1}
    without_history = risk_engine.calculate_health_score(_profile(), risks)
    with_history = risk_engine.calculate_health_score(
        _profile(family_history=True), risks
    )
    assert with_history < without_history
    assert (without_history - with_history) == pytest.approx(9.0)


def test_health_score_matches_documented_decomposition():
    """Score equals the documented 0.50/0.35/0.15 component decomposition."""
    profile = _profile(
        bmi=Decimal("27.0"),
        physical_activity_min_per_week=Decimal("90.0"),
        sleep_duration_hours=Decimal("6.0"),
        smoking_status="former",
        family_history=True,
        stress_level=5,
    )
    risks = {
        "diabetes_risk": 0.35,
        "hypertension_risk": 0.28,
        "cardiovascular_risk": 0.41,
    }
    lifestyle = risk_engine.calculate_lifestyle_score(profile)
    risk_comp = 100.0 - (
        risks["diabetes_risk"] * 35.0
        + risks["hypertension_risk"] * 35.0
        + risks["cardiovascular_risk"] * 30.0
    )
    expected = round(0.50 * lifestyle + 0.35 * risk_comp + 0.15 * 40.0, 1)
    assert risk_engine.calculate_health_score(profile, risks) == expected
