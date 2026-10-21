"""HELIORA API - tests for RAG retrieval pipeline (RAG-002).

Offline/deterministic: injects a fake embedding model and a fake ChromaDB
collection, so no model download, no network, and no persisted KB is needed.

Covers (TASK.md RAG-002, PRD FR-027, AC-EVIDENCE-01, AC-LLM-02):
- Query construction (embedding call contract)
- Similarity search (cosine conversion, ordering, top_k)
- Relevance filtering (threshold boundary, custom threshold)
- Source preservation (hit keys, citation/url, get_source, registry metadata)
"""

import numpy as np
import pytest

from app.ai import retrieval
from app.ai.rag_pipeline import build_document_chunks
from app.services.evidence_service import CLINICAL_EVIDENCE_REGISTRY


# ── Fakes ──────────────────────────────────────────────────────────────────
class _FakeModel:
    """Deterministic stub for SentenceTransformer."""

    def __init__(self, *args, **kwargs):
        self.encode_calls: list[dict] = []

    def encode(self, texts, convert_to_numpy=False, normalize_embeddings=False, **kwargs):
        self.encode_calls.append(
            {
                "texts": list(texts),
                "convert_to_numpy": convert_to_numpy,
                "normalize_embeddings": normalize_embeddings,
            }
        )
        return np.array([[0.5, 0.5, 0.5, 0.5]])


class _FakeCollection:
    """Programmable stub for a ChromaDB collection."""

    def __init__(self, query_result=None, get_result=None, count_value=0):
        self._query_result = query_result or {"ids": [[]], "distances": [[]]}
        self._get_result = get_result or {"ids": []}
        self._count_value = count_value
        self.query_calls: list[dict] = []
        self.get_calls: list[dict] = []

    def query(self, **kwargs):
        self.query_calls.append(kwargs)
        return self._query_result

    def get(self, **kwargs):
        self.get_calls.append(kwargs)
        return self._get_result

    def count(self):
        return self._count_value


def _meta(evidence_id="evi-01", **overrides):
    base = {
        "evidence_id": evidence_id,
        "rule_id": "REC-ACT-01",
        "title": "WHO Guidelines on Physical Activity",
        "organization": "World Health Organization (WHO)",
        "year": "2020",
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "evidence_level": "Level A (Kuat)",
        "clinical_section": "Chapter 3: Recommendations for Adults",
        "citation": "Bull FC, et al. Br J Sports Med 2020;54:1451-1462.",
        "external_url": "https://www.who.int/publications/i/item/9789240015128",
        "summary": "Aktivitas aerobik minimal 150 menit per minggu.",
        "chunk_index": 0,
    }
    base.update(overrides)
    return base


def _query_result(ids, distances, metas, docs):
    return {
        "ids": [ids],
        "distances": [distances],
        "metadatas": [metas],
        "documents": [docs],
    }


@pytest.fixture
def wired(monkeypatch):
    """Patch retrieval module globals with fakes; returns (model, collection)."""
    model = _FakeModel()
    collection = _FakeCollection()
    monkeypatch.setattr(retrieval, "_get_embedding_model", lambda: model)
    monkeypatch.setattr(retrieval, "_get_collection", lambda: collection)
    return model, collection


# ── Query construction ─────────────────────────────────────────────────────
def test_query_embeddings_share_pipeline_model_loader():
    """Retrieval embeds queries via rag_pipeline's shared model singleton."""
    from app.ai import rag_pipeline

    assert retrieval._get_embedding_model is rag_pipeline._get_embedding_model


def test_search_embeds_query_with_normalized_embeddings(wired):
    """Query construction: encode([query], numpy, normalized)."""
    model, _ = wired

    retrieval.search_evidence("berapa lama tidur yang sehat")

    assert len(model.encode_calls) == 1
    call = model.encode_calls[0]
    assert call["texts"] == ["berapa lama tidur yang sehat"]
    assert call["convert_to_numpy"] is True
    assert call["normalize_embeddings"] is True


def test_search_queries_collection_with_overfetch(wired):
    """Collection queried with single embedding vector and n_results=top_k*3."""
    model, collection = wired

    retrieval.search_evidence("aktivitas fisik jantung", top_k=4)

    assert len(collection.query_calls) == 1
    call = collection.query_calls[0]
    assert len(call["query_embeddings"]) == 1
    assert call["n_results"] == 12
    assert call["include"] == ["metadatas", "documents", "distances"]
    assert call["where"] is None


