"""HELIORA API — External Service Resilience and Deterministic Fallback Tests (#QA-002.2).

Verifies system resilience against external dependency failures:
1. Gemini API issues (timeout, rate limit 429, 503 service unavailable, DNS failure, connect error, empty/malformed response).
2. ChromaDB / Retrieval RAG issues (corrupted vector store, sqlite locks, empty retrieval results).
3. Grounding & Anti-Hallucination guardrail (ensuring no fake/forged citations when RAG is empty).
4. Dual outage resilience (simultaneous failure of both RAG and LLM without HTTP 500).

Implements Architecture §16, PRD FR-030/031/032, BR-LLM-000..005, AC-LLM-01/02, TASK.md QA-002.
"""

from typing import Any

import httpx
import pytest

from app.ai import explanation_prompt as ep
from app.ai.llm_client import GeminiClient
from app.services import explanation_service as es

_SAMPLE_RISKS: list[dict[str, Any]] = [
    {
        "condition": "diabetes",
        "label": "Diabetes Melitus",
        "estimated_risk_score": 35.0,
        "risk_level": "moderate",
    },
    {
        "condition": "hypertension",
        "label": "Hipertensi",
        "estimated_risk_score": 15.0,
        "risk_level": "low",
    },
]

_SAMPLE_FACTORS: list[dict[str, Any]] = [
    {
        "feature": "physical_activity",
        "label": "Aktivitas Fisik",
        "impact": "increase",
        "weight_percentage": 25.0,
        "description": "Kurang dari 60 menit per minggu.",
    },
]

_SAMPLE_RECS: list[dict[str, Any]] = [
    {
        "id": "rec-1",
        "rule_id": "REC-ACT-01",
        "title": "Tingkatkan Aktivitas Fisik",
        "category": "activity",
        "priority": "high",
        "action": "Jalan cepat 30 menit minimal 5 hari seminggu.",
        "evidence_level": "A",
        "source": "WHO Guidelines",
    },
]

_SAMPLE_EVIDENCE: list[dict[str, Any]] = [
    {
        "evidence_id": "evi-01",
        "title": "Pedoman Aktivitas Fisik untuk Pencegahan Penyakit Kronis",
        "organization": "WHO",
        "year": 2020,
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "evidence_level": "A",
        "summary": "Aktivitas aerobik teratur menurunkan risiko diabetes dan hipertensi.",
        "citation": "WHO Guidelines on physical activity (2020).",
        "external_url": "https://who.int/guidelines/physical-activity",
        "rule_id": "REC-ACT-01",
    },
]

_VALID_LLM_JSON = (
    '{"ringkasan": "Estimasi risiko Anda berada pada level sedang.", '
    '"penjelasan_faktor": "Kurangnya aktivitas fisik [evi-01] berkontribusi terhadap risiko.", '
    '"rekomendasi": "Lakukan jalan cepat 30 menit setiap hari.", '
    '"kutipan_evidence": ["evi-01"]}'
)


@pytest.fixture(autouse=True)
def mock_retrieval(monkeypatch):
    """Hermetic autouse fixture preventing live vector store initialization in unit tests."""
    monkeypatch.setattr(
        es.retrieval, "search_evidence", lambda *a, **k: _SAMPLE_EVIDENCE
    )


