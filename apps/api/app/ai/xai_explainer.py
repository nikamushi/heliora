"""HELIORA API — SHAP-based Explainable AI explainer (XAI-001).

Generates feature contribution explanations using SHAP (SHapley Additive exPlanations)
for the Preventive Lifestyle Risk Engine. Provides both raw SHAP values and
human-readable contributing factors for frontend display.

Architecture §8, PRD XAI-001.
"""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import shap

from app.core.risk_engine import risk_engine
from app.core.vitals import normalize_smoking_status, parse_blood_pressure

logger = logging.getLogger(__name__)

# ── Config ──────────────────────────────────────────────────────
MAX_FEATURES_DISPLAYED = 4
"""Maximum number of top contributing factors to return to the frontend."""

# ── Feature index mapping ───────────────────────────────────────
# Index positions in the input vector passed to the risk model.
# Uses 11-dimensional encoding (same as shap_explainer.py RiskModelWrapper):
#   [age, bmi, physical_activity, sleep_duration, smoking_encoded,
#    family_history, stress_level, blood_sugar, cholesterol,
#    systolic_bp, diastolic_bp]
# smoking_encoded: 0=never, 1=former, 2=current
FEATURE_INDEX = {
    "age": 0,
    "bmi": 1,
    "physical_activity": 2,
    "sleep_duration": 3,
    "smoking_status": 4,
    "family_history": 5,
    "stress_level": 6,
    "blood_sugar": 7,
    "cholesterol": 8,
    "systolic_bp": 9,
    "diastolic_bp": 10,
}


def _build_feature_vector(profile: Any) -> np.ndarray:
    """Extract numeric feature vector from a HealthProfile ORM entity.

    Returns a 12-dimensional vector matching the order in FEATURE_INDEX.
    """
    bmi = float(profile.bmi) if profile.bmi else 22.0
    activity = float(profile.physical_activity_min_per_week)
    sleep = float(profile.sleep_duration_hours)
    smoking = normalize_smoking_status(profile.smoking_status)
    family_history = bool(profile.family_history)
    stress = float(profile.stress_level) if profile.stress_level else 5.0
    blood_sugar = (
        float(profile.blood_sugar_mg_dl) if profile.blood_sugar_mg_dl else 90.0
    )
    cholesterol = (
        float(profile.cholesterol_mg_dl) if profile.cholesterol_mg_dl else 180.0
    )
    systolic, diastolic = parse_blood_pressure(profile.blood_pressure)
    systolic = systolic if systolic is not None else 120.0
    diastolic = diastolic if diastolic is not None else 80.0

    return np.array(
        [
            float(profile.age),
            bmi,
            activity,
            sleep,
            1.0 if smoking == "current" else 0.0,
            1.0 if smoking == "former" else 0.0,
            1.0 if family_history else 0.0,
            stress,
            blood_sugar,
            cholesterol,
            systolic,
            diastolic,
        ],
        dtype=np.float64,
    )


def _model_predict(features: np.ndarray) -> np.ndarray:
    """Wrapper that calls the risk engine and returns diabetes risk as a pseudo-model.

    SHAP needs a callable that returns predictions. Because the risk engine is a
    deterministic rule-based system, we use the log-odds of diabetes risk as the
    model output for explanation purposes. This gives consistent attribution
    that reflects the engine's internal logic.
    """
    single = features.shape[0] == 1
    if single:
        features = features.reshape(1, -1)

    n = features.shape[0]
    results = np.zeros(n)
    for i in range(n):
        row = features[i]
        age = float(row[0])
        bmi = float(row[1])
        activity = float(row[2])
        sleep = float(row[3])
        smoking_current = float(row[4])
        smoking_former = float(row[5])
        family_history = float(row[6])
        stress = float(row[7])
        blood_sugar = float(row[8])

        dm_log_odds = -3.2 + 0.028 * max(0.0, age - 20.0)

        if bmi >= 30.0:
            dm_log_odds += 1.2 + 0.04 * (bmi - 30.0)
        elif bmi >= 25.0:
            dm_log_odds += 0.65
        elif bmi < 23.0:
            dm_log_odds -= 0.35

        if activity >= 150.0:
            dm_log_odds -= 0.4
        elif activity < 60.0:
            dm_log_odds += 0.45

        if family_history:
            dm_log_odds += 0.75

        if blood_sugar >= 126.0:
            dm_log_odds += 1.6
        elif blood_sugar >= 100.0:
            dm_log_odds += 0.7
        elif blood_sugar < 90.0:
            dm_log_odds -= 0.25

        if sleep < 6.0:
            dm_log_odds += 0.15
        elif sleep >= 7.0:
            dm_log_odds -= 0.1

        if smoking_current > 0.5:
            dm_log_odds += 0.4
        elif smoking_former > 0.5:
            dm_log_odds += 0.15

        if stress >= 7.0:
            dm_log_odds += 0.2
        elif stress <= 3.0:
            dm_log_odds -= 0.1

        # Clamp to prevent overflow in sigmoid
        dm_log_odds = max(-20.0, min(20.0, dm_log_odds))
        results[i] = dm_log_odds

    return results if not single else results[0]


