"""AI-001 acceptance tests — NHANES-2021-2023-v1 dataset preprocessing.

Covers PRD §11.31 (dataset evaluation checklist), §11.30 (leakage),
and the locked AI-001 decisions (NHANES-only, 9-feature contract,
blood-sugar train-only median + missing indicator, hba1c excluded,
70/15/15 split stratified on the joint target key).

Runs the real workflow (``heliora_ai.workflows``) end-to-end on the
dataset under ``ai/datasets/``; unit-level train/serve logic is covered
by ``packages/ml-core/tests``.
"""

from __future__ import annotations

import json
from pathlib import Path

import ml_core.preprocessing as m
import numpy as np
import pandas as pd
import pytest

from heliora_ai.workflows import ai_001_dataset_preprocessing as w


@pytest.fixture(scope="session")
def pipeline(tmp_path_factory: pytest.TempPathFactory) -> dict:
    """Run the full pipeline once per session into a temp dir.

    Uses a temp OUT_DIR so tests never depend on committed artifacts.
    """
    out = tmp_path_factory.mktemp("ai001")
    return w.run_pipeline(raw_csv=w.RAW_CSV, out_dir=out)


def _splits(pipeline: dict) -> dict[str, pd.DataFrame]:
    return {k: pipeline[k] for k in ("train", "val", "test")}


def test_raw_load_shape_and_columns() -> None:
    df = m.load_nhanes(w.RAW_CSV)
    assert len(df) > 8000
    assert set(m.RAW_REQUIRED_COLUMNS) <= set(df.columns)


def test_feature_contract_columns(pipeline: dict) -> None:
    for name, split in _splits(pipeline).items():
        assert set(m.FEATURE_NAMES) <= set(split.columns), name


def test_no_missing_in_features(pipeline: dict) -> None:
    for name, split in _splits(pipeline).items():
        assert split[m.FEATURE_NAMES].isna().sum().sum() == 0, name


def test_targets_binary_and_complete(pipeline: dict) -> None:
    for name, split in _splits(pipeline).items():
        for target in m.TARGETS:
            vals = set(split[target].unique().tolist())
            assert vals <= {0, 1}, (name, target, vals)


def test_seqn_disjoint_across_splits(pipeline: dict) -> None:
    splits = _splits(pipeline)
    ids = [set(s["seqn"].tolist()) for s in splits.values()]
    assert ids[0].isdisjoint(ids[1])
    assert ids[0].isdisjoint(ids[2])
    assert ids[1].isdisjoint(ids[2])
    total = sum(len(s) for s in splits.values())
    assert len(ids[0] | ids[1] | ids[2]) == total


def test_targets_and_leakage_columns_excluded(pipeline: dict) -> None:
    forbidden = set(m.TARGETS) | set(m.EXCLUDED_COLUMNS)
    assert not (forbidden & set(m.FEATURE_NAMES))
    for name, split in _splits(pipeline).items():
        assert not (set(m.EXCLUDED_COLUMNS) & set(split.columns)), name


def test_split_ratios(pipeline: dict) -> None:
    splits = _splits(pipeline)
    total = sum(len(s) for s in splits.values())
    assert len(splits["train"]) / total == pytest.approx(0.70, abs=0.02)
    assert len(splits["val"]) / total == pytest.approx(0.15, abs=0.02)
    assert len(splits["test"]) / total == pytest.approx(0.15, abs=0.02)


def test_stratification_preserved(pipeline: dict) -> None:
    splits = _splits(pipeline)
    full = pd.concat(list(splits.values()), ignore_index=True)
    for target in m.TARGETS:
        global_rate = float(full[target].mean())
        for name, split in splits.items():
            rate = float(split[target].mean())
            assert rate == pytest.approx(global_rate, abs=0.03), (name, target)


def test_blood_sugar_indicator_and_no_hba1c(pipeline: dict) -> None:
    assert "blood_sugar_missing" in m.FEATURE_NAMES
    assert "hba1c_pct" not in m.FEATURE_NAMES
    raw = m.load_nhanes(w.RAW_CSV)
    assert set(raw["blood_sugar_missing"].unique().tolist()) <= {0, 1}
    assert int(raw["blood_sugar_missing"].sum()) > 0


