# Lifestyle Score

**Status:** BACKLOG · **Task:** AI-005 · **Sprint:** S4 · **Owner:** Gilang & Aksal

Dokumen ini adalah sumber kebenaran untuk faktor, normalisasi, bobot, rentang, dan interpretasi
**Lifestyle Score** HELIORA. Dokumen ini selaras dengan `docs/PRD.md` (§11.5.2, BR-SCORE-004/005/006)
dan `docs/Architecture.md` §10.

---

## 1. Tujuan

Lifestyle Score memberi ringkasan numerik tunggal atas kualitas kebiasaan hidup pengguna yang
dapat dimodifikasi. Skor dipakai untuk:

- memberi gambaran cepat kualitas gaya hidup pada dashboard;
- menjadi baseline/komponen pada Simulasi Kesehatan Masa Depan dan What-if Simulation;
- menjadi bagian dari penjelasan yang dapat diaudit (bukan kotak hitam).

Lifestyle Score **bukan diagnosis**, **bukan** keluaran langsung dari LLM atau model ML, dan
**tidak boleh** diposisikan sebagai skor medis resmi (`PRD.md` §11.5.2).

---

## 2. Definisi

Lifestyle Score adalah skalar pada rentang **0.0 – 100.0**, di mana **100** berarti kebiasaan
hidup optimal dan **0** berarti beban lifestyle maksimum. Skor dibulatkan ke **1 desimal**
dan **deterministik**: input yang sama selalu menghasilkan skor yang sama.

Sesuai BR-SCORE-004, Lifestyle Score **berbeda dari risk estimation**: ia menggambarkan kualitas
lifestyle (input yang dapat diubah), bukan estimasi risiko (luaran model).

---

## 3. Faktor

Faktor inti (wajib — selalu tersedia pada setiap assessment karena required pada profil kesehatan):

| Faktor | Sumber data | Keterangan |
| --- | --- | --- |
| BMI | `profile.bmi` (dihitung saat profil disimpan) | Indikator antropometrik, bukan diagnosis |
| Physical Activity | `profile.physical_activity_min_per_week` | Durasi aktivitas fisik per minggu |
| Sleep Duration | `profile.sleep_duration_hours` | Rata-rata durasi tidur harian |
| Smoking Status | `profile.smoking_status` | `never` / `former` / `current` |

Faktor opsional:

| Faktor | Sumber data | Keterangan |
| --- | --- | --- |
| Stress Level | `profile.stress_level` (boleh kosong) | Masuk komponen **Other** apabila tersedia (`PRD.md` §11.5.2) |

Rujukan faktor pada PRD: §3.11, §6.6, §10.6, §11.5.2.

---

## 4. Normalisasi

Setiap faktor dinormalisasi ke sub-score **0 – 100** sebelum dibobot. Aturan normalisasi:

**BMI Score** — memakai ulang kategori `get_bmi_category` (`app/schemas/health_profile.py`,
ambang WHO) agar konsisten dengan respons API:

| Kategori | BMI | Sub-score |
| --- | --- | --- |
| Normal | 18.5 – 24.9 | 100 |
| Underweight | < 18.5 | 60 |
| Overweight | 25.0 – 29.9 | 55 |
| Obesity | ≥ 30.0 | 20 |

BMI kosong/tidak valid → fallback 22.0 (Normal), mengikuti pola `estimate_risks()`. Kasus ini
tidak terjadi pada profil tersimpan karena BMI selalu dihitung saat penyimpanan profil.

**Physical Activity Score** — linear terhadap acuan 150 menit/minggu:

```text
Activity Score = min(100, menit_aktivitas / 150 * 100)
```

**Sleep Score** — berjenjang berdasarkan durasi tidur harian:

| Durasi tidur (jam) | Sub-score |
| --- | --- |
| 7.0 – 9.0 | 100 |
| 6.0 – <7.0 atau >9.0 – 10.0 | 70 |
| 5.0 – <6.0 atau >10.0 – 11.0 | 40 |
| < 5.0 atau > 11.0 | 10 |

**Smoking Score**:

| Status | Sub-score |
| --- | --- |
| never | 100 |
| former | 60 |
| current | 0 |

**Other Score (Stress)** — skala implementasi 1 – 10:

| Stress level | Sub-score |
| --- | --- |
| ≤ 3 | 100 |
| 4 – 6 | 60 |
| ≥ 7 | 30 |

**Data kosong**: hanya Stress Level yang boleh kosong. Bila kosong, komponen Other dikeluarkan
dan bobot faktor tersisa **direnormalisasi** (detail matematis pada §5), sehingga tidak ada
poin gratis dari data yang tidak diisi.

---

## 5. Referensi

- `docs/PRD.md` — §3.11, §6.6, §10.6, §11.5.2, BR-SCORE-004/005/006.
- `docs/Architecture.md` §10 (Lifestyle Score Architecture).
- `docs/Database.md` — `risk_results.lifestyle_score NUMERIC(5,2)`.
- `apps/api/app/core/risk_engine.py` — `calculate_lifestyle_score()`.
- `apps/api/app/schemas/health_profile.py` — `get_bmi_category()`.
