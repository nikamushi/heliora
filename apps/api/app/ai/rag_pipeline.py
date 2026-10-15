"""HELIORA API — RAG Knowledge Base Pipeline (RAG-001).

Document ingestion, cleaning, chunking, embedding, and vector storage.
Uses sentence-transformers for embeddings + ChromaDB for vector storage.

Architecture §8, PRD RAG-001.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import chromadb
from sentence_transformers import SentenceTransformer

from app.services.evidence_service import CLINICAL_EVIDENCE_REGISTRY

logger = logging.getLogger(__name__)

# ── Configuration ────────────────────────────────────────────────────────
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 512  # characters per chunk
CHUNK_OVERLAP = 64
PERSIST_DIR = Path(__file__).parent.parent / "data" / "rag_storage"
PERSIST_DIR.mkdir(parents=True, exist_ok=True)

# ── In-memory ChromaDB client ──────────────────────────────────────────
# Use local persistence for durability across restarts.
_client: chromadb.Client | None = None
_collection: chromadb.Collection | None = None
_embedding_model: SentenceTransformer | None = None


def _get_client() -> chromadb.Client:
    """Get or create ChromaDB client."""
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=str(PERSIST_DIR))
        logger.info("ChromaDB client initialized with persist dir: %s", PERSIST_DIR)
    return _client


def _get_collection() -> chromadb.Collection:
    """Get or create the evidence collection."""
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(
            name="heliora_evidence",
            metadata={"description": "HELIORA clinical evidence knowledge base"},
        )
        logger.info("Evidence collection ready")
    return _collection


def _get_embedding_model() -> SentenceTransformer:
    """Get or load the sentence transformer model."""
    global _embedding_model
    if _embedding_model is None:
        logger.info("Loading embedding model: %s", EMBEDDING_MODEL_NAME)
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        logger.info("Embedding model loaded")
    return _embedding_model


# ── Document cleaning ────────────────────────────────────────────────────
def clean_document(text: str) -> str:
    """Basic text cleaning: normalize whitespace, strip, remove excessive newlines."""
    import re
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    return text


# ── Chunking ─────────────────────────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks."""
    text = clean_document(text)
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
        if start >= len(text):
            break

    return chunks


def build_document_chunks(evidence: dict[str, Any]) -> list[dict[str, Any]]:
    """Build chunk documents from a single evidence item.

    Each evidence item becomes one or more chunks with metadata.
    """
    # Combine all text fields into a single document
    text_parts = [
        f"TITLE: {evidence['title']}",
        f"AUTHOR: {evidence['organization']}",
        f"YEAR: {evidence['year']}",
        f"SECTION: {evidence['clinical_section']}",
        f"SUMMARY: {evidence['summary']}",
        f"CITATION: {evidence['citation']}",
    ]
    full_text = "\n\n".join(text_parts)

    chunks = chunk_text(full_text)
    docs = []
    for i, chunk in enumerate(chunks):
        docs.append({
            "id": f"{evidence['id']}-chunk-{i}",
            "text": chunk,
            "metadata": {
                "evidence_id": evidence['id'],
                "rule_id": evidence['rule_id'],
                "title": evidence['title'],
                "organization": evidence['organization'],
                "year": str(evidence['year']),
                "category": evidence['category'],
                "category_label": evidence['category_label'],
                "evidence_level": evidence['evidence_level'],
                "summary": evidence['summary'],
                "clinical_section": evidence['clinical_section'],
                "citation": evidence['citation'],
                "external_url": evidence['external_url'],
                "chunk_index": i,
                "total_chunks": len(chunks),
            },
        })
    return docs


# ── Ingestion pipeline ───────────────────────────────────────────────────
def ingest_all_evidence() -> int:
    """Ingest all clinical evidence items into the vector store.

    Returns number of documents indexed.
    """
    collection = _get_collection()
    model = _get_embedding_model()

    # Check if already ingested
    existing_count = collection.count()
    if existing_count > 0:
        logger.info("Evidence already ingested (%d docs). Skipping re-ingestion.", existing_count)
        return existing_count

    all_docs = []
    for evi in CLINICAL_EVIDENCE_REGISTRY:
        chunks = build_document_chunks(evi)
        all_docs.extend(chunks)

    logger.info("Building %d chunks from %d evidence items",
                len(all_docs), len(CLINICAL_EVIDENCE_REGISTRY))

    # Generate embeddings
    texts = [doc["text"] for doc in all_docs]
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)

    # Add to ChromaDB
    ids = [doc["id"] for doc in all_docs]
    metadatas = [doc["metadata"] for doc in all_docs]

    collection.add(
        embeddings=embeddings.tolist(),
        documents=texts,
        metadatas=metadatas,
        ids=ids,
    )

    logger.info("Ingested %d documents into knowledge base", len(all_docs))
    return len(all_docs)


def get_knowledge_base_status() -> dict[str, Any]:
    """Return status of the knowledge base."""
    collection = _get_collection()
    count = collection.count()
    return {
        "document_count": count,
        "collection_name": "heliora_evidence",
        "persist_dir": str(PERSIST_DIR),
        "embedding_model": EMBEDDING_MODEL_NAME,
        "ready": count > 0,
    }


# ── CLI entry point ──────────────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    logger.info("Starting RAG knowledge base ingestion...")
    count = ingest_all_evidence()
    status = get_knowledge_base_status()

    print(f"\n{'='*60}")
    print("RAG Knowledge Base Ingestion Complete")
    print(f"{'='*60}")
    print(f"Documents indexed: {count}")
    print(f"Collection: {status['collection_name']}")
    print(f"Storage: {status['persist_dir']}")
    print(f"Embedding model: {status['embedding_model']}")
    print(f"{'='*60}\n")
