"""HELIORA API — Contributing factors, XAI formatting, and recommendations.

Rule-based explanation content for assessments: top attribution factors
(Architecture §9/§10) and deterministic guideline-backed recommendations
(Architecture §14).
"""

from typing import Any

from app.core.vitals import normalize_smoking_status
from app.schemas.assessment import ContributingFactor


class FactorExtractionMixin:
    """Builds contributing factors and rule-based recommendations."""

    @staticmethod
    def extract_top_factors(
        profile: Any, risks: dict[str, float]
    ) -> list[ContributingFactor]:
        """Extract top feature attribution factors explaining the risk assessment outcomes."""
        factors: list[ContributingFactor] = []
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = normalize_smoking_status(profile.smoking_status)
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
    def format_factor_from_xai(
        feature: str,
        direction: str,
        contribution: float,
    ) -> ContributingFactor:
        """Format an XAIResult row into a ContributingFactor."""
        labels = {
            "bmi": "Indeks Massa Tubuh (BMI)",
            "physical_activity": "Aktivitas Fisik",
            "smoking_status": (
                "Kebiasaan Merokok" if direction == "positive" else "Bebas Asap Rokok"
            ),
            "sleep_duration": "Durasi Tidur",
            "family_history": "Riwayat Penyakit Keluarga",
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
                "Riwayat keluarga mengindikasikan kecenderungan "
                "predisposisi genetik metabolik."
            ),
            ("family_history", "negative"): (
                "Tanpa riwayat keluarga penyakit kronis memberikan "
                "keuntungan protektif."
            ),
        }
        label = labels.get(feature, feature.replace("_", " ").title())
        desc = descriptions.get(
            (feature, direction),
            f"Kontribusi faktor {feature} terhadap estimasi risiko.",
        )
        return ContributingFactor(
            feature=feature,
            label=label,
            impact="increase" if direction == "positive" else "decrease",
            weight_percentage=round(contribution, 1),
            description=desc,
        )

    @staticmethod
    def generate_recommendations(profile: Any) -> list[dict[str, Any]]:
        """Generate clinical rule engine recommendations based on modifiable lifestyle parameters."""
        recs: list[dict[str, Any]] = []
        bmi = float(profile.bmi) if profile.bmi else 22.0
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = normalize_smoking_status(profile.smoking_status)
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
