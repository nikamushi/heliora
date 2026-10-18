"""HELIORA API — Risk Engine Model Training & Persistence (AI-002.1).

Trains gradient boosting models (XGBoost/LightGBM) on synthetic lifestyle data
and persists them for inference. Replaces the rule-based risk engine with
learned models while maintaining API compatibility.

Architecture §8, PRD AI-002.
"""

from __future__ import annotations

import json
import logging
import pickle
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import numpy as np
import xgboost as xgb
from lightgbm import LGBMClassifier

from app.ai.synthetic_data import (
    cardiovascular_probability,
    diabetes_probability,
    hypertension_probability,
    sample_features,
)
from app.core.vitals import normalize_smoking_status, parse_blood_pressure

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# ── Training data generation ─────────────────────────────────────

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

SMOKING_CODE = {"never": 0, "former": 1, "current": 2}


def generate_training_data(n_samples: int = 10000, seed: int = 42) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Generate synthetic labeled training data for risk prediction.

    Uses the shared synthetic cohort generator (app.ai.synthetic_data) so
    features and epidemiological probabilities match the evaluation pipeline.

    Returns:
        X: Feature matrix (n_samples, 11)
        y_diabetes: Binary diabetes labels
        y_hypertension: Binary hypertension labels
        y_cvd: Binary CVD labels
    """
    rng = np.random.default_rng(seed)

    feature_matrix = np.zeros((n_samples, len(FEATURE_NAMES)))
    y_diabetes = np.zeros(n_samples)
    y_hypertension = np.zeros(n_samples)
    y_cvd = np.zeros(n_samples)

    for i in range(n_samples):
        features = sample_features(rng)
        feature_matrix[i] = [
            float(features.age),
            features.bmi,
            features.physical_activity,
            features.sleep_duration,
            float(SMOKING_CODE[features.smoking_status]),
            float(features.family_history),
            features.stress_level if features.stress_level is not None else 0.0,
            features.blood_sugar_mg_dl if features.blood_sugar_mg_dl is not None else 90.0,
            features.cholesterol_mg_dl if features.cholesterol_mg_dl is not None else 180.0,
            features.systolic_bp,
            features.diastolic_bp,
        ]

        dm_prob = diabetes_probability(features)
        ht_prob = hypertension_probability(features)
        cvd_prob = cardiovascular_probability(features, ht_prob)

        y_diabetes[i] = 1 if rng.random() < dm_prob else 0
        y_hypertension[i] = 1 if rng.random() < ht_prob else 0
        y_cvd[i] = 1 if rng.random() < cvd_prob else 0

    return feature_matrix, y_diabetes, y_hypertension, y_cvd


# ── Model training ───────────────────────────────────────────────

@dataclass
class TrainedModels:
    """Container for trained risk prediction models."""

    diabetes_model: xgb.Booster | LGBMClassifier
    hypertension_model: xgb.Booster | LGBMClassifier
    cvd_model: xgb.Booster | LGBMClassifier
    training_info: dict[str, Any] = field(default_factory=dict)


def _neg_pos_ratio(y: np.ndarray) -> float:
    """Return the negative-to-positive sample ratio for binary labels.

    Used as XGBoost ``scale_pos_weight`` / LightGBM per-class weight so
    minority (positive) samples carry proportionally more gradient.
    Returns 1.0 when the positive class is absent (no weighting possible).
    """
    n_pos = int(np.sum(y == 1))
    n_neg = int(np.sum(y == 0))
    if n_pos == 0:
        return 1.0
    return round(n_neg / n_pos, 4)


def train_risk_models(
    n_samples: int = 10000,
    seed: int = 42,
    use_xgboost: bool = True,
    save_path: Path | None = None,
    balance_classes: bool = False,
) -> TrainedModels:
    """Train gradient boosting models for the three risk conditions.

    Args:
        n_samples: Number of synthetic training samples.
        seed: RNG seed for reproducibility.
        use_xgboost: If True, use XGBoost; otherwise LightGBM.
        save_path: Optional path to persist trained models.
        balance_classes: If True, weight the positive class of each
            condition by its negative/positive sample ratio (AI-003.04).
            Defaults to False so the historical baseline stays reproducible.

    Returns:
        TrainedModels with trained model objects and metadata.
    """
    logger.info(
        "Generating %d training samples (seed=%d, xgboost=%s, balance=%s)",
        n_samples,
        seed,
        use_xgboost,
        balance_classes,
    )

    feature_matrix, y_dm, y_ht, y_cvd = generate_training_data(n_samples, seed)

    train_method = _train_xgboost if use_xgboost else _train_lightgbm

    if balance_classes:
        weights = {
            "diabetes": _neg_pos_ratio(y_dm),
            "hypertension": _neg_pos_ratio(y_ht),
            "cardiovascular": _neg_pos_ratio(y_cvd),
        }
    else:
        weights = {"diabetes": 1.0, "hypertension": 1.0, "cardiovascular": 1.0}
    logger.info("Positive-class weights: %s", weights)

    logger.info("Training diabetes model...")
    diabetes_model = train_method(feature_matrix, y_dm, "diabetes", weights["diabetes"])

    logger.info("Training hypertension model...")
    hypertension_model = train_method(
        feature_matrix, y_ht, "hypertension", weights["hypertension"]
    )

    logger.info("Training CVD model...")
    cvd_model = train_method(
        feature_matrix, y_cvd, "cardiovascular", weights["cardiovascular"]
    )

    models = TrainedModels(
        diabetes_model=diabetes_model,
        hypertension_model=hypertension_model,
        cvd_model=cvd_model,
        training_info={
            "n_samples": n_samples,
            "seed": seed,
            "algorithm": "xgboost" if use_xgboost else "lightgbm",
            "n_features": len(FEATURE_NAMES),
            "feature_names": FEATURE_NAMES,
            "balance_classes": balance_classes,
            "class_weights": weights,
            "trained_at": datetime.now(UTC).isoformat(),
        },
    )

    if save_path:
        _save_models(models, save_path)
        logger.info("Models saved to %s", save_path)

    return models


def _train_xgboost(
    features: np.ndarray, y: np.ndarray, condition: str, pos_weight: float = 1.0
) -> xgb.Booster:
    """Train an XGBoost model for a specific condition.

    ``pos_weight`` maps to ``scale_pos_weight``; 1.0 means no weighting.
    """
    dtrain = xgb.DMatrix(features, label=y)

    params: dict[str, Any] = {
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "max_depth": 5,
        "learning_rate": 0.1,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "seed": 42,
    }
    if pos_weight != 1.0:
        params["scale_pos_weight"] = pos_weight

    model = xgb.train(params, dtrain, num_boost_round=100)
    return model


def _train_lightgbm(
    features: np.ndarray, y: np.ndarray, condition: str, pos_weight: float = 1.0
) -> LGBMClassifier:
    """Train a LightGBM model for a specific condition.

    ``pos_weight`` maps to a per-class weight dict; 1.0 means no weighting.
    """
    extra: dict[str, Any] = {}
    if pos_weight != 1.0:
        extra["class_weight"] = {0: 1.0, 1: pos_weight}
    model = LGBMClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1,
        **extra,
    )
    model.fit(features, y)
    return model


# ── Model persistence ────────────────────────────────────────────

def _save_models(models: TrainedModels, path: Path) -> None:
    """Save trained models to disk."""
    path.mkdir(parents=True, exist_ok=True)

    model_dict = {
        "diabetes": models.diabetes_model,
        "hypertension": models.hypertension_model,
        "cvd": models.cvd_model,
        "training_info": models.training_info,
    }

    with open(path / "risk_models.pkl", "wb") as f:
        pickle.dump(model_dict, f)

    with open(path / "training_info.json", "w") as f:
        json.dump(models.training_info, f, indent=2)

    logger.info("Saved %d models to %s", len(model_dict), path / "risk_models.pkl")


def load_models(path: Path) -> TrainedModels:
    """Load trained models from disk."""
    with open(path / "risk_models.pkl", "rb") as f:
        model_dict = pickle.load(f)

    return TrainedModels(
        diabetes_model=model_dict["diabetes"],
        hypertension_model=model_dict["hypertension"],
        cvd_model=model_dict["cvd"],
        training_info=model_dict.get("training_info", {}),
    )


# ── Model-based inference ────────────────────────────────────────

def _expected_default_signature() -> dict[str, Any]:
    """Training signature that a reusable default cache must carry."""
    return {
        "n_samples": 10000,
        "seed": 42,
        "algorithm": "xgboost",
        "n_features": len(FEATURE_NAMES),
        "balance_classes": False,
    }


class ModelRiskEngine:
    """Risk engine backed by trained gradient boosting models.

    Provides the same interface as the rule-based risk engine but uses
    learned models for prediction.
    """

    def __init__(self, models: TrainedModels | None = None):
        self.models = models
        if models is None:
            self.models = self._load_or_train_default()

    def _load_or_train_default(self) -> TrainedModels:
        """Load cached models or train new ones if not available.

        A cached model is only reused when its training signature
        (samples/seed/algorithm/features/weighting) matches the current
        defaults; otherwise it is retrained so stale models can never
        silently back an evaluation (AI-003 R4 guard).
        """
        default_path = MODEL_DIR / "default"
        pkl_path = default_path / "risk_models.pkl"
        if pkl_path.exists():
            try:
                cached = load_models(default_path)
                expected = _expected_default_signature()
                info = cached.training_info
                if all(info.get(key) == value for key, value in expected.items()):
                    logger.info("Loading cached models from %s", default_path)
                    return cached
                logger.warning(
                    "Cached models signature mismatch (config changed), retraining..."
                )
            except Exception as exc:  # corrupt cache must never block evaluation
                logger.warning("Failed to load cached models (%s), retraining...", exc)

        logger.info("No cached models found, training new models...")
        models = train_risk_models(save_path=default_path)
        return models

    def estimate_risks(self, profile: Any) -> dict[str, float]:
        """Predict risk probabilities using trained models."""
        features = self._profile_to_features(profile)
        dm_prob = self._predict(self.models.diabetes_model, features, 0)
        ht_prob = self._predict(self.models.hypertension_model, features, 1)
        cvd_prob = self._predict(self.models.cvd_model, features, 2)

        return {
            "diabetes_risk": round(float(dm_prob), 4),
            "hypertension_risk": round(float(ht_prob), 4),
            "cardiovascular_risk": round(float(cvd_prob), 4),
        }

    def _profile_to_features(self, profile: Any) -> np.ndarray:
        """Convert profile to feature vector."""
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

        smoking_val = SMOKING_CODE.get(smoking, 0)

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

    def _predict(
        self, model: xgb.Booster | LGBMClassifier, features: np.ndarray, idx: int
    ) -> float:
        """Predict probability for a specific condition."""
        feature_row = features.reshape(1, -1)
        if isinstance(model, xgb.Booster):
            dmatrix = xgb.DMatrix(feature_row)
            pred = model.predict(dmatrix)[0]
        else:
            pred = model.predict_proba(feature_row)[0, 1]
        return float(pred)


# ── Model evaluation ─────────────────────────────────────────────

def evaluate_trained_models(models: TrainedModels, n_test: int = 2000, seed: int = 123) -> dict[str, Any]:
    """Evaluate trained models on holdout test data.

    Returns evaluation metrics per condition.
    """
    feature_matrix, y_dm, y_ht, y_cvd = generate_training_data(n_test, seed)

    from sklearn.metrics import (
        accuracy_score,
        f1_score,
        precision_score,
        recall_score,
        roc_auc_score,
    )

    results: dict[str, Any] = {}

    # Diabetes
    if isinstance(models.diabetes_model, xgb.Booster):
        dm_pred = models.diabetes_model.predict(xgb.DMatrix(feature_matrix))
    else:
        dm_pred = models.diabetes_model.predict_proba(feature_matrix)[:, 1]
    results["diabetes"] = {
        "accuracy": round(accuracy_score(y_dm, (dm_pred >= 0.5).astype(int)), 4),
        "precision": round(precision_score(y_dm, (dm_pred >= 0.5).astype(int)), 4),
        "recall": round(recall_score(y_dm, (dm_pred >= 0.5).astype(int)), 4),
        "f1": round(f1_score(y_dm, (dm_pred >= 0.5).astype(int)), 4),
        "roc_auc": round(roc_auc_score(y_dm, dm_pred), 4),
    }

    # Hypertension
    if isinstance(models.hypertension_model, xgb.Booster):
        ht_pred = models.hypertension_model.predict(xgb.DMatrix(feature_matrix))
    else:
        ht_pred = models.hypertension_model.predict_proba(feature_matrix)[:, 1]
    results["hypertension"] = {
        "accuracy": round(accuracy_score(y_ht, (ht_pred >= 0.5).astype(int)), 4),
        "precision": round(precision_score(y_ht, (ht_pred >= 0.5).astype(int)), 4),
        "recall": round(recall_score(y_ht, (ht_pred >= 0.5).astype(int)), 4),
        "f1": round(f1_score(y_ht, (ht_pred >= 0.5).astype(int)), 4),
        "roc_auc": round(roc_auc_score(y_ht, ht_pred), 4),
    }

    # CVD
    if isinstance(models.cvd_model, xgb.Booster):
        cvd_pred = models.cvd_model.predict(xgb.DMatrix(feature_matrix))
    else:
        cvd_pred = models.cvd_model.predict_proba(feature_matrix)[:, 1]
    results["cardiovascular"] = {
        "accuracy": round(accuracy_score(y_cvd, (cvd_pred >= 0.5).astype(int)), 4),
        "precision": round(precision_score(y_cvd, (cvd_pred >= 0.5).astype(int)), 4),
        "recall": round(recall_score(y_cvd, (cvd_pred >= 0.5).astype(int)), 4),
        "f1": round(f1_score(y_cvd, (cvd_pred >= 0.5).astype(int)), 4),
        "roc_auc": round(roc_auc_score(y_cvd, cvd_pred), 4),
    }

    return results


# ── CLI entry point ──────────────────────────────────────────────

if __name__ == "__main__":  # pragma: no cover - manual CLI entry point
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    logger.info("Training risk prediction models...")
    models = train_risk_models(n_samples=10000, save_path=MODEL_DIR / "default")

    logger.info("Evaluating trained models...")
    eval_results = evaluate_trained_models(models)

    print("\n" + "=" * 60)
    print("HELIORA Risk Engine — Model Evaluation Report")
    print("=" * 60)
    for condition, metrics in eval_results.items():
        print(f"\n{condition.upper()}:")
        for metric, value in metrics.items():
            print(f"  {metric}: {value}")
    print("=" * 60)
