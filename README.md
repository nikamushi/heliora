# HELIORA

AI-Powered Preventive Health Intelligence Platform.

## Overview

HELIORA adalah platform MVP kompetisi INSEVENT 2026 (SDG 3) yang membantu masyarakat memahami kesehatan dari pola gaya hidup, mengestimasi risiko penyakit tidak menular (Diabetes Melitus Tipe 2, Hipertensi, Penyakit Kardiovaskular), melakukan simulasi perubahan gaya hidup, serta memperoleh rekomendasi preventif berbasis bukti klinis.

> [!IMPORTANT]
> HELIORA bukan alat diagnosis medis, layanan telemedicine, ataupun pengganti konsultasi dengan dokter atau tenaga medis profesional.

## Tech Stack

- **Frontend:** Next.js 16 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python 3.12, SQLAlchemy (asyncpg), Alembic, Pydantic v2
- **Auth & Database:** Supabase (PostgreSQL, JWKS Bearer auth, RLS)
- **Monorepo & Tooling:** Turborepo, pnpm, uv

---

## Prasyarat Sistem

- **Node.js** >= 20.x & **pnpm** >= 9.x
- **Python** >= 3.11 (disarankan 3.12) & **uv** package manager

Untuk pengembang lokal, aktifkan hook commit monorepo sekali setelah klon:
```bash
git config core.hooksPath .githooks
```

---

## Cara Menjalankan Project

### 1. Backend (FastAPI)

Masuk ke direktori `apps/api`:

```bash
cd apps/api
```

1. **Salin konfigurasi environment:**
   ```bash
   cp .env.example .env
   # Di Windows PowerShell:
   # Copy-Item .env.example .env
   ```
   Sesuaikan `DATABASE_URL` dengan database PostgreSQL lokal atau instance Supabase Anda.

2. **Sinkronkan dependensi dengan `uv`:**
   ```bash
   uv sync --extra dev
   ```

3. **Jalankan migrasi database:**
   ```bash
   uv run alembic upgrade head
   ```

4. **Jalankan server FastAPI:**
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```

API berjalan di `http://localhost:8000`. Dokumentasi interaktif Swagger UI tersedia di `http://localhost:8000/docs`.

---

### 2. Frontend (Next.js)

Masuk ke direktori `apps/web`:

```bash
cd apps/web
```

1. **Salin konfigurasi environment:**
   ```bash
   cp .env.example .env.local
   # Di Windows PowerShell:
   # Copy-Item .env.example .env.local
   ```
   Sesuaikan `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`) dan kredensial Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

2. **Install dependensi paket:**
   ```bash
   pnpm install
   ```

3. **Jalankan server Next.js:**
   ```bash
   pnpm --filter frontend dev
   # Atau jika berada di dalam direktori apps/web:
   # pnpm dev
   ```

Aplikasi frontend berjalan di `http://localhost:3000`.

---

### 3. Menjalankan Sekaligus dari Root (Opsional)

Dari root direktori repositori:
```bash
pnpm dev
```
*(Menjalankan frontend dev server via Turborepo. Backend dapat dijalankan bersamaan di terminal terpisah menggunakan perintah `uv run uvicorn app.main:app --reload --port 8000` dari `apps/api`).*

---

## Menjalankan Linting & Pengujian

### Backend
```bash
cd apps/api
uv run --extra dev ruff check app tests alembic
uv run --extra dev pytest
```

### Frontend
```bash
# Dari root monorepo
pnpm --filter frontend lint
pnpm --filter frontend build
```

---

## Dokumentasi & Struktur Proyek

- [PRD](docs/PRD.md)
- [Architecture](docs/Architecture.md)
- [Design](docs/Design.md)
- [Monorepo](docs/Monorepo.md)
- [TASK](docs/TASK.md)
- [CONTRIBUTING](CONTRIBUTING.md)

```text
heliora/
├── apps/
│   ├── api/            # FastAPI backend (uv, SQLAlchemy, Alembic, tests)
│   └── web/            # Next.js frontend (pnpm, App Router, Tailwind CSS)
├── docs/               # PRD, Architecture, Design, Monorepo, TASK
├── supabase/           # Schema database & migrasi SQL Supabase
├── .githooks/          # Commit message hooks
├── package.json        # Turborepo root configuration
├── pnpm-workspace.yaml
├── pyproject.toml      # uv workspace root
└── turbo.json
```
