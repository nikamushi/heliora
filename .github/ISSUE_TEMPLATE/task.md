---
name: "Task / Feature / Bug"
about: "Template issue mengikuti alur kerja standar SOP (To Do → Development → Code Review → Waiting for Test → Testing → Done)"
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
- [ ] **To Do → Development:** Issue sudah diambil developer & branch dibuat dari `develop` (`SG-xxx` atau `type/task-id`).
- [ ] **Development → Code Review:** Gate lokal lolos (`pnpm lint`, `pnpm test`, `pnpm build`), PR dibuka ke `develop`.
- [ ] **Code Review → Waiting for Test:** Review selesai (peer-review atau `/code-review`), semua diskusi di-resolve, CI hijau.
- [ ] **Waiting for Test → Testing:** Build siap diakses QA (`bun dev` lokal / build CI).
- [ ] **Testing → Done:** QA approve PR di GitHub dengan catatan hasil uji, lalu squash-merge ke `develop`.
