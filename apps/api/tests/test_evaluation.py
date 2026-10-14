"""HELIORA API — tests for the AI-003 model evaluation suite.

All tests are offline: metric unit tests use fixed vectors, and the
integration tests inject a deterministic stub engine so no model is ever
trained (AI-003 R2 guard). This module stays importable without xgboost.
"""

from types import SimpleNamespace

import numpy as np
import pytest

from app.ai import evaluation as ev
from app.ai.evaluation import (
    FROZEN_BASELINE,
    TUNED_THRESHOLDS,
    WEIGHTING_REVIEW,
    EvaluationSample,
    _binary_precision_recall_f1,
    _brier_score,
    _model_card,
    _roc_auc_from_probs,
    _serialize_report,
    analyze_class_balance,
    evaluate_risk_engine,
    generate_synthetic_evaluation_data,
    get_model_engine,
    sample_to_profile,
)


class _StubEngine:
    """Deterministic stub engine: constant risk per condition."""

    def __init__(
        self,
        diabetes: float = 0.4,
        hypertension: float = 0.35,
        cardiovascular: float = 0.3,
    ) -> None:
        self._risks = {
            "diabetes_risk": diabetes,
            "hypertension_risk": hypertension,
            "cardiovascular_risk": cardiovascular,
        }

    def estimate_risks(self, profile):  # noqa: ANN001, ANN202
        return dict(self._risks)


def _make_sample(**overrides) -> EvaluationSample:
    params = {
        "age": 45,
        "bmi": 27.5,
        "physical_activity": 120.0,
        "sleep_duration": 7.0,
        "smoking_status": "former",
        "family_history": True,
        "stress_level": 5.0,
        "blood_sugar_mg_dl": 110.0,
        "cholesterol_mg_dl": 210.0,
        "blood_pressure": "130/85",
        "diabetes_label": 0.0,
        "hypertension_label": 1.0,
        "cardiovascular_label": 0.0,
    }
    params.update(overrides)
    return EvaluationSample(**params)


# ── Binary metrics ────────────────────────────────────────────────


def test_binary_metrics_perfect_predictions():
    y_true = np.array([0, 0, 1, 1])
    y_prob = np.array([0.1, 0.2, 0.8, 0.9])
    metrics = _binary_precision_recall_f1(y_true, y_prob, 0.5)
    assert metrics["precision"] == 1.0
    assert metrics["recall"] == 1.0
    assert metrics["f1"] == 1.0
    assert metrics["accuracy"] == 1.0
    assert metrics["confusion"] == {"tp": 2, "fp": 0, "fn": 0, "tn": 2}


def test_binary_metrics_counts():
    y_true = np.array([0, 1, 1, 1, 0])
    y_prob = np.array([0.9, 0.1, 0.8, 0.4, 0.2])
    metrics = _binary_precision_recall_f1(y_true, y_prob, 0.5)
    assert metrics["confusion"] == {"tp": 1, "fp": 1, "fn": 2, "tn": 1}
    assert metrics["precision"] == 0.5
    assert metrics["recall"] == 0.3333
    assert metrics["f1"] == 0.4
    assert metrics["accuracy"] == 0.4


def test_binary_metrics_no_positive_predictions():
    y_true = np.array([0, 1, 1, 0])
    y_prob = np.array([0.0, 0.0, 0.0, 0.0])
    metrics = _binary_precision_recall_f1(y_true, y_prob, 0.5)
    assert metrics["precision"] == 0.0
    assert metrics["recall"] == 0.0
    assert metrics["f1"] == 0.0
    assert metrics["accuracy"] == 0.5
    assert metrics["confusion"] == {"tp": 0, "fp": 0, "fn": 2, "tn": 2}


def test_binary_metrics_empty_inputs():
    metrics = _binary_precision_recall_f1(np.array([]), np.array([]), 0.5)
    assert metrics["precision"] == 0.0
    assert metrics["recall"] == 0.0
    assert metrics["f1"] == 0.0
    assert metrics["accuracy"] == 0.0
    assert metrics["confusion"] == {"tp": 0, "fp": 0, "fn": 0, "tn": 0}


# ── ROC AUC / Brier ───────────────────────────────────────────────


def test_roc_auc_perfect_separation():
    assert _roc_auc_from_probs(np.array([0, 0, 1, 1]), np.array([0.1, 0.2, 0.8, 0.9])) == 1.0


def test_roc_auc_single_class_returns_chance():
    assert _roc_auc_from_probs(np.array([0, 0, 0]), np.array([0.1, 0.9, 0.4])) == 0.5
    assert _roc_auc_from_probs(np.array([1, 1]), np.array([0.1, 0.9])) == 0.5


