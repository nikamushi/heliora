# %% [markdown]
# AI-001 — Dataset Preprocessing (NHANES-2021-2023-v1)
#
# End-to-end preprocessing: NHANES 2021–2023 microdata → train/val/test
# parquet + fitted preprocessor + manifest + evaluation report.
#
# Locked decisions (see TASK.md AI-001):
# - Source: NHANES only (`apps/ml/data/nhanes_2021_2023.csv`). SKI is
#   reference; no downloads; BRFSS excluded.
# - Feature contract (9 measured fields): age, bmi,
#   physical_activity_min_per_week, sleep_duration_hours, smoking_status,
#   blood_sugar_mg_dl (from fasting_glucose_mg_dl), cholesterol_mg_dl
#   (from total_cholesterol_mg_dl), systolic_bp_mean, diastolic_bp_mean.
# - `family_history` / `stress_level` are NOT in NHANES/BRFSS → handled
#   rule-based outside the model (documented limitation).
# - Blood sugar: train-only median imputation + missing indicator.
#   `hba1c_pct` is kept in the dataset but EXCLUDED from model features
#   (avoids train/serve skew — HbA1c is not collected at serving time).
# - `sex` excluded from the model matrix (serving-side FEATURE_NAMES in
#   `apps/api/app/ai/shap_explainer.py` does not use it).
# - Targets: diabetes, hypertension, cardiovascular.
# - Split 70/15/15, stratified on the joint 3-target key, seed 42.
# - Duplicate handling (.03): exact `seqn` duplicates dropped first;
#   0 found in NHANES-2021-2023-v1.
# - Outlier review (.04): systematic IQR + physiologic hard-bound review
#   recorded in `dataset_report["outlier_review"]`; policy = keep
#   (tree models are outlier-robust, flags are clinically plausible),
#   only activity entries above the cap are clipped.
# - Encoding (.05): `smoking_status` is an explicit NHANES ordinal
#   (0=never, 1=former, 2=current), validated, never one-hot (tree
#   models handle ordinals and the 9-field serving contract stays 1:1).
# - Leakage guard: imputation statistics fit on TRAIN only; `seqn`
#   disjoint across splits; label/medication columns never enter X.
# - Train↔serve parity: ML feature names differ from serving names
#   (e.g. `blood_sugar_mg_dl` vs `blood_sugar`); the exact mapping is
#   recorded in `manifest["feature_contract"]` so AI-002 can bind them.

# %%
"""AI-001 dataset preprocessing pipeline (importable + jupytext-paired).

The notebook `ai_001_dataset_preprocessing.ipynb` is generated from this
file via ``jupytext --to ipynb`` and kept in sync with ``jupytext --sync``.
"""

from __future__ import annotations

import json
import platform
from pathlib import Path

import joblib
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

# %% [markdown]
# ## 0. Configuration

# %%
VERSION = "NHANES-2021-2023-v1"
SEED = 42
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

MODULE_DIR = Path(__file__).resolve().parent
REPO_ROOT = MODULE_DIR.parent.parent
RAW_CSV = MODULE_DIR.parent / "data" / "nhanes_2021_2023.csv"
DEFAULT_OUT = MODULE_DIR.parent / "data" / "processed" / VERSION

TARGETS = ["diabetes", "hypertension", "cardiovascular"]

# Columns required in the raw CSV (pre-rename names).
RAW_REQUIRED_COLUMNS = [
    "seqn",
    "age",
    "bmi",
    "physical_activity_min_per_week",
    "sleep_duration_hours",
    "smoking_status",
    "fasting_glucose_mg_dl",
    "total_cholesterol_mg_dl",
    "systolic_bp_mean",
    "diastolic_bp_mean",
    "diabetes",
    "hypertension",
    "cardiovascular",
]

# Model input columns (post-rename, pre-transform).
MODEL_INPUT_COLUMNS = [
    "age",
    "bmi",
    "physical_activity_min_per_week",
    "sleep_duration_hours",
    "smoking_status",
    "blood_sugar_mg_dl",
    "cholesterol_mg_dl",
    "systolic_bp_mean",
    "diastolic_bp_mean",
]

