# CI/CD

Pipeline GitHub Actions untuk monorepo HELIORA: web (Next.js), API (FastAPI),
dan mobile (Flutter), plus deployment ke VPS dengan Docker Compose.

## 1. Alur

```text
Pull request
  └─ CI (path-filtered)
       ├─ Web      : lint → typecheck → build
       ├─ API      : ruff → alembic → pytest (API, ml-core, ai)
       ├─ Mobile   : format → analyze → test → debug APK
       ├─ Dependency review
       └─ CI Gate  ← required status check untuk merge

Push ke main
  ├─ CI
  └─ Deploy (build image → Trivy → staging, bila DEPLOY_ENABLED=true)

Tag app-vX.Y.Z
  └─ Deploy → production (butuh approval environment)

Tag mobile-vX.Y.Z
  └─ Mobile Release → signed APK + GitHub Release
```

## 2. Workflow

| File | Fungsi |
| --- | --- |
| `.github/workflows/ci.yml` | Lint, typecheck, build, test, dependency review, gate |
| `.github/workflows/codeql.yml` | CodeQL untuk JavaScript/TypeScript dan Python |
| `.github/workflows/deploy.yml` | Build/push image ke GHCR, scan, deploy VPS |
| `.github/workflows/release-mobile.yml` | Build APK bertanda tangan dan GitHub Release |
| `.github/dependabot.yml` | Update dependensi mingguan |

Hanya **CI Gate** yang dijadikan required status check. Job per-aplikasi
memakai path filter, sehingga check yang di-skip tidak membuat PR menggantung.

## 3. Menjalankan gate secara lokal

```bash
# Web
pnpm install --frozen-lockfile
pnpm --filter frontend lint --max-warnings=0
pnpm --filter frontend typecheck
pnpm --filter frontend build

# Python (dari root)
uv lock --check
uv sync --frozen --all-packages --all-extras --no-extra notebook --all-groups
uv run ruff check apps/api packages/ml-core/src ai/src
uv run ruff format --check apps/api packages/ml-core ai

cd apps/api && uv run pytest tests -q
cd packages/ml-core && uv run pytest tests -q
cd ai && uv run pytest tests -q

# Mobile
cd apps/mobile
flutter pub get
flutter analyze --fatal-infos
flutter test --coverage

# Advisory sampai reformat Flutter dijalankan terpisah:
dart format --output=none --set-exit-if-changed lib test
```

## 4. Secrets dan variables

### Repository variables

| Name | Contoh | Dipakai |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.example.com` | Build image web |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Build image web |
| `DEPLOY_ENABLED` | `true` | Mengaktifkan job deploy |

### Repository secrets

| Name | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase untuk build web |

### Environment secrets (`staging`, `production`)

| Name | Keterangan |
| --- | --- |
| `VPS_HOST` | Hostname/IP VPS |
| `VPS_PORT` | Port SSH (default 22) |
| `VPS_USER` | User deploy non-root |
| `VPS_SSH_KEY` | Private key khusus deploy |
| `VPS_HOST_FINGERPRINT` | Fingerprint host key SSH |
| `VPS_DEPLOY_PATH` | Direktori compose di VPS, mis. `/opt/heliora` |

### Mobile release secrets

| Name | Keterangan |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Keystore release, base64 |
| `ANDROID_KEYSTORE_PASSWORD` | Password keystore |
| `ANDROID_KEY_ALIAS` | Alias key |
| `ANDROID_KEY_PASSWORD` | Password key |
| `API_BASE_URL` | Base URL API untuk APK |
| `SUPABASE_URL` | URL Supabase untuk APK |
| `SUPABASE_ANON_KEY` | Anon key Supabase untuk APK |

Release mobile **fail-closed**: bila salah satu secret di atas kosong, build
gagal. Tidak ada lagi keystore acak atau URL default yang tersembunyi.

## 5. Menyiapkan VPS

1. Buat user deploy non-root dan tambahkan ke grup `docker`.
2. Pasang Docker Engine + Compose plugin.
3. Buka hanya port `22`, `80`, `443` di firewall.
4. Arahkan DNS `DOMAIN` dan `API_DOMAIN` ke IP VPS.
5. Salin direktori `infra/` dari repo ke VPS dengan layout yang sama:

   ```text
   /opt/heliora/infra/
   ├── compose/
   │   ├── docker-compose.yml
   │   └── .env
   └── caddy/
       └── Caddyfile
   ```

   Set `VPS_DEPLOY_PATH=/opt/heliora/infra/compose`. Volume Caddy memakai
   path relatif `../caddy/Caddyfile`, jadi layout ini harus dipertahankan.
6. Isi `.env` dari `infra/compose/.env.example`.
7. Pastikan `docker compose pull` bisa membaca GHCR (image dibuat private
   secara default; `GITHUB_TOKEN` dari workflow dipakai saat deploy).
8. Isi environment secrets dan set variable `DEPLOY_ENABLED=true`.
9. Aktifkan required reviewer untuk environment `production`.

Deploy pertama dapat dijalankan lewat **Actions → Deploy → Run workflow**
(`workflow_dispatch`).

## 6. Deploy dan rollback

Job deploy:

1. `docker compose pull`
2. `docker compose run --rm --no-deps api alembic upgrade head`
3. `docker compose up -d --wait`
4. Smoke test `https://$API_DOMAIN/health` dan `https://$DOMAIN/`
5. Bila gagal, `IMAGE_TAG` dikembalikan ke tag sebelumnya dan container
   dijalankan ulang

Rollback manual:

```bash
cd /opt/heliora
sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=sha-abc1234/' .env
docker compose pull
docker compose up -d --wait
```

Catatan: satu VPS berarti restart singkat saat deploy (bukan zero-downtime
penuh). Health-gated restart memastikan container yang gagal tidak dibiarkan
melayani trafik.

## 7. Rilis mobile

```bash
git tag mobile-v1.0.0
git push origin mobile-v1.0.0
```

Workflow akan membangun APK release, memverifikasi signature, membuat
checksum SHA-256, mengunggah artifact, dan menerbitkan GitHub Release.
Versi diambil dari tag; build number memakai nomor run Actions.

## 8. Keamanan supply chain

- Semua action dipin ke commit SHA.
- `permissions` minimal per job.
- Trivy memblokir image dengan HIGH/CRITICAL vulnerability yang sudah punya fix.
- Buildx menghasilkan provenance dan SBOM.
- Dependabot memantau npm, uv, pub, gradle, dan GitHub Actions.
- CodeQL berjalan pada PR, push ke `main`, dan mingguan.

## 9. Troubleshooting

| Gejala | Penyebab umum |
| --- | --- |
| `uv lock --check` gagal | `pyproject.toml` berubah tanpa `uv lock` |
| Job API gagal di Alembic | Service Postgres belum sehat |
| Deploy gagal di `curl` | DNS/TLS Caddy belum siap, atau `.env` salah |
| Deploy job skipped | `DEPLOY_ENABLED` belum `true` |
| Release mobile gagal | Secret signing/env belum lengkap |