def test_roc_auc_ties_count_half():
    assert _roc_auc_from_probs(np.array([0, 1]), np.array([0.5, 0.5])) == 0.5


def test_brier_score_known_value():
    assert _brier_score(np.array([0, 1]), np.array([0.25, 0.75])) == pytest.approx(0.0625)


# ── Synthetic data ────────────────────────────────────────────────


def test_synthetic_data_deterministic_per_seed():
    first = generate_synthetic_evaluation_data(50, seed=7)
    second = generate_synthetic_evaluation_data(50, seed=7)
    assert len(first) == 50
    assert [(s.diabetes_label, s.hypertension_label, s.cardiovascular_label) for s in first] == [
        (s.diabetes_label, s.hypertension_label, s.cardiovascular_label) for s in second
    ]


def test_synthetic_data_varies_across_seeds():
    left = generate_synthetic_evaluation_data(200, seed=1)
    right = generate_synthetic_evaluation_data(200, seed=2)
    left_labels = [(s.diabetes_label, s.hypertension_label) for s in left]
    right_labels = [(s.diabetes_label, s.hypertension_label) for s in right]
    assert left_labels != right_labels


def test_synthetic_data_labels_binary():
    for sample in generate_synthetic_evaluation_data(100, seed=11):
        assert sample.diabetes_label in (0.0, 1.0)
        assert sample.hypertension_label in (0.0, 1.0)
        assert sample.cardiovascular_label in (0.0, 1.0)


def test_synthetic_data_baseline_distribution_locked():
    """Seed-42 / n=1000 label counts back the frozen baseline contract."""
    samples = generate_synthetic_evaluation_data(1000, seed=42)
    counts = {
        "diabetes": sum(s.diabetes_label for s in samples),
        "hypertension": sum(s.hypertension_label for s in samples),
        "cardiovascular": sum(s.cardiovascular_label for s in samples),
    }
    assert counts == {"diabetes": 133.0, "hypertension": 370.0, "cardiovascular": 26.0}


# ── Class balance ─────────────────────────────────────────────────


def test_analyze_class_balance_counts_and_ratio():
    balance = analyze_class_balance(
        {"a": [1.0, 0.0, 0.0, 0.0], "b": [0.0, 0.0]},
    )
    assert balance["a"] == {
        "n_positive": 1,
        "n_negative": 3,
        "prevalence": 0.25,
        "imbalance_ratio": 3.0,
    }
    assert balance["b"] == {
        "n_positive": 0,
        "n_negative": 2,
        "prevalence": 0.0,
        "imbalance_ratio": None,
    }


# ── Profile mapping ───────────────────────────────────────────────


def test_sample_to_profile_maps_fields():
    profile = sample_to_profile(_make_sample())
    assert float(profile.bmi) == pytest.approx(27.5)
    assert profile.smoking_status == "former"
    assert profile.family_history is True
    assert profile.blood_pressure == "130/85"


def test_sample_to_profile_missing_labs_become_none():
    profile = sample_to_profile(_make_sample(blood_sugar_mg_dl=None, cholesterol_mg_dl=None))
    assert profile.blood_sugar_mg_dl is None
    assert profile.cholesterol_mg_dl is None


# ── Report contracts ──────────────────────────────────────────────


def test_frozen_baseline_contract():
    assert FROZEN_BASELINE["overall_accuracy"] == 0.8863
    assert FROZEN_BASELINE["thresholds"] == {
        "diabetes": 0.3,
        "hypertension": 0.3,
        "cardiovascular": 0.3,
    }
    assert FROZEN_BASELINE["conditions"]["Penyakit Jantung"]["recall"] == 0.1923


def test_tuned_thresholds_contract():
    assert TUNED_THRESHOLDS == {"diabetes": 0.25, "hypertension": 0.2, "cardiovascular": 0.25}


def test_weighting_review_decision_rejected():
    assert WEIGHTING_REVIEW["decision"] == "rejected"
    assert set(WEIGHTING_REVIEW["class_weights_tested"]) == {
        "diabetes",
        "hypertension",
        "cardiovascular",
    }


def test_model_card_without_engine_reports_unknowns():
    card = _model_card(None)
    assert card["model_name"] == "heliora-risk-engine"
    assert card["training_dataset"] == "synthetic-epi-model-v1 (n=None, seed=None)"
    assert card["balance_classes"] is None


def test_model_card_maps_training_info():
    engine = SimpleNamespace(
        models=SimpleNamespace(
            training_info={
                "n_samples": 10000,
                "seed": 42,
                "algorithm": "xgboost",
                "n_features": 11,
                "balance_classes": False,
                "class_weights": {"diabetes": 1.0},
                "trained_at": "2026-01-01T00:00:00+00:00",
            }
        )
    )
    card = _model_card(engine)
    assert card["training_dataset"] == "synthetic-epi-model-v1 (n=10000, seed=42)"
    assert card["balance_classes"] is False
    assert card["class_weights"] == {"diabetes": 1.0}


