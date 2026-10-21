# Simulation — Future Health (SIM-001 · SIM-002)

**Status:** REVIEW · **Task:** SIM-001 · **Sprint:** S5 · **Owner:** Gilang & Aksal

Dokumen ini adalah sumber kebenaran untuk metodologi, asumsi, dan interpretasi
**Future Health Simulation** HELIORA. Metodologi didokumentasikan **as-implemented**
mengikuti `docs/PRD.md` §14.11 (BR-SIM-001–004, AC-SIM-01/02) dan
`docs/Architecture.md` §12.2, §12.4, §19.

Cakupan dokumen ini adalah **SIM-001 (Simulation Engine, §1–§8)** dan
**SIM-002 (Future Simulation API, §9)**. What-if engine (SIM-003,
`docs/What-If.md`) dan what-if API (SIM-004) mengikuti prinsip yang sama
tetapi didokumentasikan terpisah.

---

## 1. Tujuan

Future Health Simulation membantu pengguna mengeksplorasi **perubahan output model
berdasarkan skenario gaya hidup** pada horizon waktu 30 / 90 / 180 hari ke depan.
Simulasi dipakai untuk:

- menampilkan proyeksi trajektori risiko tiga kondisi kardiometabolik
  (diabetes, hipertensi, kardiovaskular);
- membandingkan keadaan baseline dengan keadaan terproyeksi;
- memberi konteks skenario terarah sebelum pengguna mengambil keputusan gaya hidup.

Future Health Simulation **bukan clinical forecast**, **bukan prognosis medis**,
dan **bukan** keluaran model ML.

---

## 2. Definisi

- **Baseline state** adalah estimasi risiko dan skor yang dihitung dari profil
  kesehatan pengguna saat ini, memakai risk engine yang sama dengan assessment
  (`estimate_risks`, `calculate_health_score`, `calculate_lifestyle_score`).
- **Projected state** adalah estimasi risiko dan skor setelah trajektori waktu
  diterapkan pada horizon terpilih, dengan asumsi kebiasaan dipertahankan stabil.
- **Horizon** (`horizon_days`) adalah parameter skenario tampilan
  (**30**, **90**, atau **180** hari), bukan jaminan bahwa outcome medis terjadi
  pada hari tersebut (PRD BR-SIM-002).
- Hasil selalu diberi label sebagai proyeksi/estimasi model
  (`is_model_estimated: true` + disclaimer), tidak pernah sebagai kepastian.

Implementasi: `apps/api/app/core/risk_engine/simulation.py`
`PreventiveLifestyleRiskEngine.simulate_future_trajectory`
(valid values: 30, 90, 180 — selain itu `SimulationHorizon` menolak pada
lapisan skema).

---

## 3. Metodologi (as-implemented)

Urutan komputasi untuk horizon `d` hari:

### 3.1 Baseline

```text
base_risks     = estimate_risks(profile)
base_health    = calculate_health_score(profile, base_risks)
base_lifestyle = calculate_lifestyle_score(profile)
```

### 3.2 Faktor waktu (time factor)

Skala horizon non-linear terhadap horizon maksimum 180 hari:

```text
time_factor = (d / 180.0) ** 0.65
```

Nilai: `d=30 → ±0.32`, `d=90 → ±0.63`, `d=180 → 1.00` (pendekatan).

### 3.3 Lifestyle alignment (per faktor)

Kebiasaan saat ini dipetakan ke skor alignment:

| Faktor | Kondisi | Alignment |
|---|---|---|
| Aktivitas (mnt/minggu) | ≥ 150 / < 60 / selainnya | +0.4 / −0.4 / −0.1 |
| Tidur (jam/malam) | 7.0–8.5 / < 6.0 / selainnya | +0.3 / −0.35 / 0.0 |
| Merokok | never / current / selainnya | +0.4 / −0.6 / +0.1 |
| BMI | < 24.0 / ≥ 28.0 / selainnya | +0.2 / −0.4 / −0.1 |
| Stres (1–10) | ≤ 3.0 / ≥ 7.0 / selainnya | +0.2 / −0.3 / 0.0 |

Nilai default bila data kosong: BMI = 22.0, stres = 5.0.

### 3.4 Momentum per kondisi

