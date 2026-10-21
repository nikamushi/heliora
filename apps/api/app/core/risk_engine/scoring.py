"""HELIORA API — Health Score and Lifestyle Score calculators.

Hybrid Health Score (docs/Health-Score.md, PRD §11.5.3) and weighted
Lifestyle Score (docs/Lifestyle-Score.md, AI-005).
"""

from typing import Any

from app.core.risk_engine._shared import (
    RiskEngineProtocol,
    HEALTH_IMPROVEMENT_NO_HISTORY,
    HEALTH_IMPROVEMENT_WITH_HISTORY,
    HEALTH_RISK_WEIGHT_CARDIOVASCULAR,
    HEALTH_RISK_WEIGHT_DIABETES,
    HEALTH_RISK_WEIGHT_HYPERTENSION,
    HEALTH_WEIGHT_IMPROVEMENT,
    HEALTH_WEIGHT_LIFESTYLE,
    HEALTH_WEIGHT_RISK,
    LIFESTYLE_WEIGHT_ACTIVITY,
    LIFESTYLE_WEIGHT_BMI,
    LIFESTYLE_WEIGHT_OTHER,
    LIFESTYLE_WEIGHT_SLEEP,
    LIFESTYLE_WEIGHT_SMOKING,
)
from app.core.vitals import normalize_smoking_status
from app.schemas.health_profile import get_bmi_category


class ScoreCalculationMixin:
    """Computes the hybrid Health Score and the weighted Lifestyle Score."""

    @staticmethod
    def calculate_health_score(profile: Any, risks: dict[str, float]) -> float:
        """Calculate hybrid Health Score on 0.0 - 100.0 scale (docs/Health-Score.md, PRD §11.5.3).

        Combines the Lifestyle component (AI-005 output), the Risk component
        (inverse of the weighted risk deduction), and the Improvement component
        (family-history protective context). Deterministic: identical inputs
        always produce identical output.
        """
        lifestyle = ScoreCalculationMixin.calculate_lifestyle_score(profile)
        risk_component = 100.0 - (
            risks["diabetes_risk"] * HEALTH_RISK_WEIGHT_DIABETES * 100.0
            + risks["hypertension_risk"] * HEALTH_RISK_WEIGHT_HYPERTENSION * 100.0
            + risks["cardiovascular_risk"] * HEALTH_RISK_WEIGHT_CARDIOVASCULAR * 100.0
        )
        improvement = (
            HEALTH_IMPROVEMENT_WITH_HISTORY
            if bool(profile.family_history)
            else HEALTH_IMPROVEMENT_NO_HISTORY
        )
        total = (
            lifestyle * HEALTH_WEIGHT_LIFESTYLE
            + risk_component * HEALTH_WEIGHT_RISK
            + improvement * HEALTH_WEIGHT_IMPROVEMENT
        )
        return round(max(0.0, min(100.0, total)), 1)

    @staticmethod
    def calculate_lifestyle_score(profile: Any) -> float:
        """Calculate Lifestyle Score on 0.0 - 100.0 scale (docs/Lifestyle-Score.md, AI-005).

        Weighted scoring over BMI, physical activity, sleep, smoking, and stress
        (Other, when available). Deterministic: identical inputs always produce
        identical output.
        """
        bmi_raw = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = normalize_smoking_status(profile.smoking_status)
        stress = float(profile.stress_level) if profile.stress_level else None

        # 1. BMI category sub-score (0 - 100)
        bmi_category = get_bmi_category(bmi_raw)
        bmi_score = {
            "Normal": 100.0,
            "Underweight": 60.0,
            "Overweight": 55.0,
            "Obesity": 20.0,
        }.get(bmi_category, 100.0)

        # 2. Physical activity, linear against the 150 min/week reference (0 - 100)
        activity_score = min(100.0, (activity / 150.0) * 100.0)

        # 3. Sleep duration tiers (0 - 100)
        if 7.0 <= sleep <= 9.0:
            sleep_score = 100.0
        elif 6.0 <= sleep < 7.0 or 9.0 < sleep <= 10.0:
            sleep_score = 70.0
        elif 5.0 <= sleep < 6.0 or 10.0 < sleep <= 11.0:
            sleep_score = 40.0
        else:
            sleep_score = 10.0

        # 4. Smoking habits (0 - 100)
        if smoking == "never":
            smoking_score = 100.0
        elif smoking == "former":
            smoking_score = 60.0
        else:
            smoking_score = 0.0

        weighted_core = (
            bmi_score * LIFESTYLE_WEIGHT_BMI
            + activity_score * LIFESTYLE_WEIGHT_ACTIVITY
            + sleep_score * LIFESTYLE_WEIGHT_SLEEP
            + smoking_score * LIFESTYLE_WEIGHT_SMOKING
        )

        # 5. Stress regulation as Other (0 - 100); renormalize weights when absent
        if stress is not None:
            if stress <= 3.0:
                other_score = 100.0
            elif stress <= 6.0:
                other_score = 60.0
            else:
                other_score = 30.0
            total = weighted_core + other_score * LIFESTYLE_WEIGHT_OTHER
        else:
            total = weighted_core / (
                LIFESTYLE_WEIGHT_BMI
                + LIFESTYLE_WEIGHT_ACTIVITY
                + LIFESTYLE_WEIGHT_SLEEP
                + LIFESTYLE_WEIGHT_SMOKING
            )

        return round(max(0.0, min(100.0, total)), 1)
