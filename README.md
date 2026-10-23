# HELIORA

[![CI](https://github.com/nikamushi/heliora/actions/workflows/ci.yml/badge.svg)](https://github.com/nikamushi/heliora/actions/workflows/ci.yml)

AI-Powered Preventive Health Intelligence Platform.

## Overview

HELIORA adalah platform MVP kompetisi INSEVENT 2026 (SDG 3: *Good Health and Well-Being*) yang membantu masyarakat memahami kesehatan dari pola gaya hidup, mengestimasi risiko penyakit tidak menular (Diabetes Melitus Tipe 2, Hipertensi, Penyakit Kardiovaskular), melakukan simulasi perubahan gaya hidup (*What-If Engine*), serta memperoleh rekomendasi preventif berbasis bukti klinis dan eksplanasi AI transparan.

> [!IMPORTANT]
> **Batasan Medis (Medical Disclaimer):**
> HELIORA adalah platform estimasi risiko preventif berbasis gaya hidup, bukan alat diagnosis medis klinis, layanan telemedicine, ataupun pengganti konsultasi dengan dokter atau tenaga medis profesional.

---

## Tech Stack

- **Frontend:** Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, Motion
- **Backend:** FastAPI, Python 3.12, SQLAlchemy (asyncpg), Alembic, Pydantic v2
- **AI & Explainability:** Google Gemini (Generative AI), RAG Pipeline berbasis Evidence Klinis (CDC, WHO, PERKENI)
- **Machine Learning & Data:** Scikit-Learn, XGBoost, empirical datasets (CDC BRFSS 2022, BPJS NCD, Harvard Dataverse Indonesia)
- **Mobile (Android):** Flutter, dikunci dengan FVM (Flutter Version Management)
- **Auth & Database:** Supabase (PostgreSQL, JWKS Bearer auth ES256/RS256, JIT User Provisioning, RLS)
- **Monorepo & Tooling:** Turborepo, pnpm, uv
- **CI/CD:** GitHub Actions, GHCR, Docker Compose, Caddy — lihat [`docs/CI-CD.md`](docs/CI-CD.md)

---

## Prasyarat Sistem

- **Node.js** 22.x & **pnpm** 11.x
- **Python** 3.12 & **uv** package manager
- **Mobile (Opsional):** Flutter versi sesuai `apps/mobile/.fvmrc` (lewat FVM), Android Studio dengan Android SDK, dan JDK 17

Untuk pengembang lokal, aktifkan hook commit monorepo sekali setelah klon:
```bash
git config core.hooksPath .githooks
```

---

## Konfigurasi Environment (.env)

### 1. Backend (`apps/api/.env`)
Salin dari template:
```bash
cp apps/api/.env.example apps/api/.env
```
Variabel penting:
- `DATABASE_URL`: URI koneksi PostgreSQL / Supabase pooler (misal: `postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`).
- `SUPABASE_URL` & `SUPABASE_ANON_KEY`: Kredensial project Supabase.
- `GEMINI_API_KEY`: API key Google AI Studio untuk pipeline penjelasan klinis AI. (Jika tidak diisi, backend otomatis menggunakan *rule-based clinical fallback* non-blocking).
- `GEMINI_MODEL`: Model Gemini yang aktif (default: `gemini-2.5-flash`).

### 2. Frontend (`apps/web/.env.local`)
Salin dari template:
```bash
cp apps/web/.env.example apps/web/.env.local
```
Variabel penting:
- `NEXT_PUBLIC_API_URL`: URL API backend (default lokal: `http://localhost:8000`).
- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon/public key Supabase.

---

## Cara Menjalankan Project

### 1. Menjalankan Backend (FastAPI)

```bash
cd apps/api
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```
- API Endpoint: `http://localhost:8000`
- Dokumentasi OpenAPI (Swagger UI): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### 2. Menjalankan Frontend (Next.js)

```bash
cd apps/web
pnpm install
pnpm dev
```
- Aplikasi web berjalan di `http://localhost:3000`.

### 3. Menjalankan Mobile (Flutter Android)

```bash
cd apps/mobile
fvm install && fvm flutter pub get
cd ../..
pnpm --filter mobile dev
```
*(Emulator Android menjangkau backend lokal melalui `http://10.0.2.2:8000`).*

### 4. Menjalankan Sekaligus (Dev Runners)
- **Web & Root:** Dari root direktori jalankan `pnpm dev`.
- **Backend + Mobile (One-Click):** Dari root jalankan `pnpm dev:mobile` (otomatis menunggu backend siap sebelum membuka Flutter session).

---

## Validasi & Pengujian Kualitas (QA Tested)

Repositori ini telah melewati rangkaian pengetesan menyeluruh:

### 1. Backend Test Suite
```bash
cd apps/api
uv run pytest
```
- **Hasil:** 380 passed, 2 skipped, 0 failures.
- Cakupan pengujian: Kalkulasi skor risiko, deterministik What-If simulation, JIT Supabase OAuth token verification, integritas data consent (UU PDP), dan fallback non-blocking LLM explanation pipeline.

### 2. Frontend Build & Typecheck
```bash
cd apps/web
npx tsc --noEmit
pnpm build
```
- **Hasil:** 35 rute terkompilasi bersih menggunakan Turbopack tanpa type error.

### 3. Linting
```bash
# Backend
cd apps/api && uv run ruff check app tests alembic

# Frontend
pnpm --filter frontend lint
```

---

## Empirical Datasets & AI Intelligence

Model penilaian risiko HELIORA dikalibrasi menggunakan dataset empiris kesehatan (`apps/ml/data/`):
1. **CDC BRFSS 2022 (`cdc_brfss_2022_preprocessed.parquet`):** Baseline data epidemiologi risiko metabolik dan kardiovaskular berskala besar.
2. **BPJS NCD Feature Sample (`bpjs_sample_ncd_features.parquet`):** Karakteristik pola komorbiditas dan beban penyakit tidak menular di Indonesia.
3. **Harvard Dataverse Indonesia Lifestyle (`dataverse_indonesia_lifestyle.parquet`):** Distribusi faktor gaya hidup spesifik populasi Indonesia (aktivitas fisik, konsumsi garam/gula, merokok, dan indeks massa tubuh).

### AI Clinical Explanation Pipeline
Ketika pengguna menyelesaikan *health assessment*, engine AI:
1. Mengekstrak kontributor risiko utama (*explainable factors*).
2. Melakukan retrieval referensi klinis terverifikasi (kategori bukti CDC/WHO/PERKENI).
3. Memanggil model `gemini-2.5-flash` untuk merumuskan narasi penjelasan yang ramah pasien, transparan, dan terbebas dari halusinasi diagnosa.

---

## Standar Keamanan & Legalitas

- **Kepatuhan UU PDP (UU No. 27/2022):** Persetujuan pemrosesan data kesehatan dilakukan secara eksplisit pada rute `/onboarding/consent` sebelum data kesehatan sensitif dikumpulkan.
- **Autentikasi Supabase & OAuth:** Mendukung email/password dan Google OAuth dengan verifikasi JWKS (ES256/RS256) serta *Just-In-Time* (JIT) provisioning ke database internal.
- **Rute Legal Terbuka:**
  - `/terms`: Ketentuan Layanan lengkap dengan klausul batasan tanggung jawab hukum.
  - `/privacy`: Kebijakan Privasi data pengguna sesuai prinsip minimisasi data.
  - `/disclaimer`: Alias rute yang mengarahkan langsung ke disclaimer medis resmi.

---

## Struktur Direktori

```text
heliora/
├── apps/
│   ├── api/            # Backend FastAPI (FastAPI, SQLAlchemy, Alembic, tests)
│   ├── ml/             # ML data empirical & training scripts (apps/ml/data/)
│   ├── mobile/         # Flutter Android app (FVM, Riverpod, clean architecture)
│   └── web/            # Next.js frontend (App Router, Tailwind CSS, Turbopack)
├── docs/               # PRD, Architecture, Design, Monorepo, TASK
├── supabase/           # Migrasi SQL & skema basis data
├── .githooks/          # Commit message hooks monorepo
├── package.json        # Konfigurasi Turborepo root
├── pnpm-workspace.yaml
├── pyproject.toml      # Konfigurasi uv workspace root
└── turbo.json
```
