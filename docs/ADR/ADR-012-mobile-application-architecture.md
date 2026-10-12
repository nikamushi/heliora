# ADR-012 — Mobile Application Architecture and Monorepo Integration

**Status:** Proposed (Menunggu persetujuan PM untuk merge ke `main` sesuai `docs/PRD-Mobile.md` §1.2 & `docs/TASK.md` §31; implementasi di branch `feature/mob-002-mobile-monorepo-foundation`).  
**Scope:** Mobile application (`apps/mobile`), monorepo orchestration (Turborepo), dependency boundaries (pub vs pnpm/uv), dan integrasi API/Auth.  
**Tanggal:** 2026-10-12.  

---

## Context

Platform HELIORA membutuhkan kehadiran aplikasi mobile Android untuk menjangkau masyarakat umum secara langsung dari layar utama ponsel (`docs/Design.md` §9, `docs/PRD-Mobile.md`). Aplikasi ini mengusung alur inti: registrasi, persetujuan medis, pengisian profil kesehatan gaya hidup, estimasi risiko AI 3 penyakit, simulasi what-if, dan manajemen privasi.

Terdapat beberapa pertimbangan arsitektural penting:

1. **Lokasi Repositori:** Memisahkan aplikasi mobile ke repositori terpisah vs menempatkannya di dalam monorepo Heliora yang ada.
2. **Orkestrasi Multi-Bahasa:** Monorepo saat ini menggunakan pnpm untuk JavaScript/TypeScript dan uv untuk Python. Memasukkan Dart/Flutter tidak boleh merusak batasan dependency manager masing-masing.
3. **Kontrak Backend & Identitas:** Backend FastAPI telah memiliki kontrak OpenAPI (`/api/v1/openapi.json`) dan autentikasi berbasis Supabase Auth dengan verifikasi JWKS (ADR-011). Mobile tidak boleh meminta endpoint khusus atau memodifikasi skema backend.
4. **Keamanan Sesi di Perangkat:** Token JWT Bearer harus disimpan secara aman di perangkat fisik, bukan di penyimpanan teks biasa.

---

## Decision

1. **Framework & Target Platform:**
   - Menggunakan **Flutter** dengan target awal **Android** (minSdk 26 / Android 8.0, compileSdk per Flutter standard, orientasi portrait, lebar acuan 360 dp).
   - Versi Flutter SDK dikunci secara eksplisit menggunakan **FVM** (`.fvmrc` pada versi `3.41.9`, Dart SDK `^3.11.5`).

2. **Integrasi Monorepo & Orkestrasi Turborepo:**
   - Aplikasi mobile ditempatkan di `apps/mobile/`.
   - `apps/mobile` menyertakan `package.json` yang **hanya berisi skrip** (`dev`, `lint`, `test`, `build`, `gen:api`) tanpa dependensi npm runtime. Ini memungkinkan Turborepo mengorkestrasi `lint`, `test`, dan `build` mobile dari root monorepo.
   - Dependensi Dart/Flutter dikelola murni oleh manajer paket bawaan (`pubspec.yaml` dan pub).
   - Root `turbo.json` menyediakan `globalPassThroughEnv` untuk variabel lingkungan Flutter/Android/Java serta merekam output build APK (`build/app/outputs/**`).

3. **Kontrak API & Pembangkitan Kode Klien:**
   - Mobile memanfaatkan kontrak terbuka FastAPI (`/api/v1/openapi.json`).
   - Kode client HTTP Dart di-generate secara deterministik menggunakan `swagger_parser` ke direktori `lib/core/api/generated/`.
   - Tidak ada perubahan atau penambahan endpoint di backend khusus untuk mobile.

4. **Autentikasi & Batasan Keamanan:**
   - Autentikasi mengintegrasikan `supabase_flutter` ke proyek Supabase yang sama dengan web. Satu akun berlaku lintas web dan mobile.
   - Sesi terenkripsi di perangkat menggunakan `flutter_secure_storage` (Android Keystore / EncryptedSharedPreferences).
   - Backend tetap memperlakukan mobile sebagai klien luar terpercaya melalui verifikasi Bearer token asimetris via JWKS (mengikuti ADR-011).
   - Deep link callback login menggunakan skema `id.heliora.app://login-callback`.

5. **Isolasi Batasan Aplikasi (Application Boundary):**
   - `apps/mobile` terisolasi penuh: dilarang mengimpor file kode dari `apps/web` atau `apps/api`.
   - Sambungan antar-aplikasi murni berupa kontrak HTTP jaringan dan token JWT Bearer.

6. **State Management & Navigasi:**
   - Menggunakan **Riverpod** untuk state management dan dependency injection.
   - Menggunakan **go_router** untuk navigasi deklaratif dengan penerapan *consent-aware routing* (menolak akses Beranda/Simulasi jika persetujuan belum diberikan atau dicabut).

---

## Consequences

- **Positif:**
  - Pengujian terpadu: `pnpm lint` dan `pnpm test` dari root ikut memeriksa kesehatan kode mobile tanpa pemisahan CI.
  - Efisiensi pengembangan: Penggunaan client generator memangkas waktu penulisan model dan menjamin kesesuaian tipe data secara instan saat API diperbarui.
  - Konsistensi identitas & privasi: Pengguna mendapatkan pengalaman data yang sinkron antara web dan mobile tanpa perlu sinkronisasi manual.

- **Konsekuensi & Mitigasi Risiko:**
  - Pengembang lokal yang menjalankan `pnpm lint`/`test` di root memerlukan toolchain Flutter. Mitigasi: README menyediakan opsi `--filter` bagi pengembang backend/web (`pnpm --filter frontend lint` / `pnpm --filter api lint`).
  - Skrip runner (`run-flutter.mjs`) disediakan agar pengembang yang belum memasang FVM secara global tetap dapat mengeksekusi skrip Turborepo melalui Flutter di PATH sistem secara transparan.
  - Sesuai `PRD-Mobile.md` §14, jadwal diproteksi dengan garis batas (*cut line*) bertahap (memangkas animasi splash dan login sosial lebih dahulu) jika waktu pengembangan kompetisi mendekati tenggat.
