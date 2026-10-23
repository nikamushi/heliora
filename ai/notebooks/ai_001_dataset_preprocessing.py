# %% [markdown]
# # AI-001 — Dataset Preprocessing (NHANES-2021-2023-v1)
#
# Driver notebook: runs the AI-001 workflow
# (`heliora_ai.workflows.ai_001_dataset_preprocessing`) against the
# datasets under `ai/datasets/`. Shared preprocessing logic lives in
# `packages/ml-core` (`ml_core`).
#
# Regenerate the paired `.ipynb` with `jupytext --to ipynb`.

# %%
"""AI-001 experiment driver (importable + jupytext-paired)."""

from __future__ import annotations

from heliora_ai.workflows.ai_001_dataset_preprocessing import (
    DEFAULT_OUT,
    RAW_CSV,
    run_pipeline,
)

# %% [markdown]
# ## Run pipeline
# Reads `RAW_CSV`, writes versioned artifacts to `DEFAULT_OUT`.

# %%
result = run_pipeline(raw_csv=RAW_CSV, out_dir=DEFAULT_OUT)

# %%
print(f"version: {result['manifest']['version']}")
print(f"raw: {RAW_CSV}")
print(f"out_dir: {result['out_dir']}")
for name in ("train", "val", "test"):
    split = result[name]
    print(f"{name}: rows={len(split)} cols={len(split.columns)}")

# %% [markdown]
# ## Manifest

# %%
result["manifest"]

# %% [markdown]
# ## Split preview

# %%
result["train"].head()

# %% [markdown]
# ## Dataset report

# %%
result["report"]
