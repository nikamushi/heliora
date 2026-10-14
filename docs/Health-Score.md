# Health Score

**Status:** REVIEW · **Task:** AI-004 · **Sprint:** S4 · **Owner:** Gilang & Aksal

Dokumen ini adalah sumber kebenaran untuk metodologi, bobot, rentang, dan interpretasi
**Health Score** HELIORA. Dokumen ini meratifikasi keputusan implementasi dan mencatat
deviasinya terhadap `Architecture.md` §9.2.

---

## 1. Tujuan

Health Score memberi ringkasan numerik tunggal atas kondisi kesehatan preventif pengguna
berdasarkan estimasi risiko kardiometabolik. Skor dipakai untuk:

- memberi gambaran cepat tren kondisi pengguna pada dashboard;
- menjadi baseline/komponen pada Simulasi Kesehatan Masa Depan;
- menjadi bagian dari penjelasan yang dapat diaudit (bukan kotak hitam).

Health Score **bukan diagnosis** dan **bukan** keluaran langsung dari LLM atau model ML.

---

## 2. Definisi

Health Score adalah skalar pada rentang **0.0 – 100.0**, di mana **100** berarti kondisi
protektif optimal dan **0** berarti beban risiko maksimum. Skor dibulatkan ke **1 desimal**
dan **deterministik**: input yang sama selalu menghasilkan skor yang sama.

---

## 3. Metodologi

Health Score diturunkan dari **tiga estimasi risiko** hasil rule-based risk engine
(`PreventiveLifestyleRiskEngine.estimate_risks`), menggunakan model **deduksi**:

```text
Health Score = clamp(100 - Deduction, 0.0, 100.0)

Deduction =
      diabetes_risk       * w_diabetes
    + hypertension_risk   * w_hypertension
    + cardiovascular_risk * w_cardiovascular
```

Setiap nilai risiko berada pada rentang 0.0 – 1.0 (probabilitas ter-klamp). Jumlah bobot
= 1.00, sehingga deduksi maksimum adalah 100.0 dan skor minimum yang mungkin adalah 0.0.

```text
risiko semua 0.0  ->  Health Score = 100.0
risiko semua 1.0  ->  Health Score = 0.0
```

Implementasi: `apps/api/app/core/risk_engine.py` → `calculate_health_score()`.

---

## 4. Bobot

Nilai bobot final ditetapkan pada AI-004.02. Struktur formula memakai tiga bobot
(`w_diabetes`, `w_hypertension`, `w_cardiovascular`) yang berjumlah 1.00.

---

## 5. Sumber Risiko

| Komponen | Sumber | Rentang |
| --- | --- | --- |
| `diabetes_risk` | `estimate_risks()` | 0.0 – 1.0 |
| `hypertension_risk` | `estimate_risks()` | 0.0 – 1.0 |
| `cardiovascular_risk` | `estimate_risks()` | 0.0 – 1.0 |

Health Score tidak menghitung risiko. Ia adalah **fungsi agregasi** atas keluaran risk
engine, sehingga bila model/bobot risk berubah, Health Score ikut berubah pada asesmen
berikutnya.

---

## 6. Interpretasi

Band interpretasi yang dipakai UI (selalu teks, bukan hanya warna):

| Rentang | Label |
| --- | --- |
| ≥ 80.0 | Kondisi Baik |
| 60.0 – 79.9 | Cukup Sehat |
| < 60.0 | Perlu Perhatian |

Label bersifat informatif dan preventif. Health Score **tidak boleh** dinyatakan sebagai
"memiliki penyakit X" maupun "probabilitas mutlak"; selalu gunakan istilah *estimasi
risiko* (`Design.md` §2.4).

---

## 7. Hubungan dengan Lifestyle Score

| Aspek | Health Score | Lifestyle Score |
| --- | --- | --- |
| Basis | Estimasi risiko kardiometabolik | Kebiasaan hidup (activity, sleep, smoking, stress) |
| Sumber | `calculate_health_score()` | `calculate_lifestyle_score()` (`Architecture.md` §10) |
| Rentang | 0.0 – 100.0 | 0.0 – 100.0 |

Keduanya sengaja dipisah: Health Score merangkum **luaran risiko**, Lifestyle Score
merangkum **input gaya hidup** yang dapat dimodifikasi. Perubahan kebiasaan belum tentu
langsung menaikkan Health Score sebelum diterjemahkan risk engine.

---

## 8. Keputusan & Deviasi dari Architecture §9.2

`Architecture.md` §9.2 menuliskan Health Score secara konseptual sebagai weighted scoring
berbasis **faktor lifestyle** (BMI + Physical Activity + Sleep + Smoking + Other), serupa
dengan pola Lifestyle Score. Implementasi yang dirilis justru berbasis **estimasi risiko**.

Keputusan resmi (AI-004):

- Health Score **dipertahankan** berbasis risiko agar tetap berbeda dan tidak tumpang
  tindih dengan Lifestyle Score (§7);
- bobot final ditetapkan dan didokumentasikan di dokumen ini, memenuhi syarat
  "bobot final harus ditentukan sebelum implementasi" pada `Architecture.md` §9.2;
- rentang diselaraskan dengan `PRD.md` BR-SCORE-002 dan constraint DB (0.0 – 100.0).

---

## 9. Referensi

- `docs/PRD.md` — BR-SCORE-001/002/003, §11.5.3, AC-SCORE-01.
- `docs/Architecture.md` §9 (Health Score), §10 (Lifestyle Score).
- `docs/Database.md` — `risk_results.health_score NUMERIC(5,2)`.
- `apps/api/app/core/risk_engine.py` — `calculate_health_score()`.
- `apps/api/tests/test_health_score.py` — pengujian AC-SCORE-01.
