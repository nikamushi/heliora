# Infrastructure

Deployment VPS memakai Docker Compose dan Caddy sebagai reverse proxy/TLS.
Default stack adalah **API-only** (frontend di Vercel). Service `web` ada di
compose di belakang profile `full` bila suatu saat ingin full-stack di VPS.

```text
infra/
├── caddy/Caddyfile          # TLS otomatis + reverse proxy API
└── compose/
    ├── docker-compose.yml   # api, caddy (+ web via --profile full)
    └── .env.example         # template konfigurasi runtime
```

Langkah setup, daftar secret, dan prosedur rollback ada di
[`docs/CI-CD.md`](../docs/CI-CD.md).

Build image dilakukan di GitHub Actions (`.github/workflows/deploy.yml`) dan
di-push ke GHCR. VPS hanya menarik image, menjalankan migrasi Alembic, lalu
menyalakan container dengan health check.
