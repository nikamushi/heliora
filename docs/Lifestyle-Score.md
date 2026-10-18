# Lifestyle Score

**Status:** REVIEW · **Task:** AI-005 · **Sprint:** S4 · **Owner:** Gilang & Aksal

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
dan bobot faktor tersisa **direnormalisasi** (detail matematis pada §6), sehingga tidak ada
poin gratis dari data yang tidak diisi.

---

## 5. Bobot

Bobot resmi yang diratifikasi AI-005.02, mengadopsi contoh `PRD.md` §11.5.2 (jumlah = 1.00):

| Komponen | Bobot | Sub-score maksimum |
| --- | --- | --- |
| BMI Score (`w_bmi`) | 0.30 | 100 |
| Physical Activity Score (`w_activity`) | 0.25 | 100 |
| Sleep Score (`w_sleep`) | 0.20 | 100 |
| Smoking Score (`w_smoking`) | 0.15 | 100 |
| Other Score / Stress (`w_other`) | 0.10 | 100 |

Perubahan bobot di masa depan adalah keputusan produk (memerlukan review PM) dan wajib
disertai pembaruan dokumen ini beserta penguncian ulang pada `test_lifestyle_score.py`.

---

## 6. Formula

Bila Stress Level tersedia:

```text
Lifestyle Score = clamp(
    BMI Score      * 0.30
  + Activity Score * 0.25
  + Sleep Score    * 0.20
  + Smoking Score  * 0.15
  + Other Score    * 0.10,
  0.0, 100.0)
```

Bila Stress Level kosong, komponen Other dikeluarkan dan bobot tersisa direnormalisasi
dengan pembagi 0.90:

```text
Lifestyle Score = clamp(
    (BMI Score      * 0.30
   + Activity Score * 0.25
   + Sleep Score    * 0.20
   + Smoking Score  * 0.15) / 0.90,
  0.0, 100.0)
```

```text
semua sub-score 100 (+ stress tersedia) -> Lifestyle Score = 100.0
semua sub-score 0                       -> Lifestyle Score = 0.0
```

Implementasi: `apps/api/app/core/risk_engine/scoring.py` → `calculate_lifestyle_score()`.

---

## 7. Interpretasi

Band interpretasi kanonik mengikuti BR-SCORE-006 (selalu teks, bukan hanya warna):

| Rentang | Status |
| --- | --- |
| 80 – 100 | Excellent |
| 60 – 79 | Good |
| 40 – 59 | Needs Improvement |
| 0 – 39 | High Attention |

Label bersifat informatif dan preventif. Lifestyle Score **tidak boleh** dinyatakan sebagai
"memiliki penyakit X" maupun "probabilitas mutlak"; selalu gunakan istilah *estimasi
risiko* untuk luaran risk engine (`Design.md` §2.4). Sesuai BR-SCORE-006, label akhir harus
konsisten di seluruh aplikasi — penyelarasan label web/mobile adalah tindak lanjut di luar
AI-005.

---

## 8. Hubungan dengan Health Score

| Aspek | Health Score | Lifestyle Score |
| --- | --- | --- |
| Basis | Estimasi risiko kardiometabolik | Kebiasaan hidup (BMI, activity, sleep, smoking, stress) |
| Sumber | `calculate_health_score()` (`docs/Health-Score.md`) | `calculate_lifestyle_score()` |
| Rentang | 0.0 – 100.0 | 0.0 – 100.0 |

Keduanya sengaja dipisah: Health Score merangkum **luaran risiko**, Lifestyle Score
merangkum **input gaya hidup** yang dapat dimodifikasi. Perubahan kebiasaan belum tentu
langsung menaikkan Health Score sebelum diterjemahkan risk engine.

---

## 9. Keputusan & Temuan

Keputusan resmi (AI-005):

- Bobot contoh `PRD.md` §11.5.2 (BMI 30 / Activity 25 / Sleep 20 / Smoking 15 / Other 10)
  diadopsi sebagai bobot resmi, memenuhi syarat "bobot final harus ditetapkan sebelum
  implementasi model dan didokumentasikan";
- Stress Level ditempatkan pada komponen Other dan bersifat opsional dengan renormalisasi
  bobot, sehingga tidak ada poin gratis dari data yang tidak diisi;
- skala implementasi Stress Level dipertahankan **1 – 10** (schema API, CHECK database,
  dan band engine sudah 1 – 10);
- tabel bobot BR-SCORE-003 (versi Health Score dengan Family History 10%) **tidak**
  ditiru, karena Health Score resmi berbasis risiko (AI-004).

Temuan untuk keputusan PM (tidak diubah pada AI-005 agar tidak breaking):

- `PRD.md` menulis skala stress 1 – 5 (§11.5.1, §11.2.5) sementara schema API, CHECK
  database, dan engine memakai 1 – 10;
- ambang kategori BMI memakai WHO umum (18.5 / 25 / 30); ambang Asia-Pasifik/Kemenkes
  (23 / 25) belum dipertimbangkan.

---

## 10. Referensi

- `docs/PRD.md` — §3.11, §6.6, §10.6, §11.5.2, BR-SCORE-004/005/006.
- `docs/Architecture.md` §10 (Lifestyle Score Architecture).
- `docs/Database.md` — `risk_results.lifestyle_score NUMERIC(5,2)`.
- `apps/api/app/core/risk_engine/scoring.py` — `calculate_lifestyle_score()`.
- `apps/api/app/schemas/health_profile.py` — `get_bmi_category()`.