NUMERIC_FEATURES = [c for c in MODEL_INPUT_COLUMNS if c != "smoking_status"]

# Final model feature order (9 contract fields + blood-sugar indicator).
FEATURE_NAMES = [
    "age",
    "bmi",
    "physical_activity_min_per_week",
    "sleep_duration_hours",
    "smoking_status",
    "blood_sugar_mg_dl",
    "blood_sugar_missing",
    "cholesterol_mg_dl",
    "systolic_bp_mean",
    "diastolic_bp_mean",
]

# Columns that must NEVER enter the feature matrix: identifiers, survey
# weights/design, alternative labels, medications, and lab fields that are
# not collected at serving time (hba1c_pct).
EXCLUDED_COLUMNS = [
    "sex",
    "height_cm",
    "weight_kg",
    "waist_cm",
    "hdl_mg_dl",
    "hba1c_pct",
    "bp_readings",
    "sedentary_min_per_day",
    "diabetes_code",
    "bp_medication",
    "high_cholesterol",
    "heart_attack",
    "stroke",
    "chd_angina",
    "weight_interview",
    "weight_exam",
    "weight_fasting",
    "psu",
    "stratum",
]

# ML → serving feature-name map. Serving uses shorter names
# (apps/api/app/ai/shap_explainer.py FEATURE_NAMES); the two lists also
# differ in membership (see SERVING_ONLY_RULE_BASED). AI-002 binds them.
SERVING_FEATURE_MAP = {
    "age": "age",
    "bmi": "bmi",
    "physical_activity_min_per_week": "physical_activity",
    "sleep_duration_hours": "sleep_duration",
    "smoking_status": "smoking_status",
    "blood_sugar_mg_dl": "blood_sugar",
    "blood_sugar_missing": None,
    "cholesterol_mg_dl": "cholesterol",
    "systolic_bp_mean": "systolic_bp",
    "diastolic_bp_mean": "diastolic_bp",
}
SERVING_ONLY_RULE_BASED = ["family_history", "stress_level"]

# Physiologic plausibility cap: 6 h/day of activity. Values above are
# data-entry artefacts (raw max = 7980 min/week ≈ 19 h/day).
ACTIVITY_CAP = 2520.0

# Row identity for .03 duplicate handling: NHANES respondent id
# (de-identified public data).
ID_COLUMN = "seqn"

# Explicit NHANES smoking ordinal (.05 encoding): 0=never, 1=former,
# 2=current. Validated in encode_features; never one-hot — tree models
# handle ordinals and the 9-field serving contract stays 1:1.
SMOKING_ENCODING = {0: "never", 1: "former", 2: "current"}
SMOKING_CATEGORIES = [0, 1, 2]

# Physiologic plausibility bounds for the .04 outlier review
# (post-rename names). Rows outside are NOT dropped — the review is
# recorded in dataset_report["outlier_review"] and the policy is
# "keep" (tree-model robustness), with the sole exception of the
# ACTIVITY_CAP data-entry artefact.
OUTLIER_HARD_BOUNDS = {
    "bmi": (10.0, 80.0),
    "systolic_bp_mean": (70.0, 250.0),
    "diastolic_bp_mean": (30.0, 150.0),
    "blood_sugar_mg_dl": (40.0, 500.0),
    "cholesterol_mg_dl": (50.0, 600.0),
    "sleep_duration_hours": (2.0, 14.0),
    "physical_activity_min_per_week": (0.0, ACTIVITY_CAP),
}

# %% [markdown]
# ## 1. Loader + missingness indicator (§11.11)

# %%
def load_nhanes(path: str | Path = RAW_CSV) -> pd.DataFrame:
    """Load raw NHANES CSV and attach the blood-sugar missing indicator.

    The indicator is derived from the raw fasting column BEFORE any
    imputation, so it faithfully marks "not measured" rows.
    """
    df = pd.read_csv(path)
    missing = set(RAW_REQUIRED_COLUMNS) - set(df.columns)
    if missing:
        raise ValueError(f"raw CSV missing columns: {sorted(missing)}")
    out = df.copy()
    out["blood_sugar_missing"] = (
        out["fasting_glucose_mg_dl"].isna().astype(int)
    )
    return out


