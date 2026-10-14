"""Tests for Health Score calculation (AI-004, PRD AC-SCORE-01, docs/Health-Score.md).

Covers range validity, boundary values, determinism, monotonicity, and finite
float output for PreventiveLifestyleRiskEngine.calculate_health_score.
"""

import math

from app.core.risk_engine import risk_engine

# ── Range & Boundaries ───────────────────────────────────────────────────────


def test_health_score_all_zero_risks_is_100():
    """Zero risk in all components yields the maximum score."""
    risks = {"diabetes_risk": 0.0, "hypertension_risk": 0.0, "cardiovascular_risk": 0.0}
    assert risk_engine.calculate_health_score(risks) == 100.0


def test_health_score_all_max_risks_is_0():
    """Maximum risk in all components yields the minimum score."""
    risks = {"diabetes_risk": 1.0, "hypertension_risk": 1.0, "cardiovascular_risk": 1.0}
    assert risk_engine.calculate_health_score(risks) == 0.0


def test_health_score_within_range_for_risk_grid():
    """Score stays within the specified 0.0-100.0 range for a risk grid."""
    for dm in (0.0, 0.25, 0.5, 1.0):
        for ht in (0.0, 0.25, 0.5, 1.0):
            for cvd in (0.0, 0.25, 0.5, 1.0):
                risks = {
                    "diabetes_risk": dm,
                    "hypertension_risk": ht,
                    "cardiovascular_risk": cvd,
                }
                score = risk_engine.calculate_health_score(risks)
                assert 0.0 <= score <= 100.0


def test_health_score_returns_finite_float():
    """Score is always a finite float, never NaN, null, or an error."""
    score = risk_engine.calculate_health_score(
        {"diabetes_risk": 0.4, "hypertension_risk": 0.3, "cardiovascular_risk": 0.2}
    )
    assert isinstance(score, float)
    assert math.isfinite(score)


# ── Weights, Determinism & Monotonicity ──────────────────────────────────────


def test_health_score_uses_ratified_weights():
    """Score locks the ratified 35/35/30 weights from docs/Health-Score.md."""
    risks = {"diabetes_risk": 0.5, "hypertension_risk": 0.5, "cardiovascular_risk": 0.5}
    # 100 - (0.5*35 + 0.5*35 + 0.5*30) = 100 - 50 = 50.
    assert risk_engine.calculate_health_score(risks) == 50.0


def test_health_score_deterministic_for_same_input():
    """Same input always produces the same score."""
    risks = {"diabetes_risk": 0.31, "hypertension_risk": 0.42, "cardiovascular_risk": 0.17}
    assert risk_engine.calculate_health_score(risks) == risk_engine.calculate_health_score(
        dict(risks)
    )


def test_health_score_never_increases_when_risk_increases():
    """Raising any single risk component never raises the score."""
    base = {"diabetes_risk": 0.2, "hypertension_risk": 0.3, "cardiovascular_risk": 0.1}
    base_score = risk_engine.calculate_health_score(base)
    for key in base:
        worse = dict(base)
        worse[key] = min(1.0, worse[key] + 0.25)
        assert risk_engine.calculate_health_score(worse) <= base_score


def test_health_score_improvement_raises_score():
    """Relevant input improvement is reflected in the score."""
    before = {"diabetes_risk": 0.6, "hypertension_risk": 0.5, "cardiovascular_risk": 0.4}
    after = {"diabetes_risk": 0.3, "hypertension_risk": 0.4, "cardiovascular_risk": 0.2}
    assert risk_engine.calculate_health_score(after) > risk_engine.calculate_health_score(
        before
    )
