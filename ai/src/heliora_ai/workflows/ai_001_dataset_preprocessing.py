"""AI-001 dataset preprocessing workflow (NHANES-2021-2023-v1).

Binds the shared preprocessing logic in ``ml_core`` to the locked AI-001
dataset contract:

- Source: NHANES only (`ai/datasets/nhanes_2021_2023.csv`). SKI is a
  reference (`ai/datasets/ski_2023_indicators.csv`); BRFSS excluded; no
  downloads (see `ai/datasets/scripts/` for rebuilds).
- Output: train/val/test parquet + fitted preprocessor + manifest +
  evaluation report, versioned under `ai/datasets/processed/<VERSION>`.
- Feature/cleanup/leakage decisions live in `ml_core.preprocessing`
  and docs/TASK.md AI-001.

Importable and jupytext-paired: `ai/notebooks/ai_001_dataset_
preprocessing.py` drives it; a `__main__` run reproduces the same
artifacts as the notebook.
"""

from __future__ import annotations

import json
import platform
from pathlib import Path

import joblib
import pandas as pd
import sklearn
from ml_core.preprocessing import (
    EXCLUDED_COLUMNS,
    FEATURE_NAMES,
    MODEL_INPUT_COLUMNS,
    SEED,
    SERVING_FEATURE_MAP,
    SERVING_ONLY_RULE_BASED,
    TARGETS,
    TEST_RATIO,
    TRAIN_RATIO,
    VAL_RATIO,
    build_preprocessor,
    clean,
    encode_features,
    evaluate_dataset,
    load_nhanes,
    review_outliers,
    split_stratified,
    transform_split,
)
from sklearn.compose import ColumnTransformer

VERSION = "NHANES-2021-2023-v1"

AI_DIR = Path(__file__).resolve().parents[3]
REPO_ROOT = AI_DIR.parent
DATASETS_DIR = AI_DIR / "datasets"
RAW_CSV = DATASETS_DIR / "nhanes_2021_2023.csv"
DEFAULT_OUT = DATASETS_DIR / "processed" / VERSION


def _source_label(path: str | Path) -> str:
    """Repo-relative source label when inside the repo, else absolute."""
    resolved = Path(path).resolve()
    try:
        return resolved.relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return resolved.as_posix()


def _manifest(
    n_raw: int,
    n_clean: int,
    sizes: dict[str, int],
    cleaning_info: dict,
    encoding_info: dict,
    source: str,
) -> dict:
    return {
        "version": VERSION,
        "seed": SEED,
        "split_ratios": {
            "train": TRAIN_RATIO,
            "val": VAL_RATIO,
            "test": TEST_RATIO,
        },
        "stratify_key": "joint:diabetes-hypertension-cardiovascular",
        "source_file": source,
        "n_rows_raw": int(n_raw),
        "n_rows_clean": int(n_clean),
        "n_rows_split": {k: int(v) for k, v in sizes.items()},
        "row_id": (
            "seqn (NHANES respondent id, de-identified public data; "
            "kept in splits for traceability, excluded from model input)"
        ),
        "feature_names": list(FEATURE_NAMES),
        "target_names": list(TARGETS),
        "excluded_columns": list(EXCLUDED_COLUMNS),
        "feature_contract": {
            "ml_to_serving": dict(SERVING_FEATURE_MAP),
            "serving_only_rule_based": list(SERVING_ONLY_RULE_BASED),
        },
        "library_versions": {
            "python": platform.python_version(),
            "pandas": pd.__version__,
            "scikit-learn": sklearn.__version__,
        },
        "cleaning": cleaning_info,
        "encoding": encoding_info,
        "decisions": {
            "family_history_stress_level": "rule-based outside model",
            "hba1c_pct": "excluded from features (train/serve skew)",
            "sex": "excluded (not used by serving risk engine)",
            "blood_sugar": "train-only median + missing indicator",
            "duplicates": "drop exact seqn duplicates first (0 found)",
            "outliers": (
                "recorded IQR + hard-bound review; keep "
                "(only activity capped)"
            ),
            "encoding": (
                "smoking ordinal 0/1/2 validated, no one-hot "
                "(tree models)"
            ),
        },
    }


def persist_artifacts(
    train: pd.DataFrame,
    val: pd.DataFrame,
    test: pd.DataFrame,
    preprocessor: ColumnTransformer,
    manifest: dict,
    report: dict,
    out_dir: str | Path,
) -> Path:
    """Write parquet splits, joblib preprocessor, manifest and report."""
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    train.to_parquet(out / "train.parquet", index=False)
    val.to_parquet(out / "val.parquet", index=False)
    test.to_parquet(out / "test.parquet", index=False)
    joblib.dump(preprocessor, out / "preprocessor.joblib")
    (out / "manifest.json").write_text(
        json.dumps(manifest, indent=2), encoding="utf-8"
    )
    (out / "dataset_report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    return out


def run_pipeline(
    raw_csv: str | Path = RAW_CSV,
    out_dir: str | Path = DEFAULT_OUT,
) -> dict:
    """Run load → evaluate → clean → split → transform → persist."""
    raw = load_nhanes(raw_csv)
    report = evaluate_dataset(raw)

    df, cleaning_info = clean(raw)
    report["n_rows_clean"] = cleaning_info["n_rows_clean"]
    report["cleaning"] = cleaning_info

    df, encoding_info = encode_features(df)
    report["encoding"] = encoding_info
    report["outlier_review"] = review_outliers(df)

    train_raw, val_raw, test_raw = split_stratified(df)

    preprocessor = build_preprocessor()
    preprocessor.fit(train_raw[MODEL_INPUT_COLUMNS])

    train = transform_split(preprocessor, train_raw)
    val = transform_split(preprocessor, val_raw)
    test = transform_split(preprocessor, test_raw)

    splits = {"train": train, "val": val, "test": test}
    report["split_prevalence"] = {
        name: {t: float(s[t].mean()) for t in TARGETS}
        for name, s in splits.items()
    }

    manifest = _manifest(
        n_raw=len(raw),
        n_clean=len(df),
        sizes={k: len(v) for k, v in splits.items()},
        cleaning_info=cleaning_info,
        encoding_info=encoding_info,
        source=_source_label(raw_csv),
    )
    out = persist_artifacts(
        train, val, test, preprocessor, manifest, report, out_dir
    )
    return {
        "train": train,
        "val": val,
        "test": test,
        "preprocessor": preprocessor,
        "manifest": manifest,
        "report": report,
        "out_dir": out,
    }


if __name__ == "__main__":
    result = run_pipeline()
    print(f"version: {result['manifest']['version']}")
    print(f"out_dir: {result['out_dir']}")
    for name in ("train", "val", "test"):
        split = result[name]
        print(f"{name}: rows={len(split)} cols={len(split.columns)}")
