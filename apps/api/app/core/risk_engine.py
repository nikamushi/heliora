"""HELIORA API — Preventive Lifestyle Risk Engine.

Computes estimated lifestyle risk probabilities (Diabetes, Hypertension, Cardiovascular),
composite Health & Lifestyle Scores, SHAP-compatible feature contributions, and
deterministic guideline-backed recommendations (Architecture §8, §9, §10, §14).
"""

import math
from typing import Any

from app.schemas.assessment import (
    ContributingFactor,
    RecommendationItem,
    RiskAssessmentItem,
)


def _sigmoid(x: float) -> float:
    """Logistic sigmoid function."""
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0


class PreventiveLifestyleRiskEngine:
    """Core deterministic risk estimation and scoring engine for HELIORA."""

    @staticmethod
    def _parse_bp(bp_str: str | None) -> tuple[float | None, float | None]:
        """Parse blood pressure string like '120/80' into (systolic, diastolic)."""
        if not bp_str or "/" not in bp_str:
            return None, None
        try:
            parts = bp_str.split("/")
            return float(parts[0].strip()), float(parts[1].strip())
        except (ValueError, IndexError):
            return None, None

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
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()
        family_history = bool(profile.family_history)
        stress = float(profile.stress_level) if profile.stress_level else None
        blood_sugar = (
            float(profile.blood_sugar_mg_dl) if profile.blood_sugar_mg_dl else None
        )
        cholesterol = (
            float(profile.cholesterol_mg_dl) if profile.cholesterol_mg_dl else None
        )
        systolic, diastolic = self._parse_bp(profile.blood_pressure)

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

    @staticmethod
    def calculate_health_score(risks: dict[str, float]) -> float:
        """Calculate overall Health Score on 0.0 - 100.0 scale (Architecture §9).

        100 is optimal vitality; deductions are weighted across multi-organ risks.
        """
        deduction = (
            risks["diabetes_risk"] * 35.0
            + risks["hypertension_risk"] * 35.0
            + risks["cardiovascular_risk"] * 30.0
        )
        score = 100.0 - deduction
        return round(max(5.0, min(98.0, score)), 1)

    @staticmethod
    def calculate_lifestyle_score(profile: Any) -> float:
        """Calculate Lifestyle Score on 0.0 - 100.0 scale based on modifiable habits (Architecture §10)."""
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()
        stress = float(profile.stress_level) if profile.stress_level else None

        # 1. Activity (0 - 30 pts)
        act_score = min(30.0, (activity / 150.0) * 30.0)

        # 2. Sleep duration (0 - 30 pts)
        if 7.0 <= sleep <= 8.5:
            sleep_score = 30.0
        elif 6.0 <= sleep < 7.0 or 8.5 < sleep <= 9.5:
            sleep_score = 22.0
        elif 5.0 <= sleep < 6.0 or 9.5 < sleep <= 10.5:
            sleep_score = 14.0
        else:
            sleep_score = 6.0

        # 3. Smoking habits (0 - 25 pts)
        if smoking == "never":
            smoke_score = 25.0
        elif smoking == "former":
            smoke_score = 15.0
        else:
            smoke_score = 0.0

        # 4. Stress regulation (0 - 15 pts)
        if stress is not None:
            if stress <= 3.0:
                stress_score = 15.0
            elif stress <= 6.0:
                stress_score = 10.0
            else:
                stress_score = 4.0
        else:
            stress_score = 10.0

        total = act_score + sleep_score + smoke_score + stress_score
        return round(max(0.0, min(100.0, total)), 1)

    @staticmethod
    def extract_top_factors(
        profile: Any, risks: dict[str, float]
    ) -> list[ContributingFactor]:
        """Extract top feature attribution factors explaining the risk assessment outcomes."""
        factors: list[ContributingFactor] = []
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()
        family_history = bool(profile.family_history)

        if bmi >= 25.0:
            factors.append(
                ContributingFactor(
                    feature="bmi",
                    label="Indeks Massa Tubuh (BMI)",
                    impact="increase",
                    weight_percentage=28.0,
                    description=f"BMI {bmi:.1f} tergolong di atas batas ideal, meningkatkan beban metabolik & vaskular.",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="bmi",
                    label="Indeks Massa Tubuh (BMI)",
                    impact="decrease",
                    weight_percentage=15.0,
                    description=f"BMI {bmi:.1f} berada pada rentang sehat dan melindungi fungsi metabolik.",
                )
            )

        if activity < 150.0:
            factors.append(
                ContributingFactor(
                    feature="physical_activity",
                    label="Aktivitas Fisik",
                    impact="increase",
                    weight_percentage=25.0,
                    description=f"{activity:.0f} menit/minggu di bawah panduan 150 menit/minggu rekomendasi WHO.",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="physical_activity",
                    label="Aktivitas Fisik",
                    impact="decrease",
                    weight_percentage=22.0,
                    description=f"Aktivitas {activity:.0f} menit/minggu mencukupi rekomendasi kardioprotektif WHO.",
                )
            )

        if smoking == "current":
            factors.append(
                ContributingFactor(
                    feature="smoking_status",
                    label="Kebiasaan Merokok",
                    impact="increase",
                    weight_percentage=32.0,
                    description="Merokok aktif merupakan faktor pemicu utama disfungsi endotel & plak kardiovaskular.",
                )
            )
        elif smoking == "never":
            factors.append(
                ContributingFactor(
                    feature="smoking_status",
                    label="Bebas Asap Rokok",
                    impact="decrease",
                    weight_percentage=20.0,
                    description="Tidak merokok menjaga integritas endotel dan elastisitas arteri jangka panjang.",
                )
            )

        if sleep < 6.5:
            factors.append(
                ContributingFactor(
                    feature="sleep_duration",
                    label="Durasi Tidur",
                    impact="increase",
                    weight_percentage=15.0,
                    description=f"Tidur {sleep:.1f} jam/hari berpotensi memicu lonjakan kortisol & resistensi insulin nokturnal.",
                )
            )

        if family_history:
            factors.append(
                ContributingFactor(
                    feature="family_history",
                    label="Riwayat Penyakit Keluarga",
                    impact="increase",
                    weight_percentage=18.0,
                    description="Riwayat keluarga mengindikasikan kecenderungan predisposisi genetik metabolik.",
                )
            )

        return factors[:4]

    @staticmethod
    def generate_recommendations(profile: Any) -> list[dict[str, Any]]:
        """Generate clinical rule engine recommendations based on modifiable lifestyle parameters."""
        recs: list[dict[str, Any]] = []
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()
        stress = float(profile.stress_level) if profile.stress_level else None

        if activity < 150.0:
            recs.append(
                {
                    "rule_id": "REC-ACT-01",
                    "title": "Tingkatkan Aktivitas Fisik Aerobik",
                    "category": "activity",
                    "action": "Lakukan jalan cepat atau aktivitas aerobik sedang minimal 150 menit per minggu (30 menit, 5 hari).",
                    "priority": "high",
                    "evidence_level": "A",
                    "source": "WHO Guidelines on Physical Activity and Sedentary Behaviour (2020)",
                }
            )

        if sleep < 7.0:
            recs.append(
                {
                    "rule_id": "REC-SLP-01",
                    "title": "Optimalkan Durasi & Kualitas Tidur",
                    "category": "sleep",
                    "action": "Jaga jadwal tidur konsisten 7–8 jam setiap malam dan batasi paparan layar 1 jam sebelum tidur.",
                    "priority": "medium",
                    "evidence_level": "A",
                    "source": "Kemenkes RI / CDC Sleep Recommendations",
                }
            )

        if bmi >= 25.0:
            recs.append(
                {
                    "rule_id": "REC-NUT-01",
                    "title": "Manajemen Berat Badan & Pola Makan Seimbang",
                    "category": "nutrition",
                    "action": "Kurangi asupan gula sederhana dan tingkatkan konsumsi serat harian minimal 25 gram.",
                    "priority": "high",
                    "evidence_level": "A",
                    "source": "Panduan Diet & Obesitas PERKENI (2021)",
                }
            )

        if smoking == "current":
            recs.append(
                {
                    "rule_id": "REC-SMK-01",
                    "title": "Program Penghentian Merokok",
                    "category": "stress",
                    "action": "Manfaatkan layanan konseling Upaya Berhenti Merokok (UBM) Kemenkes untuk menurunkan risiko kardiovaskular drastis.",
                    "priority": "high",
                    "evidence_level": "A",
                    "source": "Kemenkes RI — Program Pengendalian Tembakau",
                }
            )

        if stress is not None and stress >= 7.0:
            recs.append(
                {
                    "rule_id": "REC-STR-01",
                    "title": "Latihan Relaksasi & Regulasi Stres",
                    "category": "stress",
                    "action": "Terapkan teknik pernapasan dalam (4-7-8) atau meditasi 10 menit setiap hari untuk menstabilkan tekanan darah.",
                    "priority": "medium",
                    "evidence_level": "B",
                    "source": "AHA / PERKI Guidelines on Stress & Cardiovascular Health",
                }
            )

        if not recs:
            # Default positive reinforcement recommendation if profile is optimal
            recs.append(
                {
                    "rule_id": "REC-GEN-01",
                    "title": "Pertahankan Pola Hidup Sehat",
                    "category": "activity",
                    "action": "Pola gaya hidup Anda saat ini optimal. Lanjutkan rutinitas aktivitas fisik dan tidur teratur secara konsisten.",
                    "priority": "low",
                    "evidence_level": "A",
                    "source": "Kemenkes RI — GERMAS (Gerakan Masyarakat Hidup Sehat)",
                }
            )

        return recs


risk_engine = PreventiveLifestyleRiskEngine()
