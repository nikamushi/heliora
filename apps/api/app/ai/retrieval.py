"""HELIORA API — RAG Retrieval Pipeline (RAG-002).

Query construction, similarity search, relevance filtering, and source preservation.
Uses the ChromaDB vector store populated by rag_pipeline.py.

Architecture §15 (RAG Architecture: §15.3 pipeline), ADR-008 (RAG = retrieval,
LLM = explanation). PRD §6.14, FR-027, AC-EVIDENCE-01, AC-LLM-02, TASK.md RAG-002.
"""

from __future__ import annotations

import logging
from typing import Any

from sentence_transformers import SentenceTransformer

from app.ai.rag_pipeline import (
    _get_collection,
)

logger = logging.getLogger(__name__)

# ── Query embedding ──────────────────────────────────────────────────────
# Lazy-load model (shared with pipeline)
_query_model: SentenceTransformer | None = None


def _get_query_model() -> SentenceTransformer:
    """Get or load the sentence transformer model for queries."""
    global _query_model
    if _query_model is None:
        logger.info("Loading query embedding model...")
        _query_model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Query embedding model loaded")
    return _query_model


# ── Similarity search ────────────────────────────────────────────────────
# Cosine similarity threshold for relevance filtering
DEFAULT_SIMILARITY_THRESHOLD = 0.3


def search_evidence(
    query: str,
    top_k: int = 5,
    category: str | None = None,
    rule_id: str | None = None,
    threshold: float = DEFAULT_SIMILARITY_THRESHOLD,
) -> list[dict[str, Any]]:
    """Search the knowledge base for relevant evidence using semantic search.

    Parameters
    ----------
    query : Natural language search query.
    top_k : Maximum number of results to return.
    category : Optional category filter (activity, sleep, nutrition, cardiovascular, stress).
    rule_id : Optional rule ID filter (e.g., REC-ACT-01, case-insensitive).
    threshold : Minimum similarity score (0-1) for a result to be considered relevant.

    Returns
    -------
    List of dictionaries containing:
    - evidence_id, title, organization, year
    - category, category_label, evidence_level
    - summary, clinical_section, citation, external_url
    - similarity_score, chunk_index
    """
    collection = _get_collection()
    model = _get_query_model()

    # Embed the query
    query_embedding = model.encode([query], convert_to_numpy=True, normalize_embeddings=True)[0]

    # Query the collection using L2 distance (ChromaDB default).
    # Since embeddings are normalized, L2 distance relates to cosine similarity:
    #   L2_dist² = 2 - 2*cos_sim  →  cos_sim = 1 - L2_dist²/2
    # Build where filter for metadata.
    # Registry stores category lowercase ("activity") and rule_id uppercase
    # ("REC-ACT-01"), so normalize each side to its stored case.
    where_filter: dict[str, Any] = {}
    if category:
        where_filter["category"] = category.lower()
    if rule_id:
        where_filter["rule_id"] = rule_id.upper()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k * 3,  # Get more candidates then filter
        where=where_filter if where_filter else None,
        include=["metadatas", "documents", "distances"],
    )

    # Process results
    hits = []
    if results and results.get("ids") and len(results["ids"]) > 0:
        ids = results["ids"][0]
        distances = results["distances"][0]
        metadatas = results["metadatas"][0] if results.get("metadatas") else [{}]
        documents = results["documents"][0] if results.get("documents") else [""]

        for i, doc_id in enumerate(ids):
            # ChromaDB returns L2 distance. Convert to cosine similarity.
            # Since both query and stored embeddings are normalized (unit vectors):
            #   L2_dist² = ||a-b||² = 2 - 2*cos_sim
            #   cos_sim = 1 - L2_dist²/2
            distance = float(distances[i])
            cosine_sim = 1.0 - (distance ** 2) / 2.0

            if cosine_sim >= threshold:
                meta = metadatas[i] if i < len(metadatas) else {}
                doc_text = documents[i] if i < len(documents) else ""

                hits.append({
                    "evidence_id": meta.get("evidence_id", doc_id.split("-chunk-")[0]),
                    "title": meta.get("title", "Unknown"),
                    "organization": meta.get("organization", "Unknown"),
                    "year": int(meta.get("year", 0)) if meta.get("year") else 0,
                    "category": meta.get("category", "unknown"),
                    "category_label": meta.get("category_label", ""),
                    "evidence_level": meta.get("evidence_level", "Level C (Konsensus Pakar)"),
                    "summary": _extract_summary_from_chunk(doc_text),
                    "clinical_section": meta.get("clinical_section", ""),
                    "citation": meta.get("citation", ""),
                    "external_url": meta.get("external_url", ""),
                    "rule_id": meta.get("rule_id", ""),
                    "similarity_score": round(cosine_sim, 4),
                    "chunk_index": meta.get("chunk_index", i),
                })

    # Sort by similarity and apply top_k
    hits.sort(key=lambda x: x["similarity_score"], reverse=True)
    return hits[:top_k]


