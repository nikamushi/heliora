"""HELIORA API — tests for AI-003 model training (tiny synthetic models).

Requires the ``ml`` extra (xgboost/lightgbm); skipped otherwise.
"""

import numpy as np
import pytest

xgboost = pytest.importorskip("xgboost")
pytest.importorskip("lightgbm")

from app.ai.model_training import (  # noqa: E402
    _expected_default_signature,
    _neg_pos_ratio,
    _train_lightgbm,
    _train_xgboost,
    evaluate_trained_models,
    load_models,
    train_risk_models,
)


def test_neg_pos_ratio_balanced():
    assert _neg_pos_ratio(np.array([0, 0, 0, 1, 1])) == 1.5


def test_neg_pos_ratio_without_positives_returns_neutral():
    assert _neg_pos_ratio(np.array([0, 0, 0])) == 1.0


def test_neg_pos_ratio_without_negatives():
    assert _neg_pos_ratio(np.array([1, 1])) == 0.0


def test_expected_default_signature_keys():
    signature = _expected_default_signature()
    assert signature == {
        "n_samples": 10000,
        "seed": 42,
        "algorithm": "xgboost",
        "n_features": 11,
        "balance_classes": False,
    }


def test_train_unweighted_records_neutral_weights():
    models = train_risk_models(n_samples=200, seed=1)
    assert models.training_info["balance_classes"] is False
    assert models.training_info["class_weights"] == {
        "diabetes": 1.0,
        "hypertension": 1.0,
        "cardiovascular": 1.0,
    }


def test_train_weighted_records_sample_ratios():
    models = train_risk_models(n_samples=200, seed=1, balance_classes=True)
    weights = models.training_info["class_weights"]
    assert models.training_info["balance_classes"] is True
    for weight in weights.values():
        assert weight >= 1.0


def test_train_lightgbm_weighted_path():
    rng = np.random.default_rng(1)
    features = rng.uniform(0, 1, size=(120, 11))
    labels = np.array([0] * 100 + [1] * 20)
    plain = _train_lightgbm(features, labels, "diabetes")
    weighted = _train_lightgbm(features, labels, "diabetes", pos_weight=5.0)
    assert plain is not None
    assert weighted is not None


def test_train_xgboost_weighted_path():
    rng = np.random.default_rng(1)
    features = rng.uniform(0, 1, size=(120, 11))
    labels = np.array([0] * 100 + [1] * 20)
    plain = _train_xgboost(features, labels, "diabetes")
    weighted = _train_xgboost(features, labels, "diabetes", pos_weight=5.0)
    assert isinstance(plain, xgboost.Booster)
    assert isinstance(weighted, xgboost.Booster)


def test_save_and_load_roundtrip(tmp_path):
    models = train_risk_models(n_samples=200, seed=1)
    from app.ai.model_training import _save_models

    _save_models(models, tmp_path)
    loaded = load_models(tmp_path)
    assert loaded.training_info == models.training_info
    assert loaded.diabetes_model is not None


def test_evaluate_trained_models_metric_ranges():
    models = train_risk_models(n_samples=300, seed=2)
    results = evaluate_trained_models(models, n_test=100, seed=3)
    assert set(results) == {"diabetes", "hypertension", "cardiovascular"}
    for metrics in results.values():
        assert set(metrics) == {"accuracy", "precision", "recall", "f1", "roc_auc"}
        for value in metrics.values():
            assert 0.0 <= value <= 1.0


def test_train_with_save_path_persists_models(tmp_path):
    models = train_risk_models(n_samples=200, seed=1, save_path=tmp_path)
    assert (tmp_path / "risk_models.pkl").exists()
    assert (tmp_path / "training_info.json").exists()
    assert models.training_info["n_samples"] == 200


def _tiny_profile():
    from types import SimpleNamespace

    return SimpleNamespace(
        age=50,
        bmi=28.0,
        physical_activity_min_per_week=90.0,
        sleep_duration_hours=6.5,
        smoking_status="current",
        family_history=False,
        stress_level=7.0,
        blood_sugar_mg_dl=130.0,
        cholesterol_mg_dl=250.0,
        blood_pressure="150/95",
    )


def test_model_risk_engine_estimate_risks_xgboost():
    from app.ai.model_training import ModelRiskEngine

    engine = ModelRiskEngine(train_risk_models(n_samples=200, seed=1))
    risks = engine.estimate_risks(_tiny_profile())
    assert set(risks) == {"diabetes_risk", "hypertension_risk", "cardiovascular_risk"}
    for value in risks.values():
        assert 0.0 <= value <= 1.0


def test_model_risk_engine_estimate_risks_lightgbm():
    from app.ai.model_training import ModelRiskEngine

    engine = ModelRiskEngine(train_risk_models(n_samples=200, seed=1, use_xgboost=False))
    risks = engine.estimate_risks(_tiny_profile())
    for value in risks.values():
        assert 0.0 <= value <= 1.0


def _cached_models_with_signature(directory, monkeypatch):
    import app.ai.model_training as mt
    from app.ai.model_training import _expected_default_signature, _save_models

    models = train_risk_models(n_samples=200, seed=1)
    models.training_info.update(_expected_default_signature())
    cache = directory / "default"
    _save_models(models, cache)
    monkeypatch.setattr(mt, "MODEL_DIR", directory)
    return models


def test_load_or_train_default_reuses_matching_cache(tmp_path, monkeypatch):
    import app.ai.model_training as mt
    from app.ai.model_training import ModelRiskEngine

    _cached_models_with_signature(tmp_path, monkeypatch)

    def _fail_train(**kwargs):
        raise AssertionError("must reuse cache, not retrain")

    monkeypatch.setattr(mt, "train_risk_models", _fail_train)
    engine = ModelRiskEngine()
    assert engine.models.diabetes_model is not None


def test_load_or_train_default_retrains_on_signature_mismatch(tmp_path, monkeypatch):
    import app.ai.model_training as mt
    from app.ai.model_training import ModelRiskEngine, _save_models

    stale = train_risk_models(n_samples=200, seed=1)
    _save_models(stale, tmp_path / "default")
    monkeypatch.setattr(mt, "MODEL_DIR", tmp_path)
    fresh = train_risk_models(n_samples=200, seed=9)
    monkeypatch.setattr(mt, "train_risk_models", lambda save_path=None: fresh)
    engine = ModelRiskEngine()
    assert engine.models is fresh


def test_load_or_train_default_recovers_from_corrupt_cache(tmp_path, monkeypatch):
    import app.ai.model_training as mt
    from app.ai.model_training import ModelRiskEngine

    cache = tmp_path / "default"
    cache.mkdir(parents=True, exist_ok=True)
    (cache / "risk_models.pkl").write_bytes(b"not a pickle")
    monkeypatch.setattr(mt, "MODEL_DIR", tmp_path)
    fresh = train_risk_models(n_samples=200, seed=9)
    monkeypatch.setattr(mt, "train_risk_models", lambda save_path=None: fresh)
    engine = ModelRiskEngine()
    assert engine.models is fresh


def test_evaluate_trained_models_lightgbm_path():
    models = train_risk_models(n_samples=200, seed=1, use_xgboost=False)
    results = evaluate_trained_models(models, n_test=80, seed=3)
    assert set(results) == {"diabetes", "hypertension", "cardiovascular"}