# ── TC-EXT-RES-01: Gemini API Timeout Fallback ──────────────────────────────
async def test_gemini_api_timeout_triggers_deterministic_fallback():
    """TC-EXT-RES-01: When Gemini API times out, fallback succeeds without 500."""

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("Read timeout after 10.0s", request=request)

    client = GeminiClient(api_key="key-test", transport=httpx.MockTransport(handler))
    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=client, api_key="key-test"
    )

    assert result.source == "fallback"
    assert "Ringkasan hasil asesmen Anda:" in result.text
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-02: Gemini API Rate Limit (429) Fallback ────────────────────
async def test_gemini_api_rate_limit_429_triggers_deterministic_fallback():
    """TC-EXT-RES-02: When Gemini returns 429 Too Many Requests, fallback succeeds."""

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, json={"error": {"code": 429, "message": "Resource exhausted"}})

    client = GeminiClient(api_key="key-test", transport=httpx.MockTransport(handler))
    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=client, api_key="key-test"
    )

    assert result.source == "fallback"
    assert "Aktivitas Fisik" in result.text
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-03: Gemini API Server Error (500/503) Fallback ──────────────
@pytest.mark.parametrize("status_code", [500, 502, 503, 504])
async def test_gemini_api_server_error_triggers_deterministic_fallback(status_code: int):
    """TC-EXT-RES-03: When Gemini returns upstream 5xx error, fallback succeeds."""

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status_code, json={"error": {"code": status_code, "message": "Service unavailable"}})

    client = GeminiClient(api_key="key-test", transport=httpx.MockTransport(handler))
    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=client, api_key="key-test"
    )

    assert result.source == "fallback"
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-04: Gemini API Network / DNS / ConnectError Fallback ────────
@pytest.mark.parametrize(
    "exc_factory",
    [
        lambda req: httpx.ConnectError("Failed to resolve host generativelanguage.googleapis.com", request=req),
        lambda req: httpx.NetworkError("Network socket closed prematurely", request=req),
        lambda req: httpx.ConnectTimeout("Connection handshake timed out", request=req),
    ],
)
async def test_gemini_api_network_disconnect_triggers_deterministic_fallback(exc_factory, monkeypatch):
    """TC-EXT-RES-04: When network or DNS fails, client raises LLMUnavailableError and fallback activates."""
    monkeypatch.setattr(es.retrieval, "search_evidence", lambda *a, **k: _SAMPLE_EVIDENCE)

    def handler(request: httpx.Request) -> httpx.Response:
        raise exc_factory(request)

    client = GeminiClient(api_key="key-test", transport=httpx.MockTransport(handler))
    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=client, api_key="key-test"
    )

    assert result.source == "fallback"
    assert result.evidence_refs == ["evi-01"]
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-05: Gemini API Empty Response Fallback ──────────────────────
async def test_gemini_api_empty_response_triggers_deterministic_fallback(monkeypatch):
    """TC-EXT-RES-05: When Gemini returns empty parts or whitespace, fallback succeeds."""
    monkeypatch.setattr(es.retrieval, "search_evidence", lambda *a, **k: _SAMPLE_EVIDENCE)

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "   "}]}}]})

    client = GeminiClient(api_key="key-test", transport=httpx.MockTransport(handler))
    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=client, api_key="key-test"
    )

    assert result.source == "fallback"
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-06: Gemini API Malformed Response Fallback ───────────────────
async def test_gemini_api_malformed_json_triggers_deterministic_fallback(monkeypatch):
    """TC-EXT-RES-06: When Gemini returns invalid JSON, output guardrail falls back cleanly."""
    monkeypatch.setattr(es.retrieval, "search_evidence", lambda *a, **k: _SAMPLE_EVIDENCE)

    class MalformedClient:
        async def generate_text(self, system_prompt, user_message):
            return "Maaf, sistem sedang sibuk dan tidak bisa menghasilkan JSON valid."

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=MalformedClient(), api_key="key-test"
    )

    assert result.source == "fallback"
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-07: Prohibited Medical Claims Fallback ──────────────────────
@pytest.mark.parametrize(
    "hallucinated_claim",
    [
        "Anda terdiagnosis menderita diabetes melitus stadium lanjut.",
        "Saya meresepkan metformin dengan dosis 500mg dua kali sehari.",
        "Dipastikan akan terkena penyakit jantung dalam 5 tahun.",
    ],
)
async def test_prohibited_medical_claim_rejected_by_guardrail(hallucinated_claim: str, monkeypatch):
    """TC-EXT-RES-07: Safety guardrail strictly catches diagnosis/prescription claims."""
    monkeypatch.setattr(es.retrieval, "search_evidence", lambda *a, **k: _SAMPLE_EVIDENCE)

    class HarmfulClient:
        async def generate_text(self, system_prompt, user_message):
            return (
                f'{{"ringkasan": "{hallucinated_claim}", '
                f'"penjelasan_faktor": "Kurang gerak.", '
                f'"rekomendasi": "Konsultasi dokter.", '
                f'"kutipan_evidence": ["evi-01"]}}'
            )

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=HarmfulClient(), api_key="key-test"
    )

    assert result.source == "fallback"
    assert hallucinated_claim not in result.text
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-08: ChromaDB Retrieval Failure Resilience ────────────────────
async def test_chromadb_retrieval_failure_degrades_gracefully_without_500(monkeypatch):
    """TC-EXT-RES-08: When ChromaDB crashes or disk lock fails, system degrades without 500."""

    def fail_search(*args, **kwargs):
        raise RuntimeError("sqlite3.OperationalError: database is locked")

    monkeypatch.setattr(es.retrieval, "search_evidence", fail_search)

    class ValidClient:
        async def generate_text(self, system_prompt, user_message):
            # Model properly generates text without citations since context had no evidence
            return (
                '{"ringkasan": "Estimasi risiko Anda berada pada level sedang.", '
                '"penjelasan_faktor": "Aktivitas fisik rendah berkontribusi terhadap risiko.", '
                '"rekomendasi": "Tingkatkan intensitas jalan kaki harian.", '
                '"kutipan_evidence": []}'
            )

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=ValidClient(), api_key="key-test"
    )

    assert result.source == "llm"
    assert result.evidence_refs == []
    assert "Sumber evidence:" not in result.text
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-09: ChromaDB Empty Retrieval Anti-Hallucination ─────────────
async def test_empty_rag_prompt_instructs_no_citations(monkeypatch):
    """TC-EXT-RES-09: When RAG returns empty results, prompt explicitly forbids citations."""
    monkeypatch.setattr(es.retrieval, "search_evidence", lambda *a, **k: [])

    captured_prompt: list[str] = []

    class InspectingClient:
        async def generate_text(self, system_prompt, user_message):
            captured_prompt.append(user_message)
            return (
                '{"ringkasan": "Risiko stabil.", "penjelasan_faktor": "Pola hidup.", '
                '"rekomendasi": "Olahraga rutin.", "kutipan_evidence": []}'
            )

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=InspectingClient(), api_key="key-test"
    )

    assert result.source == "llm"
    assert len(captured_prompt) == 1
    assert "Evidence: tidak ditemukan. Jangan mengutip sumber apa pun." in captured_prompt[0]


