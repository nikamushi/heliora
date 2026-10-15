# What-If — What-if Engine (SIM-003)

**Status:** DONE · **Task:** SIM-003 · **Sprint:** S6 · **Owner:** Gilang & Aksal

Dokumen ini adalah sumber kebenaran untuk metodologi, asumsi, dan interpretasi
**What-if Engine** HELIORA. Metodologi didokumentasikan **as-implemented**
mengikuti `docs/PRD.md` §14.12 (BR-WHATIF-001–006, AC-WHATIF-01/02) dan
`docs/Architecture.md` §12.3, §18, §12.4/§14, §23, §24.

Cakupan dokumen ini adalah **SIM-003 (What-if Engine)**. Future engine
(SIM-001) dan kontrak API-nya (SIM-002) didokumentasikan di
`docs/Simulation.md`; permukaan API what-if (SIM-004) mengikuti prinsip
yang sama tetapi didokumentasikan terpisah.

---

## 1. Tujuan

What-if Engine memungkinkan pengguna mengubah parameter lifestyle dan melihat
perubahan hasil estimasi secara interaktif (PRD BR-WHATIF-001), tanpa
menyentuh data profil utama (BR-WHATIF-003).

What-if Engine **bukan clinical forecast**, **bukan prognosis medis**,
dan **bukan** keluaran model ML.

---

## 2. Definisi

- **Baseline state** adalah estimasi risiko dan skor yang dihitung dari profil
  kesehatan aktual pengguna **pada saat simulasi dimulai**, memakai risk engine
  yang sama dengan assessment (`estimate_risks`, `calculate_health_score`,
  `calculate_lifestyle_score`) — PRD BR-WHATIF-005.
- **Skenario what-if** adalah salinan state yang parameter tertentunya
  ditimpa (override) oleh input pengguna; semua parameter lain mengikuti profil.
- **VirtualProfile** adalah objek in-memory yang menampung gabungan
  profil + override untuk dihitung ulang. Ia tidak pernah ditulis ke database.
- **Derived features** adalah fitur turunan yang dihitung ulang dari override,
  saat ini: BMI (`derived_bmi`) dari berat override + tinggi profil.
- Hasil selalu diberi label sebagai estimasi model
  (`is_model_estimated: true` + disclaimer), tidak pernah sebagai kepastian.

Implementasi: `apps/api/app/core/risk_engine.py`
`PreventiveLifestyleRiskEngine.simulate_what_if`.

---

## 3. Metodologi (as-implemented)

Urutan komputasi untuk satu set override `o`:

### 3.1 Baseline

```text
base_risks     = estimate_risks(profile)
base_health    = calculate_health_score(profile, base_risks)
base_lifestyle = calculate_lifestyle_score(profile)
```

Baseline selalu berasal dari kondisi aktual pengguna (BR-WHATIF-005).

### 3.2 Override parameter

Hanya parameter yang **dikirim** yang ditimpa
(`request.model_dump(exclude_unset=True)` di service); sisanya mengikuti profil.
Parameter yang didukung (§4).

### 3.3 Derived features

```text
derived_bmi = round(weight_kg / (height_m ** 2), 1)
```

`weight_kg` memakai nilai override bila ada, `height_m` dari tinggi profil.
Skema menjepit `derived_bmi` pada 10.0–80.0.

### 3.4 Re-run risk engine (BR-WHATIF-004)

```text
What-if Input
     ↓
Feature Processing (override + derived BMI → VirtualProfile)
     ↓
Risk Engine (estimate_risks, calculate_health_score, calculate_lifestyle_score)
     ↓
New Risk + New Score
     ↓
Compare with Baseline
```

```text
sim_risks     = estimate_risks(sim_profile)
sim_health    = calculate_health_score(sim_profile, sim_risks)
sim_lifestyle = calculate_lifestyle_score(sim_profile)
```

Berbeda dengan future simulation (SIM-001), what-if **tidak** memakai
`time_factor`/momentum dan **`sim_lifestyle` ikut dihitung ulang**
(dibandingkan `proj_lifestyle` yang dibekukan — lihat `Simulation.md` §7 K4).
What-if adalah rekalkulasi point-in-time, bukan proyeksi trajektori waktu.

### 3.5 Perbandingan per kondisi (BR-WHATIF-006)

Untuk tiap kondisi (diabetes, hipertensi, kardiovaskular):

```text
b_score = round(baseline_p × 100, 1)
s_score = round(simulated_p × 100, 1)
delta   = round(s_score − b_score, 1)   # poin persentase
```

### 3.6 Agregat skor dan delta

```text
health_score_delta    = round(sim_health − base_health, 1)
lifestyle_score_delta = round(sim_lifestyle − base_lifestyle, 1)
```

`applied_parameters` menggemakan parameter efektif skenario
(sleep, activity, weight, smoking, bmi).

### 3.7 Label, tren, dan impact summary

Probabilitas skenario dipetakan ke:

- **risk level**: `high` (≥ 0.50), `moderate` (0.25–0.50), `low` (< 0.25)
  (band yang sama dengan `_to_risk_level`);
