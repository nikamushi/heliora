"""HELIORA API — Chronic disease risk probability estimation.

Log-odds model for Diabetes, Hypertension, and Cardiovascular risk
(Architecture §8).
"""

from typing import Any

from app.core.risk_engine._shared import _sigmoid
from app.core.vitals import normalize_smoking_status, parse_blood_pressure


class RiskEstimationMixin:
    """Estimates the three chronic disease risk probabilities."""

    def estimate_risks(self, profile: Any) -> dict[str, float]:
        """Estimate 3 chronic disease probabilities based on biometric and lifestyle factors.

        Returns:
            dict containing 'diabetes_risk', 'hypertension_risk', 'cardiovascular_risk'
            bounded strictly in [0.0100, 0.9500].
        """
        age = float(profile.age)
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = normalize_smoking_status(profile.smoking_status)
        family_history = bool(profile.family_history)
        stress = float(profile.stress_level) if profile.stress_level else None
        blood_sugar = (
            float(profile.blood_sugar_mg_dl) if profile.blood_sugar_mg_dl else None
        )
        cholesterol = (
            float(profile.cholesterol_mg_dl) if profile.cholesterol_mg_dl else None
        )
        systolic, diastolic = parse_blood_pressure(profile.blood_pressure)

        # ── 1. Diabetes Melitus Risk Log-Odds ─────────────────────────
        dm_log_odds = -3.2 + 0.028 * max(0.0, age - 20.0)

        # BMI contribution
        if bmi >= 30.0:
            dm_log_odds += 1.2 + 0.04 * (bmi - 30.0)
        elif bmi >= 25.0:
            dm_log_odds += 0.65
        elif bmi < 23.0:
            dm_log_odds -= 0.35

        # Physical activity contribution
        if activity >= 150.0:
            dm_log_odds -= 0.4
        elif activity < 60.0:
            dm_log_odds += 0.45

        # Family history
        if family_history:
            dm_log_odds += 0.75

        # Fasting blood sugar (if provided)
        if blood_sugar is not None:
            if blood_sugar >= 126.0:
                dm_log_odds += 1.6
            elif blood_sugar >= 100.0:
                dm_log_odds += 0.7
            elif blood_sugar < 90.0:
                dm_log_odds -= 0.25

        # ── 2. Hypertension Risk Log-Odds ────────────────────────────
        ht_log_odds = -2.9 + 0.032 * max(0.0, age - 20.0)

        # Sleep duration
        if sleep < 6.0:
            ht_log_odds += 0.55
        elif 6.5 <= sleep <= 8.5:
            ht_log_odds -= 0.25

        # Stress level
        if stress is not None:
            if stress >= 7.0:
                ht_log_odds += 0.5
            elif stress <= 3.0:
                ht_log_odds -= 0.2

        # Smoking
        if smoking == "current":
            ht_log_odds += 0.45
        elif smoking == "never":
            ht_log_odds -= 0.15

        # Blood pressure readings (if provided)
        if systolic is not None and diastolic is not None:
            if systolic >= 140.0 or diastolic >= 90.0:
                ht_log_odds += 1.5
            elif systolic >= 130.0 or diastolic >= 85.0:
                ht_log_odds += 0.65
            elif systolic < 120.0 and diastolic < 80.0:
                ht_log_odds -= 0.35

        # BMI link to hypertension
        if bmi >= 25.0:
            ht_log_odds += 0.45

        # ── 3. Cardiovascular Disease Risk Log-Odds ──────────────────
        cvd_log_odds = -3.4 + 0.038 * max(0.0, age - 20.0)

        # Smoking is primary CVD multiplier
        if smoking == "current":
            cvd_log_odds += 1.1
        elif smoking == "former":
            cvd_log_odds += 0.3
        elif smoking == "never":
            cvd_log_odds -= 0.35

        # Cholesterol
        if cholesterol is not None:
            if cholesterol >= 240.0:
                cvd_log_odds += 1.1
            elif cholesterol >= 200.0:
                cvd_log_odds += 0.45
            elif cholesterol < 180.0:
                cvd_log_odds -= 0.25

        # Inactivity
        if activity < 60.0:
            cvd_log_odds += 0.45
        elif activity >= 150.0:
            cvd_log_odds -= 0.35

        # Coupling with hypertension state
        if ht_log_odds > 0:
            cvd_log_odds += 0.4

        # Convert to probabilities & clamp
        def clamp_prob(val: float) -> float:
            p = _sigmoid(val)
            return round(max(0.0100, min(0.9500, p)), 4)

        return {
            "diabetes_risk": clamp_prob(dm_log_odds),
            "hypertension_risk": clamp_prob(ht_log_odds),
            "cardiovascular_risk": clamp_prob(cvd_log_odds),
        }
