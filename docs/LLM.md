# LLM — Explanation Pipeline (LLM-001)

Dokumen ini menjelaskan **explanation pipeline** HELIORA: bagaimana hasil
asesmen (risk result + faktor SHAP + rekomendasi + retrieved evidence) diubah
menjadi penjelasan berbahasa Indonesia yang mudah dipahami. Cakupan dokumen
ini adalah **LLM-001** (7 kotak TASK.md); knowledge base adalah **RAG-001**,
retrieval adalah **RAG-002**.

## 1. Tujuan dan Batasan

LLM hanya lapisan penjelasan/presentation (Architecture §16.1, PRD FR-030,
BR-LLM-002). Batasan arsitektur yang mengikat:

- **LLM bukan risk engine** (BR-LLM-001, AC-LLM-01): tidak menghitung atau
  mengubah risk score; output tidak memiliki field skor (by design).
- **LLM tidak boleh**: menentukan diagnosis, memberi resep/rencana pengobatan,
  menimpa rule rekomendasi, atau mengarang evidence (Architecture §16.3,
  §39.3, BR-LLM-004).
- **LLM non-blocking** (BR-LLM-000, Architecture §16.4): core asesmen, XAI,
  dan rekomendasi tetap jalan tanpa LLM; tanpa key → fallback deterministik.
- Keselamatan medis (Design §2.4, AGENTS.md): tidak pernah menyatakan pengguna
  "memiliki penyakit X"; istilah "estimasi risiko", bukan probabilitas mutlak.
- Disclaimer statutori tampil kata-per-kata di setiap penjelasan (Design
  §2.6, PRD FR-005).
- Provider: **Gemini API** (keputusan ADR-009); pipeline tidak butuh key
  untuk diuji — seluruh test offline.

## 2. Alur Explanation

```text
Risk Result
      ↓
SHAP Factors
      ↓
Recommendation
      ↓
Retrieved Evidence (RAG, sebelum generation — AC-LLM-02)
      ↓
Prompt Builder (system prompt + context terstruktur)
      ↓
LLM (Gemini generateContent)
      ↓
Response Validation + Guardrail
      ↓
Human-Friendly Explanation  ATAU  Fallback deterministik
```

## 3. Prompt & Context

`app/ai/explanation_prompt.py`:

- `SYSTEM_PROMPT` — peran explanation layer + 6 aturan mutlak (bukan
  diagnosis, tidak menghitung/mengubah skor, tidak mengganti rekomendasi,
  tidak mengarang evidence, kutipan `[evi-NN]` hanya dari konteks, Bahasa
  Indonesia sederhana) + kewajiban disclaimer kata-per-kata.
- `build_explanation_context()` — merakit risks + factors + recommendations
  + evidence menjadi satu struktur (`risks`, `factors`, `recommendations`,
  `evidence`, `evidence_ids`).
- `build_user_message()` — render konteks menjadi pesan user berlabel
  ("Estimasi risiko:", "Faktor yang berkontribusi:", "Rekomendasi sistem:",
  "Evidence yang diambil:"); bila KB kosong, pesan eksplisit melarang kutipan.
- `ExplanationOutput` — schema JSON output (`ringkasan`, `penjelasan_faktor`,
  `rekomendasi`, `kutipan_evidence`); **tanpa field skor/diagnosis**.
- `validate_llm_output()` — tolak bila: bukan JSON, schema invalid, section
  kosong, kutipan di luar `evidence_ids`, atau mengandung pola terlarang
  (diagnosis/resep/penyakit/dosis/klaim kepastian).

## 4. Generation & Guardrail

`app/ai/llm_client.py` — `GeminiClient` async via `httpx` ke
`.../models/{model}:generateContent` (`generationConfig`: temperature 0.3,
maxOutputTokens 1024; tanpa parameter thinking agar kompatibel semua model).
Setiap kegagalan (tanpa key, timeout, 429/5xx, respons kosong/malformed)
dipetakan ke `LLMUnavailableError`. Key via header `x-goog-api-key`, tidak
pernah di-log.

