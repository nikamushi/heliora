"""HELIORA API - tests for LLM explanation pipeline (LLM-001).

Offline/deterministic: the Gemini REST call is faked with an httpx
MockTransport, and retrieval is monkeypatched, so no API key, no network,
and no persisted KB is needed.

Covers (TASK.md LLM-001, PRD FR-030/031/032, BR-LLM-000..005, AC-LLM-01/02):
- Prompt design (system prompt constraints, statutory disclaimer)
- Context construction (risks + factors + recommendations + evidence)
- RAG integration (retrieval runs before generation)
- Explanation generation (fake LLM contract)
- Output validation (JSON schema, non-empty sections)
- Hallucination guardrail (no diagnosis, citations grounded in evidence)
- Fallback response (no key, timeout, HTTP error, invalid output, empty KB)
"""

import httpx
import pytest

from app.ai import explanation_prompt as ep
from app.ai.llm_client import GeminiClient, LLMUnavailableError
from app.core.config import Settings
from app.services import explanation_service as es


# ── Fixtures ─────────────────────────────────────────────────────────────
_SAMPLE_RISKS = [
    {
        "condition": "diabetes",
        "label": "Diabetes Tipe 2",
        "estimated_risk_score": 0.32,
        "risk_level": "moderate",
    },
    {
        "condition": "hypertension",
        "label": "Hipertensi",
        "estimated_risk_score": 0.18,
        "risk_level": "low",
    },
]

_SAMPLE_FACTORS = [
    {
        "feature": "sleep_duration",
        "label": "Durasi Tidur",
        "impact": "increase",
        "weight_percentage": 18.5,
        "description": "Tidur kurang dari 6 jam per hari.",
    },
]

_SAMPLE_RECS = [
    {
        "id": "r1",
        "rule_id": "REC-SLP-02",
        "title": "Tidur 7-8 jam setiap malam",
        "category": "sleep",
        "priority": "high",
        "action": "Tetapkan jadwal tidur yang konsisten.",
        "evidence_level": "B",
        "source": "Kemenkes RI",
    },
]

_SAMPLE_EVIDENCE = [
    {
        "evidence_id": "evi-03",
        "title": "Hubungan Kualitas Tidur dengan Kejadian Hipertensi",
        "organization": "Kemenkes RI",
        "year": 2023,
        "category": "sleep",
        "category_label": "Tidur",
        "evidence_level": "B",
        "summary": "Kualitas tidur buruk berhubungan dengan hipertensi.",
        "citation": "Kemenkes RI (2023).",
        "external_url": "https://example.org/evi-03",
        "rule_id": "REC-SLP-02",
    },
]

_VALID_LLM_JSON = (
    '{"ringkasan": "Estimasi risiko diabetes Anda berada pada level sedang.", '
    '"penjelasan_faktor": "Durasi tidur yang kurang [evi-03] meningkatkan estimasi risiko.", '
    '"rekomendasi": "Tidur 7-8 jam setiap malam.", '
    '"kutipan_evidence": ["evi-03"]}'
)


def _ok_transport(text: str) -> httpx.MockTransport:
    """Fake Gemini REST endpoint returning one candidate with `text`."""

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={"candidates": [{"content": {"parts": [{"text": text}]}}]},
        )

    return httpx.MockTransport(handler)


def _error_transport(status: int) -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status, json={"error": {"message": "boom"}})

    return httpx.MockTransport(handler)


# ── Prompt design ────────────────────────────────────────────────────────
def test_system_prompt_forbids_diagnosis_and_risk_calculation():
    lowered = ep.SYSTEM_PROMPT.lower()
    for phrase in (
        "bukan diagnosis",
        "tidak menghitung",
        "tidak mengubah",
        "estimasi risiko",
    ):
        assert phrase in lowered


def test_system_prompt_requires_statutory_disclaimer():
    assert "bukan diagnosis medis" in ep.SYSTEM_PROMPT
    assert "bukan pengganti konsultasi tenaga kesehatan" in ep.SYSTEM_PROMPT


def test_output_schema_has_no_score_fields():
    """LLM must not be able to return (modified) risk scores through output."""
    fields = set(ep.ExplanationOutput.model_fields)
    assert fields == {"ringkasan", "penjelasan_faktor", "rekomendasi", "kutipan_evidence"}
    for name in ("risk_score", "estimated_risk_score", "probability", "diagnosis"):
        assert name not in fields


# ── Context construction ─────────────────────────────────────────────────
def test_context_contains_all_inputs():
    ctx = ep.build_explanation_context(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, _SAMPLE_EVIDENCE
    )
    assert ctx["risks"] == _SAMPLE_RISKS
    assert ctx["factors"] == _SAMPLE_FACTORS
    assert ctx["recommendations"] == _SAMPLE_RECS
    assert ctx["evidence"] == _SAMPLE_EVIDENCE
    assert ctx["evidence_ids"] == ["evi-03"]


def test_user_message_renders_context_sections():
    msg = ep.build_user_message(
        ep.build_explanation_context(
            _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, _SAMPLE_EVIDENCE
        )
    )
    for needle in ("Diabetes Tipe 2", "Durasi Tidur", "Tidur 7-8 jam", "evi-03"):
        assert needle in msg


# ── Config ───────────────────────────────────────────────────────────────
def test_llm_config_defaults():
    settings = Settings()
    assert settings.GEMINI_API_KEY is None
    assert settings.GEMINI_MODEL == "gemini-3.5-flash-lite"
    assert settings.LLM_TIMEOUT_SECONDS == 10


