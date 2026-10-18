"""HELIORA API — SHAP Explainable AI Module (XAI-001).

Generates SHAP (SHapley Additive exPlanations) feature contributions for the
Preventive Lifestyle Risk Engine. Provides feature-level explanations
for diabetes, hypertension, and cardiovascular risk predictions.

Architecture §8, PRD XAI-001.
"""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
import shap

from app.core.attribute_profile import AttributeProfile
from app.core.risk_engine import risk_engine
from app.core.vitals import normalize_smoking_status, parse_blood_pressure

logger = logging.getLogger(__name__)

# ── Feature configuration ────────────────────────────────────────
FEATURE_NAMES = [
    "age",
    "bmi",
    "physical_activity",
    "sleep_duration",
    "smoking_status",
    "family_history",
    "stress_level",
    "blood_sugar",
    "cholesterol",
    "systolic_bp",
    "diastolic_bp",
]

# ── Model wrapper for SHAP ───────────────────────────────────────
# SHAP requires a callable that maps features → predictions.
# We wrap the risk engine's estimate_risks to produce a 3-output
# prediction vector (diabetes, hypertension, CVD) for multi-output SHAP.


class RiskModelWrapper:
    """Wrapper that adapts the risk engine for SHAP explanation.

    The risk engine is a deterministic rule-based system, not a trained
    ML model. For XAI purposes, we treat it as a 'model' and use SHAP's
    KernelExplainer to attribute contributions to each feature.
    """

    def __init__(self) -> None:
        self._background_data: np.ndarray | None = None
        self._explainer: shap.KernelExplainer | None = None

    def _prepare_background_data(self) -> np.ndarray:
        """Create a background dataset for SHAP expectation values.

        Uses representative samples spanning the feature space to
        establish a baseline expectation for SHAP values.
        """
        rng = np.random.default_rng(42)
        n_samples = 100

        background = np.zeros((n_samples, len(FEATURE_NAMES)))

        for i in range(n_samples):
            background[i, 0] = rng.uniform(20, 80)       # age
            background[i, 1] = rng.uniform(18, 40)        # bmi
            background[i, 2] = rng.uniform(0, 300)        # physical_activity
            background[i, 3] = rng.uniform(4, 10)         # sleep_duration
            # smoking: 0=never, 1=former, 2=current (encoded numerically)
            background[i, 4] = rng.choice([0, 1, 2])      # smoking_status
            background[i, 5] = float(rng.choice([0, 1]))  # family_history
            background[i, 6] = rng.uniform(1, 10)         # stress_level
            background[i, 7] = rng.uniform(70, 160)       # blood_sugar
            background[i, 8] = rng.uniform(140, 260)      # cholesterol
            background[i, 9] = rng.uniform(100, 160)      # systolic_bp
            background[i, 10] = rng.uniform(60, 100)      # diastolic_bp

        self._background_data = background
        return background

    def _profile_to_feature_vector(self, profile: Any) -> np.ndarray:
        """Convert a HealthProfile ORM object to a feature vector."""
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

        smoking_map = {"never": 0, "former": 1, "current": 2}
        smoking_val = smoking_map.get(smoking, 0)

        return np.array(
            [
                float(profile.age),
                bmi,
                activity,
                sleep,
                smoking_val,
                float(family_history),
                stress,
                blood_sugar,
                cholesterol,
                systolic,
                diastolic,
            ],
            dtype=np.float64,
        )

    def _risk_predict(self, features: np.ndarray) -> np.ndarray:
        """Predict risk probabilities for a batch of feature vectors.

        Returns a (n_samples, 3) array with columns:
        [diabetes_risk, hypertension_risk, cardiovascular_risk]
        """
        n = features.shape[0]
        results = np.zeros((n, 3))
        for i in range(n):
            # Build a mock profile from feature vector
            profile = self._vector_to_mock_profile(features[i])
            risks = risk_engine.estimate_risks(profile)
            results[i, 0] = risks["diabetes_risk"]
            results[i, 1] = risks["hypertension_risk"]
            results[i, 2] = risks["cardiovascular_risk"]
        return results

    def _vector_to_mock_profile(self, vec: np.ndarray) -> Any:
        """Convert a feature vector back to a mock profile object."""
        smoking_map_rev = {0: "never", 1: "former", 2: "current"}

        return AttributeProfile(
            age=int(vec[0]),
            gender="male",
            height_cm=170.0,
            weight_kg=70.0,
            physical_activity_min_per_week=vec[2],
            sleep_duration_hours=vec[3],
            smoking_status=smoking_map_rev.get(int(vec[4]), "never"),
            family_history=bool(vec[5]),
            stress_level=float(vec[6]) if vec[6] > 0 else None,
            blood_sugar_mg_dl=vec[7],
            cholesterol_mg_dl=vec[8],
            blood_pressure=f"{int(vec[9])}/{int(vec[10])}",
            bmi=vec[1],
            created_at=None,
            updated_at=None,
        )

    def get_explainer(self) -> shap.KernelExplainer:
        """Get or create the SHAP KernelExplainer."""
        if self._explainer is None:
            background = self._prepare_background_data()
            self._explainer = shap.KernelExplainer(
                self._risk_predict, background
            )
            logger.info(
                "SHAP KernelExplainer initialized with %d background samples",
                len(background),
            )
        return self._explainer

    def explain_profile(self, profile: Any) -> dict[str, Any]:
        """Generate SHAP explanations for a single profile.

        Returns:
            Dictionary with:
            - shap_values: (11, 3) array of SHAP values per feature per condition
            - expected_values: baseline risk values from background data
            - feature_names: list of feature names
        """
        features = self._profile_to_feature_vector(profile).reshape(1, -1)
        explainer = self.get_explainer()

        # Compute SHAP values. For multi-output KernelExplainer, this returns
        # a 3D array (batch, n_features, n_outputs) or 2D (n_features, n_outputs).
        shap_values = explainer.shap_values(features)
        # Squeeze batch dimension if present: (1, 11, 3) → (11, 3)
        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            shap_values = shap_values[0]  # Remove batch dimension

        # shap_values is a list of 3 arrays (one per output) for multi-output
        # Each array has shape (1, 11) for a single prediction
        result: dict[str, Any] = {
            "shap_values": shap_values,
            "expected_values": explainer.expected_value,
            "feature_names": FEATURE_NAMES,
            "features": features[0].tolist(),
        }
        return result