`app/services/explanation_service.py` — `explain_assessment()`:

1. Tanpa key → langsung fallback (tanpa retrieval, tanpa network).
2. Turunkan query dari label faktor + judul rekomendasi; panggil
   `retrieval.search_evidence(query, top_k=3)` per query, dedup per
   `evidence_id` (retrieval **sebelum** generation — AC-LLM-02).
3. Generate → validasi + guardrail → teks LLM + `evidence_refs`;
   gagal di titik mana pun → fallback dengan evidence yang sudah diambil.
4. Teks LLM dirender: ringkasan + faktor + rekomendasi + daftar "Sumber
   evidence" (judul — organisasi, tahun) + disclaimer (BR-LLM-005: sitasi
   dapat ditelusuri lewat Evidence Center).

## 5. Fallback

`build_fallback_explanation()` — template deterministik dari data terstruktur:
estimasi risiko per kondisi, faktor utama, rekomendasi, evidence pendukung
(hanya yang diberikan — tidak mengarang), + disclaimer. BR-LLM-000:
fallback tidak membuat klaim kesehatan baru dan tidak mengekspos error
internal. AC-LLM-01: fallback tersedia dan tidak mengarang evidence atau
recommendation baru.

## 6. Testing

Pengujian deterministik dan offline (`apps/api/tests/test_explanation.py`,
23 test): fake httpx `MockTransport` untuk Gemini + monkeypatch retrieval,
sehingga **tanpa API key, tanpa network, tanpa KB ter-ingest**. Tercakup
(Architecture §33.5): explanation generation, context adherence, no risk
score modification (schema tanpa field skor), no diagnosis claims
(parametrized frasa diagnosis/resep), evidence-grounded response (kutipan
halu `evi-99` ditolak), fallback (tanpa key tanpa network, timeout, 429,
500, output invalid, KB kosong → respons aman tanpa kutipan).

## 7. Batasan Saat Ini

- **Belum smoke live**: kualitas bahasa output Gemini nyata belum diuji
  (butuh `GEMINI_API_KEY` di `apps/api/.env`); yang terbukti offline hanya
  kontrak, grounding, guardrail, dan fallback.
- Explanation service **belum ter-wire ke endpoint/API maupun assessment
  flow** — dipakai sebagai modul (endpoint di luar scope LLM-001).
- Tanpa validasi klinis: hasil smoke live dicatat apa adanya saat key tersedia.

## 8. Kesesuaian Kotak LLM-001

| Kotak TASK.md LLM-001 | Bukti |
|---|---|
| Prompt design | `SYSTEM_PROMPT` + `test_system_prompt_*` |
| Context construction | `build_explanation_context` + `test_context_contains_all_inputs` |
| RAG integration | retrieval-sebelum-generation + `test_retrieval_runs_before_generation` |
| Explanation generation | `GeminiClient.generate_text` + kontrak fake transport |
| Output validation | `validate_llm_output` + `test_malformed_output_rejected` |
| Hallucination guardrail | pola terlarang + cek kutipan + `test_*_rejected` |
| Fallback response | `build_fallback_explanation` + 5 skenario fallback |

## 9. Referensi

- Architecture §16 LLM Architecture (§16.1–§16.4), §33.5 LLM Tests, §39.3,
  §41, ADR-008, ADR-009 (`docs/ADR/ADR-009-llm-provider.md`), ADR-010.
- PRD §6.13 LLM-Assisted Explanation, FR-030/031/032, BR-LLM-000..005,
  §15.13–15.14 AC-LLM-01/02.
- Kode: `apps/api/app/ai/explanation_prompt.py`,
  `apps/api/app/ai/llm_client.py`,
  `apps/api/app/services/explanation_service.py`,
  `apps/api/app/core/config.py`, `apps/api/tests/test_explanation.py`.
- TASK.md LLM-001 (P0, S8).
