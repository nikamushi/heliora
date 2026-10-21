"""Build one adult-level NHANES 2021-2023 CSV from the CDC XPT component files.

Input : <raw>/nhanes/{DEMO_L,BMX_L,BPXO_L,GLU_L,GHB_L,TCHOL_L,HDL_L,SMQ_L,SLQ_L,PAQ_L,DIQ_L,BPQ_L,MCQ_L}.xpt
        (raw = $ML_RAW_DIR or ai/datasets/raw)
Output: ai/datasets/nhanes_2021_2023.csv

Column names mirror the BRFSS CSVs (and the HELIORA health-profile API) where an equivalent exists.
Measured values (blood pressure, glucose, HbA1c, cholesterol) are kept as numbers; no clinical
cut-off is applied here.
Run:  uv run --no-project --with pandas --with numpy python ai/datasets/scripts/build_nhanes.py
"""
import os
from pathlib import Path

import numpy as np
import pandas as pd

DATA = Path(__file__).resolve().parent.parent
SRC = Path(os.environ.get("ML_RAW_DIR", DATA / "raw")) / "nhanes"
OUT = DATA / "nhanes_2021_2023.csv"


def rd(name):
    df = pd.read_sas(SRC / f"{name}.xpt", format="xport", encoding="utf-8")
    for c in df.select_dtypes("float").columns:  # SAS stores a numeric zero as a ~5e-79 denormal
        df[c] = df[c].mask((df[c] > 0) & (df[c] < 1e-6), 0.0)
    return df


def yes_no(s):
    return s.map({1: 1, 2: 0}).astype("Int8")


demo = rd("DEMO_L")
df = demo.loc[demo["RIDAGEYR"] >= 18, ["SEQN", "RIDAGEYR", "RIAGENDR", "WTINT2YR", "WTMEC2YR", "SDMVPSU", "SDMVSTRA"]].copy()
for name, cols in {
    "BMX_L": ["BMXHT", "BMXWT", "BMXBMI", "BMXWAIST"],
    "BPXO_L": ["BPXOSY1", "BPXOSY2", "BPXOSY3", "BPXODI1", "BPXODI2", "BPXODI3"],
    "GLU_L": ["LBXGLU", "WTSAF2YR"],
    "GHB_L": ["LBXGH"],
    "TCHOL_L": ["LBXTC"],
    "HDL_L": ["LBDHDD"],
    "SMQ_L": ["SMQ020", "SMQ040"],
    "SLQ_L": ["SLD012", "SLD013"],
    "PAQ_L": ["PAD790Q", "PAD790U", "PAD800", "PAD810Q", "PAD810U", "PAD820", "PAD680"],
    "DIQ_L": ["DIQ010"],
    "BPQ_L": ["BPQ020", "BPQ080", "BPQ150"],
    "MCQ_L": ["MCQ160C", "MCQ160D", "MCQ160E", "MCQ160F"],
}.items():
    df = df.merge(rd(name)[["SEQN"] + cols], on="SEQN", how="left")

out = pd.DataFrame({"seqn": df["SEQN"].astype("Int32")})
out["age"] = df["RIDAGEYR"].astype("Int16")
out["sex"] = df["RIAGENDR"].map({1: 1, 2: 2}).astype("Int8")  # 1 male, 2 female
out["height_cm"] = df["BMXHT"].round(1)
out["weight_kg"] = df["BMXWT"].round(1)
out["bmi"] = df["BMXBMI"].round(1)
out["waist_cm"] = df["BMXWAIST"].round(1)

sbp = df[["BPXOSY1", "BPXOSY2", "BPXOSY3"]]
dbp = df[["BPXODI1", "BPXODI2", "BPXODI3"]]
out["systolic_bp_mean"] = sbp.mean(axis=1).round(1)
out["diastolic_bp_mean"] = dbp.mean(axis=1).round(1)
out["bp_readings"] = sbp.notna().sum(axis=1).astype("Int8")
# Fasting glucose is valid only for the fasting subsample (WTSAF2YR > 0). Morning-session
# participants who did not fast long enough still carry a LBXGLU value but a zero weight.
out["fasting_glucose_mg_dl"] = df["LBXGLU"].where(df["WTSAF2YR"] > 0)
out["hba1c_pct"] = df["LBXGH"]
out["total_cholesterol_mg_dl"] = df["LBXTC"]
out["hdl_mg_dl"] = df["LBDHDD"]