def test_artifacts_and_manifest(pipeline: dict) -> None:
    out: Path = pipeline["out_dir"]
    for fname in ("train.parquet", "val.parquet", "test.parquet",
                  "preprocessor.joblib", "manifest.json",
                  "dataset_report.json"):
        assert (out / fname).exists(), fname
    manifest = json.loads((out / "manifest.json").read_text())
    assert manifest["version"] == "NHANES-2021-2023-v1"
    assert manifest["seed"] == m.SEED
    assert manifest["feature_names"] == m.FEATURE_NAMES
    assert manifest["target_names"] == m.TARGETS
    report = json.loads((out / "dataset_report.json").read_text())
    for key in ("n_rows_raw", "n_rows_clean", "missing_rate",
                "target_prevalence", "split_prevalence"):
        assert key in report, key


def test_preprocessor_transforms_sample(pipeline: dict) -> None:
    import joblib

    out: Path = pipeline["out_dir"]
    pre = joblib.load(out / "preprocessor.joblib")
    sample = pipeline["train"][m.MODEL_INPUT_COLUMNS].head(5)
    transformed = pre.transform(sample)
    # ColumnTransformer emits the 9 model inputs; the missing indicator
    # is attached separately in transform_split (not part of imputation).
    assert transformed.shape == (5, len(m.MODEL_INPUT_COLUMNS))
    assert not bool(np.isnan(transformed).any())


def _train_raw() -> pd.DataFrame:
    raw = m.load_nhanes(w.RAW_CSV)
    df, _ = m.clean(raw)
    train_raw, _, _ = m.split_stratified(df)
    return train_raw


def test_imputer_statistics_match_train_only() -> None:
    """Imputation constants must come from TRAIN, never the full data."""
    train_raw = _train_raw()
    pre = m.build_preprocessor()
    pre.fit(train_raw[m.MODEL_INPUT_COLUMNS])

    num_stats = pre.named_transformers_["num"].statistics_
    expected = train_raw[m.NUMERIC_FEATURES].median().to_numpy()
    assert np.allclose(num_stats, expected)

    smoke_stat = pre.named_transformers_["smoke"].statistics_
    expected_mode = train_raw["smoking_status"].mode().iloc[0]
    assert smoke_stat[0] == pytest.approx(expected_mode)


def test_transform_fills_real_missing_values() -> None:
    """Rows with genuine NaNs must be filled with the TRAIN median."""
    train_raw = _train_raw()
    pre = m.build_preprocessor()
    pre.fit(train_raw[m.MODEL_INPUT_COLUMNS])

    raw = m.load_nhanes(w.RAW_CSV)
    df, _ = m.clean(raw)
    missing_row = df[df["blood_sugar_mg_dl"].isna()].head(1)
    assert len(missing_row) == 1

    out = pre.transform(missing_row[m.MODEL_INPUT_COLUMNS])
    idx = m.NUMERIC_FEATURES.index("blood_sugar_mg_dl")
    expected = float(train_raw["blood_sugar_mg_dl"].median())
    assert out[0][idx] == pytest.approx(expected)


def test_clean_rules_on_synthetic_frame() -> None:
    """Clipping + label-missing drop, and input must not be mutated."""
    base = m.load_nhanes(w.RAW_CSV).head(3).copy()
    for target in m.TARGETS:
        base[target] = 0
    base.loc[base.index[0], "physical_activity_min_per_week"] = 99999.0
    base.loc[base.index[1], "diabetes"] = np.nan
    n_in = len(base)

    out, info = m.clean(base)

    assert len(out) == n_in - 1
    assert info["rows_dropped_target_missing"] == 1
    assert info["rows_dropped_duplicate_seqn"] == 0
    assert info["activity_values_clipped"] == 1
    assert float(out["physical_activity_min_per_week"].max()) <= m.ACTIVITY_CAP
    assert out[m.TARGETS].isna().sum().sum() == 0
    assert len(base) == n_in