def evaluate_dataset(df: pd.DataFrame) -> dict:
    """PRD §11.31 initial dataset evaluation (JSON-serializable)."""
    total = len(df)
    missing_rate = {
        col: float(df[col].isna().mean()) for col in df.columns
    }
    prevalence = {
        t: float(df[t].dropna().mean()) for t in TARGETS
    }
    out_of_range = {
        "physical_activity_min_per_week_gt_cap": int(
            (df["physical_activity_min_per_week"] > ACTIVITY_CAP).sum()
        ),
    }
    return {
        "n_rows_raw": int(total),
        "missing_rate": missing_rate,
        "target_prevalence": prevalence,
        "target_missing": {
            t: int(df[t].isna().sum()) for t in TARGETS
        },
        "out_of_range": out_of_range,
    }

# %% [markdown]
# ## 2. Cleaning (§11.10 + .03): dedup on `seqn`, drop label-missing
# rows, cap activity artefacts, rename labs

# %%
def clean(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Clean a copy of the raw frame; never mutates the input."""
    out = df.copy()
    n_raw = len(out)

    out = out.drop_duplicates(subset=[ID_COLUMN]).reset_index(drop=True)
    n_dropped_duplicates = n_raw - len(out)

    out = out.dropna(subset=TARGETS).reset_index(drop=True)
    n_dropped_targets = n_raw - n_dropped_duplicates - len(out)

    n_clipped = int((out["physical_activity_min_per_week"] > ACTIVITY_CAP).sum())
    out["physical_activity_min_per_week"] = out[
        "physical_activity_min_per_week"
    ].clip(upper=ACTIVITY_CAP)

    out = out.rename(
        columns={
            "fasting_glucose_mg_dl": "blood_sugar_mg_dl",
            "total_cholesterol_mg_dl": "cholesterol_mg_dl",
        }
    )
    for target in TARGETS:
        out[target] = out[target].astype(int)

    info = {
        "n_rows_clean": int(len(out)),
        "rows_dropped_duplicate_seqn": int(n_dropped_duplicates),
        "rows_dropped_target_missing": int(n_dropped_targets),
        "activity_values_clipped": int(n_clipped),
    }
    return out, info

# %% [markdown]
# ## 2b. Outlier review (.04) + explicit encoding (.05)

# %%
def encode_features(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Validate and lock the smoking ordinal (.05).

    Stateless mapping — no statistics are learned, so this step is
    leakage-free by construction and runs before the split. NaNs are
    kept for the train-only imputer in `build_preprocessor`.
    """
    out = df.copy()
    observed = sorted(
        out.loc[out["smoking_status"].notna(), "smoking_status"]
        .unique()
        .tolist()
    )
    unknown = [v for v in observed if v not in SMOKING_CATEGORIES]
    if unknown:
        raise ValueError(
            "unknown smoking_status values "
            f"(expected {SMOKING_CATEGORIES}): {unknown}"
        )
    out["smoking_status"] = out["smoking_status"].astype(float)
    info = {
        "column": "smoking_status",
        "mapping": {int(k): v for k, v in SMOKING_ENCODING.items()},
        "domain": list(SMOKING_CATEGORIES),
        "n_unknown_values": 0,
        "rationale": (
            "NHANES ordinal 0/1/2 kept as-is; tree models handle "
            "ordinals natively and one-hot would break the 9-field "
            "serving contract."
        ),
    }
    return out, info


def review_outliers(df: pd.DataFrame) -> dict:
    """Systematic outlier review (.04): IQR flags + hard-bound check.

    Read-only: returns a JSON-serializable review, never drops or
    winsorizes rows. Reviewed on the cleaned frame so bounds describe
    exactly what the model trains on.
    """
    features: dict[str, dict] = {}
    total_hard = 0
    for col in NUMERIC_FEATURES:
        s = df[col].dropna()
        q1 = float(s.quantile(0.25))
        q3 = float(s.quantile(0.75))
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        bounds = OUTLIER_HARD_BOUNDS.get(col)
        if bounds is None:
            hard_bounds: list[float] | None = None
            n_hard = 0
        else:
            lo, hi = bounds
            hard_bounds = [float(lo), float(hi)]
            n_hard = int(((s < lo) | (s > hi)).sum())
        total_hard += n_hard
        features[col] = {
            "q1": q1,
            "q3": q3,
            "iqr_lower": float(lower),
            "iqr_upper": float(upper),
            "n_below_iqr": int((s < lower).sum()),
            "n_above_iqr": int((s > upper).sum()),
            "hard_bounds": hard_bounds,
            "n_hard_violations": int(n_hard),
        }
    return {
        "columns": features,
        "total_hard_violations": int(total_hard),
        "policy": {
            "action": "keep",
            "only_cap": "physical_activity_min_per_week",
            "rationale": (
                "IQR-flagged values are clinically plausible (e.g. high "
                "glucose in diabetics); tree models are outlier-robust, "
                "so nothing is dropped or winsorized. Only activity "
                "values above ACTIVITY_CAP are clipped because raw max "
                "7980 min/week (19 h/day) is a data-entry artefact, "
                "not physiology."
            ),
        },
    }

# %% [markdown]
# ## 3. Stratified split (§11.30): joint target key, `seqn`-disjoint by construction

# %%
def _stratify_key(df: pd.DataFrame) -> pd.Series:
    return df[TARGETS].astype(int).astype(str).agg("-".join, axis=1)


def _require_stratifiable(key: pd.Series, where: str) -> None:
    min_count = int(key.value_counts().min())
    if min_count < 2:
        raise ValueError(
            f"cannot stratify {where}: thinnest joint-target stratum "
            f"has {min_count} rows (< 2). Drop thin strata or use a "
            "single-target stratify key."
        )


def split_stratified(
    df: pd.DataFrame,
    seed: int = SEED,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """70/15/15 split stratified on the joint 3-target key."""
    key = _stratify_key(df)
    _require_stratifiable(key, "train/test")
    train, temp = train_test_split(
        df,
        test_size=1.0 - TRAIN_RATIO,
        random_state=seed,
        stratify=key,
    )
    temp_key = _stratify_key(temp)
    _require_stratifiable(temp_key, "val/test")
    val_ratio_of_temp = VAL_RATIO / (VAL_RATIO + TEST_RATIO)
    val, test = train_test_split(
        temp,
        test_size=1.0 - val_ratio_of_temp,
        random_state=seed,
        stratify=temp_key,
    )
    return (
        train.reset_index(drop=True),
        val.reset_index(drop=True),
        test.reset_index(drop=True),
    )

# %% [markdown]
# ## 4. Transform (§11.12): train-only imputation, no leakage

# %%
def build_preprocessor() -> ColumnTransformer:
    """Imputer fitted on TRAIN only: median for numerics, mode for smoking."""
    return ColumnTransformer(
        transformers=[
            ("num", SimpleImputer(strategy="median"), NUMERIC_FEATURES),
            (
                "smoke",
                SimpleImputer(strategy="most_frequent"),
                ["smoking_status"],
            ),
        ]
    )


def transform_split(
    preprocessor: ColumnTransformer, df: pd.DataFrame
) -> pd.DataFrame:
    """Apply a fitted preprocessor; returns seqn + features + targets."""
    matrix = preprocessor.transform(df[MODEL_INPUT_COLUMNS])
    transformed = pd.DataFrame(
        matrix,
        columns=[*NUMERIC_FEATURES, "smoking_status"],
    )
    transformed["blood_sugar_missing"] = (
        df["blood_sugar_missing"].to_numpy()
    )
    features = transformed[FEATURE_NAMES]
    return pd.concat(
        [df[["seqn"]].reset_index(drop=True), features,
         df[TARGETS].reset_index(drop=True)],
        axis=1,
    )

# %% [markdown]
# ## 5. Persist + versioning (§11.29)

# %%
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

# %% [markdown]
# ## 6. Main — executed only as a script / notebook run-all, never on import

# %%
if __name__ == "__main__":
    result = run_pipeline()
    print(f"version: {result['manifest']['version']}")
    print(f"out_dir: {result['out_dir']}")
    for name in ("train", "val", "test"):
        split = result[name]
        print(f"{name}: rows={len(split)} cols={len(split.columns)}")
