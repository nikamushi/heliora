"""HELIORA API - tests for RAG knowledge base pipeline (RAG-001).

Offline/deterministic: injects a fake embedding model and fake ChromaDB
objects, so no model download, no network, and no persisted KB is needed.

Covers (TASK.md RAG-001, PRD §6.14, Architecture §15.2/§15.3/§15.4/§15.5):
- Document ingestion (full ingest, skip-when-populated, reset/re-ingest)
- Document cleaning (whitespace normalization)
- Chunking (size/overlap math, single-chunk, boundaries)
- Embedding generation (encode call contract)
- Vector storage (add call contract, lazy persist-dir creation)
- Metadata storage (chunk ids, total_chunks, 14-field metadata, registry sweep)
- CLI (ingest/status/reset subcommands, exit codes)
"""

import numpy as np
import pytest

from app.ai import rag_pipeline as rp
from app.services.evidence_service import CLINICAL_EVIDENCE_REGISTRY


# ── Fakes ──────────────────────────────────────────────────────────────────
class _FakeModel:
    """Deterministic stub for SentenceTransformer."""

    def __init__(self):
        self.encode_calls: list[dict] = []

    def encode(self, texts, **kwargs):
        self.encode_calls.append({"texts": list(texts), "kwargs": kwargs})
        return np.zeros((len(texts), 4))


class _FakeCollection:
    """Programmable stub for a ChromaDB collection."""

    def __init__(self, count_value=0):
        self._count_value = count_value
        self.add_calls: list[dict] = []

    def count(self):
        return self._count_value

    def add(self, **kwargs):
        self.add_calls.append(kwargs)
        self._count_value = len(kwargs["ids"])


class _FakeClient:
    """Stub for chromadb.PersistentClient (delete only)."""

    def __init__(self):
        self.deleted: list[str] = []

    def delete_collection(self, name):
        self.deleted.append(name)


@pytest.fixture
def fakes(monkeypatch):
    """Patch pipeline globals with fakes; returns (model, collection, client)."""
    model = _FakeModel()
    collection = _FakeCollection()
    client = _FakeClient()
    monkeypatch.setattr(rp, "_get_embedding_model", lambda: model)
    monkeypatch.setattr(rp, "_get_collection", lambda: collection)
    monkeypatch.setattr(rp, "_get_client", lambda: client)
    return model, collection, client


# ── Document cleaning ──────────────────────────────────────────────────────
def test_clean_document_normalizes_whitespace():
    """Strip + collapse all whitespace runs (incl. newlines/tabs) to spaces."""
    assert rp.clean_document("  hello\n\n  world \t\n test  ") == "hello world test"


def test_clean_document_empty_stays_empty():
    assert rp.clean_document("   \n\t  ") == ""


# ── Chunking ───────────────────────────────────────────────────────────────
def test_chunk_text_single_chunk_when_short():
    """Text shorter than chunk_size returns one cleaned chunk."""
    assert rp.chunk_text("  hello   world  ") == ["hello world"]


def test_chunk_text_exact_size_is_single_chunk():
    text = "x" * rp.CHUNK_SIZE
    assert rp.chunk_text(text) == [text]


def test_chunk_text_overlap_math():
    """Second chunk starts at chunk_size - overlap (sliding window)."""
    text = "abcdefghij" * 60  # 600 chars
    chunks = rp.chunk_text(text)

    assert len(chunks) == 2
    assert chunks[0] == text[: rp.CHUNK_SIZE]
    assert chunks[1] == text[rp.CHUNK_SIZE - rp.CHUNK_OVERLAP :]
    assert len(chunks[1]) == 600 - (rp.CHUNK_SIZE - rp.CHUNK_OVERLAP)


def test_chunk_text_custom_size_and_no_overlap():
    chunks = rp.chunk_text("0123456789", chunk_size=4, overlap=0)
    assert chunks == ["0123", "4567", "89"]