def test_manifest_feature_contract(pipeline: dict) -> None:
    """Manifest must bind every ML feature to its serving counterpart."""
    out: Path = pipeline["out_dir"]
    manifest = json.loads((out / "manifest.json").read_text())

    contract = manifest["feature_contract"]
    assert set(contract["ml_to_serving"]) == set(m.FEATURE_NAMES)
    assert contract["ml_to_serving"]["blood_sugar_mg_dl"] == "blood_sugar"
    assert contract["ml_to_serving"]["blood_sugar_missing"] is None
    assert contract["serving_only_rule_based"] == [
        "family_history",
        "stress_level",
    ]
    assert "scikit-learn" in manifest["library_versions"]


def test_clean_drops_duplicate_seqn() -> None:
    """.03: exact seqn duplicates are dropped first and counted."""
    base = m.load_nhanes(w.RAW_CSV).head(5).copy()
    for target in m.TARGETS:
        base[target] = 0
    dup = pd.concat([base, base.iloc[[0]]], ignore_index=True)
    assert len(dup) == 6

    out, info = m.clean(dup)

    assert info["rows_dropped_duplicate_seqn"] == 1
    assert len(out) == 5
    assert int(out["seqn"].duplicated().sum()) == 0
    assert len(base) == 5  # input untouched


def test_encode_features_validates_smoking_domain() -> None:
    """.05: smoking ordinal mapping locked; same rows in and out."""
    raw = m.load_nhanes(w.RAW_CSV)
    df, _ = m.clean(raw)

    out, info = m.encode_features(df)

    assert info["column"] == "smoking_status"
    assert info["mapping"] == m.SMOKING_ENCODING
    assert info["domain"] == m.SMOKING_CATEGORIES == [0, 1, 2]
    assert info["n_unknown_values"] == 0
    assert len(out) == len(df)
    assert set(out["smoking_status"].dropna().unique().tolist()) <= {0.0, 1.0, 2.0}


def test_encode_features_rejects_unknown_smoking() -> None:
    """.05: smoking values outside {0,1,2} must fail loudly."""
    raw = m.load_nhanes(w.RAW_CSV)
    df, _ = m.clean(raw)
    bad = df.head(3).copy()
    bad.loc[bad.index[0], "smoking_status"] = 9
    with pytest.raises(ValueError, match="unknown smoking_status"):
        m.encode_features(bad)


def test_outlier_review_structure(pipeline: dict) -> None:
    """.04: review covers every numeric feature; 0 hard violations."""
    review = pipeline["report"]["outlier_review"]
    assert set(review["columns"]) == set(m.NUMERIC_FEATURES)
    for col, stats in review["columns"].items():
        for key in ("q1", "q3", "iqr_lower", "iqr_upper",
                    "n_below_iqr", "n_above_iqr",
                    "hard_bounds", "n_hard_violations"):
            assert key in stats, (col, key)
    assert review["total_hard_violations"] == 0
    assert review["policy"]["action"] == "keep"


def test_outlier_review_flags_activity_cap(pipeline: dict) -> None:
    """.04: activity above-cap rows are flagged, bounds match the cap."""
    review = pipeline["report"]["outlier_review"]
    act = review["columns"]["physical_activity_min_per_week"]
    assert act["hard_bounds"] == [0.0, m.ACTIVITY_CAP]
    assert act["n_above_iqr"] > 0


def test_manifest_encoding_and_duplicates(pipeline: dict) -> None:
    """.03/.05: manifest records dedup counts and the encoding contract."""
    manifest = pipeline["manifest"]
    assert manifest["cleaning"]["rows_dropped_duplicate_seqn"] == 0
    assert manifest["encoding"]["mapping"] == m.SMOKING_ENCODING
    assert manifest["encoding"]["domain"] == m.SMOKING_CATEGORIES
    for key in ("duplicates", "outliers", "encoding"):
        assert key in manifest["decisions"], key
    report = pipeline["report"]
    for key in ("column", "mapping", "domain", "rationale"):
        assert key in report["encoding"], key
