"""HELIORA shared ML core — preprocessing & feature contract (train↔serve).

Dataset paths, notebooks and artifact persistence deliberately live in the
``ai`` workspace member (``heliora_ai``); this package only carries the
train/serve-identical logic and the feature contract.
"""

from ml_core.preprocessing import (
    ACTIVITY_CAP,
    EXCLUDED_COLUMNS,
    FEATURE_NAMES,
    ID_COLUMN,
    MODEL_INPUT_COLUMNS,
    NUMERIC_FEATURES,
    OUTLIER_HARD_BOUNDS,
    RAW_REQUIRED_COLUMNS,
    SEED,
    SERVING_FEATURE_MAP,
    SERVING_ONLY_RULE_BASED,
    SMOKING_CATEGORIES,
    SMOKING_ENCODING,
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

__version__ = "0.1.0"

__all__ = [
    "ACTIVITY_CAP",
    "EXCLUDED_COLUMNS",
    "FEATURE_NAMES",
    "ID_COLUMN",
    "MODEL_INPUT_COLUMNS",
    "NUMERIC_FEATURES",
    "OUTLIER_HARD_BOUNDS",
    "RAW_REQUIRED_COLUMNS",
    "SEED",
    "SERVING_FEATURE_MAP",
    "SERVING_ONLY_RULE_BASED",
    "SMOKING_CATEGORIES",
    "SMOKING_ENCODING",
    "TARGETS",
    "TEST_RATIO",
    "TRAIN_RATIO",
    "VAL_RATIO",
    "build_preprocessor",
    "clean",
    "encode_features",
    "evaluate_dataset",
    "load_nhanes",
    "review_outliers",
    "split_stratified",
    "transform_split",
]
