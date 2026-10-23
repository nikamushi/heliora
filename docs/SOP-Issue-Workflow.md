# SOP Alur Kerja Issue

**Dokumen:** Standard Operating Procedure (SOP) alur kerja issue.
**Terkait Issue:** #12 (`SETUP-005: Implementasi SOP Alur Kerja Issue & Template GitHub`).
**Sumber acuan repo:** `CONTRIBUTING.md` (branch, commit, PR), `docs/TASK.md` (status task), `.github/ISSUE_TEMPLATE/` (template issue), `docs/Branch-Protection-main.md` (proteksi `main`), `docs/Code-Review-Guide.md` (panduan `/code-review`).

> Keputusan yang dicatat: repo ini memakai **satu long-lived branch `main`** (tidak ada `develop`, lihat `CONTRIBUTING.md`). Setiap penyebutan `develop` pada issue/template lama harus dibaca sebagai `main`.

---

## 1. Diagram Stage

```text
To Do
  → Development
    → Code Review
      → Waiting for Test
        → Testing
          → Done
```

## 2. Definisi Stage & Peran

| Stage | Pemilik utama | Definisi | Keluaran |
| --- | --- | --- | --- |
| `To Do` | Developer (pengambil issue) | Issue sudah jelas (metadata + Acceptance Criteria lengkap) tetapi belum dikerjakan. | Issue berlabel `status:todo`, assignee terisi. |
| `Development` | Developer | Pengerjaan aktif di working branch hasil turunan `main`. | Branch `<type>/<task-id>-<one-line-description>`, commit mengikuti konvensi. |
| `Code Review` | Developer + Reviewer | Implementasi selesai, PR dibuka ke `main`, menunggu review. | PR dengan deskripsi 5W1H, gate lokal lolos, CI hijau. |
| `Waiting for Test` | Reviewer → QA | Review selesai, semua diskusi resolve, menunggu build siap diuji QA. | PR approved secara review, build/preview URL tersedia. |
| `Testing` | QA | QA memvalidasi setiap Acceptance Criteria satu per satu. | Hasil uji tercatat sebagai komentar PR. |
| `Done` | QA + Maintainer | Seluruh Acceptance Criteria lolos, PR di-squash-merge ke `main`. | Issue tertutup, label `status:done`. |

## 3. Mapping ke Status `docs/TASK.md`

`docs/TASK.md` memakai status `BACKLOG → READY → IN PROGRESS → REVIEW → TESTING → DONE`. Tabel ini memetakan kedua sistem agar tidak ada duplikasi makna:

| Stage Issue (SOP ini) | Status `TASK.md` | Catatan |
| --- | --- | --- |
| `To Do` | `READY` | Requirement dan dependency jelas, siap diambil. |
| `Development` | `IN PROGRESS` | Sedang dikerjakan di branch. |
| `Code Review` | `REVIEW` | Implementasi selesai, menunggu review. |
| `Waiting for Test` | `REVIEW` | Review selesai, menunggu build QA. Tetap `REVIEW` di `TASK.md` sampai QA mulai. |
| `Testing` | `TESTING` | QA sedang menguji. |
| `Done` | `DONE` | Acceptance Criteria terpenuhi, sudah merge. |

`BACKLOG` di `TASK.md` berada **sebelum** `To Do` (pekerjaan teridentifikasi tetapi requirement belum siap menjadi issue yang dapat dikerjakan).

## 4. Aturan Branch, Commit, dan PR

Mengikuti `CONTRIBUTING.md` secara penuh; ringkasannya:

- **Branch:** dari `main`, format `<type>/<task-id>-<one-line-description>` (contoh: `chore/setup-005-implementasi-sop-...`). Jangan memakai nama developer. Tidak ada branch `develop`.
- **Commit:** `<TASK-ID>.<CHILD-TASK-ID>: <imperative action>` dengan body `Why:` dan `How:` (contoh induk: `SETUP-005.01: ...`). Aktifkan hook lokal sekali per clone: `git config core.hooksPath .githooks`.
- **PR:** target `main`, judul `<TASK-ID>: <overall change>`, deskripsi 5W1H (`What/Why/Who/When/Where/How`) memakai `.github/pull_request_template.md`.

## 5. Gate Checklist Sebelum Ganti Stage

### 5.1 `To Do → Development`

- [ ] Issue sudah memiliki Type, Platform, Priority, Assignee, dan Acceptance Criteria (lihat template di `.github/ISSUE_TEMPLATE/`).
- [ ] Developer mengambil issue (assignee) dan membuat branch dari `main` terbaru.
- [ ] Nama branch mengikuti konvensi §4.

### 5.2 `Development → Code Review`

- [ ] Gate lokal lolos dari root monorepo:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  ```

  (Perintah tersedia via `turbo run`, lihat `package.json`. Jika workspace tertentu belum punya script tersebut, catat pengecualiannya di PR.)
  Gate Python dan mobile yang dijalankan CI ada di `docs/CI-CD.md`.
- [ ] Tidak ada secret/kredensial yang ter-commit (periksa `.env.example`, bukan `.env` asli).
- [ ] PR dibuka ke `main` dengan format standar (§4), menautkan issue (`Closes #<n>` bila PR menyelesaikan issue).

### 5.3 `Code Review → Waiting for Test`

- [ ] Review selesai: peer-review atau slash command `/code-review` untuk self-review developer (panduan: `docs/Code-Review-Guide.md`).
- [ ] Semua diskusi review di-resolve.
- [ ] CI hijau: required status check **`CI Gate`** pada proteksi `main` (lihat `docs/CI-CD.md`).

### 5.4 `Waiting for Test → Testing`

- [ ] Build siap diakses QA: `pnpm dev` lokal atau preview URL / build CI.
- [ ] QA diberi tahu (komentar PR) beserta daftar Acceptance Criteria yang harus diuji.

### 5.5 `Testing → Done`

- [ ] QA memvalidasi **seluruh** Acceptance Criteria satu per satu dan mencatat hasilnya sebagai komentar PR.
- [ ] QA approve PR; maintainer melakukan **squash-merge** ke `main` (lihat `docs/Branch-Protection-main.md`).
- [ ] Issue dipindah ke `Done` (label `status:done`) dan tertutup.

## 6. Template Issue

- Feature/Task: `.github/ISSUE_TEMPLATE/feature_task.md`
- Bug: `.github/ISSUE_TEMPLATE/bug_report.md`
- Template generik lama: `.github/ISSUE_TEMPLATE/task.md` (sudah dikoreksi ke alur `main`; gunakan dua template di atas bila memungkinkan)
- Pengaturan chooser: `.github/ISSUE_TEMPLATE/config.yml`

Kolom wajib di semua template: Type, Platform, Priority, Assignee, Acceptance Criteria.

## 7. Proteksi Branch & Review

- Proteksi `main` (wajib PR, CI hijau, squash merge): `docs/Branch-Protection-main.md` + skrip reproduksibel `scripts/setup-branch-protection.sh` (dijalankan manual oleh maintainer berizin admin; tidak diterapkan otomatis oleh perubahan ini).
- Panduan review: `docs/Code-Review-Guide.md`.