def test_chunk_text_covers_full_text_without_gaps():
    """Every char of the input appears in at least one chunk."""
    text = "z" * 1500
    chunks = rp.chunk_text(text)
    assert chunks[0][0] == "z" and chunks[-1][-1] == "z"
    offset = 0
    for chunk in chunks:
        assert text[offset : offset + len(chunk)] in text
        offset += rp.CHUNK_SIZE - rp.CHUNK_OVERLAP
    assert offset >= len(text)


# ── Metadata storage ───────────────────────────────────────────────────────
EXPECTED_CHUNK_METADATA_KEYS = {
    "evidence_id",
    "rule_id",
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
    "chunk_index",
    "total_chunks",
}


def _long_evidence():
    return {
        "id": "evi-99",
        "rule_id": "REC-TST-01",
        "title": "Long Test Guideline",
        "organization": "Test Org",
        "year": 2024,
        "evidence_level": "Level B",
        "category": "sleep",
        "category_label": "Tidur",
        "summary": "satu kata. " * 200,
        "clinical_section": "Bab Uji",
        "citation": "Test Citation 2024.",
        "external_url": "https://example.org/test",
    }


def test_build_document_chunks_ids_and_indexing():
    """Chunk ids follow evi-NN-chunk-i with sequential index + total."""
    chunks = rp.build_document_chunks(_long_evidence())

    assert len(chunks) >= 2
    for i, chunk in enumerate(chunks):
        assert chunk["id"] == f"evi-99-chunk-{i}"
        assert set(chunk["metadata"]) == EXPECTED_CHUNK_METADATA_KEYS
        assert chunk["metadata"]["chunk_index"] == i
        assert chunk["metadata"]["total_chunks"] == len(chunks)


def test_build_document_chunks_preserves_source_fields():
    """Summary/clinical_section/citation/url carried into chunk metadata."""
    chunks = rp.build_document_chunks(_registry_first())
    assert len(chunks) >= 1
    chunk = chunks[0]

    assert chunk["metadata"]["evidence_id"] == "evi-01"
    assert chunk["metadata"]["rule_id"] == "REC-ACT-01"
    assert chunk["metadata"]["summary"].startswith("Aktivitas aerobik")
    assert chunk["metadata"]["clinical_section"].startswith("Chapter 3")
    assert chunk["metadata"]["citation"].startswith("Bull FC")
    assert chunk["metadata"]["external_url"].startswith("https://")


def _registry_first():
    return CLINICAL_EVIDENCE_REGISTRY[0]


def test_registry_all_items_produce_valid_chunks():
    """Every registry item yields >=1 uniquely-id'd chunk (KB coverage)."""
    assert len(CLINICAL_EVIDENCE_REGISTRY) >= 15

    seen_ids: set[str] = set()
    for item in CLINICAL_EVIDENCE_REGISTRY:
        chunks = rp.build_document_chunks(item)
        assert len(chunks) >= 1
        for chunk in chunks:
            assert chunk["id"] not in seen_ids
            seen_ids.add(chunk["id"])


# ── Embedding generation ───────────────────────────────────────────────────
def test_ingest_encodes_all_chunk_texts(fakes):
    """Encode receives every chunk text with numpy output requested."""
    model, _, _ = fakes

    count = rp.ingest_all_evidence()

    assert count > 0
    assert len(model.encode_calls) == 1
    call = model.encode_calls[0]
    assert len(call["texts"]) == count
    assert call["kwargs"]["convert_to_numpy"] is True


# ── Vector storage ─────────────────────────────────────────────────────────
def test_ingest_stores_vectors_documents_and_metadata(fakes):
    """collection.add receives aligned embeddings/documents/metadatas/ids."""
    _, collection, _ = fakes

    count = rp.ingest_all_evidence()

    assert len(collection.add_calls) == 1
    call = collection.add_calls[0]
    assert len(call["ids"]) == count
    assert len(call["documents"]) == count
    assert len(call["metadatas"]) == count
    assert len(call["embeddings"]) == count
    assert call["ids"][0].endswith("-chunk-0")


def test_ingest_skips_when_already_populated(fakes):
    """Non-empty collection: return existing count, no encode, no add."""
    model, collection, _ = fakes
    collection._count_value = 42

    assert rp.ingest_all_evidence() == 42
    assert model.encode_calls == []
    assert collection.add_calls == []


