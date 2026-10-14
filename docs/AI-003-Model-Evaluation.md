# AI-003 — Model Evaluation

Dokumen kinerja evaluasi Preventive Lifestyle Risk Engine.
Sumber angka: `apps/api/evaluation_report.json` (diregenerasi dari modul
`apps/api/app/ai/evaluation.py` + `model_training.py`).
Status tugas: lihat `docs/TASK.md` §9.3 (AI-003).

> Bukan validasi klinis. Semua label evaluasi bersifat sintetis
> (dibangkitkan dari model epidemiologis yang sama dengan prediktor),
> sehingga metrik hanya menunjukkan konsistensi internal, bukan
> kemampuan diagnosis. HELIORA bukan alat diagnosis.

## 1. Konfigurasi model (model card, Architecture §29)

| Field | Nilai |
|---|---|
| model_name | heliora-risk-engine |
| model_version | synthetic-xgb-10k-v1 |
| training_dataset | synthetic-epi-model-v1 (n=10000, seed=42) |
| feature_version | model_training.FEATURE_NAMES v1 (11 features) |
| algorithm | XGBoost (`binary:logistic`, max_depth=5, lr=0.1, 100 rounds) |
| balance_classes | false (default; weighting dikaji lalu ditolak, §4) |
| eval | n=1000, seed=42, thresholds hasil tune (§2) |

## 2. Threshold operasi (tune max-F1, stabil lintas seed 42/7/123)

| Kondisi | Threshold | Alasan |
|---|---|---|
| Diabetes Melitus | 0.25 | F1 0.52 → 0.58 |
| Hipertensi | 0.20 | F1 0.65 → 0.77 |
| Penyakit Jantung | 0.25 | F1 0.22 → 0.33 |

## 3. Metrik per kondisi (laporan resmi, threshold tune)

| Kondisi | Precision | Recall | F1 | Accuracy | ROC-AUC | Brier | Calib gap |
|---|---:|---:|---:|---:|---:|---:|---:|
| Diabetes Melitus | 0.5497 | 0.6241 | 0.5845 | 0.8820 | 0.9044 | 0.089176 | 0.0211 |
| Hipertensi | 0.6809 | 0.8649 | 0.7619 | 0.8000 | 0.9059 | 0.196726 | 0.1645 |
| Penyakit Jantung | 0.2750 | 0.4231 | 0.3333 | 0.9560 | 0.9308 | 0.024720 | 0.0458 |

`overall_accuracy` (rerata accuracy): **0.8793**.
Baseline beku pra-perubahan (threshold 0.3): overall 0.8863;
DM 0.69/0.42/0.52; HT 0.88/0.52/0.65; CVD 0.26/0.19/0.22.
Ranking (AUC) tidak berubah oleh tuning — hanya titik operasi.

## 4. Analisis error (confusion pada threshold operasi)

| Kondisi | TP | FP | FN | TN | Pola error dominan |
|---|---|---:|---:|---:|---|
| Diabetes Melitus | 83 | 68 | 50 | 799 | 38% positif terlewat (FN) |
| Hipertensi | 320 | 150 | 50 | 480 | Over-flag (FP 150) + 14% positif terlewat |
| Penyakit Jantung | 11 | 29 | 15 | 945 | **58% positif terlewat (15/26)** —_FN dominan |

## 5. Tinjauan class imbalance (keputusan)

Distribusi label evaluasi (n=1000, seed=42):

| Kondisi | Positif | Negatif | Prevalensi | Rasio imbalance |
|---|---:|---:|---:|---:|
| Diabetes Melitus | 133 | 867 | 0.133 | 6.52 |
| Hipertensi | 370 | 630 | 0.370 | 1.70 |
| Penyakit Jantung | 26 | 974 | 0.026 | 37.46 |

Eksperimen weighting (`scale_pos_weight` DM 4.45 / HT 3.66 / CVD 9.25),
evaluasi n=5000 × seed 42/7/123:

- AUC turun: DM −0.022, HT −0.010, CVD −0.028 (gerbang: ≥ baseline−0.02).
- Recall CVD turun 0.398 → 0.267 (gerbang: naik).
- Titik operasi CVD tak stabil (std F1 ±0.068).

**Keputusan: weighting DITOLAK sebagai default** (gagal gerbang R1);
dipertahankan sebagai flag opt-in `balance_classes` untuk riset lanjutan.
Tuning threshold pada model baseline menaikkan F1 semua kondisi tanpa
merusak ranking.

## 6. Reproduksi

```bash
cd apps/api
uv sync --extra dev --extra ml
uv run --extra dev --extra ml python -m app.ai.evaluation  # tulis evaluation_report.json
uv run --extra dev --extra ml pytest tests/test_evaluation.py tests/test_model_training.py -q
```

## 7. Keterbatasan (limitations)

Lihat commit dokumentasi keterbatasan (AI-003.06).