# ── Singleton explainer instance ──────────────────────────────────
_explainer_instance = RiskModelWrapper()


def get_shap_explainer() -> RiskModelWrapper:
    """Get the singleton SHAP explainer instance."""
    return _explainer_instance


def explain_health_profile(profile: Any) -> list[dict[str, Any]]:
    """Generate human-readable SHAP feature contributions for a profile.

    Returns top contributing factors with:
    - feature: feature name
    - contribution: absolute SHAP value (importance)
    - direction: 'positive' (increases risk) or 'negative' (decreases risk)
    - label: human-readable label
    - description: explanation text
    """
    result = _explainer_instance.explain_profile(profile)
    shap_values = result["shap_values"]

    # shap_values is a (11, 3) numpy array for multi-output KernelExplainer:
    # rows = features, columns = [diabetes, hypertension, CVD]
    # Each cell is the SHAP value of that feature for that condition.
    if isinstance(shap_values, np.ndarray) and shap_values.ndim == 2:
        # Compute combined importance (sum of absolute SHAP values across all conditions)
        combined_importance = np.sum(np.abs(shap_values), axis=1)

        # Get top contributing features
        top_indices = np.argsort(combined_importance)[::-1][:5]

        factors: list[dict[str, Any]] = []
        for idx in top_indices:
            if combined_importance[idx] > 1e-6:
                feature_name = FEATURE_NAMES[idx]

                # Use diabetes column as primary direction indicator
                # (most clinically actionable for preventive health)
                raw_shap_dm = float(shap_values[idx, 0]) if shap_values.shape[1] > 0 else 0.0
                raw_shap_htn = float(shap_values[idx, 1]) if shap_values.shape[1] > 1 else 0.0
                raw_shap_cvd = float(shap_values[idx, 2]) if shap_values.shape[1] > 2 else 0.0

                # Overall direction based on net SHAP value across all conditions
                net_shap = raw_shap_dm + raw_shap_htn + raw_shap_cvd
                direction = "increase" if net_shap > 0 else "decrease"

                label = _get_feature_label(feature_name)
                description = _get_feature_description(feature_name, direction, profile)

                factors.append(
                    {
                        "feature": feature_name,
                        "factor": label,
                        "impact": direction,
                        "label": label,
                        "description": description,
                        "weight_percentage": round(
                            float(combined_importance[idx] / (np.sum(combined_importance) + 1e-10) * 100), 1
                        ),
                        "confidence": 0.85,  # SHAP values from rule-based model
                        "shap_diabetes": round(raw_shap_dm, 4),
                        "shap_hypertension": round(raw_shap_htn, 4),
                        "shap_cardiovascular": round(raw_shap_cvd, 4),
                    }
                )

        return factors

    # Fallback: empty list if unexpected shape
    logger.warning("Unexpected SHAP values shape: %s", shap_values.shape if hasattr(shap_values, 'shape') else type(shap_values))
    return []



