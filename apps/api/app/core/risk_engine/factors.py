"""HELIORA API — Contributing factors, XAI formatting, and recommendations.

Rule-based explanation content for assessments: top attribution factors
(Architecture §9/§10) and deterministic guideline-backed recommendations
(Architecture §14).
"""

from typing import Any

from app.core.vitals import normalize_smoking_status, parse_blood_pressure
from app.schemas.assessment import ContributingFactor


class FactorExtractionMixin:
    """Builds contributing factors and rule-based recommendations."""

    @staticmethod
    def extract_top_factors(
        profile: Any, risks: dict[str, float] | None = None
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
        smoking = normalize_smoking_status(profile.smoking_status)
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
                    value_display=f"{bmi:.1f} kg/m² · di atas batas normal (≥ 25,0)",
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
                    value_display=f"{bmi:.1f} kg/m² · di bawah rentang normal (18,5–22,9)",
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
                    value_display=f"{bmi:.1f} kg/m² · rentang ideal Asia (18,5–22,9)",
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
                    value_display=f"{bmi:.1f} kg/m² · berat badan berlebih (23,0–24,9)",
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
            sys_bp, dia_bp = parse_blood_pressure(profile.blood_pressure)
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
        canonical_dir = (
            "positive" if direction in ("positive", "increase") else "negative"
        )
        labels = {
            "age": "Usia",
            "bmi": "Indeks Massa Tubuh (IMT)",
            "physical_activity": "Aktivitas Fisik",
            "sleep_duration": "Durasi Tidur",
            "smoking_status": (
                "Kebiasaan Merokok"
                if canonical_dir == "positive"
                else "Bebas Asap Rokok"
            ),
            "family_history": "Riwayat Penyakit Keluarga",
            "stress_level": "Tingkat Stres",
            "blood_sugar": "Kadar Gula Darah",
            "cholesterol": "Kadar Kolesterol",
            "systolic_bp": "Tekanan Darah Sistolik",
            "diastolic_bp": "Tekanan Darah Diastolik",
        }
        descriptions = {
            ("bmi", "positive"): (
                "BMI tergolong di atas batas ideal, meningkatkan beban metabolik & vaskular."
            ),
            ("bmi", "negative"): (
                "BMI berada pada rentang sehat dan melindungi fungsi metabolik."
            ),
            ("physical_activity", "positive"): (
                "Aktivitas fisik di bawah panduan 150 menit/minggu rekomendasi WHO."
            ),
            ("physical_activity", "negative"): (
                "Aktivitas fisik mencukupi rekomendasi kardioprotektif WHO."
            ),
            ("smoking_status", "positive"): (
                "Merokok aktif merupakan faktor pemicu utama disfungsi endotel & plak kardiovaskular."
            ),
            ("smoking_status", "negative"): (
                "Tidak merokok menjaga integritas endotel dan elastisitas arteri jangka panjang."
            ),
            ("sleep_duration", "positive"): (
                "Durasi tidur berpotensi memicu lonjakan kortisol & resistensi insulin nokturnal."
            ),
            ("sleep_duration", "negative"): (
                "Pola tidur optimal mendukung regulasi kardiometabolik."
            ),
            ("family_history", "positive"): (
                "Riwayat keluarga mengindikasikan kecenderungan predisposisi genetik metabolik."
            ),
            ("family_history", "negative"): (
                "Tanpa riwayat keluarga penyakit kronis memberikan keuntungan protektif."
            ),
            ("stress_level", "positive"): (
                "Tingkat stres tinggi memicu aktivasi sistem saraf simpatis dan peningkatan kortisol."
            ),
            ("stress_level", "negative"): (
                "Tingkat stres rendah mendukung stabilitas tekanan darah dan pemulihan metabolik."
            ),
            ("age", "positive"): (
                "Pertambahan usia merupakan faktor risiko biologis terhadap elastisitas pembuluh darah."
            ),
            ("age", "negative"): (
                "Faktor usia saat ini belum memberikan beban risiko degeneratif signifikan."
            ),
        }
        label = labels.get(feature, feature.replace("_", " ").title())
        desc = descriptions.get(
            (feature, canonical_dir),
            f"Kontribusi faktor {feature} terhadap estimasi risiko.",
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
        overrides: dict[str, Any] | None = None,
        risks: dict[str, float] | None = None,
        top_factors: list[Any] | None = None,
    ) -> list[dict[str, Any]]:
        """Generate clinical rule engine recommendations based on modifiable lifestyle parameters and safety rules (PRD §6.11, §9.16).

        - Triggered strictly by clinical guideline thresholds (Rule Engine), NOT SHAP direction.
        - Ordered by SHAP feature attribution weight (FR-026).
        - Safety guardrail (REC-SAFETY-01) triggers unconditionally when high risk threshold is crossed (>= 0.60).
        """
        recs: list[dict[str, Any]] = []
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = normalize_smoking_status(profile.smoking_status)

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
                    "action": f"IMT Anda {bmi:.1f} kg/m², di bawah rentang normal. Tingkatkan asupan nutrisi seimbang untuk mencapai berat badan ideal.",
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
                    float(f.weight_percentage)
                    if hasattr(f, "weight_percentage")
                    else float(f.get("weight_percentage", 0.0))
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