# ── Similarity search ──────────────────────────────────────────────────────
def test_cosine_conversion_from_l2_distance(wired):
    """L2 distance converts to cosine via cos = 1 - d^2/2 (normalized vectors)."""
    _, collection = wired
    # d=0 -> 1.0 ; d=1 -> 0.5 ; d=1.3 -> 0.155
    collection._query_result = _query_result(
        ids=["evi-01-chunk-0", "evi-02-chunk-0", "evi-03-chunk-0"],
        distances=[0.0, 1.0, 1.3],
        metas=[_meta("evi-01"), _meta("evi-02"), _meta("evi-03")],
        docs=["SUMMARY: a", "SUMMARY: b", "SUMMARY: c"],
    )

    hits = retrieval.search_evidence("q", threshold=0.0)

    scores = {h["evidence_id"]: h["similarity_score"] for h in hits}
    assert scores == {"evi-01": 1.0, "evi-02": 0.5, "evi-03": 0.155}


def test_results_sorted_descending_and_truncated_to_top_k(wired):
    """Hits sorted by similarity desc, then sliced to top_k."""
    _, collection = wired
    collection._query_result = _query_result(
        ids=["evi-01-chunk-0", "evi-02-chunk-0", "evi-03-chunk-0"],
        distances=[1.2, 0.2, 0.8],  # cos: 0.28, 0.98, 0.68
        metas=[_meta("evi-01"), _meta("evi-02"), _meta("evi-03")],
        docs=["SUMMARY: a", "SUMMARY: b", "SUMMARY: c"],
    )

    hits = retrieval.search_evidence("q", top_k=2, threshold=0.0)

    assert [h["evidence_id"] for h in hits] == ["evi-02", "evi-03"]


def test_empty_collection_returns_empty_list(wired):
    """No candidates -> empty list, not an error."""
    assert retrieval.search_evidence("q") == []


# ── Relevance filtering ────────────────────────────────────────────────────
def test_default_similarity_threshold_is_0_3():
    """DEFAULT_SIMILARITY_THRESHOLD = 0.3 (Architecture §33.4 relevance)."""
    assert retrieval.DEFAULT_SIMILARITY_THRESHOLD == 0.3
    assert retrieval.search_evidence.__defaults__[-1] == 0.3


def test_below_threshold_results_are_dropped(wired):
    """Candidates below threshold are filtered; boundary (>=) is kept."""
    _, collection = wired
    # cos: 0.98 (keep), 0.2999 (drop at default 0.3), 0.28 (drop)
    collection._query_result = _query_result(
        ids=["evi-01-chunk-0", "evi-02-chunk-0", "evi-03-chunk-0"],
        distances=[0.2, 2 * (1 - 0.2999) ** 0.5, 1.2],
        metas=[_meta("evi-01"), _meta("evi-02"), _meta("evi-03")],
        docs=["SUMMARY: a", "SUMMARY: b", "SUMMARY: c"],
    )

    hits = retrieval.search_evidence("q")

    assert [h["evidence_id"] for h in hits] == ["evi-01"]


def test_custom_threshold_is_honored(wired):
    """Explicit threshold overrides the default (AC relevance tunable)."""
    _, collection = wired
    collection._query_result = _query_result(
        ids=["evi-01-chunk-0", "evi-02-chunk-0"],
        distances=[0.2, 1.2],  # cos: 0.98, 0.28
        metas=[_meta("evi-01"), _meta("evi-02")],
        docs=["SUMMARY: a", "SUMMARY: b"],
    )

    assert len(retrieval.search_evidence("q", threshold=0.0)) == 2
    assert len(retrieval.search_evidence("q", threshold=0.99)) == 0


def test_where_filter_category_lowercased_and_rule_id_uppercase(wired):
    """Category normalized lower; rule_id normalized to registry case (REC-*)."""
    _, collection = wired

    retrieval.search_evidence("q", category="Activity", rule_id="rec-act-01")

    where = collection.query_calls[0]["where"]
    assert where == {"category": "activity", "rule_id": "REC-ACT-01"}


def test_repeated_search_is_stable(wired):
    """Repeated identical queries return identical results (AC-LLM-02 grounding)."""
    _, collection = wired
    collection._query_result = _query_result(
        ids=["evi-01-chunk-0"],
        distances=[0.2],
        metas=[_meta("evi-01")],
        docs=["SUMMARY: a"],
    )

    first = retrieval.search_evidence("q")
    second = retrieval.search_evidence("q")

    assert first == second


# ── Source preservation ────────────────────────────────────────────────────
EXPECTED_HIT_KEYS = {
    "evidence_id",
    "title",
    "organization",
    "year",
    "category",
    "category_label",
    "evidence_level",
    "summary",
    "clinical_section",
    "citation",
    "external_url",
    "rule_id",
    "similarity_score",
    "chunk_index",
}