def test_serialize_report_shape():
    result = evaluate_risk_engine(n_samples=60, seed=3, engine=_StubEngine())
    report = _serialize_report(result, engine=None)
    assert set(report) == {
        "eval_timestamp",
        "sample_count",
        "runtime_seconds",
        "overall_accuracy",
        "model",
        "baseline",
        "weighting_review",
        "class_balance",
        "disclaimer",
        "conditions",
    }
    assert len(report["conditions"]) == 3
    for condition in report["conditions"]:
        assert set(condition) >= {
            "condition",
            "threshold",
            "precision",
            "recall",
            "f1",
            "accuracy",
            "roc_auc",
            "brier_score",
            "mean_predicted",
            "mean_actual",
            "calibration_gap",
            "confusion",
        }
        assert set(condition["confusion"]) == {"tp", "fp", "fn", "tn"}
    assert report["baseline"] == FROZEN_BASELINE
    assert report["weighting_review"]["decision"] == "rejected"


# ── Full evaluation with stub engine ──────────────────────────────


def test_evaluate_uses_tuned_thresholds_by_default():
    result = evaluate_risk_engine(n_samples=60, seed=3, engine=_StubEngine())
    assert [c.threshold for c in result.conditions] == [
        TUNED_THRESHOLDS["diabetes"],
        TUNED_THRESHOLDS["hypertension"],
        TUNED_THRESHOLDS["cardiovascular"],
    ]


def test_evaluate_respects_custom_thresholds():
    custom = {"diabetes": 0.9, "hypertension": 0.9, "cardiovascular": 0.9}
    result = evaluate_risk_engine(n_samples=60, seed=3, thresholds=custom, engine=_StubEngine())
    assert [c.threshold for c in result.conditions] == [0.9, 0.9, 0.9]


def test_evaluate_is_deterministic():
    first = _serialize_report(evaluate_risk_engine(n_samples=80, seed=5, engine=_StubEngine()))
    second = _serialize_report(evaluate_risk_engine(n_samples=80, seed=5, engine=_StubEngine()))
    for report in (first, second):
        report.pop("eval_timestamp")
        report.pop("runtime_seconds")
    assert first == second


def test_evaluate_overall_accuracy_is_mean_of_conditions():
    result = evaluate_risk_engine(n_samples=80, seed=5, engine=_StubEngine())
    expected = round(sum(c.accuracy for c in result.conditions) / 3, 4)
    assert result.overall_accuracy == expected


def test_evaluate_calibration_gap_definition():
    result = evaluate_risk_engine(n_samples=80, seed=5, engine=_StubEngine())
    for condition in result.conditions:
        assert condition.calibration_gap == round(
            abs(condition.mean_predicted - condition.mean_actual), 4
        )


def test_evaluate_class_balance_covers_all_samples():
    result = evaluate_risk_engine(n_samples=80, seed=5, engine=_StubEngine())
    assert set(result.class_balance) == {"diabetes", "hypertension", "cardiovascular"}
    for balance in result.class_balance.values():
        assert balance["n_positive"] + balance["n_negative"] == 80


def test_evaluate_writes_json_report_to_output_path(tmp_path):
    output = tmp_path / "reports" / "eval.json"
    result = evaluate_risk_engine(
        n_samples=40, seed=9, engine=_StubEngine(), output_path=str(output)
    )
    assert output.exists()
    import json

    stored = json.loads(output.read_text(encoding="utf-8"))
    assert stored["sample_count"] == 40
    assert stored["overall_accuracy"] == result.overall_accuracy


def test_stub_evaluation_never_touches_global_engine():
    saved = ev._model_engine
    ev._model_engine = None
    try:
        evaluate_risk_engine(n_samples=40, seed=9, engine=_StubEngine())
        assert ev._model_engine is None
    finally:
        ev._model_engine = saved


def test_get_model_engine_trains_once_and_caches(monkeypatch):
    pytest.importorskip("xgboost")
    from app.ai import model_training as mt

    calls: list[int] = []

    class _DummyEngine:
        def __init__(self) -> None:
            calls.append(1)

    monkeypatch.setattr(mt, "ModelRiskEngine", _DummyEngine)
    saved = ev._model_engine
    ev._model_engine = None
    try:
        first = get_model_engine()
        second = get_model_engine()
        assert first is second
        assert len(calls) == 1
    finally:
        ev._model_engine = saved