def test_get_client_creates_persist_dir_lazily(monkeypatch, tmp_path):
    """Persist dir is created by _get_client, not at import time."""
    target = tmp_path / "rag_storage"
    monkeypatch.setattr(rp, "PERSIST_DIR", target)
    monkeypatch.setattr(rp, "_client", None)

    created = {}

    class _RecordingClient:
        def __init__(self, path):
            created["path"] = path

    monkeypatch.setattr(rp.chromadb, "PersistentClient", _RecordingClient)

    rp._get_client()

    assert target.is_dir()
    assert created["path"] == str(target)


# ── Reset / re-ingest ──────────────────────────────────────────────────────
def test_reset_knowledge_base_deletes_collection(fakes, monkeypatch):
    """Reset deletes heliora_evidence, clears cached handle, returns count."""
    _, collection, client = fakes
    collection._count_value = 7
    monkeypatch.setattr(rp, "_collection", collection)

    removed = rp.reset_knowledge_base()

    assert removed == 7
    assert client.deleted == ["heliora_evidence"]
    assert rp._collection is None


def test_ingest_with_reset_rebuilds_populated_kb(fakes, monkeypatch):
    """ingest(reset=True) clears a populated KB then ingests fresh."""
    model, collection, client = fakes
    collection._count_value = 7
    # After delete_collection the old handle is dead; _get_collection()
    # recreates a fresh empty one — emulate that here.
    fresh = _FakeCollection(count_value=0)
    state = {"reset_done": False}
    real_reset = rp.reset_knowledge_base

    def _get():
        return fresh if state["reset_done"] else collection

    def _reset():
        out = real_reset()
        state["reset_done"] = True
        return out

    monkeypatch.setattr(rp, "_get_collection", _get)
    monkeypatch.setattr(rp, "reset_knowledge_base", _reset)

    count = rp.ingest_all_evidence(reset=True)

    assert client.deleted == ["heliora_evidence"]
    assert len(model.encode_calls) == 1
    assert count > 0
    assert fresh.count() == count


# ── Knowledge base status ──────────────────────────────────────────────────
def test_get_knowledge_base_status_ready(fakes):
    """Populated KB reports ready with document count and storage info."""
    _, collection, _ = fakes
    collection._count_value = 42

    status = rp.get_knowledge_base_status()

    assert status == {
        "document_count": 42,
        "collection_name": "heliora_evidence",
        "persist_dir": str(rp.PERSIST_DIR),
        "embedding_model": rp.EMBEDDING_MODEL_NAME,
        "ready": True,
    }


def test_get_knowledge_base_status_not_ready(fakes):
    _, collection, _ = fakes
    collection._count_value = 0

    status = rp.get_knowledge_base_status()

    assert status["document_count"] == 0
    assert status["ready"] is False


# ── CLI ────────────────────────────────────────────────────────────────────
def test_cli_status_returns_zero(fakes):
    assert rp.main(["status"]) == 0


def test_cli_ingest_returns_zero_and_ingests(fakes):
    _, collection, _ = fakes

    assert rp.main(["ingest"]) == 0
    assert collection.count() > 0


def test_cli_ingest_reset_flag_rebuilds(fakes):
    _, _, client = fakes

    assert rp.main(["ingest", "--reset"]) == 0
    assert client.deleted == ["heliora_evidence"]


def test_cli_reset_returns_zero(fakes, monkeypatch):
    _, collection, client = fakes
    collection._count_value = 5
    monkeypatch.setattr(rp, "_collection", collection)

    assert rp.main(["reset"]) == 0
    assert client.deleted == ["heliora_evidence"]


def test_cli_ingest_failure_returns_one(monkeypatch):
    """Ingestion errors surface as exit code 1 (operational runbook)."""

    def _boom(*args, **kwargs):
        raise RuntimeError("KB unreachable")

    monkeypatch.setattr(rp, "ingest_all_evidence", _boom)

    assert rp.main(["ingest"]) == 1


def test_cli_unknown_command_exits_nonzero(fakes):
    with pytest.raises(SystemExit) as exc:
        rp.main(["frobnicate"])
    assert exc.value.code != 0