- **risk label**: Lower / Moderate / Higher;
- **trend**: `decreasing` (Δ < −0.3), `increasing` (Δ > +0.3),
  selainnya `stable`;
- **impact_summary**: narasi arah perubahan dalam persen poin
  (ambang ±0.5%).

---

## 4. Parameter dan validasi

MVP mendukung minimal sleep duration, physical activity, dan weight
(PRD BR-WHATIF-002); smoking status adalah parameter tambahan:

| Parameter | Batas skema | Default bila tidak dikirim |
|---|---|---|
| `sleep_duration_hours` | 3.0–14.0 | nilai profil |
| `physical_activity_min_per_week` | 0.0–1000.0 | nilai profil |
| `weight_kg` | 30.0–300.0 | nilai profil (lalu BMI dihitung ulang) |
| `smoking_status` | `never` / `former` / `current` | nilai profil |

Contoh body parsial `{ "sleep_duration_hours": 8.0 }` hanya menimpa tidur;
tiga parameter lain mengikuti profil. Nilai di luar batas ditolak
Pydantic → `422`. Validasi backend adalah authority utama
(`Architecture.md` §23).

---

## 5. Asumsi

1. Override hanya berlaku pada simulasi; profil persisten tidak berubah
   (PRD BR-WHATIF-003; diverifikasi test non-mutasi).
2. Parameter yang tidak dikirim dianggap dipertahankan seperti profil.
3. Penyimpanan permanen perubahan adalah **explicit save terpisah**
   (`PUT /api/v1/health-profile`), bukan bagian what-if
   (AC-WHATIF-01: "tidak mengubah data profile utama sebelum user menyimpan").
4. Hasil adalah estimasi skenario model, bukan diagnosis klinis (§6).

---

## 6. Interpretasi dan Safety

- Output wajib dibaca sebagai **simulated / model-estimated change**, dilarang
  disajikan sebagai outcome klinis atau certainty statement
  (`Architecture.md` §12.4, §14).
- Setiap respons memuat `is_model_estimated: true` dan disclaimer medis
  verbatim (PRD FR-005).
- Terminologi yang dipakai: Estimated, Simulated, Scenario.
  Dilarang: *"You will definitely…"*, *"You will get…"*, *"You have…"*.

---

## 7. Kesesuaian kotak SIM-003

| Kotak `docs/TASK.md` | Bukti |
|---|---|
| Define simulation input | `WhatIfSimulationRequest` (4 parameter opsional, §4) |
| Validate input | Batas skema Pydantic; test 422 dua batas |
| Recalculate derived features | `derived_bmi` (§3.3); test `derived_bmi < profil` |
| Re-run risk engine | `estimate_risks` + skor pada `VirtualProfile` (§3.4) |
| Recalculate score | `sim_health`, `sim_lifestyle` (§3.4, §3.6) |
| Compare baseline and scenario | `condition_comparisons` + delta (§3.5–3.7); test semua kondisi menurun |
| Return result | `WhatIfSimulationResponse`; test 200 + kontrak kunci |

### Kesesuaian Acceptance Criteria

| AC | Bukti |
|---|---|
| User dapat mengubah parameter | Kontrak backend menerima 0–4 override parsial; wiring FE di luar scope backend |
| Risk result berubah sesuai input | Test perbaikan gaya hidup: skor naik, semua `delta_percentage ≤ 0`; test tanpa override: semua delta `0.0` |
| Original profile tidak berubah tanpa explicit save | `VirtualProfile` in-memory + test non-mutasi (route & engine); save eksplisit = `PUT /api/v1/health-profile` (§5.3) |

AC-WHATIF-01/02 terpenuhi di sisi backend: pembaruan hasil tanpa proses manual
per perubahan (satu POST, `exclude_unset`), dan stabilitas perubahan berulang
teruji (`test_what_if_repeated_changes_stable`).

---

## 8. Batasan (di luar SIM-003)

- Kontrak API what-if (`POST /api/v1/simulation/what-if`, status-code,
  target performa `< 1s`) didefinisikan di **§9 (SIM-004)**.
- Helper `to_level`/`to_label` terduplikasi dengan future engine (SIM-001);
  dedup ditunda agar SIM-003 tetap lokal.
- Tabel `simulations` (persistensi hasil) di luar cakupan; engine in-memory.
- Konsistensi kontrak AI terhadap konsumen non-SIM
  (`assessment_service`, `shap_explainer`, `evaluation`) di luar cakupan
  dokumen ini.

---

## 9. SIM-004 — What-if API (kontrak backend)

Seksi ini hanya mencakup **SIM-004 (What-if API)**. Semua klaim merujuk
sumber kebenaran: `docs/PRD.md` §9.10 (FR-020–023), §14.12
(BR-WHATIF-001–006, AC-WHATIF-01/02), §13.2.2 + §15.18 (performa `< 1s`),
dan `docs/Architecture.md` §6.9 (endpoint), §12.3 (flow), §18 (data flow),
§23 (validasi), §24 (error handling), §25/§25.1 (strategi performa).

### 9.1 Endpoint