def _get_feature_label(feature_name: str) -> str:
    """Get human-readable label for a feature."""
    labels = {
        "age": "Usia",
        "bmi": "Indeks Massa Tubuh (BMI)",
        "physical_activity": "Aktivitas Fisik",
        "sleep_duration": "Durasi Tidur",
        "smoking_status": "Status Merokok",
        "family_history": "Riwayat Keluarga",
        "stress_level": "Tingkat Stres",
        "blood_sugar": "Gula Darah",
        "cholesterol": "Kolesterol",
        "systolic_bp": "Tekanan Darah Sistolik",
        "diastolic_bp": "Tekanan Darah Diastolik",
    }
    return labels.get(feature_name, feature_name.replace("_", " ").title())


def _get_feature_description(
    feature_name: str, direction: str, profile: Any
) -> str:
    """Generate a human-readable description for a feature contribution."""
    descriptions = {
        "age": {
            "positive": "Usia lebih tinggi meningkatkan risiko penyakit metabolisme dan kardiovaskular.",
            "negative": "Usia dalam rentang optimal memberikan perlindungan relatif terhadap risiko.",
        },
        "bmi": {
            "positive": "BMI lebih tinggi berkontribusi terhadap peningkatan beban metabolik dan risiko.",
            "negative": "BMI dalam rentang sehat melindungi fungsi metabolik dan kardiovaskular.",
        },
        "physical_activity": {
            "positive": "Aktivitas fisik rendah meningkatkan risiko penyakit kronis.",
            "negative": "Aktivitas fisik cukup memberikan efek protektif terhadap risiko.",
        },
        "sleep_duration": {
            "positive": "Durasi tidur tidak optimal berpotensi meningkatkan risiko kesehatan.",
            "negative": "Pola tidur optimal mendukung regulasi kardiometabolik.",
        },
        "smoking_status": {
            "positive": "Merokok berkontribusi signifikan terhadap disfungsi endotel dan risiko kardiovaskular.",
            "negative": "Tidak merokok menjaga integritas vaskular dan fungsi metabolik.",
        },
        "family_history": {
            "positive": "Riwayat keluarga menunjukkan predisposisi genetik terhadap kondisi metabolik.",
            "negative": "Tanpa riwayat keluarga memberikan keuntungan protektif.",
        },
        "stress_level": {
            "positive": "Tingkat stres tinggi berpotensi meningkatkan tekanan darah dan risiko.",
            "negative": "Tingkat stres terkontrol mendukung kesehatan kardiometabolik.",
        },
        "blood_sugar": {
            "positive": "Gula darah lebih tinggi meningkatkan risiko diabetes.",
            "negative": "Gula darah dalam rentang normal melindungi dari risiko diabetes.",
        },
        "cholesterol": {
            "positive": "Kolesterol lebih tinggi berkontribusi terhadap risiko kardiovaskular.",
            "negative": "Kolesterol dalam rentang optimal memberikan perlindungan kardiovaskular.",
        },
        "systolic_bp": {
            "positive": "Tekanan darah sistolik lebih tinggi meningkatkan risiko hipertensi.",
            "negative": "Tekanan darah sistolik dalam rentang normal melindungi dari hipertensi.",
        },
        "diastolic_bp": {
            "positive": "Tekanan darah diastolik lebih tinggi berkontribusi terhadap risiko hipertensi.",
            "negative": "Tekanan darah diastolik dalam rentang normal memberikan perlindungan.",
        },
    }

    default_desc = f"Faktor {feature_name.replace('_', ' ')} berkontribusi terhadap estimasi risiko."
    return descriptions.get(feature_name, {}).get(direction, default_desc)