def _extract_summary_from_chunk(chunk_text: str) -> str:
    """Extract the summary portion from a chunk's text."""
    for line in chunk_text.split("\n"):
        if line.startswith("SUMMARY:"):
            return line.replace("SUMMARY:", "").strip()
    # Fallback: return first 200 chars
    return chunk_text[:200].strip()


# ── Source preservation ──────────────────────────────────────────────────
def get_source(evidence_id: str) -> dict[str, Any] | None:
    """Retrieve full source metadata for a specific evidence item.

    Preserves the original source information for citation and verification.
    """
    collection = _get_collection()

    results = collection.get(
        where={"evidence_id": evidence_id},
        include=["metadatas", "documents"],
    )

    if not results or not results.get("ids") or len(results["ids"]) == 0:
        return None

    # Return the first matching document's metadata (all chunks share same metadata)
    meta = results["metadatas"][0]
    return {
        "evidence_id": evidence_id,
        "title": meta.get("title", ""),
        "organization": meta.get("organization", ""),
        "year": int(meta.get("year", 0)) if meta.get("year") else 0,
        "category": meta.get("category", ""),
        "category_label": meta.get("category_label", ""),
        "evidence_level": meta.get("evidence_level", ""),
        "summary": meta.get("summary", ""),
        "clinical_section": meta.get("clinical_section", ""),
        "citation": meta.get("citation", ""),
        "external_url": meta.get("external_url", ""),
        "rule_id": meta.get("rule_id", ""),
    }


# ── Retrieval testing ────────────────────────────────────────────────────
def test_retrieval() -> dict[str, Any]:
    """Run retrieval tests to validate the knowledge base.

    Returns test results with sample queries and retrieval quality metrics.
    """
    test_queries = [
        ("seberapa penting aktivitas fisik untuk kesehatan jantung", "activity"),
        ("pengaruh merokok terhadap penyakit kardiovaskular", "cardiovascular"),
        ("tips tidur yang baik untuk menurunkan tekanan darah", "sleep"),
        ("apa saja rekomendasi diet untuk diabetes", "nutrition"),
        ("cara mengelola stres agar tekanan darah stabil", "stress"),
    ]

    results = []
    for query, expected_category in test_queries:
        hits = search_evidence(query, top_k=3, category=expected_category)
        results.append({
            "query": query,
            "expected_category": expected_category,
            "retrieved_count": len(hits),
            "top_result": hits[0] if hits else None,
            "avg_similarity": (
                round(sum(h["similarity_score"] for h in hits) / len(hits), 4)
                if hits else 0.0
            ),
        })

    return {
        "test_count": len(test_queries),
        "results": results,
        "kb_status": {
            "document_count": _get_collection().count(),
        },
    }


# ── CLI entry point ──────────────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    print(f"\n{'='*60}")
    print("RAG Retrieval Pipeline — Test")
    print(f"{'='*60}\n")

    # Run retrieval tests
    test_results = test_retrieval()
    print(f"Knowledge base documents: {test_results['kb_status']['document_count']}")
    print(f"Test queries: {test_results['test_count']}\n")

    for i, r in enumerate(test_results["results"], 1):
        print(f"--- Test {i}: {r['query']} ---")
        print(f"  Expected category: {r['expected_category']}")
        print(f"  Retrieved: {r['retrieved_count']} results")
        if r["top_result"]:
            print(f"  Top result: {r['top_result']['title']}")
            print(f"  Similarity: {r['top_result']['similarity_score']}")
            print(f"  Category: {r['top_result']['category_label']}")
        print()

    print(f"{'='*60}\n")