```text
dm_momentum  = bmi×0.45 + aktivitas×0.40 + tidur×0.15
ht_momentum  = tidur×0.40 + stres×0.35 + aktivitas×0.25
cvd_momentum = merokok×0.50 + aktivitas×0.30 + bmi×0.20
```

Momentum positif berarti kebiasaan protektif (menurunkan proyeksi risiko);
momentum negatif berarti paparan berlanjut (menaikkan proyeksi risiko).

### 3.5 Proyeksi probabilitas

Proyeksi dilakukan di ruang logit dengan faktor skala 0.40, lalu dijepit:

```text
base_lo  = log(p / (1 − p))
delta_lo = momentum × time_factor × 0.40
new_p    = sigmoid(base_lo − delta_lo)
proj_p   = clamp(new_p, 0.01, 0.95)  → dibulatkan 4 desimal
```

### 3.6 Skor terproyeksi

```text
proj_risks = {diabetes: proj_dm, hipertensi: proj_ht, kardiovaskular: proj_cvd}
proj_health     = calculate_health_score(profile, proj_risks)
proj_lifestyle  = base_lifestyle   # dibekukan — lihat §7 K4
```

`proj_health` memakai formula hybrid AI-004
(`0.50·Lifestyle + 0.35·Risk + 0.15·Improvement`).
Karena `proj_lifestyle = base_lifestyle`, pergerakan `proj_health` berasal dari
komponen risiko: **Δhealth ≈ 0.35 × Δrisk-component**.

### 3.7 Label, tren, dan deskripsi

Per kondisi, probabilitas terproyeksi dipetakan ke:

- **risk level**: `high` (≥ 0.50), `moderate` (0.25–0.50), `low` (< 0.25)
  (band yang sama dengan `_to_risk_level`);
- **risk label**: Lower / Moderate / Higher;
- **trend**: `decreasing` (Δ < −0.005), `increasing` (Δ > +0.005),
  selainnya `stable`;
- **description**: kalimat naratif arah perubahan dalam persen poin
  (ambang ±0.5%).

---

## 4. Horizon

MVP memakai tiga horizon produk (PRD BR-SIM-002):

```text
30 Days
90 Days
180 Days
```

Proyeksi monotonik terhadap horizon untuk profil tetap: horizon lebih panjang
memberi `time_factor` lebih besar sehingga deviasi dari baseline lebih besar
pada arah yang sama.

---

## 5. Asumsi

Empat asumsi dikembalikan di setiap respons (`assumptions`):

1. Rutinitas aktivitas fisik dipertahankan stabil selama horizon.
2. Pola durasi tidur berjalan konsisten.
3. Tidak ada intervensi medis/farmakologis baru.
4. Proyeksi berbasis simulasi tren model kardiometabolik, bukan diagnosis klinis.

Asumsi tambahan yang terdokumentasi di sini:

- BMI default 22.0 dan stres default 5.0 bila data kosong (§3.3).
- `projected_lifestyle_score` dibekukan pada nilai baseline (§3.6, §7 K4).
- Simulasi **tidak memutasi** profil, database, maupun state persisten apa pun
  (PRD BR-SIM-007; diverifikasi test `test_future_simulation_does_not_mutate_profile`).

---

## 6. Interpretasi dan Safety

- Output wajib dibaca sebagai **simulated / model-estimated change**, dilarang
  disajikan sebagai future clinical outcome atau certainty statement
  (PRD BR-SIM-004; `Architecture.md` §12.4).
- Setiap respons memuat `is_model_estimated: true` dan disclaimer:
  *"Simulasi merupakan proyeksi skenario model gaya hidup terarah, bukan
  prognosis medis atau jaminan luaran klinis."*
- Terminologi yang dipakai: Estimated, Projected, Simulated, Scenario.
  Dilarang: *"You will definitely…"*, *"You will get…"*, *"You have…"*.

---

## 7. Keputusan dan Kesesuaian Spesifikasi

### K1 — Prinsip: re-inference pada Risk Engine yang sama

