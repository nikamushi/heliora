---
name: "Task / Feature / Bug"
about: "Template issue generik mengikuti SOP alur kerja standar (To Do → Development → Code Review → Waiting for Test → Testing → Done). Untuk kasus baru, gunakan template Feature / Task atau Bug Report. Lihat docs/SOP-Issue-Workflow.md."
title: "type(scope): description #TASK-ID"
labels: ["status:todo"]
assignees: ""
---

## 📋 Metadata
- **Type:** Feature / Bug / Task
- **Platform:** Web / Backend / Android / iOS
- **Priority:** P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
- **Assignee:** @username
- **Current Stage:** To Do

---

## 🎯 Objective & Scope
<!-- Jelaskan apa yang ingin dicapai, latar belakang singkat, dan dampaknya -->

---

## ✅ Acceptance Criteria (Wajib Diuji QA Satu per Satu)
- [ ] Kriteria 1
- [ ] Kriteria 2
- [ ] Kriteria 3

---

## 🚦 Gate Checklist Sebelum Ganti Stage
- [ ] **To Do → Development:** Issue sudah diambil developer & branch dibuat dari `main` (`<type>/<task-id>-<one-line-description>`, lihat `CONTRIBUTING.md`).
- [ ] **Development → Code Review:** Gate lokal lolos (`pnpm lint`, `pnpm test`, `pnpm build`), PR dibuka ke `main` dengan format standar.
- [ ] **Code Review → Waiting for Test:** Review selesai (peer-review atau `/code-review`, lihat `docs/Code-Review-Guide.md`), semua diskusi di-resolve, CI hijau.
- [ ] **Waiting for Test → Testing:** Build siap diakses QA (`pnpm dev` lokal / preview URL / build CI).
- [ ] **Testing → Done:** QA approve PR di GitHub dengan catatan hasil uji, lalu squash-merge ke `main`.
