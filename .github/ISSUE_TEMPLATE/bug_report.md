---
name: "Bug Report"
about: "Template untuk melaporkan bug mengikuti SOP alur kerja issue. Lihat docs/SOP-Issue-Workflow.md."
title: "bug(scope): description #TASK-ID"
labels: ["status:todo"]
assignees: ""
---

## 📋 Metadata (wajib)

- **Type:** Bug
- **Platform:** Web / Backend / Android / iOS
- **Priority:** P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
- **Assignee:** @username
- **Current Stage:** To Do

---

## 🐞 Deskripsi Bug

<!-- Ringkasan bug dalam 1-2 kalimat -->

---

## 🔁 Steps to Reproduce

1. Langkah 1
2. Langkah 2
3. Langkah 3

---

## ✅ Expected vs ❌ Actual

- **Expected:** <!-- perilaku yang diharapkan -->
- **Actual:** <!-- perilaku yang terjadi -->

---

## 🖥️ Environment

- **Branch/commit:**
- **OS / Browser / Device:**
- **Data / akun uji (tanpa kredensial asli):**

---

## ✅ Acceptance Criteria (wajib, diuji QA satu per satu)

- [ ] Bug tidak lagi dapat direproduksi dengan langkah di atas.
- [ ] Tidak ada regresi pada area terkait (sebutkan area yang diuji).
- [ ] Kriteria tambahan 1

---

## 🚦 Gate Checklist Sebelum Ganti Stage

- [ ] **To Do → Development:** Issue sudah diambil developer & branch dibuat dari `main` (`<type>/<task-id>-<one-line-description>`, lihat `CONTRIBUTING.md`).
- [ ] **Development → Code Review:** Gate lokal lolos (`pnpm lint`, `pnpm test`, `pnpm build`), PR dibuka ke `main` dengan format standar.
- [ ] **Code Review → Waiting for Test:** Review selesai (peer-review atau `/code-review`, lihat `docs/Code-Review-Guide.md`), semua diskusi di-resolve, CI hijau.
- [ ] **Waiting for Test → Testing:** Build siap diakses QA (`pnpm dev` lokal / preview URL / build CI).
- [ ] **Testing → Done:** QA approve PR di GitHub dengan catatan hasil uji, lalu squash-merge ke `main`.
