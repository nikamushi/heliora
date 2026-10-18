"""HELIORA API — Future trajectory and what-if simulation (Architecture §12).

Projects risk/score trajectories over defined horizons and recalculates
risks for modifiable lifestyle overrides without database mutation
(PRD BR-SIM-001–007, BR-WHATIF-001–006).
"""

import math
from typing import Any

from app.core.attribute_profile import AttributeProfile
from app.core.risk_engine._shared import _sigmoid
from app.core.risk_levels import to_risk_label, to_risk_level
from app.core.vitals import normalize_smoking_status
from app.schemas.simulation import MANDATORY_MEDICAL_DISCLAIMER


class SimulationMixin:
    """Projects risk/score trajectories and simulates lifestyle overrides."""

    def simulate_future_trajectory(
        self, profile: Any, horizon_days: int
    ) -> dict[str, Any]:
        """Project future risk and score trajectories over defined horizons (30, 90, 180 days).

        Implements Architecture §12, §19, PRD BR-SIM-001–004, AC-SIM-01/02.
        Operates without database mutation (PRD BR-SIM-007).
        """
        # 1. Baseline risk and scores
        base_risks = self.estimate_risks(profile)
        base_health = self.calculate_health_score(profile, base_risks)
        base_lifestyle = self.calculate_lifestyle_score(profile)

        # 2. Time factor: non-linear horizon scale
        time_factor = (horizon_days / 180.0) ** 0.65

        # Extract modifiable parameters
        activity = float(profile.physical_activity_min_per_week)
        sleep = float(profile.sleep_duration_hours)
        smoking = normalize_smoking_status(profile.smoking_status)
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

        proj_health = self.calculate_health_score(profile, proj_risks)
        proj_lifestyle = base_lifestyle

        assumptions = [
            f"Rutinitas aktivitas fisik ({activity:.0f} menit/minggu) dipertahankan stabil selama {horizon_days} hari.",
            f"Pola durasi tidur rata-rata ({sleep:.1f} jam/malam) berjalan konsisten.",
            "Tidak ada intervensi medis/farmakologis baru yang ditambahkan.",
            "Proyeksi berbasis simulasi tren model kardiometabolik, bukan hasil diagnosis klinis mutlak.",
        ]

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
            ("diabetes", "Diabetes Melitus", base_risks["diabetes_risk"], proj_dm),
            ("hypertension", "Hipertensi", base_risks["hypertension_risk"], proj_ht),
            (
                "cardiovascular",
                "Penyakit Jantung",
                base_risks["cardiovascular_risk"],
                proj_cvd,
            ),
        ]

        trajectories = []
        for cond, label, bp, pp in conditions_meta:
            lvl = to_risk_level(pp)
            lbl = to_risk_label(lvl)
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

        return {
            "horizon_days": horizon_days,
            "assumptions": assumptions,
            "baseline_health_score": base_health,
            "projected_health_score": proj_health,
            "baseline_lifestyle_score": base_lifestyle,
            "projected_lifestyle_score": proj_lifestyle,
            "risk_trajectories": trajectories,
            "is_model_estimated": True,
            "disclaimer": MANDATORY_MEDICAL_DISCLAIMER,
        }

    def simulate_what_if(
        self, profile: Any, overrides: dict[str, Any]
    ) -> dict[str, Any]:
        """Simulate real-time risk recalculation for modifiable lifestyle overrides.

        Implements Architecture §12.3, §18, PRD BR-WHATIF-001–006, BR-SIM-007, SIM-003.
        Operates without modifying the user's persisted health profile.
        """
        # Baseline calculations
        base_risks = self.estimate_risks(profile)
        base_health = self.calculate_health_score(profile, base_risks)
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
            normalize_smoking_status(overrides["smoking_status"])
            if overrides.get("smoking_status") is not None
            else normalize_smoking_status(profile.smoking_status)
        )

        sim_profile = AttributeProfile(
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
        sim_health = self.calculate_health_score(sim_profile, sim_risks)
        sim_lifestyle = self.calculate_lifestyle_score(sim_profile)

        def make_impact_summary(cond: str, delta: float) -> str:
            if delta < -0.5:
                return f"Penyesuaian gaya hidup mereduksi estimasi risiko {cond} sebesar {abs(delta):.1f}%."
            elif delta > 0.5:
                return f"Penyesuaian parameter menaikkan estimasi beban risiko {cond} sebesar +{delta:.1f}%."
            return f"Penyesuaian parameter menghasilkan estimasi risiko {cond} yang stabil ({delta:+.1f}%)."

        conditions_meta = [
            ("diabetes", "Diabetes Melitus"),
            ("hypertension", "Hipertensi"),
            ("cardiovascular", "Penyakit Jantung"),
        ]

        comparisons = []
        for cond, label in conditions_meta:
            bp = base_risks[f"{cond}_risk"]
            sp = sim_risks[f"{cond}_risk"]
            b_score = round(bp * 100.0, 1)
            s_score = round(sp * 100.0, 1)
            delta = round(s_score - b_score, 1)
            lvl = to_risk_level(sp)
            lbl = to_risk_label(lvl)
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
            "disclaimer": MANDATORY_MEDICAL_DISCLAIMER,
        }