`POST /api/v1/simulation/what-if` (`Architecture.md` §6.9) — body
`WhatIfSimulationRequest`, respons `WhatIfSimulationResponse`
(`apps/api/app/schemas/simulation.py`), status `200 OK`.
Dependensi: `get_current_user` (401 bila tanpa token),
`require_active_consent` (403 bila consent tidak aktif, BR-CONSENT-001),
`get_db`.

### 9.2 Skema request

`WhatIfSimulationRequest`: 4 field opsional (FR-020; BR-WHATIF-002),
`null` = mengikuti profil (§3.2):

- `sleep_duration_hours`: 3.0–14.0
- `physical_activity_min_per_week`: 0.0–1000.0
- `weight_kg`: 30.0–300.0
- `smoking_status`: `never` / `former` / `current`

### 9.3 Skema respons (konsisten)

Respons mentah `response_model` tanpa envelope — konvensi yang sama dengan
endpoint assessment/health-profile dan future simulation (repo tidak memakai
envelope `ApiResponse`). Kunci stabil (11): `applied_parameters`,
`derived_bmi`, pasangan `baseline_*`/`simulated_*` (health + lifestyle),
`health_score_delta`, `lifestyle_score_delta`, `condition_comparisons`
(3 kondisi; perbandingan Current-vs-What-if, FR-022),
`is_model_estimated: true`, `disclaimer` verbatim (PRD FR-005).
Narasi memakai istilah *disimulasi/diestimasi*, bukan kepastian (FR-023).
Diverifikasi test kontrak respons
(`test_what_if_route_response_contract_consistent`).

### 9.4 Validasi skenario

Nilai di luar batas ditolak Pydantic → `422`. Validasi backend adalah
authority utama (`Architecture.md` §23); validasi frontend meningkatkan
UX tetapi bukan pengganti.

### 9.5 Error handling

| Kondisi | Status | Sumber |
|---|---|---|
| Tanpa token | 401 | `get_current_user` |
| Tanpa consent aktif | 403 | `require_active_consent` |
| Tanpa profil kesehatan | 404 | `simulation_service` ("profil kesehatan belum ditemukan") |
| Parameter tidak valid | 422 | Pydantic |

Pola error mengikuti `Architecture.md` §24. Tidak ada mutasi persisten
pada jalur mana pun (BR-WHATIF-003; test non-mutasi).

### 9.6 Performance

Target: what-if `< 1 detik` (PRD §13.2.2, §15.18; `Architecture.md` §25).
Strategi (`§25.1`): request sinkron ringan, service reusable
(`simulation_service`), tanpa retraining / rebuild pipeline / external
LLM call — flow Stored Model → Modified Input → Inference → Result.
Perhitungan murni in-memory di atas rule engine; terukur ±0,01 s per
panggilan pada mesin dev lokal (test `test_what_if_route_performance_target`,
assert `< 1.0s`) — margin ±100× dari target.

### 9.7 Kesesuaian kotak SIM-004

| Kotak `docs/TASK.md` | Bukti |
|---|---|
| Create endpoint | `routes/simulation.py:47-65`, terdaftar `/api/v1/simulation` |
| Define request schema | `WhatIfSimulationRequest` (§9.2); test 422 + parsial + echo |
| Define response schema | `WhatIfSimulationResponse` (§9.3); test kontrak SIM-004 |
| Validate scenario | Batas Pydantic + `derived_bmi` 10–80; test 422 dua batas |
| Performance optimization | Tanpa LLM/retraining; in-memory; smoke test `< 1s` (§9.6) |

### 9.8 Acceptance Criteria

| AC | Status |
|---|---|
| Simulation dapat dipanggil secara interaktif | Terpenuhi: satu POST per perubahan, `exclude_unset`, tanpa proses manual; stabilitas berulang teruji (`test_what_if_repeated_changes_stable`) |
| Response memenuhi target performance sejauh environment memungkinkan | Terpenuhi: terukur ±0,01 s lokal (target `< 1s`); smoke test menjaga regresi; target memakai kualifikasi environment sesuai PRD AC SIM-004 dan `Architecture.md:2622` |

---

## 10. Referensi

- `docs/PRD.md` §9.10: FR-020, FR-021, FR-022, FR-023.
- `docs/PRD.md` §14.12: BR-WHATIF-001–006; AC-WHATIF-01, AC-WHATIF-02;
  FR-WHATIF; BR-SIM-007 (tanpa mutasi).
- `docs/PRD.md` §13.2.2, §15.18 (performa what-if `< 1s`).
- `docs/Architecture.md` §6.9 (endpoint), §12.3 (What-if Simulation),
  §18 (What-if Data Flow), §12.4/§14 (safety), §23 (validasi),
  §24 (error handling), §25/§25.1 (performa).
- `docs/Simulation.md` (future engine SIM-001, kontrak SIM-002).
- `apps/api/app/core/risk_engine.py` `simulate_what_if`.
- `apps/api/app/services/simulation_service.py`,
  `apps/api/app/api/routes/simulation.py`,
  `apps/api/app/schemas/simulation.py`.
