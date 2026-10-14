# Health Score

**Status:** REVIEW · **Task:** AI-004 · **Sprint:** S4 · **Owner:** Gilang & Aksal

Dokumen ini adalah sumber kebenaran untuk metodologi, bobot, rentang, dan interpretasi
**Health Score** HELIORA. Metodologi hybrid diratifikasi mengikuti `docs/PRD.md` §11.5.3
(Lifestyle Component + Risk Component + Improvement Component) dan selaras dengan
`docs/Architecture.md` §9.

---

## 1. Tujuan

Health Score memberi ringkasan numerik tunggal atas kondisi kesehatan preventif pengguna
dari tiga sudut: **kebiasaan hidup**, **estimasi risiko kardiometabolik**, dan **konteks
protektif**. Skor dipakai untuk:

- memberi gambaran cepat tren kondisi pengguna pada dashboard;
- menjadi baseline/komponen pada Simulasi Kesehatan Masa Depan dan What-if Simulation;
- menjadi bagian dari penjelasan yang dapat diaudit (bukan kotak hitam).

Health Score **bukan diagnosis** dan **bukan** keluaran langsung dari LLM atau model ML.

---

## 2. Definisi

Health Score adalah skalar pada rentang **0.0 – 100.0**, di mana **100** berarti kombinasi
optimal (kebiasaan sehat, risiko minimal, konteks protektif) dan **0** berarti beban
maksimum pada ketiga komponen. Skor dibulatkan ke **1 desimal** dan **deterministik**:
input yang sama selalu menghasilkan skor yang sama.

---

## 3. Metodologi

Health Score menggunakan pendekatan hybrid `PRD.md` §11.5.3:

```text
Health Score = clamp(
    0.50 * Lifestyle Component
  + 0.35 * Risk Component
  + 0.15 * Improvement Component,
  0.0, 100.0)
```

dengan:

```text
Lifestyle Component   = calculate_lifestyle_score(profile)   # 0 – 100 (AI-005)
Risk Component        = 100 - (diabetes_risk * 35
                             + hypertension_risk * 35
                             + cardiovascular_risk * 30)      # 0 – 100
Improvement Component = skor protektif riwayat keluarga:       # 100 atau 40
                        tanpa riwayat -> 100
                        dengan riwayat -> 40
```

Contoh batas (terkunci pada `test_health_score.py`):

```text
profil optimal + risiko semua 0.0                     -> Health Score = 100.0
profil optimal + risiko semua 1.0                     -> Health Score = 65.0
profil terburuk + risiko semua 1.0 + ada riwayat      -> Health Score = 11.5
```

Implementasi: `apps/api/app/core/risk_engine.py` → `calculate_health_score(profile, risks)`.

---

## 4. Bobot

Bobot resmi yang diratifikasi rework AI-004 (jumlah = 1.00):

| Komponen | Bobot |
| --- | --- |
| Lifestyle Component | 0.50 |
| Risk Component | 0.35 |
| Improvement Component | 0.15 |

Sub-bobot di dalam Risk Component (diwarisi AI-004, jumlah = 1.00):

| Sub-komponen risiko | Bobot | Poin deduksi maksimum |
| --- | --- | --- |
| `diabetes_risk` | 0.35 | 35.0 |
| `hypertension_risk` | 0.35 | 35.0 |
| `cardiovascular_risk` | 0.30 | 30.0 |

Improvement Component memakai skor protektif biner: `100.0` tanpa riwayat keluarga,
`40.0` dengan riwayat keluarga.

Perubahan bobot di masa depan adalah keputusan produk (memerlukan review PM) dan wajib
disertai pembaruan dokumen ini beserta penguncian ulang pada `test_health_score.py`.

---

## 5. Sumber Komponen

| Komponen | Sumber | Rentang |
| --- | --- | --- |
| Lifestyle Component | `calculate_lifestyle_score(profile)` (AI-005) | 0.0 – 100.0 |
| `diabetes_risk` | `estimate_risks()` | 0.0 – 1.0 |
| `hypertension_risk` | `estimate_risks()` | 0.0 – 1.0 |
| `cardiovascular_risk` | `estimate_risks()` | 0.0 – 1.0 |
| Konteks riwayat | `profile.family_history` | boolean |

Health Score tidak menghitung risiko sendiri. Ia adalah **fungsi agregasi** atas keluaran
risk engine, skor lifestyle, dan konteks profil, sehingga bila model/bobot risk berubah,
Health Score ikut berubah pada asesmen berikutnya.

---

## 6. Interpretasi

Band interpretasi kanonik mengikuti BR-SCORE-006 (selalu teks, bukan hanya warna):

| Rentang | Status |
| --- | --- |
| 80 – 100 | Excellent |
| 60 – 79 | Good |
| 40 – 59 | Needs Improvement |
| 0 – 39 | High Attention |

Label bersifat informatif dan preventif. Health Score **tidak boleh** dinyatakan sebagai
"memiliki penyakit X" maupun "probabilitas mutlak"; selalu gunakan istilah *estimasi
risiko* (`Design.md` §2.4). Sesuai BR-SCORE-006, label akhir harus konsisten di seluruh
aplikasi — penyelarasan label web/mobile adalah tindak lanjut di luar scope backend.

---

## 7. Hubungan dengan Lifestyle Score

| Aspek | Health Score | Lifestyle Score |
| --- | --- | --- |
| Basis | Hybrid: 50% Lifestyle + 35% Risiko + 15% konteks riwayat | Murni kebiasaan hidup (BMI, activity, sleep, smoking, stress) |
| Sumber | `calculate_health_score(profile, risks)` | `calculate_lifestyle_score(profile)` (`Architecture.md` §10) |
| Rentang | 0.0 – 100.0 | 0.0 – 100.0 |

Keduanya tetap berbeda: Lifestyle Score merangkum **input gaya hidup** yang dapat
dimodifikasi, sedangkan Health Score menggabungkan input tersebut dengan **luaran
risiko** dan **konteks non-modifiable**. Perbaikan kebiasaan menaikkan komponen
Lifestyle secara langsung dan komponen Risiko setelah diterjemahkan risk engine.

---

## 8. Keputusan & Kesesuaian Spesifikasi

Keputusan resmi (rework AI-004):

- Klausul pengikat metodologi adalah **`PRD.md` §11.5.3** (Lifestyle + Risk +
  Improvement). Formula sebelumnya yang murni berbasis risiko digantikan hybrid ini
  agar selaras dengan PRD dan `Architecture.md` §9;
- faktor ke-5 `BR-SCORE-003` (Family History) diakomodasi sebagai Improvement
  Component, karena empat faktor lifestyle (BMI, aktivitas, tidur, merokok) sudah
  tercakup di dalam komponen Lifestyle;
- bobot bersifat provisional dan wajib divalidasi sebelum release MVP
  (`PRD.md` §3.10, §6.5, §10.5);
- rentang diselaraskan dengan `PRD.md` BR-SCORE-002 dan constraint DB (0.0 – 100.0).

---

## 9. Referensi

- `docs/PRD.md` — §11.5.3, §10.5, §6.5, §3.10, §20.9, BR-SCORE-001/002/003/006, AC-SCORE-01.
- `docs/Architecture.md` §9 (Health Score), §10 (Lifestyle Score).
- `docs/Database.md` — `risk_results.health_score NUMERIC(5,2)`.
- `apps/api/app/core/risk_engine.py` — `calculate_health_score(profile, risks)`.
- `apps/api/tests/test_health_score.py` — pengujian AC-SCORE-01 (11 passed).
