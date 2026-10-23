"""HELIORA API — Shared synthetic cohort generator (AI-003).

Single source of truth for the synthetic feature sampling sequence and the
epidemiological probability model. Both the training data generator
(``app.ai.model_training``) and the evaluation dataset
(``app.ai.evaluation``) draw from this module so features and risk signals
cannot drift between the two pipelines.

The sampling sequence and formulas here are contract-frozen: the evaluation
baseline (``tests/test_evaluation.py::test_synthetic_data_baseline_distribution_locked``)
depends on them.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

ELEVATED_RISK_THRESHOLD = 0.25


@dataclass(frozen=True)
class SyntheticFeatures:
    """One synthetic individual sampled from the cohort model."""

    age: int
    bmi: float
    physical_activity: float
    sleep_duration: float
    smoking_status: str
    family_history: bool
    stress_level: float | None
    blood_sugar_mg_dl: float | None
    cholesterol_mg_dl: float | None
    systolic_bp: float
    diastolic_bp: float

    @property
    def blood_pressure(self) -> str:
        """Blood pressure string like '120/80'."""
        return f"{int(self.systolic_bp)}/{int(self.diastolic_bp)}"


def sample_features(rng: np.random.Generator) -> SyntheticFeatures:
    """Draw one synthetic individual using the canonical sampling sequence."""
    age = int(rng.uniform(20, 75))
    bmi = float(rng.uniform(18.0, 38.0))
    activity = float(rng.uniform(0, 300))
    sleep = float(rng.uniform(4.0, 10.0))
    smoking_roll = rng.random()
    smoking = (
        "current"
        if smoking_roll < 0.25
        else ("former" if smoking_roll < 0.45 else "never")
    )
    family_history = bool(rng.random() < 0.30)
    stress = float(rng.uniform(1, 10)) if rng.random() < 0.7 else None
    blood_sugar = float(rng.uniform(70, 160)) if rng.random() < 0.4 else None
    cholesterol = float(rng.uniform(140, 260)) if rng.random() < 0.4 else None
    systolic = float(rng.uniform(105, 160))
    diastolic = float(rng.uniform(65, 100))

    return SyntheticFeatures(
        age=age,
        bmi=bmi,
        physical_activity=activity,
        sleep_duration=sleep,
        smoking_status=smoking,
        family_history=family_history,
        stress_level=stress,
        blood_sugar_mg_dl=blood_sugar,
        cholesterol_mg_dl=cholesterol,
        systolic_bp=systolic,
        diastolic_bp=diastolic,
    )


def diabetes_probability(features: SyntheticFeatures) -> float:
    """Epidemiological diabetes probability for one synthetic individual."""
    base = 0.02 + 0.008 * max(0, features.age - 30) / 10
    bmi_term = 0.0
    if features.bmi >= 30:
        bmi_term = 0.12 + 0.02 * (features.bmi - 30) / 10
    elif features.bmi >= 25:
        bmi_term = 0.06
    elif features.bmi < 23:
        bmi_term = -0.03
    activity_term = (
        -0.04
        if features.physical_activity >= 150
        else (0.05 if features.physical_activity < 60 else -0.01)
    )
    famhist_term = 0.08 if features.family_history else 0.0
    smoke_term = (
        0.05
        if features.smoking_status == "current"
        else (0.02 if features.smoking_status == "former" else -0.02)
    )
    sleep_term = (
        0.03
        if features.sleep_duration < 6
        else (-0.02 if features.sleep_duration >= 7 else 0.0)
    )
    bs_term = 0.0
    if features.blood_sugar_mg_dl is not None:
        if features.blood_sugar_mg_dl >= 126:
            bs_term = 0.15
        elif features.blood_sugar_mg_dl >= 100:
            bs_term = 0.07
        elif features.blood_sugar_mg_dl < 90:
            bs_term = -0.02
    return max(
        0.01,
        min(
            0.95,
            base
            + bmi_term
            + activity_term
            + famhist_term
            + smoke_term
            + sleep_term
            + bs_term,
        ),
    )


def hypertension_probability(features: SyntheticFeatures) -> float:
    """Epidemiological hypertension probability for one synthetic individual."""
    base = 0.03 + 0.009 * max(0, features.age - 30) / 10
    sleep_term = (
        0.06
        if features.sleep_duration < 6
        else (-0.03 if 6.5 <= features.sleep_duration <= 8.5 else 0.0)
    )
    stress_term = (
        0.05
        if features.stress_level is not None and features.stress_level >= 7
        else (
            -0.02
            if features.stress_level is not None and features.stress_level <= 3
            else 0.0
        )
    )
    smoke_term = (
        0.05
        if features.smoking_status == "current"
        else (-0.02 if features.smoking_status == "never" else 0.0)
    )
    bmi_term = 0.05 if features.bmi >= 25 else 0.0
    bp_term = 0.0
    if features.systolic_bp >= 140 or features.diastolic_bp >= 90:
        bp_term = 0.18
    elif features.systolic_bp >= 130 or features.diastolic_bp >= 85:
        bp_term = 0.07
    elif features.systolic_bp < 120 and features.diastolic_bp < 80:
        bp_term = -0.04
    return max(
        0.01,
        min(0.95, base + sleep_term + stress_term + smoke_term + bmi_term + bp_term),
    )


def cardiovascular_probability(
    features: SyntheticFeatures, hypertension_prob: float
) -> float:
    """Epidemiological cardiovascular probability for one synthetic individual."""
    base = 0.02 + 0.01 * max(0, features.age - 30) / 10
    smoke_term = (
        0.12
        if features.smoking_status == "current"
        else (0.04 if features.smoking_status == "former" else -0.04)
    )
    chol_term = 0.0
    if features.cholesterol_mg_dl is not None:
        if features.cholesterol_mg_dl >= 240:
            chol_term = 0.12
        elif features.cholesterol_mg_dl >= 200:
            chol_term = 0.05
        elif features.cholesterol_mg_dl < 180:
            chol_term = -0.03
    activity_term = (
        -0.04
        if features.physical_activity >= 150
        else (0.05 if features.physical_activity < 60 else -0.01)
    )
    bmi_term = 0.02 if features.bmi < 24 else (-0.05 if features.bmi >= 28 else -0.01)
    ht_term = 0.04 if hypertension_prob > ELEVATED_RISK_THRESHOLD else 0.0
    return max(
        0.01,
        min(0.95, base + smoke_term + chol_term + activity_term + bmi_term + ht_term),
    )
