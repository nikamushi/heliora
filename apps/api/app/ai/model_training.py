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

from app.core.risk_engine import risk_engine

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


def generate_training_data(n_samples: int = 10000, seed: int = 42) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Generate synthetic labeled training data for risk prediction.

    Returns:
        X: Feature matrix (n_samples, 11)
        y_diabetes: Binary diabetes labels
        y_hypertension: Binary hypertension labels
        y_cvd: Binary CVD labels
    """
    rng = np.random.default_rng(seed)

    feature_matrix = np.zeros((n_samples, len(FEATURE_NAMES)))

    for i in range(n_samples):
        feature_matrix[i, 0] = rng.uniform(20, 80)
        feature_matrix[i, 1] = rng.uniform(18, 40)
        feature_matrix[i, 2] = rng.uniform(0, 300)
        feature_matrix[i, 3] = rng.uniform(4, 10)
        feature_matrix[i, 4] = float(rng.choice([0, 1, 2]))
        feature_matrix[i, 5] = float(rng.choice([0, 1]))
        feature_matrix[i, 6] = rng.uniform(1, 10) if rng.random() < 0.7 else 0
        feature_matrix[i, 7] = rng.uniform(70, 160) if rng.random() < 0.4 else 90
        feature_matrix[i, 8] = rng.uniform(140, 260) if rng.random() < 0.4 else 180
        feature_matrix[i, 9] = rng.uniform(100, 160)
        feature_matrix[i, 10] = rng.uniform(60, 100)

    # Generate labels based on epidemiological correlations
    y_diabetes = np.zeros(n_samples)
    y_hypertension = np.zeros(n_samples)
    y_cvd = np.zeros(n_samples)

    for i in range(n_samples):
        age = feature_matrix[i, 0]
        bmi = feature_matrix[i, 1]
        activity = feature_matrix[i, 2]
        sleep = feature_matrix[i, 3]
        smoking = int(feature_matrix[i, 4])
        famhist = int(feature_matrix[i, 5])
        stress = feature_matrix[i, 6] if feature_matrix[i, 6] > 0 else 5
        blood_sugar = feature_matrix[i, 7]
        cholesterol = feature_matrix[i, 8]
        systolic = feature_matrix[i, 9]
        diastolic = feature_matrix[i, 10]

        # Diabetes probability
        dm_prob = 0.02 + 0.008 * max(0, age - 30) / 10
        if bmi >= 30:
            dm_prob += 0.12
        elif bmi >= 25:
            dm_prob += 0.06
        if activity < 60:
            dm_prob += 0.05
        elif activity >= 150:
            dm_prob -= 0.03
        if famhist:
            dm_prob += 0.08
        if smoking == 2:
            dm_prob += 0.05
        if blood_sugar >= 126:
            dm_prob += 0.15
        elif blood_sugar >= 100:
            dm_prob += 0.07
        dm_prob = min(0.95, dm_prob)
        y_diabetes[i] = 1 if rng.random() < dm_prob else 0

        # Hypertension probability
        ht_prob = 0.03 + 0.009 * max(0, age - 30) / 10
        if sleep < 6:
            ht_prob += 0.06
        elif 6.5 <= sleep <= 8.5:
            ht_prob -= 0.02
        if stress >= 7:
            ht_prob += 0.05
        if smoking == 2:
            ht_prob += 0.05
        elif smoking == 0:
            ht_prob -= 0.02
        if bmi >= 25:
            ht_prob += 0.05
        if systolic >= 140 or diastolic >= 90:
            ht_prob += 0.18
        ht_prob = min(0.95, ht_prob)
        y_hypertension[i] = 1 if rng.random() < ht_prob else 0

        # CVD probability
        cvd_prob = 0.02 + 0.01 * max(0, age - 30) / 10
        if smoking == 2:
            cvd_prob += 0.12
        elif smoking == 1:
            cvd_prob += 0.04
        elif smoking == 0:
            cvd_prob -= 0.03
        if cholesterol >= 240:
            cvd_prob += 0.12
        elif cholesterol >= 200:
            cvd_prob += 0.05
        if activity < 60:
            cvd_prob += 0.05
        elif activity >= 150:
            cvd_prob -= 0.03
        cvd_prob = min(0.95, cvd_prob)
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


def train_risk_models(
    n_samples: int = 10000,
    seed: int = 42,
    use_xgboost: bool = True,
    save_path: Path | None = None,
) -> TrainedModels:
    """Train gradient boosting models for the three risk conditions.

    Args:
        n_samples: Number of synthetic training samples.
        seed: RNG seed for reproducibility.
        use_xgboost: If True, use XGBoost; otherwise LightGBM.
        save_path: Optional path to persist trained models.

    Returns:
        TrainedModels with trained model objects and metadata.
    """
    logger.info(
        "Generating %d training samples (seed=%d, xgboost=%s)",
        n_samples,
        seed,
        use_xgboost,
    )

    feature_matrix, y_dm, y_ht, y_cvd = generate_training_data(n_samples, seed)

    train_method = _train_xgboost if use_xgboost else _train_lightgbm

    logger.info("Training diabetes model...")
    diabetes_model = train_method(feature_matrix, y_dm, "diabetes")

    logger.info("Training hypertension model...")
    hypertension_model = train_method(feature_matrix, y_ht, "hypertension")

    logger.info("Training CVD model...")
    cvd_model = train_method(feature_matrix, y_cvd, "cardiovascular")

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
            "trained_at": datetime.now(UTC).isoformat(),
        },
    )

    if save_path:
        _save_models(models, save_path)
        logger.info("Models saved to %s", save_path)

    return models


def _train_xgboost(
    features: np.ndarray, y: np.ndarray, condition: str
) -> xgb.Booster:
    """Train an XGBoost model for a specific condition."""
    dtrain = xgb.DMatrix(features, label=y)

    params = {
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "max_depth": 5,
        "learning_rate": 0.1,
        "n_estimators": 100,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "seed": 42,
    }

    model = xgb.train(params, dtrain, num_boost_round=100)
    return model


def _train_lightgbm(
    features: np.ndarray, y: np.ndarray, condition: str
) -> LGBMClassifier:
    """Train a LightGBM model for a specific condition."""
    model = LGBMClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1,
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
        """Load cached models or train new ones if not available."""
        default_path = MODEL_DIR / "default"
        if (default_path / "risk_models.pkl").exists():
            logger.info("Loading cached models from %s", default_path)
            return load_models(default_path)

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
        smoking = str(
            profile.smoking_status.value
            if hasattr(profile.smoking_status, "value")
            else profile.smoking_status
        ).lower()
        family_history = bool(profile.family_history)
        stress = float(profile.stress_level) if profile.stress_level else 5.0
        blood_sugar = (
            float(profile.blood_sugar_mg_dl) if profile.blood_sugar_mg_dl else 90.0
        )
        cholesterol = (
            float(profile.cholesterol_mg_dl) if profile.cholesterol_mg_dl else 180.0
        )
        systolic, diastolic = risk_engine._parse_bp(profile.blood_pressure)
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

if __name__ == "__main__":
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
