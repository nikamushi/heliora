"""Unit tests for ml_core.preprocessing (shared train/serve logic).

Synthetic frames only — no dataset files — so the package stays
independently testable. End-to-end AI-001 acceptance tests over the real
NHANES CSV (splits, artifacts, manifest) live in ``ai/tests``.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from ml_core.preprocessing import (
    ACTIVITY_CAP,
    EXCLUDED_COLUMNS,
    FEATURE_NAMES,
    MODEL_INPUT_COLUMNS,
    NUMERIC_FEATURES,
    TARGETS,
    build_preprocessor,
    clean,
    encode_features,
    load_nhanes,
    review_outliers,
    split_stratified,
    transform_split,
)


def _raw_frame(n_per_stratum: int = 8) -> pd.DataFrame:
    """Synthetic raw NHANES-like frame covering all 8 joint strata."""
    rows: list[dict[str, float | int]] = []
    seqn = 1
    for diabetes in (0, 1):
        for hypertension in (0, 1):
            for cardiovascular in (0, 1):
                for _ in range(n_per_stratum):
                    rows.append(
                        {
                            "seqn": seqn,
                            "age": 30.0 + seqn % 40,
                            "bmi": 22.0 + seqn % 15,
                            "physical_activity_min_per_week": (120.0 + (seqn % 7) * 60),
                            "sleep_duration_hours": 6.0 + seqn % 3,
                            "smoking_status": seqn % 3,
                            "fasting_glucose_mg_dl": 90.0 + seqn % 50,
                            "total_cholesterol_mg_dl": 160.0 + seqn % 80,
                            "systolic_bp_mean": 110.0 + seqn % 40,
                            "diastolic_bp_mean": 70.0 + seqn % 20,
                            "diabetes": diabetes,
                            "hypertension": hypertension,
                            "cardiovascular": cardiovascular,
                        }
                    )
                    seqn += 1
    return pd.DataFrame(rows)


def _loaded_frame(n_per_stratum: int = 8) -> pd.DataFrame:
    """Raw frame with the missing indicator, as load_nhanes would add it."""
    df = _raw_frame(n_per_stratum)
    df["blood_sugar_missing"] = df["fasting_glucose_mg_dl"].isna().astype(int)
    return df


def _clean_encoded() -> pd.DataFrame:
    df, _ = clean(_loaded_frame())
    df, _ = encode_features(df)
    return df


def test_feature_contract_matches_model_inputs() -> None:
    """FEATURE_NAMES = 9 model inputs + indicator; no leakage columns."""
    assert set(MODEL_INPUT_COLUMNS) | {"blood_sugar_missing"} == set(FEATURE_NAMES)
    assert not set(TARGETS) & set(FEATURE_NAMES)
    assert not set(EXCLUDED_COLUMNS) & set(FEATURE_NAMES)


def test_load_nhanes_attaches_missing_indicator(tmp_path: Path) -> None:
    """Indicator is derived from the raw fasting column before imputation."""
    df = _raw_frame()
    df.loc[0, "fasting_glucose_mg_dl"] = np.nan
    csv = tmp_path / "raw.csv"
    df.to_csv(csv, index=False)

    loaded = load_nhanes(csv)

    assert int(loaded["blood_sugar_missing"].sum()) == 1
    assert int(loaded.loc[0, "blood_sugar_missing"]) == 1


def test_load_nhanes_rejects_missing_columns(tmp_path: Path) -> None:
    """A raw CSV missing contract columns must fail loudly."""
    csv = tmp_path / "bad.csv"
    _raw_frame().drop(columns=["bmi"]).to_csv(csv, index=False)
    with pytest.raises(ValueError, match="missing columns"):
        load_nhanes(csv)


def test_clean_caps_activity_drops_labels_and_never_mutates() -> None:
    """Clipping + label-missing drop + lab rename, input untouched."""
    base = _loaded_frame().head(3).copy()
    base.loc[base.index[0], "physical_activity_min_per_week"] = 99999.0
    base.loc[base.index[1], "diabetes"] = np.nan
    n_in = len(base)

    out, info = clean(base)

    assert len(out) == n_in - 1
    assert info["rows_dropped_target_missing"] == 1
    assert info["rows_dropped_duplicate_seqn"] == 0
    assert info["activity_values_clipped"] == 1
    assert float(out["physical_activity_min_per_week"].max()) <= ACTIVITY_CAP
    assert "blood_sugar_mg_dl" in out.columns
    assert "fasting_glucose_mg_dl" not in out.columns
    assert len(base) == n_in


def test_encode_validates_and_rejects_unknown_smoking() -> None:
    """.05: domain {0,1,2} locked; anything else fails loudly."""
    loaded = _loaded_frame()

    out, info = encode_features(loaded)

    assert info["mapping"] == {0: "never", 1: "former", 2: "current"}
    assert info["domain"] == [0, 1, 2]
    assert set(out["smoking_status"].unique().tolist()) <= {0.0, 1.0, 2.0}

    bad = loaded.copy()
    bad.loc[bad.index[0], "smoking_status"] = 7
    with pytest.raises(ValueError, match="unknown smoking_status"):
        encode_features(bad)


def test_split_deterministic_disjoint_and_stratified() -> None:
    """Same seed → same split; seqn disjoint; ~70/15/15 ratios."""
    df = _clean_encoded()

    train_a, val_a, test_a = split_stratified(df)
    train_b, _, _ = split_stratified(df)

    assert set(train_a["seqn"]) == set(train_b["seqn"])
    ids = [set(s["seqn"]) for s in (train_a, val_a, test_a)]
    assert ids[0].isdisjoint(ids[1])
    assert ids[0].isdisjoint(ids[2])
    assert ids[1].isdisjoint(ids[2])
    total = sum(len(s) for s in (train_a, val_a, test_a))
    assert len(ids[0] | ids[1] | ids[2]) == total
    assert len(train_a) / total == pytest.approx(0.70, abs=0.05)


def test_split_requires_stratifiable_frame() -> None:
    """Thin joint-target strata must raise, not silently leak."""
    df = _clean_encoded()
    stratum = (
        (df["diabetes"] == 1) & (df["hypertension"] == 0) & (df["cardiovascular"] == 0)
    )
    thin = pd.concat([df[~stratum], df[stratum].head(1)], ignore_index=True)
    with pytest.raises(ValueError, match="cannot stratify"):
        split_stratified(thin)


def test_build_preprocessor_uses_train_only_statistics() -> None:
    """Imputation constants come from TRAIN; output matches the contract."""
    df = _clean_encoded()
    train_raw, val_raw, _ = split_stratified(df)

    pre = build_preprocessor()
    pre.fit(train_raw[MODEL_INPUT_COLUMNS])
    transformed = transform_split(pre, val_raw)

    assert list(transformed.columns) == ["seqn", *FEATURE_NAMES, *TARGETS]
    assert not transformed[FEATURE_NAMES].isna().any().any()

    num_stats = pre.named_transformers_["num"].statistics_
    expected = train_raw[NUMERIC_FEATURES].median().to_numpy()
    assert np.allclose(num_stats, expected)


def test_transform_split_preserves_missing_indicator() -> None:
    """Rows missing blood sugar stay flagged and get the TRAIN median."""
    loaded = _loaded_frame()
    loaded.loc[loaded.index[-1], "fasting_glucose_mg_dl"] = np.nan
    loaded["blood_sugar_missing"] = loaded["fasting_glucose_mg_dl"].isna().astype(int)

    df, _ = clean(loaded)
    df, _ = encode_features(df)
    train_raw, val_raw, test_raw = split_stratified(df)

    pre = build_preprocessor()
    pre.fit(train_raw[MODEL_INPUT_COLUMNS])
    frames = [transform_split(pre, s) for s in (train_raw, val_raw, test_raw)]
    all_rows = pd.concat(frames, ignore_index=True)

    assert int(all_rows["blood_sugar_missing"].sum()) == 1
    missing_row = all_rows[all_rows["blood_sugar_missing"] == 1]
    assert missing_row["blood_sugar_mg_dl"].iloc[0] == pytest.approx(
        float(train_raw["blood_sugar_mg_dl"].median())
    )


def test_review_outliers_flags_hard_violations() -> None:
    """.04: out-of-bound values are flagged, policy keeps the rows."""
    df = _clean_encoded()
    df.loc[df.index[0], "bmi"] = 5.0

    review = review_outliers(df)

    assert set(review["columns"]) == set(NUMERIC_FEATURES)
    assert review["columns"]["bmi"]["n_hard_violations"] == 1
    assert review["total_hard_violations"] == 1
    assert review["policy"]["action"] == "keep"
