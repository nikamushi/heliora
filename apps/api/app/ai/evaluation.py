"""HELIORA API — Model Evaluation Suite (AI-003).

Evaluates the Preventive Lifestyle Risk Engine against holdout test data,
computes standard classification metrics, and generates an evaluation report.

Architecture §8, PRD AI-003.
"""

from __future__ import annotations

import json
import logging
import statistics
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import TYPE_CHECKING, Any

import numpy as np

if TYPE_CHECKING:  # pragma: no cover - typing only; keeps this module xgboost-free
    from app.ai.model_training import ModelRiskEngine

logger = logging.getLogger(__name__)

# Lazily-initialized model engine. Kept module-private so importing this
# module never triggers expensive model training (AI-003 R2 guard);
# use get_model_engine() or inject an engine explicitly.
_model_engine: ModelRiskEngine | None = None


def get_model_engine() -> ModelRiskEngine:
    """Return the shared model engine, training it on first use."""
    global _model_engine
    if _model_engine is None:
        from app.ai.model_training import ModelRiskEngine

        _model_engine = ModelRiskEngine()
    return _model_engine

# ── Metric computation ──────────────────────────────────────────

def _binary_precision_recall_f1(
    y_true: np.ndarray, y_pred_prob: np.ndarray, threshold: float = 0.5
) -> dict[str, float]:
    """Compute precision, recall, F1 for binary classification at a threshold."""
    y_pred = (y_pred_prob >= threshold).astype(int)
    y_true_int = y_true.astype(int)

    tp = int(np.sum((y_pred == 1) & (y_true_int == 1)))
    fp = int(np.sum((y_pred == 1) & (y_true_int == 0)))
    fn = int(np.sum((y_pred == 0) & (y_true_int == 1)))
    tn = int(np.sum((y_pred == 0) & (y_true_int == 0)))

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall) > 0
        else 0.0
    )
    accuracy = (tp + tn) / (tp + fp + fn + tn) if (tp + fp + fn + tn) > 0 else 0.0

    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "accuracy": round(accuracy, 4),
        "confusion": {"tp": tp, "fp": fp, "fn": fn, "tn": tn},
    }


def _roc_auc_from_probs(y_true: np.ndarray, y_score: np.ndarray) -> float:
    """Compute ROC AUC from true labels and predicted probabilities (Mann-Whitney U)."""
    n_pos = int(np.sum(y_true == 1))
    n_neg = int(np.sum(y_true == 0))
    if n_pos == 0 or n_neg == 0:
        return 0.5

    # Vectorized U-statistic computation
    pos_scores = y_score[y_true == 1]
    neg_scores = y_score[y_true == 0]

    # Count pairs where positive > negative (tie = 0.5)
    u = 0
    for ps in pos_scores:
        u += np.sum(neg_scores < ps) + 0.5 * np.sum(neg_scores == ps)

    auc = u / (n_pos * n_neg)
    return round(float(auc), 4)


