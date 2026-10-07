"""Extract national / age-group / sex rows of key indicators from the SKI 2023 'Dalam Angka' PDF.

Input : <raw>/ski/ski_2023_dalam_angka_id.pdf   (raw = $ML_RAW_DIR or apps/ml/data/raw)
Output: apps/ml/data/ski_2023_indicators.csv     (tidy: one row per indicator x group)

Group rows (age, sex) come from the "menurut Karakteristik" table. The national total comes from the
same table when it has an INDONESIA row, otherwise from the paired "menurut Provinsi" table, which
always ends with the national row for the same population.
Weighted N is deliberately not extracted: its thousand separators are inconsistent in the PDF text.
Run:  uv run --no-project --with pypdf python apps/ml/data/scripts/extract_ski.py
"""
import csv
import json
import os
import re
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent
SKI_RAW = Path(os.environ.get("ML_RAW_DIR", DATA / "raw")) / "ski"
PDF = SKI_RAW / "ski_2023_dalam_angka_id.pdf"
OUT = DATA / "ski_2023_indicators.csv"


def load_pages():
    cache = SKI_RAW / "ski_pages.json"
    if cache.exists():
        return json.load(open(cache, encoding="utf-8"))
    from pypdf import PdfReader

    pages = [(p.extract_text() or "") for p in PdfReader(str(PDF)).pages]
    json.dump(pages, open(cache, "w", encoding="utf-8"))
    return pages


PAGES = load_pages()

# (characteristics table, province table or None, population, unit, measure names)
TABLES = [
    ("7.11", "7.10", ">=15", "percent", ["diabetes_doctor_diagnosis"]),
    ("7.12", None, ">=15", "percent", ["diabetes_blood_glucose_measured"]),
    ("7.13", None, ">=15", "percent",
     ["prediabetes_gdpt_impaired_fasting_glucose", "prediabetes_tgt_impaired_glucose_tolerance"]),
    ("7.35", "7.34", ">=15", "percent", ["hypertension_doctor_diagnosis", "hypertension_measured"]),
    ("7.37", "7.36", ">=18", "percent", ["hypertension_doctor_diagnosis", "hypertension_measured"]),
    ("7.29", "7.28", "all ages", "percent", ["heart_disease_doctor_diagnosis"]),
    ("7.47", "7.46", ">=15", "per_mille", ["stroke_doctor_diagnosis"]),
    ("7.30", None, "not stated in table title", "percent",
     ["total_cholesterol_desirable", "total_cholesterol_borderline", "total_cholesterol_high"]),
    ("11.30", "11.29", ">=10", "percent",
     ["smoker_every_day", "smoker_occasional", "former_smoker", "non_smoker"]),
    ("11.104", "11.103", ">=10", "percent", ["physical_activity_sufficient", "physical_activity_insufficient"]),
]

AGE = re.compile(r"^(<\s*\d+|\d+\s*-\s*\d+|\d+\s*\+)\s+(.*)$")
SEX = re.compile(r"^(Laki-laki|Perempuan)\s+(.*)$")
TOTAL = re.compile(r"^INDONESIA\s+(.*)$", re.I)
NUM = re.compile(r"\d+(?:,\d+)?")


def locate(number):
    major, minor = number.split(".")
    pat = re.compile(r"Tabel\s*" + major + r"\.\s*" + minor + r"\s+(?!\d)")
    for i, t in enumerate(PAGES):
        if i < 40:  # skip the list of tables in the front matter
            continue
        m = pat.search(t)
        if m:
            return i, m.start()
    raise SystemExit(f"table {number} not found")


def segment(number):
    i, start = locate(number)
    text = PAGES[i][start:] + "\n" + (PAGES[i + 1] if i + 1 < len(PAGES) else "")
    nxt = re.search(r"\nTabel\s*\d+\.\s*\d+\s", text[40:])
    if nxt:
        text = text[: nxt.start() + 40]
    header = re.search(r"\|\s*(\d+)", PAGES[i][:300])
    return text, int(header.group(1)) if header else None


def to_float(s):
    return float(s.replace(",", "."))


def parse_numbers(rest, n_measures, label):
    rest = rest.replace("?", "-").replace("–", "-")
    rest = re.sub(r"\b\d{1,3}(?:\.\d{3})+\*?", " ", rest)  # weighted N, dot thousands
    rest = re.sub(r"\b\d{1,3}(?:,\d{3})+\*?", " ", rest)  # weighted N, comma thousands (decimals here have <=2 digits)
    nums = NUM.findall(rest)
    if len(nums) == 3 * n_measures + 1 and re.search(r"\s\d+\*?\s*$", " " + rest):
        nums = nums[:-1]  # trailing small N without separators
    if len(nums) != 3 * n_measures:
        raise SystemExit(f"{label}: expected {3 * n_measures} numbers, got {nums}")
    return [(to_float(nums[k]), to_float(nums[k + 1]), to_float(nums[k + 2])) for k in range(0, len(nums), 3)]


def total_row(text):
    for raw in text.split("\n"):
        m = TOTAL.match(raw.strip())
        if m:
            return m.group(1)
    return None


rows = []


def add(measures, population, unit, dim, cat, rest, table, page, note_extra=""):
    note = note_extra
    if "**" in rest:
        note = (note + "; " if note else "") + "value below 0.05 (report footnote **)"
    elif re.search(r"\d\*\s*$", rest):
        note = (note + "; " if note else "") + "weighted N marked with * in the report"
    for name, (val, lo, hi) in zip(measures, parse_numbers(rest, len(measures), f"Tabel {table} {cat}")):
        rows.append({
            "indicator": name, "population": population, "group_type": dim, "group": cat,
            "value": val, "ci_low": lo, "ci_high": hi, "unit": unit,
            "source_table": f"Tabel {table}", "report_page": page, "note": note,
        })


for number, province, population, unit, measures in TABLES:
    text, page = segment(number)
    block = None
    own_total = total_row(text)
    for raw in text.split("\n"):
        line = raw.strip()
        if line.startswith("Kelompok Umur (Khusus)"):
            block = None
        elif line.startswith("Kelompok Umur"):
            block = "age_group"
        elif line.startswith("Jenis Kelamin"):
            block = "sex"
        elif line.startswith(("Pendidikan", "Pekerjaan", "Tempat Tinggal", "Status ekonomi")):
            block = None
        elif block == "age_group" and (m := AGE.match(line)):
            add(measures, population, unit, "age_group", re.sub(r"\s+", "", m.group(1)), m.group(2), number, page)
        elif block == "sex" and (m := SEX.match(line)):
            add(measures, population, unit, "sex", {"Laki-laki": "male", "Perempuan": "female"}[m.group(1)],
                m.group(2), number, page)
    if own_total:
        add(measures, population, unit, "national", "INDONESIA", own_total, number, page)
    elif province:
        ptext, ppage = segment(province)
        prest = total_row(ptext)
        if not prest:
            raise SystemExit(f"Tabel {province}: INDONESIA row not found")
        add(measures, population, unit, "national", "INDONESIA", prest, province, ppage,
            note_extra=f"national total taken from province table {province}")
    else:
        raise SystemExit(f"Tabel {number}: no national total available")

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)
print(f"wrote {len(rows)} rows to {OUT}")
