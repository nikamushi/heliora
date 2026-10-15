# RAG — Retrieval Pipeline (RAG-002)

Dokumen ini menjelaskan **retrieval pipeline** HELIORA: bagaimana query pengguna
diubah menjadi evidence klinis yang relevan beserta sumbernya. Cakupan dokumen
ini adalah **RAG-002** (retrieval); ingestion knowledge base adalah **RAG-001**,
generasi penjelasan LLM adalah **LLM-001**.

## 1. Tujuan dan Batasan

RAG digunakan untuk menyediakan evidence yang relevan terhadap recommendation,
explanation, dan preventive health information (Architecture §15.1, PRD §6.14,
PRD FR-027). Batasan arsitektur yang mengikat:

- **RAG bukan risk prediction engine** (Architecture §15.1).
- **RAG = Evidence Retrieval, LLM = Explanation** (ADR-008). Retrieval pipeline
  tidak memanggil LLM dan **tidak membutuhkan API key apa pun** (tidak ada
  `GEMINI_API_KEY`/kredensial eksternal). Kunci LLM hanya relevan untuk LLM-001.
- Provider vector database **tidak dikunci PRD** (Architecture §41, §15.5);
  pemilihan **ChromaDB** adalah implementation decision (ADR-010).

## 2. Alur Retrieval

```text
Query pengguna
      │
Query construction (embedding all-MiniLM-L6-v2, ternormalisasi)
      │
Similarity search (ChromaDB, jarak L2 → cosine similarity)
      │
Relevance filtering (threshold similarity, default 0.3)
      │
Source preservation (metadata evidence utuh per hit)
      │
Relevant Evidence + Source
```

### 2.1 Query construction

Query bahasa alami di-encode menjadi satu vektor embedding dengan
`SentenceTransformer("all-MiniLM-L6-v2")`, opsi `convert_to_numpy=True` dan
`normalize_embeddings=True` (`retrieval._get_query_model`,
`retrieval.search_evidence`). Model di-load malas (lazy) dan di-cache —
diuji oleh `test_query_model_lazy_singleton`.

### 2.2 Similarity search

Koleksi di-query dengan `n_results = top_k * 3` (kandidat berlebih, lalu
disaring), `include=["metadatas", "documents", "distances"]`. ChromaDB
mengembalikan **jarak L2**; karena query dan embedding tersimpan dinormalisasi
(vektor satuan), konversinya `cos_sim = 1 − d²/2`. Hasil diurut menurun lalu
dipotong ke `top_k`. Filter metadata opsional:

- `category` dinormalisasi ke huruf kecil (registry menyimpan `"activity"`, …);
- `rule_id` dinormalisasi ke huruf besar (registry menyimpan `"REC-ACT-01"`, …).

### 2.3 Relevance filtering

Hit dengan `similarity_score < threshold` dibuang. Default
`DEFAULT_SIMILARITY_THRESHOLD = 0.3`; threshold eksplisit menimpa default.
Koleksi kosong mengembalikan list kosong (bukan error).

### 2.4 Source preservation

Setiap hit membawa 14 field: `evidence_id`, `title`, `organization`, `year`,
`category`, `category_label`, `evidence_level`, `summary`, `clinical_section`,
`citation`, `external_url`, `rule_id`, `similarity_score`, `chunk_index`.
`summary` diambil dari baris `SUMMARY:` pada chunk (fallback 200 karakter
pertama). Bila metadata `evidence_id` hilang, fallback ke prefix doc-id
(`evi-NN`). `retrieval.get_source(evidence_id)` mengembalikan metadata penuh
satu item untuk sitasi/verifikasi, atau `None` bila tidak ditemukan (respons
aman, AC-LLM-02). Sistem **tidak mengarang sumber**: semua field berasal dari
metadata chunk/registry.

## 3. Metadata Chunk

Setiap chunk menyimpan metadata (`rag_pipeline.build_document_chunks`):
`evidence_id`, `rule_id`, `title`, `organization`, `year`, `category`,
`category_label`, `evidence_level`, `summary`, `clinical_section`, `citation`,
`external_url`, `chunk_index`, `total_chunks` — memenuhi metadata minimal
Architecture §15.4 (`document_id`, `title`, `publisher`, `source_url`,
`publication_date`, `category`, `evidence_level`, `chunk_id`).

## 4. Retrieval Testing

Pengujian deterministik dan offline (`apps/api/tests/test_retrieval.py`,
18 test): fake embedding model + fake collection di-inject, sehingga **tanpa
unduh model, tanpa network, tanpa KB ter-ingest**. Tercakup: konstruksi query,
konversi cosine, batas threshold, pengurutan + `top_k`, where-filter,
stabilitas query berulang, kelengkapan 14 field source, `get_source`,
harness `test_retrieval()` (5 query kategori), dan integrasi metadata untuk
**seluruh 18 item** `CLINICAL_EVIDENCE_REGISTRY` (AC "Source tetap tersedia").

Harness CLI `retrieval.test_retrieval()` (5 query Indonesia lintas kategori
activity/cardiovascular/sleep/nutrition/stress) tetap tersedia untuk smoke
manual setelah KB di-ingest — bukan bagian CI.

## 5. Batasan Saat Ini

- Knowledge base **belum di-ingest** (`app/data/rag_storage` belum ada,
  gitignored) dan bobot `all-MiniLM-L6-v2` belum diunduh → retrieval live
  membutuhkan langkah ingestion manual (di luar CI).
- Retrieval pipeline **belum ter-wire ke API** (tidak ada route/service yang
  memakainya) — offline/CLI, sama seperti RAG-001.
- Tanpa LLM: grounding untuk LLM-001 disiapkan lewat `search_evidence` +
  `get_source` (AC-LLM-02: retrieval sebelum generation, referensi evidence,
  tidak mengklaim sumber yang tidak tersedia).

## 6. Kesesuaian Kotak RAG-002

| Kotak TASK.md RAG-002 | Bukti |
|---|---|
| Query construction | `search_evidence` + `test_search_embeds_query_with_normalized_embeddings` |
| Similarity search | konversi cosine + `test_cosine_conversion_from_l2_distance`, sort + top_k |
| Relevance filtering | threshold 0.3 + `test_below_threshold_results_are_dropped`, custom threshold |
| Source preservation | 14 field hit + `get_source` + integrasi 18 item registry |
| Retrieval testing | `tests/test_retrieval.py` (18 passed), harness `test_retrieval()` |

## 7. Referensi

- Architecture §15 RAG Architecture (§15.1 tujuan, §15.2 knowledge base,
  §15.3 pipeline, §15.4 metadata, §15.5 vector storage), §33.4 RAG Tests,
  §41 (provider tidak dikunci), ADR-008, ADR-010.
- PRD §6.14 RAG Knowledge Base, FR-027 Evidence Retrieval, FR-028, FR-029,
  §15.13 AC-EVIDENCE-01, §15.14 AC-LLM-02.
- Kode: `apps/api/app/ai/retrieval.py`, `apps/api/app/ai/rag_pipeline.py`,
  `apps/api/app/services/evidence_service.py`, `apps/api/tests/test_retrieval.py`.
- TASK.md RAG-002 (P0, S7).
