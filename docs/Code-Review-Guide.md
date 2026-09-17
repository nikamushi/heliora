# Panduan Slash Command `/code-review`

**Terkait Issue:** #12 (`SETUP-005`), Acceptance Criteria: *"Panduan slash command `/code-review` untuk self-review developer tercatat di repositori"*.
**Posisi dalam SOP:** dipakai pada transisi `Code Review → Waiting for Test` (lihat `docs/SOP-Issue-Workflow.md §5.3`).

## 1. Apa itu `/code-review`

`/code-review` adalah perintah review berbantuan (AI slash command atau perintah sepadan di tool yang dipakai tim) yang dijalankan developer **sebelum meminta peer-review**, untuk menangkap masalah umum lebih awal. Bila tool slash command tidak tersedia di environment kerja, ganti dengan **peer-review manual** memakai checklist yang sama — transisi stage tetap sah selama checklist §3 terpenuhi dan tercatat di PR.

## 2. Kapan menjalankannya

1. Gate lokal lolos (`pnpm lint`, `pnpm test`, `pnpm build`).
2. Jalankan `/code-review` terhadap diff branch → PR (`main...<branch>`).
3. Perbaiki temuan, ulangi gate lokal bila ada perubahan kode.
4. Cantumkan ringkasan hasil review di PR (temuan + tindak lanjut), lalu minta peer-review bila diperlukan.

## 3. Checklist Self-Review (wajib)

- [ ] **Kebenaran:** perubahan mengimplementasikan Acceptance Criteria issue; tidak ada klaim/fitur di luar scope.
- [ ] **Keamanan:** tidak ada secret, token, kredensial, atau data pribadi yang ter-commit; input tervalidasi; error tidak membocorkan informasi sensitif.
- [ ] **Kualitas kode:** mengikuti pola yang sudah ada di repo; tidak ada kode mati, `console.log`/debug sisa, atau TODO tanpa issue lanjutan.
- [ ] **Tes & build:** `pnpm lint`, `pnpm test`, `pnpm build` hijau; cakupan uji menyentuh area yang diubah.
- [ ] **Dokumentasi:** docs/template yang terdampak diperbarui; PR memakai format 5W1H dan menautkan issue.
- [ ] **Scope repo ini:** tidak memosisikan output estimasi/proyeksi sebagai diagnosis medis (prinsip produk HELIORA).

## 4. Contoh pemakaian

```text
/code-review --target main...chore/setup-005-implementasi-sop-alur-kerja-issue-template-github
```

Bila tool tidak mendukung argumen target, jalankan `/code-review` di konteks PR/branch aktif dan tempel ringkasannya ke deskripsi atau komentar PR.

## 5. Syarat lolos ke `Waiting for Test`

- Semua temuan `/code-review` ditindaklanjuti atau dicatat sebagai issue lanjutan yang disepakati.
- Semua thread diskusi review di-resolve, CI hijau.
- Fakta review tercatat: siapa yang me-review, kapan, dan dengan alat apa (`/code-review` atau peer-review manual).