class XAICache:
    """Lightweight in-memory cache for SHAP explainer instances.

    The KernelExplainer is expensive to construct (~1-2s), so we cache it
    per process lifetime.
    """

    def __init__(self) -> None:
        self._explainer: shap.KernelExplainer | None = None
        self._initialized: bool = False

    def get_explainer(self) -> shap.KernelExplainer:
        """Return (and lazily construct) the cached SHAP KernelExplainer."""
        if self._explainer is None:
            # Background data: representative sample of "average" lifestyle
            # used to anchor SHAP expectation values.
            background = np.array(
                [
                    [45.0, 23.0, 150.0, 7.0, 0.0, 0.0, 0.0, 4.0, 90.0, 180.0, 120.0, 80.0],
                    [55.0, 27.0, 90.0, 6.0, 0.0, 0.0, 1.0, 6.0, 95.0, 200.0, 130.0, 85.0],
                    [35.0, 21.0, 200.0, 8.0, 0.0, 0.0, 0.0, 3.0, 85.0, 170.0, 115.0, 75.0],
                    [60.0, 30.0, 60.0, 5.0, 1.0, 0.0, 1.0, 8.0, 105.0, 220.0, 140.0, 90.0],
                    [40.0, 25.0, 120.0, 6.5, 0.0, 1.0, 0.0, 5.0, 92.0, 190.0, 125.0, 82.0],
                    [50.0, 28.0, 60.0, 5.5, 1.0, 0.0, 1.0, 7.0, 110.0, 230.0, 145.0, 92.0],
                    [28.0, 20.0, 180.0, 7.5, 0.0, 0.0, 0.0, 3.0, 88.0, 175.0, 118.0, 78.0],
                    [65.0, 32.0, 45.0, 4.5, 1.0, 0.0, 1.0, 9.0, 115.0, 240.0, 150.0, 95.0],
                ],
                dtype=np.float64,
            )
            self._explainer = shap.KernelExplainer(_model_predict, background)
            self._initialized = True
            logger.info("SHAP KernelExplainer initialized with background sample.")
        return self._explainer


_xai_cache = XAICache()


def explain_profile(profile: Any) -> list[dict[str, Any]]:
    """Generate SHAP-based feature attributions for a single health profile.

    Returns a list of dicts compatible with the assessment repo's
    create_xai_results expectations: feature, impact, weight_percentage.
    Uses the RiskModelWrapper from shap_explainer.py for consistent 11-dim encoding.
    """
    try:
        from app.ai.shap_explainer import explain_health_profile
        shap_factors = explain_health_profile(profile)
        # Convert to xai_explainer format: feature, impact, weight_percentage
        result: list[dict[str, Any]] = []
        for f in shap_factors:
            result.append(
                {
                    "feature": f["feature"],
                    "impact": f["impact"],
                    "weight_percentage": f["weight_percentage"],
                    "label": f.get("label", f["feature"]),
                    "description": f.get("description", ""),
                    "raw_shap_value": f.get("shap_diabetes", 0.0),
                    "shap_diabetes": f.get("shap_diabetes", 0.0),
                    "shap_hypertension": f.get("shap_hypertension", 0.0),
                    "shap_cardiovascular": f.get("shap_cardiovascular", 0.0),
                }
            )
        result.sort(key=lambda x: x["weight_percentage"], reverse=True)
        return result[:MAX_FEATURES_DISPLAYED]

    except Exception as exc:
        logger.warning("SHAP explanation failed, falling back to rule-based factors: %s", exc)
        return []


def explain_profile_to_factors(
    profile: Any, risks: dict[str, float]
) -> list[dict[str, Any]]:
    """Combine SHAP explanation with risk engine factors into unified output.

    Tries SHAP first; if SHAP fails or returns empty, falls back to
    the rule-based extract_top_factors from risk_engine.
    """
    shap_factors = explain_profile(profile)

    if shap_factors:
        for f in shap_factors:
            f["source"] = "shap"
            # Map SHAP direction to ContributingFactor-compatible values
            impact = f.get("impact", "increase")
            if impact == "negative":
                f["impact"] = "decrease"
            elif impact == "positive":
                f["impact"] = "increase"
        return shap_factors

    # Fallback to deterministic factors from risk engine
    factors = risk_engine.extract_top_factors(profile, risks)
    return [
        {
            "feature": f.feature,
            "label": f.label,
            "impact": f.impact,
            "weight_percentage": f.weight_percentage,
            "description": f.description,
            "source": "rule_based",
        }
        for f in factors
    ]