def _brier_score(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    """Compute Brier score (MSE of probabilities)."""
    return round(float(np.mean((y_prob - y_true) ** 2)), 6)


# ── Report metadata ──────────────────────────────────────────────
# Frozen pre-AI-003 baseline (default config: XGBoost 10k/seed-42, thr=0.3).
# Reproduced exactly in this environment before any AI-003 change.
FROZEN_BASELINE: dict[str, Any] = {
    "overall_accuracy": 0.8863,
    "thresholds": {"diabetes": 0.3, "hypertension": 0.3, "cardiovascular": 0.3},
    "conditions": {
        "Diabetes Melitus": {
            "precision": 0.6914, "recall": 0.4211, "f1": 0.5234,
            "accuracy": 0.898, "roc_auc": 0.9044,
        },
        "Hipertensi": {
            "precision": 0.8843, "recall": 0.5162, "f1": 0.6519,
            "accuracy": 0.796, "roc_auc": 0.9059,
        },
        "Penyakit Jantung": {
            "precision": 0.2632, "recall": 0.1923, "f1": 0.2222,
            "accuracy": 0.965, "roc_auc": 0.9308,
        },
    },
}

# Class-weighting review outcome (AI-003.04, gate R1).
# Experiment: scale_pos_weight per condition (DM 4.45 / HT 3.66 / CVD 9.25).
# Result on n=5000 x seeds(42,7,123): ranking degrades (DM AUC -0.022,
# CVD AUC -0.028 vs gate tolerance -0.02) and the CVD operating point is
# unstable (F1 std +-0.068); CVD recall falls 0.398 -> 0.267.
# Decision: REJECTED as default; kept as opt-in `balance_classes` flag.
WEIGHTING_REVIEW: dict[str, Any] = {
    "decision": "rejected",
    "gate": "AUC tiap kondisi >= baseline-0.02 dan recall CVD naik",
    "class_weights_tested": {"diabetes": 4.4466, "hypertension": 3.662, "cardiovascular": 9.2459},
    "auc_delta_vs_baseline": {"diabetes": -0.0222, "hypertension": -0.0103, "cardiovascular": -0.0281},
    "cvd_recall_baseline_tuned": 0.3975,
    "cvd_recall_weighted_tuned": 0.2671,
    "note": (
        "Threshold tuning pada model baseline menaikkan F1 semua kondisi "
        "(DM 0.52->0.59, HT 0.65->0.77, CVD 0.22->0.31) tanpa degradasi ranking; "
        "weighting ditolak karena merusak ranking dan tidak stabil."
    ),
}

# Tuned operating thresholds (max-F1 sweep, stabil lintas seed 42/7/123).
TUNED_THRESHOLDS: dict[str, float] = {
    "diabetes": 0.25, "hypertension": 0.2, "cardiovascular": 0.25,
}

MODEL_NAME = "heliora-risk-engine"
MODEL_VERSION = "synthetic-xgb-10k-v1"


# ── Evaluation data ─────────────────────────────────────────────

@dataclass
class EvaluationSample:
    """A single labeled sample for evaluation."""

    age: float
    bmi: float
    physical_activity: float
    sleep_duration: float
    smoking_status: str
    family_history: bool
    stress_level: float | None
    blood_sugar_mg_dl: float | None
    cholesterol_mg_dl: float | None
    blood_pressure: str | None
    # Ground truth labels (0-1 probability scale, or 0/1 binary)
    diabetes_label: float
    hypertension_label: float
    cardiovascular_label: float


@dataclass
class MetricsPerCondition:
    """Evaluation metrics for one condition."""

    condition: str
    label_count: int
    positive_count: int
    threshold: float
    precision: float
    recall: float
    f1: float
    accuracy: float
    roc_auc: float
    brier_score: float
    mean_predicted: float
    mean_actual: float
    # Absolute gap between mean predicted risk and observed prevalence.
    # Simple calibration signal: 0.0 means perfectly calibrated on average.
    calibration_gap: float
    # Raw confusion counts {tp, fp, fn, tn} at the operating threshold.
    confusion: dict[str, int] = field(default_factory=dict)


@dataclass
class EvaluationResult:
    """Complete evaluation output for all conditions."""

    conditions: list[MetricsPerCondition] = field(default_factory=list)
    overall_accuracy: float = 0.0
    eval_timestamp: str = ""
    sample_count: int = 0
    runtime_seconds: float = 0.0
    class_balance: dict[str, Any] = field(default_factory=dict)
    disclaimer: str = (
        "Evaluation based on trained XGBoost models (10k samples). "
        "Metrics reflect model performance on synthetic data, not clinical validation."
    )


def analyze_class_balance(labels: dict[str, list[float]]) -> dict[str, dict[str, Any]]:
    """Compute class-balance statistics per condition from binary labels.

    Returns per condition: positive/negative counts, prevalence, and the
    negative-to-positive imbalance ratio (None when no positives exist).
    This is the explicit AI-003 "Review class imbalance" evidence.
    """
    balance: dict[str, dict[str, Any]] = {}
    for condition, values in labels.items():
        y = np.asarray(values, dtype=float)
        n_pos = int(np.sum(y >= 0.5))
        n_neg = int(np.sum(y < 0.5))
        total = n_pos + n_neg
        balance[condition] = {
            "n_positive": n_pos,
            "n_negative": n_neg,
            "prevalence": round(n_pos / total, 4) if total else 0.0,
            "imbalance_ratio": round(n_neg / n_pos, 2) if n_pos > 0 else None,
        }
    return balance


# ── Synthetic evaluation dataset ────────────────────────────────

def generate_synthetic_evaluation_data(
    n_samples: int = 1000, seed: int = 42
) -> list[EvaluationSample]:
    """Generate synthetic labeled data for evaluation.

    Uses realistic correlations derived from epidemiological literature:
    - Age positively correlated with all three conditions
    - BMI positively correlated with diabetes & hypertension
    - Physical activity negatively correlated with all conditions
    - Smoking positively correlated with hypertension & CVD
    - Family history positively correlated with diabetes
    - Sleep deprivation positively correlated with hypertension
    - Blood sugar/cholesterol positively correlated with respective conditions

    Labels are generated as probabilistic ground truth based on known risk factors.
    """
    rng = np.random.default_rng(seed)

    data: list[EvaluationSample] = []
    for _ in range(n_samples):
        age = int(rng.uniform(20, 75))
        bmi = float(rng.uniform(18.0, 38.0))
        activity = float(rng.uniform(0, 300))
        sleep = float(rng.uniform(4.0, 10.0))
        smoking_roll = rng.random()
        smoking = (
            "current" if smoking_roll < 0.25 else ("former" if smoking_roll < 0.45 else "never")
        )
        family_history = bool(rng.random() < 0.30)
        stress = float(rng.uniform(1, 10)) if rng.random() < 0.7 else None
        blood_sugar = float(rng.uniform(70, 160)) if rng.random() < 0.4 else None
        cholesterol = float(rng.uniform(140, 260)) if rng.random() < 0.4 else None
        systolic = float(rng.uniform(105, 160))
        diastolic = float(rng.uniform(65, 100))
        bp = f"{int(systolic)}/{int(diastolic)}"

        # Generate ground truth probabilities based on epidemiological model
        # (correlated with the same factors the risk engine uses)

        # Diabetes
        dm_base = 0.02 + 0.008 * max(0, age - 30) / 10
        dm_bmi = 0.0
        if bmi >= 30:
            dm_bmi = 0.12 + 0.02 * (bmi - 30) / 10
        elif bmi >= 25:
            dm_bmi = 0.06
        elif bmi < 23:
            dm_bmi = -0.03
        dm_activity = -0.04 if activity >= 150 else (0.05 if activity < 60 else -0.01)
        dm_famhist = 0.08 if family_history else 0.0
        dm_smoke = 0.05 if smoking == "current" else (0.02 if smoking == "former" else -0.02)
        dm_sleep = 0.03 if sleep < 6 else (-0.02 if sleep >= 7 else 0.0)
        dm_bs = 0.0
        if blood_sugar is not None:
            if blood_sugar >= 126:
                dm_bs = 0.15
            elif blood_sugar >= 100:
                dm_bs = 0.07
            elif blood_sugar < 90:
                dm_bs = -0.02
        dm_prob = max(0.01, min(0.95, dm_base + dm_bmi + dm_activity + dm_famhist + dm_smoke + dm_sleep + dm_bs))
        dm_label = 1 if dm_prob >= 0.25 else 0  # Binary label: elevated risk threshold

        # Hypertension
        ht_base = 0.03 + 0.009 * max(0, age - 30) / 10
        ht_sleep = 0.06 if sleep < 6 else (-0.03 if 6.5 <= sleep <= 8.5 else 0.0)
        ht_stress = 0.05 if stress is not None and stress >= 7 else (-0.02 if stress is not None and stress <= 3 else 0.0)
        ht_smoke = 0.05 if smoking == "current" else (-0.02 if smoking == "never" else 0.0)
        ht_bmi = 0.05 if bmi >= 25 else 0.0
        ht_bp = 0.0
        if systolic >= 140 or diastolic >= 90:
            ht_bp = 0.18
        elif systolic >= 130 or diastolic >= 85:
            ht_bp = 0.07
        elif systolic < 120 and diastolic < 80:
            ht_bp = -0.04
        ht_prob = max(0.01, min(0.95, ht_base + ht_sleep + ht_stress + ht_smoke + ht_bmi + ht_bp))
        ht_label = 1 if ht_prob >= 0.25 else 0

        # Cardiovascular
        cvd_base = 0.02 + 0.01 * max(0, age - 30) / 10
        cvd_smoke = 0.12 if smoking == "current" else (0.04 if smoking == "former" else -0.04)
        cvd_chol = 0.0
        if cholesterol is not None:
            if cholesterol >= 240:
                cvd_chol = 0.12
            elif cholesterol >= 200:
                cvd_chol = 0.05
            elif cholesterol < 180:
                cvd_chol = -0.03
        cvd_activity = -0.04 if activity >= 150 else (0.05 if activity < 60 else -0.01)
        cvd_bmi = 0.02 if bmi < 24 else (-0.05 if bmi >= 28 else -0.01)
        cvd_ht = 0.04 if ht_prob > 0.25 else 0.0
        cvd_prob = max(0.01, min(0.95, cvd_base + cvd_smoke + cvd_chol + cvd_activity + cvd_bmi + cvd_ht))
        cvd_label = 1 if cvd_prob >= 0.25 else 0

        data.append(
            EvaluationSample(
                age=age,
                bmi=bmi,
                physical_activity=activity,
                sleep_duration=sleep,
                smoking_status=smoking,
                family_history=family_history,
                stress_level=stress,
                blood_sugar_mg_dl=blood_sugar,
                cholesterol_mg_dl=cholesterol,
                blood_pressure=bp,
                diabetes_label=float(dm_label),
                hypertension_label=float(ht_label),
                cardiovascular_label=float(cvd_label),
            )
        )

    return data


# ── Profile builder for risk engine ────────────────────────────

def sample_to_profile(sample: EvaluationSample) -> Any:
    """Convert an EvaluationSample to a mock HealthProfile-like object for the risk engine."""
    from decimal import Decimal

    class MockProfile:
        def __init__(self, **kwargs: Any) -> None:
            self.__dict__.update(kwargs)

    return MockProfile(
        age=sample.age,
        gender="male",
        height_cm=Decimal("170.0"),
        weight_kg=Decimal(str(round(sample.bmi * 1.7 * 1.7, 1))),
        physical_activity_min_per_week=sample.physical_activity,
        sleep_duration_hours=sample.sleep_duration,
        smoking_status=sample.smoking_status,
        family_history=sample.family_history,
        stress_level=sample.stress_level,
        blood_sugar_mg_dl=Decimal(str(sample.blood_sugar_mg_dl)) if sample.blood_sugar_mg_dl else None,
        cholesterol_mg_dl=Decimal(str(sample.cholesterol_mg_dl)) if sample.cholesterol_mg_dl else None,
        blood_pressure=sample.blood_pressure,
        bmi=Decimal(str(sample.bmi)),
        created_at=None,
        updated_at=None,
    )


# ── Main evaluation function ────────────────────────────────────

def evaluate_risk_engine(
    n_samples: int = 1000,
    seed: int = 42,
    thresholds: dict[str, float] | None = None,
    output_path: str | None = None,
    engine: ModelRiskEngine | None = None,
) -> EvaluationResult:
    """Run full evaluation of the risk engine against synthetic labeled data.

    Parameters
    ----------
    n_samples : Number of synthetic evaluation samples to generate.
    seed : RNG seed for reproducibility.
    thresholds : Custom probability thresholds per condition
        (default TUNED_THRESHOLDS: diabetes 0.25, hypertension 0.2,
        cardiovascular 0.25).
    output_path : Optional file path to write JSON evaluation report.
    engine : Optional pre-built ModelRiskEngine (e.g. a test stub).
        When omitted, the shared lazily-trained engine is used.

    Returns
    -------
    EvaluationResult with per-condition metrics and overall statistics.
    """
    thresholds = thresholds or dict(TUNED_THRESHOLDS)
    engine = engine if engine is not None else get_model_engine()

    start = time.perf_counter()

    # Generate data
    samples = generate_synthetic_evaluation_data(n_samples, seed)
    logger.info("Generated %d synthetic evaluation samples (seed=%d)", n_samples, seed)

    # Run predictions
    predictions: dict[str, list[float]] = {
        "diabetes": [],
        "hypertension": [],
        "cardiovascular": [],
    }
    labels: dict[str, list[float]] = {
        "diabetes": [],
        "hypertension": [],
        "cardiovascular": [],
    }

    for sample in samples:
        profile = sample_to_profile(sample)
        risks = engine.estimate_risks(profile)
        for cond in predictions:
            predictions[cond].append(risks[f"{cond}_risk"])
            labels[cond].append(getattr(sample, f"{cond}_label"))

    # Class-balance review (AI-003.04): prevalence and imbalance ratio
    # per condition, computed on the evaluation labels.
    class_balance = analyze_class_balance(labels)

    # Compute metrics per condition
    conditions: list[MetricsPerCondition] = []
    for cond_key, cond_name in [("diabetes", "Diabetes Melitus"), ("hypertension", "Hipertensi"), ("cardiovascular", "Penyakit Jantung")]:
        y_true = np.array(labels[cond_key])
        y_prob = np.array(predictions[cond_key])
        thr = thresholds[cond_key]

        bin_metrics = _binary_precision_recall_f1(y_true, y_prob, thr)
        roc_auc = _roc_auc_from_probs(y_true, y_prob)
        brier = _brier_score(y_true, y_prob)
        mean_pred = round(float(np.mean(y_prob)), 4)
        mean_true = round(float(np.mean(y_true)), 4)

        conditions.append(
            MetricsPerCondition(
                condition=cond_name,
                label_count=len(y_true),
                positive_count=int(np.sum(y_true >= 0.5)),
                threshold=thr,
                precision=bin_metrics["precision"],
                recall=bin_metrics["recall"],
                f1=bin_metrics["f1"],
                accuracy=bin_metrics["accuracy"],
                roc_auc=roc_auc,
                brier_score=brier,
                mean_predicted=mean_pred,
                mean_actual=mean_true,
                calibration_gap=round(abs(mean_pred - mean_true), 4),
                confusion=bin_metrics["confusion"],
            )
        )

    runtime = time.perf_counter() - start

    result = EvaluationResult(
        conditions=conditions,
        overall_accuracy=round(statistics.mean(c.accuracy for c in conditions), 4),
        eval_timestamp=datetime.now(UTC).isoformat(),
        sample_count=n_samples,
        runtime_seconds=round(runtime, 3),
        class_balance=class_balance,
    )

    # Write report if path provided
    if output_path:
        report = _serialize_report(result, engine)
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        Path(output_path).write_text(json.dumps(report, indent=2), encoding="utf-8")
        logger.info("Evaluation report written to %s", output_path)

    return result


def _model_card(engine: ModelRiskEngine | None) -> dict[str, Any]:
    """Build the Architecture §29 model card from the engine's training info."""
    info: dict[str, Any] = (
        getattr(getattr(engine, "models", None), "training_info", None) or {}
    )
    return {
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "training_dataset": (
            f"synthetic-epi-model-v1 (n={info.get('n_samples')}, "
            f"seed={info.get('seed')})"
        ),
        "feature_version": (
            f"model_training.FEATURE_NAMES v1 "
            f"({info.get('n_features')} features)"
        ),
        "training_date": info.get("trained_at"),
        "algorithm": info.get("algorithm"),
        "balance_classes": info.get("balance_classes"),
        "class_weights": info.get("class_weights"),
    }


def _serialize_report(
    result: EvaluationResult, engine: ModelRiskEngine | None = None
) -> dict[str, Any]:
    """Convert EvaluationResult to JSON-serializable dict."""
    return {
        "eval_timestamp": result.eval_timestamp,
        "sample_count": result.sample_count,
        "runtime_seconds": result.runtime_seconds,
        "overall_accuracy": result.overall_accuracy,
        "model": _model_card(engine),
        "baseline": FROZEN_BASELINE,
        "weighting_review": WEIGHTING_REVIEW,
        "class_balance": result.class_balance,
        "disclaimer": result.disclaimer,
        "conditions": [
            {
                "condition": c.condition,
                "label_count": c.label_count,
                "positive_count": c.positive_count,
                "threshold": c.threshold,
                "precision": c.precision,
                "recall": c.recall,
                "f1": c.f1,
                "accuracy": c.accuracy,
                "roc_auc": c.roc_auc,
                "brier_score": c.brier_score,
                "mean_predicted": c.mean_predicted,
                "mean_actual": c.mean_actual,
                "calibration_gap": c.calibration_gap,
                "confusion": c.confusion,
            }
            for c in result.conditions
        ],
    }


# ── CLI entry point ─────────────────────────────────────────────

if __name__ == "__main__":  # pragma: no cover - manual CLI entry point
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    result = evaluate_risk_engine(
        n_samples=1000,
        seed=42,
        output_path="evaluation_report.json",
    )

    print(f"\n{'='*60}")
    print("HELIORA Risk Engine — Evaluation Report")
    print(f"{'='*60}")
    print(f"Timestamp   : {result.eval_timestamp}")
    print(f"Sample count: {result.sample_count}")
    print(f"Runtime     : {result.runtime_seconds:.3f}s")
    print(f"Overall acc : {result.overall_accuracy:.4f}")
    print("\nClass balance (evaluation labels):")
    for cond_key, bal in result.class_balance.items():
        print(
            f"  {cond_key}: pos={bal['n_positive']} "
            f"neg={bal['n_negative']} prev={bal['prevalence']:.4f} "
            f"ratio={bal['imbalance_ratio']}"
        )
    print("\nPer-condition metrics (tuned thresholds):")
    for c in result.conditions:
        print(f"\n  {c.condition} (thr={c.threshold}):")
        print(f"    Precision : {c.precision:.4f}")
        print(f"    Recall    : {c.recall:.4f}")
        print(f"    F1        : {c.f1:.4f}")
        print(f"    Accuracy  : {c.accuracy:.4f}")
        print(f"    ROC AUC   : {c.roc_auc:.4f}")
        print(f"    Brier     : {c.brier_score:.6f}")
        print(f"    Mean pred : {c.mean_predicted:.4f}")
        print(f"    Mean true : {c.mean_actual:.4f}")
        print(f"    Calib gap : {c.calibration_gap:.4f}")
        cf = c.confusion
        print(
            f"    Confusion : TP={cf.get('tp')} FP={cf.get('fp')} "
            f"FN={cf.get('fn')} TN={cf.get('tn')}"
        )
    print(f"\nDisclaimer  : {result.disclaimer}")
    print(f"{'='*60}\n")
