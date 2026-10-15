# ADR-009 — LLM Provider

**Status:** Accepted (LLM-001).
**Scope:** Explanation layer backend (`app/ai/llm_client.py`,
`app/ai/explanation_prompt.py`, `app/services/explanation_service.py`).
**Tanggal:** 2026-10-15.

## Context

PRD dan Architecture tidak mengunci provider LLM (Architecture §41 —
implementation decision). LLM-001 membutuhkan provider untuk explanation
pipeline dengan batasan: explanation layer saja (Architecture §16.1, §39.3),
fallback wajib saat LLM gagal (BR-LLM-000, Architecture §16.4), dan target
latensi LLM + RAG < 5 detik (PERF, `docs/TASK.md` S9).

## Decision

1. **Gemini API** (key dari AI Studio, `GEMINI_API_KEY` via environment saja).
2. **Model default `gemini-3.5-flash-lite`** (dapat diganti via `GEMINI_MODEL`
   tanpa ubah kode). Alasan: task hanya menyusun ulang narasi dari konteks
   terstruktur (bukan penalaran berat), volume potensial tinggi, dan target
   latensi < 5 detik — model lite paling cepat dan termurah. Model yang
   dipertimbangkan lalu ditolak: `gemini-2.0-flash` (sudah shut down),
   `gemini-2.5-flash` (akses dibatasi pengguna lama; Google mengarahkan proyek
   baru ke 3.x), `gemini-3.5-flash`/`gemini-3.7-flash` (deprecated, auto-routed),
   `gemini-3.8-flash` (paling pintar tetapi default thinking `medium` → lebih
   banyak token, lebih lambat, lebih mahal; disimpan sebagai opsi naik kelas).
3. **Panggil REST langsung via `httpx`** (sudah dependency) — tanpa SDK baru.
   Tidak mengirim parameter thinking apa pun (hanya `temperature` +
   `maxOutputTokens`) agar ID model apa pun kompatibel (catatan: 3.8-flash
   menolak `thinking_level: minimal`).
4. **Key hanya dari environment** (`GEMINI_API_KEY`), dikirim via header
   `x-goog-api-key`, tidak pernah di-log atau di-commit. Nilai default
   `None` → layanan langsung memakai fallback deterministik (BR-LLM-000).

## Consequences

- **Konfigurasi:** `GEMINI_API_KEY` / `GEMINI_MODEL` / `LLM_TIMEOUT_SECONDS`
  di `app/core/config.py` + `apps/api/.env.example`. File `.env` mengikuti
  konvensi repo di `apps/api/.env` (gitignored); pindah ke root butuh
  perubahan `config.py` dan dicatat terpisah (bukan bagian ADR ini).
- **Ketahanan model:** ID model terpusat di satu default + env override;
   pergantian model tidak menyentuh kode pipeline.
- **Risiko:** perubahan lineup/deprecation model oleh Google (terbukti pada
   2.0/3.5/3.7) — mitigasi via override env + tidak memakai parameter
   spesifik-generasi (thinking); biaya/latensi model naik kelas harus diukur
   ulang terhadap target < 5 detik bila berganti model.
- **Bukan validasi klinis:** kualitas bahasa output model nyata belum diuji
   (butuh key) — smoke live dicatat terpisah saat key tersedia.

## References

- `docs/TASK.md` — LLM-001.
- `docs/Architecture.md` §16, §33.5, §39.3, §41–§43; `docs/LLM.md`.
- PRD FR-030/031/032, BR-LLM-000..005, AC-LLM-01/02.
- Gemini API docs — Models & deprecations (diakses 2026-10-15).