# ── TC-EXT-RES-10: Empty RAG with Hallucinated Citations Rejection ─────────
async def test_empty_rag_rejects_hallucinated_citations(monkeypatch):
    """TC-EXT-RES-10: If RAG is empty and LLM hallucinates fake citation, guardrail falls back without fake citations."""
    monkeypatch.setattr(es.retrieval, "search_evidence", lambda *a, **k: [])

    class HallucinatingClient:
        async def generate_text(self, system_prompt, user_message):
            return (
                '{"ringkasan": "Risiko sedang [evi-99].", '
                '"penjelasan_faktor": "Berdasarkan pedoman palsu [evi-99].", '
                '"rekomendasi": "Tidur teratur.", '
                '"kutipan_evidence": ["evi-99"]}'
            )

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=HallucinatingClient(), api_key="key-test"
    )

    assert result.source == "fallback"
    assert result.evidence_refs == []
    assert "evi-" not in result.text
    assert "Evidence pendukung:" not in result.text


# ── TC-EXT-RES-11: Simultaneous Dual Outage Resilience ─────────────────────
async def test_simultaneous_rag_and_llm_outage_produces_fallback(monkeypatch):
    """TC-EXT-RES-11: If both ChromaDB AND Gemini fail simultaneously, fallback succeeds without 500."""

    def fail_search(*args, **kwargs):
        raise RuntimeError("ChromaDB vector store unreachable")

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("Gemini API connection refused", request=request)

    monkeypatch.setattr(es.retrieval, "search_evidence", fail_search)
    client = GeminiClient(api_key="key-test", transport=httpx.MockTransport(handler))

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, client=client, api_key="key-test"
    )

    assert result.source == "fallback"
    assert result.evidence_refs == []
    assert ep.STATUTORY_DISCLAIMER in result.text


# ── TC-EXT-RES-12: Unset Gemini API Key Offline Operation ──────────────────
async def test_missing_api_key_operates_offline_without_network_call(monkeypatch):
    """TC-EXT-RES-12: Without API key, assessment operates hermetically without network or 500."""
    monkeypatch.setattr(es.settings, "GEMINI_API_KEY", None)

    def never_call(*args, **kwargs):
        raise AssertionError("Network / retrieval should not be invoked when API key is missing")

    monkeypatch.setattr(es.retrieval, "search_evidence", never_call)

    result = await es.explain_assessment(_SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, api_key=None)

    assert result.source == "fallback"
    assert result.evidence_refs == []
    assert "Ringkasan hasil asesmen Anda:" in result.text
    assert ep.STATUTORY_DISCLAIMER in result.text
