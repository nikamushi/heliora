# ADR-011 — Authentication Strategy

**Status:** Accepted (Issue #18, ARC-004 / BE-001-CONFLICT).
**Scope:** Keseluruhan — Supabase (identity), FastAPI (application/security boundary),
Postgres (data), AI (internal backend capability). Implementasi bertahap dimulai dari
frontend (FE-012); backend dan database mengikuti dalam task BE/DB terpisah.
**Tanggal:** 2026-09-18.

## Context

Terjadi tumpang tindih arsitektural antara FastAPI native auth (endpoint `/auth/*`,
bcrypt, JWT lokal HS256 via `SECRET_KEY`) dan Supabase Auth (`auth.users`, cloud JWT, RLS):

1. **Dual user store** — `auth.users` (Supabase) vs `public.users` (FastAPI) tidak tersinkronisasi.
2. **Token mismatch (401)** — token Supabase ditolak `get_current_user` FastAPI karena beda
   secret/signature.
3. **RLS vs SQLAlchemy pool** — RLS butuh `auth.uid()`, sedangkan FastAPI memakai connection
   pool service-role.
4. **AI pipeline blocked** — model (XGBoost/SHAP) butuh akses data klinis tanpa terhalang RLS.

Kondisi kode saat keputusan ini diambil: auth 100% FastAPI-native, nol kode Supabase
(`apps/api/app/api/routes/auth.py`, `app/api/dependencies.py:get_current_user`,
`app/core/security.py` bcrypt + python-jose HS256; `apps/web/src/lib/api-client.ts`
token di `localStorage`; migrasi `001_initial_schema.py` tanpa RLS/trigger).

## Decision

1. **Hybrid Opsi 2.** Supabase Auth adalah Identity Provider (termasuk Google OAuth);
   FastAPI adalah resource server sekaligus business/AI gateway; Postgres adalah data layer;
   AI adalah kapabilitas internal backend — bukan security boundary tersendiri.
2. **Verifikasi JWT asimetris via JWKS — bukan shared-secret HS256.**
   FastAPI memvalidasi Bearer Supabase terhadap
   `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`
   (lookup `kid`, allowlist `ES256`/`RS256`, validasi `iss`/`aud`/`exp`,
   cache dengan refresh saat rotasi/`kid` tak dikenal). Alasan: shared-secret HS256 tidak
   dapat dirotasi per-key dan berisiko bocor; JWKS mendukung rotasi standby/previous keys.
3. **FastAPI adalah trusted resource server yang melakukan authorization sendiri**
   (`get_current_user` hasil verifikasi JWKS → `sub` UUID → `public.users` + consent + FK).
   RLS owner-only (`auth.uid() = user_id`) hanya berlaku untuk akses langsung
   Supabase/client (PostgREST), bukan mekanisme authorization utama FastAPI/AI
   (service-role pool + app-level checks).

## Consequences

- **Backend (diluar FE-012):** deprecate `POST /auth/register|/login|/token` lokal; refactor
  `app/api/dependencies.py:get_current_user` ke verifier JWKS; hapus penerbitan JWT HS256
  untuk user; tambah `SUPABASE_JWKS_URL/ISSUER/AUDIENCE/ALLOWED_ALGS`; tulis ulang
  `tests/test_auth.py`, `tests/test_security.py` dengan mock JWKS
  (valid/expired/wrong-aud/unknown-kid/rotasi).
- **Database (diluar FE-012):** trigger mirror `auth.users → public.users`
  (`id` = Supabase uid), FK tabel kesehatan ke `public.users.id`, drop `password_hash`,
  RLS owner-only untuk jalur langsung; FastAPI/AI via service-role + app-authz.
- **Frontend (FE-012, scope kerja ini):** Supabase SDK sebagai sumber session/token;
  `api-client` mengirim Bearer Supabase; login/register/logout + Google OAuth via Supabase;
  guard berbasis session; tipe user Supabase.
- **Migrasi user lokal:** hash bcrypt tidak dapat diimpor ke GoTrue — import via Admin API
  + paksa reset password/magic-link, atau dual-issuer transisi sementara sebelum cutover.
- **Risiko:** cache JWKS saat rotasi (~10 mnt edge cache), alg-confusion bila allowlist longgar,
  trigger race, kebutuhan project-ref/keys per environment, perubahan UX login yang harus
  dikomunikasikan.

## References

- Issue #18 — `fix(arch): resolve authentication boundary conflict between FastAPI and Supabase Auth`.
- `docs/TASK.md` — FE-012 (frontend), BE-001, INT-001, ARC-001/002.
- `docs/Architecture.md` §42–§43, §47 (lokasi `docs/ADR/`).
- Supabase docs — JWT signing keys & JWKS (`/auth/v1/.well-known/jwks.json`).
