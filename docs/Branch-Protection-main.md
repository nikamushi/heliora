# Panduan Branch Protection untuk `main`

**Terkait Issue:** #12 (`SETUP-005`), Acceptance Criteria: *"GitHub Ruleset / Branch Protection untuk branch `develop`"*.
**Keputusan yang dicatat:** repo ini memakai satu long-lived branch **`main`** tanpa `develop` (`CONTRIBUTING.md`, tidak ada branch `develop` di remote). Panduan ini mengganti target menjadi **`main`**.

> Perubahan ini **dokumentatif saja**: tidak ada setting remote yang diubah oleh file/skrip di repo ini. Maintainer berizin admin menerapkan ruleset secara manual memakai skrip `scripts/setup-branch-protection.sh`.

## Setting yang harus diterapkan ke `main`

1. **Wajib Pull Request** — direct push ke `main` ditolak; semua perubahan masuk via PR.
2. **Required approvals** — minimal 1 approval non-author sebelum merge (naikkan bila tim membesar).
3. **CI hijau (required status checks)** — required check adalah **`CI Gate`** (`.github/workflows/ci.yml`). Gate ini merangkum job Web, API, Mobile, dan Dependency review; job yang di-skip karena path filter tetap dianggap lolos selama tidak ada failure/cancelled.
4. **Squash merge** — merge ke `main` memakai squash agar riwayat linear dan setiap commit di `main` tetap tertaut ke Task ID.
5. **Include administrators** — aturan berlaku juga untuk admin (tanpa bypass rutin).
6. **Linear history / no force-push** — tolak force-push ke `main`.

## Cara menerapkan (manual, butuh admin)

```bash
# Dari root repo, dalam keadaan login gh dengan akun admin:
./scripts/setup-branch-protection.sh
```

Skrip membuat satu ruleset repo-level bernama `protect-main` yang menargetkan branch `main` via `gh api`. Verifikasi:

```bash
gh api repos/nikamushi/heliora/rulesets --jq '.[].name'
```

Kondisi saat dokumen ini ditulis: ruleset **belum ada** (`[]`), sesuai keputusan "dokumen + skrip saja". Setelah CI `DEV-001` tersedia, required check `CI Gate` sudah tercantum di payload skrip dan tinggal diterapkan oleh maintainer berizin admin.

## Referensi

- SOP stage & gate: `docs/SOP-Issue-Workflow.md`
- Konvensi branch/commit/PR: `CONTRIBUTING.md`