# ── Generation (fake LLM contract) ───────────────────────────────────────
async def test_client_posts_to_generate_content_endpoint():
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(
            200, json={"candidates": [{"content": {"parts": [{"text": "halo"}]}}]}
        )

    client = GeminiClient(
        api_key="key-abc", model="gemini-3.5-flash-lite", transport=httpx.MockTransport(handler)
    )
    assert await client.generate_text("sys", "user") == "halo"

    req = seen[0]
    assert "gemini-3.5-flash-lite" in str(req.url)
    assert ":generateContent" in str(req.url)


async def test_client_without_key_raises_unavailable():
    client = GeminiClient(api_key=None)
    with pytest.raises(LLMUnavailableError):
        await client.generate_text("sys", "user")


async def test_client_maps_http_error_to_unavailable():
    client = GeminiClient(api_key="key-abc", transport=_error_transport(500))
    with pytest.raises(LLMUnavailableError):
        await client.generate_text("sys", "user")


async def test_client_maps_rate_limit_to_unavailable():
    client = GeminiClient(api_key="key-abc", transport=_error_transport(429))
    with pytest.raises(LLMUnavailableError):
        await client.generate_text("sys", "user")


async def test_client_maps_timeout_to_unavailable():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("slow", request=request)

    client = GeminiClient(api_key="key-abc", transport=httpx.MockTransport(handler))
    with pytest.raises(LLMUnavailableError):
        await client.generate_text("sys", "user")


# ── RAG integration + service orchestration ──────────────────────────────
async def test_retrieval_runs_before_generation(monkeypatch):
    order: list[str] = []

    def fake_search(query, top_k=3, **kwargs):
        order.append(f"search:{query}")
        return _SAMPLE_EVIDENCE

    class FakeClient:
        async def generate_text(self, system_prompt, user_message):
            order.append("generate")
            return _VALID_LLM_JSON

    monkeypatch.setattr(es.retrieval, "search_evidence", fake_search)
    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, api_key="key", client=FakeClient()
    )
    assert result.source == "llm"
    assert order[0].startswith("search:")
    assert order[-1] == "generate"
    assert any("Tidur" in call or "sleep" in call.lower() for call in order[:-1])


async def test_valid_grounded_output_accepted(monkeypatch):
    monkeypatch.setattr(
        es.retrieval, "search_evidence", lambda *a, **k: _SAMPLE_EVIDENCE
    )

    class FakeClient:
        async def generate_text(self, system_prompt, user_message):
            return _VALID_LLM_JSON

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, api_key="key", client=FakeClient()
    )
    assert result.source == "llm"
    assert result.evidence_refs == ["evi-03"]
    assert "evi-03" in result.text


# ── Hallucination guardrail ──────────────────────────────────────────────
@pytest.mark.parametrize(
    "bad_text",
    [
        "Anda menderita diabetes tipe 2.",
        "Berdasarkan hasil ini, diagnosis Anda adalah hipertensi.",
        "Saya meresepkan obat untuk Anda.",
        "Minum obat ini dengan dosis dua kali sehari.",
    ],
)
def test_diagnosis_or_prescription_claims_rejected(bad_text):
    assert ep.validate_llm_output(
        '{"ringkasan": "%s", "penjelasan_faktor": "x", '
        '"rekomendasi": "y", "kutipan_evidence": []}' % bad_text,
        [],
    ) is None


def test_hallucinated_citation_rejected():
    forged = _VALID_LLM_JSON.replace("evi-03", "evi-99")
    assert ep.validate_llm_output(forged, ["evi-03"]) is None


def test_malformed_output_rejected():
    assert ep.validate_llm_output("bukan json sama sekali", ["evi-03"]) is None
    assert ep.validate_llm_output(
        '{"ringkasan": "", "penjelasan_faktor": "x", '
        '"rekomendasi": "y", "kutipan_evidence": []}',
        [],
    ) is None


async def test_guardrail_failure_falls_back(monkeypatch):
    monkeypatch.setattr(
        es.retrieval, "search_evidence", lambda *a, **k: _SAMPLE_EVIDENCE
    )

    class FakeClient:
        async def generate_text(self, system_prompt, user_message):
            return _VALID_LLM_JSON.replace("evi-03", "evi-99")

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, api_key="key", client=FakeClient()
    )
    assert result.source == "fallback"


# ── Fallback response ────────────────────────────────────────────────────
async def test_no_api_key_uses_fallback_without_network(monkeypatch):
    def fail_search(*args, **kwargs):  # pragma: no cover - must not run
        raise AssertionError("retrieval must not run without key")

    monkeypatch.setattr(es.retrieval, "search_evidence", fail_search)
    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, api_key=None
    )
    assert result.source == "fallback"
    assert "bukan diagnosis medis" in result.text
    assert "Durasi Tidur" in result.text
    assert "Tidur 7-8 jam" in result.text
    assert result.evidence_refs == []


async def test_empty_kb_gives_safe_response(monkeypatch):
    monkeypatch.setattr(es.retrieval, "search_evidence", lambda *a, **k: [])

    class FakeClient:
        async def generate_text(self, system_prompt, user_message):
            return _VALID_LLM_JSON.replace('["evi-03"]', "[]").replace(" [evi-03]", "")

    result = await es.explain_assessment(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, api_key="key", client=FakeClient()
    )
    assert result.source == "llm"
    assert result.evidence_refs == []
    assert "evi-" not in result.text


async def test_fallback_does_not_invent_evidence():
    result = es.build_fallback_explanation(
        _SAMPLE_RISKS, _SAMPLE_FACTORS, _SAMPLE_RECS, _SAMPLE_EVIDENCE
    )
    assert result.source == "fallback"
    assert result.evidence_refs == ["evi-03"]
    assert "Kemenkes RI" in result.text
