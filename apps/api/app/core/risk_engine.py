"""HELIORA API — Preventive Lifestyle Risk Engine.

Computes estimated lifestyle risk probabilities (Diabetes, Hypertension, Cardiovascular),
composite Health & Lifestyle Scores, SHAP-compatible feature contributions, and
deterministic guideline-backed recommendations (Architecture §8, §9, §10, §14).
"""

import math
from typing import Any

from app.schemas.assessment import (
    ContributingFactor,
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
        """Calculate Lifestyle Score on 0.0 - 100.0 scale based on modifiable habits (PRD §10.6, §14.7, AC-SCORE-02).

        Documented Weights:
        1. Physical Activity (0 - 35 pts, 35% weight: WHO standard >= 150 min/wk optimal)
        2. Sleep Duration (0 - 35 pts, 35% weight: 7.0 - 9.0h optimal)
        3. Smoking Habits (0 - 30 pts, 30% weight: 30 never, 28 former, 0 current)
        Total: 100.0 pts.
        """
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()

        # 1. Activity (0 - 35 pts)
        act_score = min(35.0, (activity / 150.0) * 35.0)

        # 2. Sleep duration (0 - 35 pts, WHO/CDC 7–9 hours optimal)
        if 7.0 <= sleep <= 9.0:
            sleep_score = 35.0
        elif 6.0 <= sleep < 7.0 or 9.0 < sleep <= 10.0:
            sleep_score = 25.0
        elif 5.0 <= sleep < 6.0 or 10.0 < sleep <= 11.0:
            sleep_score = 15.0
        else:
            sleep_score = 5.0

        # 3. Smoking habits (0 - 30 pts)
        if smoking == "never":
            smoke_score = 30.0
        elif smoking == "former":
            smoke_score = 28.0
        else:
            smoke_score = 0.0

        total = act_score + sleep_score + smoke_score
        return round(max(0.0, min(100.0, total)), 1)

    @staticmethod
    def extract_top_factors(
        profile: Any, risks: dict[str, float]
    ) -> list[ContributingFactor]:
        """Extract top feature attribution factors explaining the risk assessment outcomes.

        Per PRD §10.8, descriptions must explain the factor's contribution to the
        model's risk estimation without speculative physiological or medical claims.
        """
        factors: list[ContributingFactor] = []
        age = float(profile.age) if profile.age else 30.0
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()
        family_history = bool(profile.family_history)

        # 1. Physical Activity
        if activity < 150.0:
            factors.append(
                ContributingFactor(
                    feature="physical_activity",
                    label="Aktivitas Fisik",
                    impact="increase",
                    weight_percentage=26.0,
                    description="Aktivitas fisik di bawah 150 menit/minggu berkontribusi menaikkan estimasi risiko model.",
                    value_display=f"{int(activity)} menit/minggu · di bawah target 150 menit",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="physical_activity",
                    label="Aktivitas Fisik",
                    impact="decrease",
                    weight_percentage=22.0,
                    description="Aktivitas fisik memenuhi panduan 150 menit/minggu berkontribusi menurunkan estimasi risiko model.",
                    value_display=f"{int(activity)} menit/minggu · target ≥ 150 menit terpenuhi",
                )
            )

        # 2. Sleep Duration
        if sleep < 7.0:
            factors.append(
                ContributingFactor(
                    feature="sleep_duration",
                    label="Durasi Tidur",
                    impact="increase",
                    weight_percentage=24.0,
                    description="Durasi tidur di bawah 7 jam per hari berkontribusi menaikkan estimasi risiko model.",
                    value_display=f"{sleep:g} jam/hari · di bawah pedoman 7–9 jam",
                )
            )
        elif sleep > 9.0:
            factors.append(
                ContributingFactor(
                    feature="sleep_duration",
                    label="Durasi Tidur",
                    impact="increase",
                    weight_percentage=15.0,
                    description="Durasi tidur melebihi 9 jam per hari berkontribusi menaikkan estimasi risiko model.",
                    value_display=f"{sleep:g} jam/hari · di atas pedoman 7–9 jam",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="sleep_duration",
                    label="Durasi Tidur",
                    impact="decrease",
                    weight_percentage=18.0,
                    description="Durasi tidur optimal (7–9 jam/hari) berkontribusi menurunkan estimasi risiko model.",
                    value_display=f"{sleep:g} jam/hari · sesuai pedoman 7–9 jam",
                )
            )

        # 3. BMI / Body Weight
        if bmi >= 25.0:
            factors.append(
                ContributingFactor(
                    feature="bmi",
                    label="Indeks Massa Tubuh (IMT)",
                    impact="increase",
                    weight_percentage=25.0,
                    description="BMI di atas rentang ideal (≥ 25) berkontribusi menaikkan estimasi risiko model.",
                    value_display=f"{format(bmi, ".1f").replace(".", ",")} kg/m² · di atas batas normal (≥ 25,0)",
                )
            )
        elif bmi < 18.5:
            factors.append(
                ContributingFactor(
                    feature="bmi",
                    label="Indeks Massa Tubuh (IMT)",
                    impact="decrease",
                    weight_percentage=16.0,
                    description="Pada model, nilai IMT ini menurunkan estimasi risiko kardiometabolik. Namun, nilai ini berada di bawah rentang normal (18,5–22,9 kg/m²).",
                    value_display=f"{format(bmi, ".1f").replace(".", ",")} kg/m² · di bawah rentang normal (18,5–22,9)",
                )
            )
        elif 18.5 <= bmi <= 22.9:
            factors.append(
                ContributingFactor(
                    feature="bmi",
                    label="Indeks Massa Tubuh (IMT)",
                    impact="decrease",
                    weight_percentage=16.0,
                    description="BMI berada dalam rentang ideal Asia berkontribusi menurunkan estimasi risiko model.",
                    value_display=f"{format(bmi, ".1f").replace(".", ",")} kg/m² · rentang ideal Asia (18,5–22,9)",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="bmi",
                    label="Indeks Massa Tubuh (IMT)",
                    impact="increase",
                    weight_percentage=18.0,
                    description="BMI sedikit di atas batas normal Asia berkontribusi menaikkan estimasi risiko model.",
                    value_display=f"{format(bmi, ".1f").replace(".", ",")} kg/m² · berat badan berlebih (23,0–24,9)",
                )
            )

        # 4. Smoking Status
        if smoking == "current":
            factors.append(
                ContributingFactor(
                    feature="smoking_status",
                    label="Kebiasaan Merokok",
                    impact="increase",
                    weight_percentage=28.0,
                    description="Riwayat merokok aktif berkontribusi menaikkan estimasi risiko model secara signifikan.",
                    value_display="Perokok aktif · di atas risiko baseline",
                )
            )
        elif smoking == "former":
            factors.append(
                ContributingFactor(
                    feature="smoking_status",
                    label="Bebas Asap Rokok",
                    impact="decrease",
                    weight_percentage=15.0,
                    description="Status mantan perokok berkontribusi menurunkan estimasi risiko dibanding perokok aktif.",
                    value_display="Mantan perokok · telah berhenti merokok",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="smoking_status",
                    label="Bebas Asap Rokok",
                    impact="decrease",
                    weight_percentage=16.0,
                    description="Status bebas asap rokok berkontribusi menurunkan estimasi risiko model.",
                    value_display="Bebas rokok · tidak pernah merokok",
                )
            )

        # 5. Optional Biometrics (Only included if user actually provided them)
        if getattr(profile, "blood_sugar_mg_dl", None) is not None:
            bs = float(profile.blood_sugar_mg_dl)
            if bs >= 100.0:
                factors.append(
                    ContributingFactor(
                        feature="blood_sugar",
                        label="Kadar Gula Darah",
                        impact="increase",
                        weight_percentage=22.0,
                        description="Kadar gula darah di atas batas optimal berkontribusi menaikkan estimasi risiko model.",
                        value_display=f"{int(bs)} mg/dL",
                    )
                )
            else:
                factors.append(
                    ContributingFactor(
                        feature="blood_sugar",
                        label="Kadar Gula Darah",
                        impact="decrease",
                        weight_percentage=16.0,
                        description="Kadar gula darah dalam batas normal berkontribusi menurunkan estimasi risiko model.",
                        value_display=f"{int(bs)} mg/dL",
                    )
                )

        if getattr(profile, "blood_pressure", None) is not None:
            sys_bp, dia_bp = risk_engine._parse_bp(profile.blood_pressure)
            if sys_bp is not None:
                if sys_bp >= 130.0 or (dia_bp and dia_bp >= 85.0):
                    factors.append(
                        ContributingFactor(
                            feature="systolic_bp",
                            label="Tekanan Darah",
                            impact="increase",
                            weight_percentage=20.0,
                            description="Tekanan darah di atas rentang optimal berkontribusi menaikkan estimasi risiko model.",
                            value_display=f"{profile.blood_pressure} mmHg",
                        )
                    )
                else:
                    factors.append(
                        ContributingFactor(
                            feature="systolic_bp",
                            label="Tekanan Darah",
                            impact="decrease",
                            weight_percentage=16.0,
                            description="Tekanan darah dalam batas normal berkontribusi menurunkan estimasi risiko model.",
                            value_display=f"{profile.blood_pressure} mmHg",
                        )
                    )

        if getattr(profile, "cholesterol_mg_dl", None) is not None:
            chol = float(profile.cholesterol_mg_dl)
            if chol >= 200.0:
                factors.append(
                    ContributingFactor(
                        feature="cholesterol",
                        label="Kadar Kolesterol",
                        impact="increase",
                        weight_percentage=18.0,
                        description="Kadar kolesterol di atas batas ideal berkontribusi menaikkan estimasi risiko model.",
                        value_display=f"{int(chol)} mg/dL",
                    )
                )
            else:
                factors.append(
                    ContributingFactor(
                        feature="cholesterol",
                        label="Kadar Kolesterol",
                        impact="decrease",
                        weight_percentage=14.0,
                        description="Kadar kolesterol dalam batas normal berkontribusi menurunkan estimasi risiko model.",
                        value_display=f"{int(chol)} mg/dL",
                    )
                )

        # 6. Biological & Genetic: Family History (always separate item)
        if family_history:
            factors.append(
                ContributingFactor(
                    feature="family_history",
                    label="Riwayat Keluarga",
                    impact="increase",
                    weight_percentage=15.0,
                    description="Adanya riwayat penyakit kronis dalam keluarga berkontribusi menaikkan estimasi risiko model.",
                    value_display="Ada riwayat keluarga",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="family_history",
                    label="Riwayat Keluarga",
                    impact="decrease",
                    weight_percentage=10.0,
                    description="Tidak ada riwayat penyakit kronis keluarga berkontribusi menurunkan estimasi risiko model.",
                    value_display="Tidak ada riwayat",
                )
            )

        # 7. Biological: Age (always separate item)
        if age >= 45.0:
            factors.append(
                ContributingFactor(
                    feature="age",
                    label="Usia",
                    impact="increase",
                    weight_percentage=round(min(30.0, 10.0 + (age - 45.0) * 0.8), 1),
                    description="Faktor pertambahan usia berkontribusi menaikkan estimasi risiko dasar pada model.",
                    value_display=f"{int(age)} tahun",
                )
            )
        else:
            factors.append(
                ContributingFactor(
                    feature="age",
                    label="Usia",
                    impact="decrease",
                    weight_percentage=12.0,
                    description="Faktor usia di bawah 45 tahun berkontribusi menurunkan estimasi risiko dasar pada model.",
                    value_display=f"{int(age)} tahun",
                )
            )

        # Sort factors by contribution percentage descending
        factors.sort(key=lambda f: f.weight_percentage, reverse=True)
        return factors

    @staticmethod
    def format_factor_from_xai(
        feature: str,
        direction: str,
        contribution: float,
    ) -> ContributingFactor:
        """Format an XAIResult row into a ContributingFactor."""
        canonical_dir = "positive" if direction in ("positive", "increase") else "negative"
        labels = {
            "age": "Usia",
            "bmi": "Indeks Massa Tubuh (IMT)",
            "physical_activity": "Aktivitas Fisik",
            "sleep_duration": "Durasi Tidur",
            "smoking_status": (
                "Kebiasaan Merokok" if canonical_dir == "positive" else "Bebas Asap Rokok"
            ),
            "family_history": "Riwayat Penyakit Keluarga",
            "stress_level": "Tingkat Stres",
            "blood_sugar": "Kadar Gula Darah",
            "cholesterol": "Kadar Kolesterol",
            "systolic_bp": "Tekanan Darah Sistolik",
            "diastolic_bp": "Tekanan Darah Diastolik",
        }
        descriptions = {
            ("age", "positive"): (
                "Faktor pertambahan usia berkontribusi menaikkan estimasi risiko dasar pada model."
            ),
            ("age", "negative"): (
                "Faktor usia di bawah 45 tahun berkontribusi menurunkan estimasi risiko dasar pada model."
            ),
            ("bmi", "positive"): (
                "BMI di atas rentang ideal (≥ 25) berkontribusi menaikkan estimasi risiko model."
            ),
            ("bmi", "negative"): (
                "Pada model, nilai IMT ini berkontribusi menurunkan estimasi risiko kardiometabolik."
            ),
            ("physical_activity", "positive"): (
                "Aktivitas fisik di bawah 150 menit/minggu berkontribusi menaikkan estimasi risiko model."
            ),
            ("physical_activity", "negative"): (
                "Aktivitas fisik memenuhi panduan 150 menit/minggu berkontribusi menurunkan estimasi risiko model."
            ),
            ("smoking_status", "positive"): (
                "Kebiasaan merokok aktif berkontribusi menaikkan estimasi risiko model secara signifikan."
            ),
            ("smoking_status", "negative"): (
                "Status bebas asap rokok berkontribusi menurunkan estimasi risiko model."
            ),
            ("sleep_duration", "positive"): (
                "Durasi tidur di bawah 7 jam per hari berkontribusi menaikkan estimasi risiko model."
            ),
            ("sleep_duration", "negative"): (
                "Durasi tidur optimal (7–8 jam/hari) berkontribusi menurunkan estimasi risiko model."
            ),
            ("family_history", "positive"): (
                "Adanya riwayat penyakit kronis dalam keluarga berkontribusi menaikkan estimasi risiko model."
            ),
            ("family_history", "negative"): (
                "Tidak ada riwayat penyakit kronis keluarga berkontribusi menurunkan estimasi risiko model."
            ),
            ("stress_level", "positive"): (
                "Tingkat stres yang dilaporkan tinggi berkontribusi menaikkan estimasi risiko model."
            ),
            ("stress_level", "negative"): (
                "Tingkat stres dalam batas terkontrol berkontribusi menurunkan estimasi risiko model."
            ),
            ("blood_sugar", "positive"): (
                "Kadar gula darah di atas batas optimal berkontribusi menaikkan estimasi risiko model."
            ),
            ("blood_sugar", "negative"): (
                "Kadar gula darah dalam batas normal berkontribusi menurunkan estimasi risiko model."
            ),
            ("cholesterol", "positive"): (
                "Kadar kolesterol di atas batas ideal berkontribusi menaikkan estimasi risiko model."
            ),
            ("cholesterol", "negative"): (
                "Kadar kolesterol dalam batas normal berkontribusi menurunkan estimasi risiko model."
            ),
            ("systolic_bp", "positive"): (
                "Tekanan darah sistolik di atas batas normal berkontribusi menaikkan estimasi risiko model."
            ),
            ("systolic_bp", "negative"): (
                "Tekanan darah sistolik dalam batas normal berkontribusi menurunkan estimasi risiko model."
            ),
            ("diastolic_bp", "positive"): (
                "Tekanan darah diastolik di atas batas normal berkontribusi menaikkan estimasi risiko model."
            ),
            ("diastolic_bp", "negative"): (
                "Tekanan darah diastolik dalam batas normal berkontribusi menurunkan estimasi risiko model."
            ),
        }
        label = labels.get(feature, feature.replace("_", " ").title())
        desc = descriptions.get(
            (feature, canonical_dir),
            f"Faktor {label.lower()} memengaruhi profil risiko estimasi.",
        )
        return ContributingFactor(
            feature=feature,
            label=label,
            impact="increase" if canonical_dir == "positive" else "decrease",
            weight_percentage=round(contribution, 1),
            description=desc,
        )

    @staticmethod
    def generate_recommendations(
        profile: Any,
        risks: dict[str, float] | None = None,
        top_factors: list[ContributingFactor] | None = None,
    ) -> list[dict[str, Any]]:
        """Generate clinical rule engine recommendations based on modifiable lifestyle parameters and safety rules (PRD §6.11, §9.16).

        - Triggered strictly by clinical guideline thresholds (Rule Engine), NOT SHAP direction.
        - Ordered by SHAP feature attribution weight (FR-026).
        - Safety guardrail (REC-SAFETY-01) triggers unconditionally when high risk threshold is crossed.
        """
        recs: list[dict[str, Any]] = []
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()

        # 1. Safety Guardrail Rule (FR-037 / FR-038): High risk threshold warning
        # Triggered whenever any condition has high probability (>= 0.60, aligning with UI 'Lebih Tinggi' band >= 60)
        has_high_risk = False
        if risks:
            has_high_risk = any(float(prob) >= 0.60 for prob in risks.values())

        if has_high_risk:
            recs.append(
                {
                    "rule_id": "REC-SAFETY-01",
                    "title": "Konsultasi Tenaga Kesehatan",
                    "category": "consultation",
                    "action": "Hasil estimasi risiko Anda berada pada kategori yang memerlukan perhatian. Pertimbangkan untuk mendiskusikan hasil asesmen ini dengan dokter atau tenaga kesehatan profesional.",
                    "priority": "high",
                    "evidence_level": "High",
                    "source": "Direktorat Pencegahan dan Pengendalian PTM Kemenkes RI (2022)",
                }
            )

        # 2. Modifiable Lifestyle Rules (Triggered strictly by guideline thresholds)
        lifestyle_recs: list[dict[str, Any]] = []

        if activity < 150.0:
            lifestyle_recs.append(
                {
                    "rule_id": "REC-ACT-01",
                    "feature": "physical_activity",
                    "title": "Tingkatkan Aktivitas Fisik Aerobik",
                    "category": "activity",
                    "action": "Lakukan jalan cepat atau aktivitas aerobik sedang minimal 150 menit per minggu (30 menit, 5 hari).",
                    "priority": "high",
                    "evidence_level": "High",
                    "source": "WHO Guidelines on Physical Activity and Sedentary Behaviour (2020)",
                }
            )

        if sleep < 7.0:
            lifestyle_recs.append(
                {
                    "rule_id": "REC-SLP-01",
                    "feature": "sleep_duration",
                    "title": "Optimalkan Durasi & Kualitas Tidur",
                    "category": "sleep",
                    "action": "Jaga jadwal tidur konsisten 7–8 jam setiap malam dan batasi paparan layar 1 jam sebelum tidur.",
                    "priority": "high",
                    "evidence_level": "High",
                    "source": "Kemenkes RI / CDC Sleep Recommendations (2022)",
                }
            )

        if bmi >= 25.0:
            lifestyle_recs.append(
                {
                    "rule_id": "REC-NUT-01",
                    "feature": "bmi",
                    "title": "Manajemen Berat Badan & Pola Makan Seimbang",
                    "category": "nutrition",
                    "action": "Kurangi asupan gula sederhana dan tingkatkan konsumsi serat harian minimal 25 gram.",
                    "priority": "high",
                    "evidence_level": "High",
                    "source": "Panduan Diet & Obesitas PERKENI (2021)",
                }
            )

        if bmi < 18.5:
            lifestyle_recs.append(
                {
                    "rule_id": "REC-NUT-LOWBMI-01",
                    "feature": "bmi",
                    "title": "Perhatikan berat badan",
                    "category": "nutrition",
                    "action": f"IMT Anda {format(bmi, ".1f").replace(".", ",")} kg/m², di bawah rentang normal. Tingkatkan asupan nutrisi seimbang untuk mencapai berat badan ideal.",
                    "priority": "medium",
                    "evidence_level": "High",
                    "source": "Pedoman Gizi Seimbang Kemenkes (BR-EVIDENCE)",
                }
            )
        if smoking == "current":
            lifestyle_recs.append(
                {
                    "rule_id": "REC-SMK-01",
                    "feature": "smoking_status",
                    "title": "Program Penghentian Merokok",
                    "category": "activity",
                    "action": "Manfaatkan layanan konseling Upaya Berhenti Merokok (UBM) Kemenkes untuk menurunkan risiko kardiovaskular drastis.",
                    "priority": "high",
                    "evidence_level": "High",
                    "source": "Kemenkes RI — Program Pengendalian Tembakau (2021)",
                }
            )

        # 3. Order lifestyle recommendations by SHAP contribution / factor weight (FR-026)
        if top_factors:
            weight_map = {
                (f.feature if hasattr(f, "feature") else f.get("feature", "")): (
                    float(f.weight_percentage) if hasattr(f, "weight_percentage") else float(f.get("weight_percentage", 0.0))
                )
                for f in top_factors
            }
            lifestyle_recs.sort(
                key=lambda r: weight_map.get(r.get("feature", ""), 0.0),
                reverse=True,
            )

        # Clean internal feature field before returning
        for r in lifestyle_recs:
            r.pop("feature", None)

        recs.extend(lifestyle_recs)
        return recs

    def simulate_future_trajectory(
        self, profile: Any, horizon_days: int
    ) -> dict[str, Any]:
        """Project future risk and score trajectories over defined horizons (30, 90, 180 days).

        Implements Architecture §8, §14, PRD BR-SIM-001–004, AC-SIM-01/02.
        Operates without database mutation (PRD BR-SIM-007).
        """
        # 1. Baseline risk and scores
        base_risks = self.estimate_risks(profile)
        base_health = self.calculate_health_score(base_risks)
        base_lifestyle = self.calculate_lifestyle_score(profile)

        # 2. Time factor: non-linear horizon scale
        time_factor = (horizon_days / 180.0) ** 0.65

        # Extract modifiable parameters
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()
        bmi = float(profile.bmi) if profile.bmi else 22.0
        stress = float(profile.stress_level) if profile.stress_level else 5.0

        # Calculate net lifestyle health alignment
        activity_alignment = (
            0.4 if activity >= 150.0 else (-0.4 if activity < 60.0 else -0.1)
        )
        sleep_alignment = (
            0.3 if 7.0 <= sleep <= 8.5 else (-0.35 if sleep < 6.0 else 0.0)
        )
        smoking_alignment = (
            0.4 if smoking == "never" else (-0.6 if smoking == "current" else 0.1)
        )
        bmi_alignment = 0.2 if bmi < 24.0 else (-0.4 if bmi >= 28.0 else -0.1)
        stress_alignment = 0.2 if stress <= 3.0 else (-0.3 if stress >= 7.0 else 0.0)

        # Condition-specific habit dynamics
        dm_momentum = (
            (bmi_alignment * 0.45)
            + (activity_alignment * 0.4)
            + (sleep_alignment * 0.15)
        )
        ht_momentum = (
            (sleep_alignment * 0.4)
            + (stress_alignment * 0.35)
            + (activity_alignment * 0.25)
        )
        cvd_momentum = (
            (smoking_alignment * 0.5)
            + (activity_alignment * 0.3)
            + (bmi_alignment * 0.2)
        )

        def project_prob(base_p: float, momentum: float) -> float:
            base_lo = math.log(base_p / (1.0 - base_p))
            delta_lo = momentum * time_factor * 0.40
            new_lo = base_lo - delta_lo
            new_p = _sigmoid(new_lo)
            return round(max(0.0100, min(0.9500, new_p)), 4)

        proj_dm = project_prob(base_risks["diabetes_risk"], dm_momentum)
        proj_ht = project_prob(base_risks["hypertension_risk"], ht_momentum)
        proj_cvd = project_prob(base_risks["cardiovascular_risk"], cvd_momentum)

        proj_risks = {
            "diabetes_risk": proj_dm,
            "hypertension_risk": proj_ht,
            "cardiovascular_risk": proj_cvd,
        }

        proj_health = self.calculate_health_score(proj_risks)
        proj_lifestyle = base_lifestyle

        assumptions = [
            f"Rutinitas aktivitas fisik ({activity:.0f} menit/minggu) dipertahankan stabil selama {horizon_days} hari.",
            f"Pola durasi tidur rata-rata ({sleep:.1f} jam/malam) berjalan konsisten.",
            "Tidak ada intervensi medis/farmakologis baru yang ditambahkan.",
            "Proyeksi berbasis simulasi tren model kardiometabolik, bukan hasil diagnosis klinis mutlak.",
        ]

        def to_level(p: float) -> str:
            if p >= 0.50:
                return "high"
            if p >= 0.25:
                return "moderate"
            return "low"

        def to_label(lvl: str) -> str:
            return {"low": "Lower", "moderate": "Moderate", "high": "Higher"}.get(
                lvl, "Lower"
            )

        def to_trend(base_p: float, proj_p: float) -> str:
            diff = proj_p - base_p
            if diff < -0.005:
                return "decreasing"
            if diff > 0.005:
                return "increasing"
            return "stable"

        def to_desc(condition: str, base_p: float, proj_p: float, days: int) -> str:
            diff_pct = round((proj_p - base_p) * 100.0, 1)
            if diff_pct < -0.5:
                return f"Pola gaya hidup protektif diproyeksikan mereduksi beban risiko sebesar {abs(diff_pct):.1f}% dalam {days} hari."
            elif diff_pct > 0.5:
                return f"Paparan faktor risiko yang berlanjut berpotensi meningkatkan estimasi sebesar +{diff_pct:.1f}% dalam {days} hari."
            return f"Estimasi risiko relatif stabil dengan deviasi minimal ({diff_pct:+.1f}%) dalam {days} hari."

        conditions_meta = [
            ("diabetes", "Diabetes Melitus Tipe 2", base_risks["diabetes_risk"], proj_dm),
            ("hypertension", "Hipertensi", base_risks["hypertension_risk"], proj_ht),
            (
                "cardiovascular",
                "Kardiovaskular",
                base_risks["cardiovascular_risk"],
                proj_cvd,
            ),
        ]

        trajectories = []
        for cond, label, bp, pp in conditions_meta:
            lvl = to_level(pp)
            lbl = to_label(lvl)
            tr = to_trend(bp, pp)
            b_score = round(bp * 100.0, 1)
            p_score = round(pp * 100.0, 1)
            delta = round(p_score - b_score, 1)
            trajectories.append(
                {
                    "condition": cond,
                    "label": label,
                    "baseline_probability": bp,
                    "projected_probability": pp,
                    "baseline_score": b_score,
                    "projected_score": p_score,
                    "delta_percentage": delta,
                    "risk_level": lvl,
                    "risk_label": lbl,
                    "trend": tr,
                    "description": to_desc(cond, bp, pp, horizon_days),
                }
            )

        # Generate discrete trajectory projection points directly evaluated by the risk model
        step = 1 if horizon_days <= 90 else 2
        daily_points = []
        for d in range(0, horizon_days + 1, step):
            if d == 0:
                daily_points.append(
                    {
                        "day": 0,
                        "health_score": base_health,
                        "lifestyle_score": base_lifestyle,
                    }
                )
            elif d == horizon_days:
                daily_points.append(
                    {
                        "day": horizon_days,
                        "health_score": proj_health,
                        "lifestyle_score": proj_lifestyle,
                    }
                )
            else:
                tf_d = (d / 180.0) ** 0.65

                def prob_at_day(base_p: float, mom: float) -> float:
                    b_lo = math.log(base_p / (1.0 - base_p))
                    d_lo = mom * tf_d * 0.40
                    return round(max(0.0100, min(0.9500, _sigmoid(b_lo - d_lo))), 4)

                r_at_d = {
                    "diabetes_risk": prob_at_day(base_risks["diabetes_risk"], dm_momentum),
                    "hypertension_risk": prob_at_day(base_risks["hypertension_risk"], ht_momentum),
                    "cardiovascular_risk": prob_at_day(base_risks["cardiovascular_risk"], cvd_momentum),
                }
                daily_points.append(
                    {
                        "day": d,
                        "health_score": self.calculate_health_score(r_at_d),
                        "lifestyle_score": base_lifestyle,
                    }
                )

        return {
            "horizon_days": horizon_days,
            "assumptions": assumptions,
            "baseline_health_score": base_health,
            "projected_health_score": proj_health,
            "baseline_lifestyle_score": base_lifestyle,
            "projected_lifestyle_score": proj_lifestyle,
            "risk_trajectories": trajectories,
            "daily_trajectories": daily_points,
            "is_model_estimated": True,
            "disclaimer": (
                "Simulasi merupakan proyeksi skenario model gaya hidup terarah, "
                "bukan prognosis medis atau jaminan luaran klinis."
            ),
        }

    def simulate_what_if(
        self, profile: Any, overrides: dict[str, Any]
    ) -> dict[str, Any]:
        """Simulate real-time risk recalculation for modifiable lifestyle overrides.

        Implements Architecture §8, §14, PRD BR-WHATIF-001–004, BR-SIM-007, SIM-003.
        Operates without modifying the user's persisted health profile.
        """
        # Baseline calculations
        base_risks = self.estimate_risks(profile)
        base_health = self.calculate_health_score(base_risks)
        base_lifestyle = self.calculate_lifestyle_score(profile)

        # Extract values with overrides applied
        height_cm = float(profile.height_cm)
        weight_kg = (
            float(overrides["weight_kg"])
            if overrides.get("weight_kg") is not None
            else float(profile.weight_kg)
        )
        sim_height_m = height_cm / 100.0
        derived_bmi = round(weight_kg / (sim_height_m * sim_height_m), 1)

        activity = (
            float(overrides["physical_activity_min_per_week"])
            if overrides.get("physical_activity_min_per_week") is not None
            else float(profile.physical_activity_min_per_week)
        )
        sleep = (
            float(overrides["sleep_duration_hours"])
            if overrides.get("sleep_duration_hours") is not None
            else float(profile.sleep_duration_hours)
        )
        smoking = (
            str(overrides["smoking_status"]).lower()
            if overrides.get("smoking_status") is not None
            else str(
                profile.smoking_status.value
                if hasattr(profile.smoking_status, "value")
                else profile.smoking_status
            ).lower()
        )

        class VirtualProfile:
            def __init__(self, **kwargs: Any) -> None:
                self.__dict__.update(kwargs)

        sim_profile = VirtualProfile(
            age=profile.age,
            gender=profile.gender,
            height_cm=height_cm,
            weight_kg=weight_kg,
            bmi=derived_bmi,
            physical_activity_min_per_week=activity,
            sleep_duration_hours=sleep,
            smoking_status=smoking,
            family_history=profile.family_history,
            stress_level=profile.stress_level,
            blood_sugar_mg_dl=profile.blood_sugar_mg_dl,
            cholesterol_mg_dl=profile.cholesterol_mg_dl,
            blood_pressure=profile.blood_pressure,
        )

        sim_risks = self.estimate_risks(sim_profile)
        sim_health = self.calculate_health_score(sim_risks)
        sim_lifestyle = self.calculate_lifestyle_score(sim_profile)

        def to_level(p: float) -> str:
            if p >= 0.50:
                return "high"
            if p >= 0.25:
                return "moderate"
            return "low"

        def to_label(lvl: str) -> str:
            return {"low": "Lower", "moderate": "Moderate", "high": "Higher"}.get(
                lvl, "Lower"
            )

        def make_impact_summary(cond: str, delta: float) -> str:
            if delta < -0.5:
                return f"Penyesuaian gaya hidup mereduksi estimasi risiko {cond} sebesar {abs(delta):.1f}%."
            elif delta > 0.5:
                return f"Penyesuaian parameter menaikkan estimasi beban risiko {cond} sebesar +{delta:.1f}%."
            return f"Penyesuaian parameter menghasilkan estimasi risiko {cond} yang stabil ({delta:+.1f}%)."

        conditions_meta = [
            ("diabetes", "Diabetes Melitus Tipe 2"),
            ("hypertension", "Hipertensi"),
            ("cardiovascular", "Kardiovaskular"),
        ]

        comparisons = []
        for cond, label in conditions_meta:
            bp = base_risks[f"{cond}_risk"]
            sp = sim_risks[f"{cond}_risk"]
            b_score = round(bp * 100.0, 1)
            s_score = round(sp * 100.0, 1)
            delta = round(s_score - b_score, 1)
            lvl = to_level(sp)
            lbl = to_label(lvl)
            tr = (
                "decreasing"
                if delta < -0.3
                else ("increasing" if delta > 0.3 else "stable")
            )
            comparisons.append(
                {
                    "condition": cond,
                    "label": label,
                    "baseline_probability": bp,
                    "simulated_probability": sp,
                    "baseline_score": b_score,
                    "simulated_score": s_score,
                    "delta_percentage": delta,
                    "risk_level": lvl,
                    "risk_label": lbl,
                    "trend": tr,
                    "impact_summary": make_impact_summary(label, delta),
                }
            )

        applied_params: dict[str, str | float] = {
            "sleep_duration_hours": sleep,
            "physical_activity_min_per_week": activity,
            "weight_kg": weight_kg,
            "smoking_status": smoking,
            "bmi": derived_bmi,
        }

        return {
            "applied_parameters": applied_params,
            "derived_bmi": derived_bmi,
            "baseline_health_score": base_health,
            "simulated_health_score": sim_health,
            "health_score_delta": round(sim_health - base_health, 1),
            "baseline_lifestyle_score": base_lifestyle,
            "simulated_lifestyle_score": sim_lifestyle,
            "lifestyle_score_delta": round(sim_lifestyle - base_lifestyle, 1),
            "condition_comparisons": comparisons,
            "is_model_estimated": True,
            "disclaimer": (
                "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. "
                "Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model "
                "yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan."
            ),
        }


risk_engine = PreventiveLifestyleRiskEngine()

