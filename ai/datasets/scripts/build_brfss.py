"""Build harmonized per-year BRFSS CSVs (2021-2025) from the CDC LLCP XPT files.

Input : <raw>/brfss/LLCP{year}XPT.zip   (raw = $ML_RAW_DIR or ai/datasets/raw)
Output: ai/datasets/brfss_{year}.csv

Column names follow the HELIORA health-profile API where an equivalent exists. A variable that a
given year did not ask is written as an empty column, so the five files concatenate without surprises.
Run:  uv run --no-project --with pandas --with numpy python ai/datasets/scripts/build_brfss.py [year ...]
"""
import os
import sys
import tempfile
import time
import zipfile
from pathlib import Path

import numpy as np
import pandas as pd

DATA = Path(__file__).resolve().parent.parent
RAW = Path(os.environ.get("ML_RAW_DIR", DATA / "raw")) / "brfss"
OUT = DATA
YEARS = [int(y) for y in sys.argv[1:]] or [2021, 2022, 2023, 2024, 2025]

KEEP = [
    "_STATE", "_AGE80", "SEXVAR", "HTM4", "WTKG3", "_BMI5", "_SMOKER3", "SLEPTIM1",
    "EXERANY2", "PAMIN13_", "PAMIN23_", "_PA150R4", "DIABETE4", "BPHIGH6", "TOLDHI3",
    "CVDINFR4", "CVDCRHD4", "CVDSTRK3", "_LLCPWT",
]

COLUMNS = [
    "year", "state_fips", "age", "sex", "height_cm", "weight_kg", "bmi", "smoking_status",
    "sleep_duration_hours", "exercise_any_30d", "physical_activity_min_per_week",
    "pa150_category", "diabetes_code", "diabetes", "bphigh_code", "hypertension",
    "high_cholesterol", "heart_attack", "chd_angina", "stroke", "cardiovascular",
    "survey_weight",
]


def col(df, name):
    return df[name] if name in df.columns else pd.Series(np.nan, index=df.index)


def yes_no(s):
    return s.map({1: 1, 2: 0}).astype("Int8")


def transform(df, year):
    out = pd.DataFrame(index=df.index)
    out["year"] = year
    out["state_fips"] = col(df, "_STATE").astype("Int16")
    out["age"] = col(df, "_AGE80").astype("Int16")
    out["sex"] = col(df, "SEXVAR").map({1: 1, 2: 2}).astype("Int8")  # 1 male, 2 female
    out["height_cm"] = col(df, "HTM4").round(0)  # HTM4 is meters with 2 implied decimals
    out["weight_kg"] = (col(df, "WTKG3") / 100).round(2)
    out["bmi"] = (col(df, "_BMI5") / 100).round(2)
    out["smoking_status"] = col(df, "_SMOKER3").map({1: 2, 2: 2, 3: 1, 4: 0}).astype("Int8")
    sleep = col(df, "SLEPTIM1")
    out["sleep_duration_hours"] = sleep.where(sleep.between(1, 24))
    exer = yes_no(col(df, "EXERANY2"))
    out["exercise_any_30d"] = exer

    # Weekly activity minutes exist only in the 2023 file (BRFSS exercise module).
    if "PAMIN13_" in df.columns:
        p1, p2 = df["PAMIN13_"].copy(), df["PAMIN23_"].copy()
        for p in (p1, p2):  # SAS stores zero as a ~5e-79 denormal in these fields
            p[p.notna() & (p < 1e-6)] = 0
        total = p1.fillna(0) + p2.fillna(0)
        all_missing = p1.isna() & p2.isna()
        no_exercise = exer.eq(0).fillna(False).to_numpy()
        total[all_missing & ~no_exercise] = np.nan
        total[all_missing & no_exercise] = 0
        total[total > 10080] = np.nan  # more than the minutes in a week
        out["physical_activity_min_per_week"] = total.round(0)
    else:
        out["physical_activity_min_per_week"] = np.nan
    out["pa150_category"] = col(df, "_PA150R4").map({1: 1, 2: 2, 3: 3}).astype("Int8")

    out["diabetes_code"] = col(df, "DIABETE4").map({1: 1, 2: 2, 3: 3, 4: 4}).astype("Int8")
    out["diabetes"] = col(df, "DIABETE4").map({1: 1, 2: 0, 3: 0, 4: 0}).astype("Int8")
    out["bphigh_code"] = col(df, "BPHIGH6").map({1: 1, 2: 2, 3: 3, 4: 4}).astype("Int8")
    out["hypertension"] = col(df, "BPHIGH6").map({1: 1, 2: 0, 3: 0, 4: 0}).astype("Int8")
    out["high_cholesterol"] = yes_no(col(df, "TOLDHI3"))
    mi = yes_no(col(df, "CVDINFR4"))
    chd = yes_no(col(df, "CVDCRHD4"))
    stroke = yes_no(col(df, "CVDSTRK3"))
    out["heart_attack"], out["chd_angina"], out["stroke"] = mi, chd, stroke
    parts = pd.concat([mi, chd, stroke], axis=1).astype("float")
    cvd = pd.Series(np.nan, index=df.index)
    cvd[(parts == 0).all(axis=1)] = 0
    cvd[(parts == 1).any(axis=1)] = 1
    out["cardiovascular"] = cvd.astype("Int8")
    out["survey_weight"] = col(df, "_LLCPWT").round(4)
    return out[COLUMNS]


def build(year):
    t0 = time.time()
    with zipfile.ZipFile(RAW / f"LLCP{year}XPT.zip") as z, tempfile.TemporaryDirectory() as tmp:
        member = z.namelist()[0]
        z.extract(member, tmp)  # ~1 GB per year; removed with the temp dir
        pieces = []
        for chunk in pd.read_sas(os.path.join(tmp, member), format="xport", chunksize=50000, encoding="latin-1"):
            pieces.append(chunk[[c for c in KEEP if c in chunk.columns]])
        df = pd.concat(pieces, ignore_index=True)
    out = transform(df, year)
    path = OUT / f"brfss_{year}.csv"
    out.to_csv(path, index=False, float_format="%.10g")
    # Weighted percentages for comparison with the CDC codebook (non-blank denominators).
    w = df["_LLCPWT"]

    def wpct(series, code):
        ok = series.notna()
        return round(100 * w[ok & (series == code)].sum() / w[ok].sum(), 2)

    checks = {"_SMOKER3=4 (never)": wpct(df["_SMOKER3"], 4), "EXERANY2=1": wpct(df["EXERANY2"], 1),
              "CVDINFR4=1": wpct(df["CVDINFR4"], 1)}
    if "BPHIGH6" in df.columns:
        checks["BPHIGH6=1"] = wpct(df["BPHIGH6"], 1)
    print(f"{year}: rows={len(out):,} size={path.stat().st_size / 1e6:.1f}MB "
          f"time={time.time() - t0:.0f}s weighted%={checks}", flush=True)


if __name__ == "__main__":
    for y in YEARS:
        build(y)
    print("DONE", flush=True)