Implementasi memakai **re-inference pada risk engine yang sama** dengan
assessment (PRD BR-SIM-003: *"Re-run Risk Engine"*; Architecture §19).
Istilah *"ML re-inference"* pada `Architecture.md` §12.1, ADR-006, dan PRD
dipertahankan sebagai **kosakata spesifikasi**, dengan makna operasional yang
didefinisikan PRD: *"menggunakan Risk Engine yang sama dengan baseline
estimation dan melakukan scenario-based re-inference"* — tanpa model ML
terlatih yang terpisah. `Architecture.md` §12.1 dilengkapi satu kalimat
klarifikasi yang merujuk definisi tersebut.

### K2 — Judul ADR-006 diselaraskan (editorial)

Daftar ADR (`Architecture.md` §42) menulis *"ADR-006 — Simulation Strategy"*,
tetapi section (`Architecture.md` §43) menulis *"ADR-006 — ML Re-inference"*.
Judul section diselaraskan ke *"Simulation Strategy"* dan dilengkapi *Revision
note* yang merujuk definisi PRD. Isi Decision dan Reason ADR-006 tidak diubah.

### K3 — Rujukan docstring diperbaiki

Docstring `simulate_future_trajectory` merujuk *"Architecture §8, §14"* yang
bukan bagian simulasi. Diperbaiki menjadi §12 (Simulation Architecture) dan
§19 (Future Health Simulation Data Flow).

### K4 — `projected_lifestyle_score` dibekukan (asumsi terdokumentasi)

`proj_lifestyle = base_lifestyle` dipertahankan sebagai **asumsi eksplisit**
(kebiasaan dipertahankan stabil, §5), bukan perubahan perilaku.
Konsekuensi yang dicatat: bobot Lifestyle 0.50 pada formula hybrid AI-004
bersifat inert pada future simulation. Apakah lifestyle ikut diproyeksikan
adalah keputusan terbuka **di luar SIM-001**.

### Kesesuaian kotak SIM-001

| Kotak `docs/TASK.md` | Bukti |
|---|---|
| Define simulation methodology | Dokumen ini (§3) |
| Define assumptions | Dokumen ini (§5) + `assumptions` pada respons |
| Define baseline state | Dokumen ini (§3.1) + `base_*` pada respons |
| Define projected state | Dokumen ini (§3.5–3.7) + `projected_*` + `risk_trajectories` |
| Integrate risk engine | Reuse engine assessment (§3.1, §3.6; K1) |
| Generate simulation result | Skema `FutureSimulationResponse`, endpoint `POST /api/v1/simulation/future` |
| Validate result | `apps/api/tests/test_simulation.py` (13 test) |

### Kesesuaian Acceptance Criteria

| AC | Bukti |
|---|---|
| Simulation menghasilkan projected result | `projected_health_score`, `projected_*` per kondisi |
| Baseline dan projected dapat dibandingkan | pasangan `baseline_*`/`projected_*` + `delta_percentage` + `trend` |
| Output disebut projection/estimation | `is_model_estimated: true` + disclaimer (§6) |

---

## 8. Batasan (di luar SIM-001)

- Konstanta metodologi (§3) masih berupa literal di kode; ekstraksi ke
  konstanta modul adalah pekerjaan lanjutan, bukan bagian definisi ini.
- Helper `to_level`/`to_label` terduplikasi dengan what-if engine (SIM-003);
  dedup ditunda agar SIM-001 tetap lokal.
- Rumusan *"Modified Input"* / *"Generate Modified Input"* pada
  `Architecture.md` §12.2 dan §19 **dibiarkan**: untuk future simulation ia
  dibaca sebagai input skenario yang disesuaikan asumsi + horizon, sejalan
  dengan langkah *"Modify Lifestyle Parameters"* pada BR-SIM-003.
- Pembukuan SIM-003/SIM-004, tabel `simulations`,
  dan konsistensi kontrak AI terhadap konsumen non-SIM
  (`assessment_service`, `shap_explainer`, `evaluation`) berada di luar
  cakupan dokumen ini.

---

## 9. SIM-002 — Future Simulation API (kontrak backend)

Seksi ini hanya mencakup **SIM-002 (Future Simulation API)**. Semua klaim
merujuk sumber kebenaran: PRD §14.11 (BR-SIM-001–004, BR-SIM-007, BR-SIM-008,
AC-SIM-01/02) dan `Architecture.md` §6.9 (endpoint), §12.2 (flow), §23
(validasi), §24 (error handling). PRD tidak mendefinisikan BR-SIM-005/006,
sehingga rentang tersebut tidak dipakai di mana pun.