def test_hit_preserves_full_source_metadata(wired):
    """Every hit carries source fields incl. citation + external_url (no fabrication)."""
    _, collection = wired
    collection._query_result = _query_result(
        ids=["evi-01-chunk-0"],
        distances=[0.2],
        metas=[_meta("evi-01")],
        docs=["TITLE: x\n\nSUMMARY: ringkasan dari chunk"],
    )

    (hit,) = retrieval.search_evidence("q")

    assert set(hit) == EXPECTED_HIT_KEYS
    assert hit["evidence_id"] == "evi-01"
    assert hit["title"] == "WHO Guidelines on Physical Activity"
    assert hit["organization"] == "World Health Organization (WHO)"
    assert hit["year"] == 2020
    assert hit["summary"] == "ringkasan dari chunk"
    assert hit["citation"] == "Bull FC, et al. Br J Sports Med 2020;54:1451-1462."
    assert hit["external_url"] == "https://www.who.int/publications/i/item/9789240015128"
    assert hit["rule_id"] == "REC-ACT-01"
    assert hit["similarity_score"] == round(1.0 - 0.2**2 / 2.0, 4)


def test_evidence_id_falls_back_to_chunk_doc_id(wired):
    """Missing evidence_id metadata falls back to doc_id prefix (evi-NN)."""
    _, collection = wired
    meta = _meta()
    del meta["evidence_id"]
    collection._query_result = _query_result(
        ids=["evi-07-chunk-2"], distances=[0.2], metas=[meta], docs=["SUMMARY: x"]
    )

    (hit,) = retrieval.search_evidence("q")

    assert hit["evidence_id"] == "evi-07"


def test_extract_summary_from_chunk_prefers_summary_line():
    """SUMMARY: line extracted; fallback is first 200 chars."""
    chunk = "TITLE: t\nAUTHOR: a\n\nSUMMARY:  inti sari evidence  \n\nCITATION: c"
    assert retrieval._extract_summary_from_chunk(chunk) == "inti sari evidence"

    long_text = "x" * 300
    assert retrieval._extract_summary_from_chunk(long_text) == "x" * 200


def test_get_source_returns_full_metadata(wired):
    """get_source preserves title/org/citation/url for citation & verification."""
    _, collection = wired
    collection._get_result = {
        "ids": ["evi-01-chunk-0"],
        "metadatas": [_meta("evi-01")],
        "documents": ["SUMMARY: s"],
    }

    source = retrieval.get_source("evi-01")

    assert source is not None
    assert source["evidence_id"] == "evi-01"
    assert source["title"] == "WHO Guidelines on Physical Activity"
    assert source["organization"] == "World Health Organization (WHO)"
    assert source["citation"] == "Bull FC, et al. Br J Sports Med 2020;54:1451-1462."
    assert source["external_url"].startswith("http")
    assert source["rule_id"] == "REC-ACT-01"


def test_get_source_missing_returns_none(wired):
    """Unknown evidence_id -> None (safe response, AC-LLM-02)."""
    assert retrieval.get_source("evi-99") is None


def test_registry_chunks_preserve_source_for_all_items():
    """Source tetap tersedia: every registry item chunks keep id/rule/cite/url."""
    assert len(CLINICAL_EVIDENCE_REGISTRY) >= 15

    for item in CLINICAL_EVIDENCE_REGISTRY:
        chunks = build_document_chunks(item)
        assert len(chunks) >= 1
        for chunk in chunks:
            meta = chunk["metadata"]
            assert meta["evidence_id"] == item["id"]
            assert meta["rule_id"] == item["rule_id"]
            assert meta["citation"] == item["citation"]
            assert meta["external_url"] == item["external_url"]
            assert meta["summary"] == item["summary"]
            assert meta["clinical_section"] == item["clinical_section"]


# ── Retrieval testing harness ──────────────────────────────────────────────
def test_retrieval_harness_structure(monkeypatch):
    """test_retrieval() runs 5 category queries and reports kb status."""
    calls = []

    def fake_search(query, top_k=3, category=None):
        calls.append((query, top_k, category))
        return [{"similarity_score": 0.9, "title": "t"}]

    collection = _FakeCollection(count_value=42)
    monkeypatch.setattr(retrieval, "search_evidence", fake_search)
    monkeypatch.setattr(retrieval, "_get_collection", lambda: collection)

    report = retrieval.test_retrieval()

    assert report["test_count"] == 5
    assert {c for _, _, c in calls} == {
        "activity",
        "cardiovascular",
        "sleep",
        "nutrition",
        "stress",
    }
    assert all(top_k == 3 for _, top_k, _ in calls)
    assert report["kb_status"] == {"document_count": 42}
    for row in report["results"]:
        assert row["retrieved_count"] == 1
        assert row["avg_similarity"] == 0.9