# smoking_status: 0 never, 1 former, 2 current (same coding as the BRFSS CSVs)
ever, now = df["SMQ020"], df["SMQ040"]
smoke = pd.Series(np.nan, index=df.index)
smoke[ever == 2] = 0
smoke[(ever == 1) & (now == 3)] = 1
smoke[(ever == 1) & now.isin([1, 2])] = 2
out["smoking_status"] = smoke.astype("Int8")

# sleep: weighted mean of weekday (5 days) and weekend (2 days) hours
wk, we = df["SLD012"], df["SLD013"]
sleep = (5 * wk + 2 * we) / 7
sleep = sleep.fillna(wk).fillna(we)
out["sleep_duration_hours"] = sleep.round(2)

# leisure-time activity minutes per week = quantity x unit factor x minutes per bout, moderate + vigorous
factor = {"D": 7.0, "W": 1.0, "M": 12 / 52, "Y": 1 / 52}


def weekly(q, u, minutes, q_max, m_max):
    q = q.where(q <= q_max)
    m = minutes.where(minutes <= m_max)
    result = q * u.str.strip().map(factor) * m
    result[q == 0] = 0  # reported zero bouts: no minutes, whatever the unit column says
    return result


mod = weekly(df["PAD790Q"], df["PAD790U"], df["PAD800"], 200, 720)
vig = weekly(df["PAD810Q"], df["PAD810U"], df["PAD820"], 200, 900)
total = mod.fillna(0) + vig.fillna(0)
total[mod.isna() & vig.isna()] = np.nan
total[total > 10080] = np.nan
out["physical_activity_min_per_week"] = total.round(0)
out["sedentary_min_per_day"] = df["PAD680"].where(df["PAD680"] <= 1380)

out["diabetes_code"] = df["DIQ010"].map({1: 1, 2: 2, 3: 3}).astype("Int8")  # 1 yes, 2 no, 3 borderline
out["diabetes"] = df["DIQ010"].map({1: 1, 2: 0, 3: 0}).astype("Int8")
out["hypertension"] = yes_no(df["BPQ020"])
out["bp_medication"] = yes_no(df["BPQ150"])
out["high_cholesterol"] = yes_no(df["BPQ080"])
mi, stroke = yes_no(df["MCQ160E"]), yes_no(df["MCQ160F"])
chd = pd.concat([yes_no(df["MCQ160C"]), yes_no(df["MCQ160D"])], axis=1).astype("float")
chd_angina = pd.Series(np.nan, index=df.index)
chd_angina[(chd == 0).all(axis=1)] = 0
chd_angina[(chd == 1).any(axis=1)] = 1
out["heart_attack"], out["stroke"], out["chd_angina"] = mi, stroke, chd_angina.astype("Int8")
parts = pd.concat([mi, out["chd_angina"], stroke], axis=1).astype("float")
cvd = pd.Series(np.nan, index=df.index)
cvd[(parts == 0).all(axis=1)] = 0
cvd[(parts == 1).any(axis=1)] = 1
out["cardiovascular"] = cvd.astype("Int8")

out["weight_interview"] = df["WTINT2YR"].round(2)
out["weight_exam"] = df["WTMEC2YR"].round(2)
out["weight_fasting"] = df["WTSAF2YR"].round(2)
out["psu"] = df["SDMVPSU"].astype("Int8")
out["stratum"] = df["SDMVSTRA"].astype("Int16")

out.to_csv(OUT, index=False, float_format="%.10g")
print(f"rows={len(out):,} cols={out.shape[1]} size={OUT.stat().st_size / 1e6:.2f}MB")
print("non-null:", {c: int(out[c].notna().sum()) for c in out.columns[1:]})


def wpct(flag, w):
    ok = out[flag].notna() & out[w].notna()
    return round(100 * (out.loc[ok, w] * out.loc[ok, flag]).sum() / out.loc[ok, w].sum(), 1)


print("weighted % (adults):", {
    "diabetes told": wpct("diabetes", "weight_interview"),
    "hypertension told": wpct("hypertension", "weight_interview"),
    "high chol told": wpct("high_cholesterol", "weight_interview"),
    "cardiovascular": wpct("cardiovascular", "weight_interview"),
})