### 9.1 Endpoint

`POST /api/v1/simulation/future` (`Architecture.md` §6.9) — body
`FutureSimulationRequest`, respons `FutureSimulationResponse`
(`apps/api/app/schemas/simulation.py`), status `200 OK`.
Dependensi: `get_current_user` (401 bila tanpa token),
`require_active_consent` (403 bila consent tidak aktif, BR-CONSENT-001),
`get_db`.

### 9.2 Validasi input & horizon

- `horizon_days`: `Literal[30, 90, 180]`, default `90`
  (PRD BR-SIM-002; `Architecture.md` §6.9). Nilai lain ditolak Pydantic → `422`.
- Validasi backend adalah authority utama (`Architecture.md` §23);
  validasi frontend meningkatkan UX tetapi bukan pengganti.

### 9.3 Perhitungan risiko

Service mendelegasikan ke engine yang sama dengan baseline
(`risk_engine.simulate_future_trajectory`; metodologi SIM-001 §3) —
memenuhi *"Re-run Risk Engine"* (PRD BR-SIM-003) dan langkah pembanding
baseline-vs-simulasi pada AC-SIM-01.

### 9.4 Skema respons (konsisten)

Respons mentah `response_model` tanpa envelope — konvensi yang sama dengan
endpoint assessment/health-profile (repo tidak memakai envelope
`ApiResponse`). Kunci stabil: `horizon_days` (di-echo), pasangan
`baseline_*`/`projected_*`, `risk_trajectories` (3 kondisi), `assumptions`,
`is_model_estimated: true`, `disclaimer` verbatim (PRD FR-005, BR-SIM-004).
Diverifikasi test kontrak respons
(`test_route_future_response_contract_consistent`).

### 9.5 Error handling

| Kondisi | Status | Sumber |
|---|---|---|
| Tanpa token | 401 | `get_current_user` |
| Tanpa consent aktif | 403 | `require_active_consent` |
| Tanpa profil kesehatan | 404 | `simulation_service` ("profil kesehatan belum ditemukan") |
| Horizon tidak valid | 422 | Pydantic `Literal` |

Pola error mengikuti `Architecture.md` §24. Tidak ada mutasi persisten pada
jalur mana pun (BR-SIM-007; test non-mutasi).

### 9.6 Kesesuaian kotak SIM-002

| Kotak `docs/TASK.md` | Bukti |
|---|---|
| Simulation endpoint | `routes/simulation.py:24-44`, terdaftar `/api/v1/simulation` |
| Input validation | `FutureSimulationRequest` + `Architecture.md` §23 |
| Horizon validation | `SimulationHorizon`, default 90; test 422 + default |
| Risk calculation | delegasi engine SIM-001 (§3); test 30/90/180 |
| Response schema | `FutureSimulationResponse`; test kontrak AC2 |
| Error handling | 401/403/404/422; tiap jalur teruji + §24 |

### 9.7 Acceptance Criteria

| AC | Status |
|---|---|
| Frontend dapat memanggil simulation API | **Backend-only**: kontrak `POST /api/v1/simulation/future` tersedia dan callable; wiring FE di luar scope backend |
| Response konsisten | Terpenuhi: skema mentah stabil + test kontrak |

---

## 10. Referensi

- `docs/PRD.md` §14.11: BR-SIM-001, BR-SIM-002, BR-SIM-003, BR-SIM-004;
  AC-SIM-01, AC-SIM-02; BR-SIM-007 (tanpa mutasi); BR-SIM-008 (reset simulasi).
- `docs/Architecture.md` §12 (Simulation Architecture), §19 (Data Flow),
  ADR-006 (Simulation Strategy).
- `docs/Health-Score.md`, `docs/Lifestyle-Score.md` (komponen skor).
- `apps/api/app/core/risk_engine/simulation.py` `simulate_future_trajectory`.
- `apps/api/app/services/simulation_service.py`,
  `apps/api/app/api/routes/simulation.py`,
  `apps/api/app/schemas/simulation.py`.
