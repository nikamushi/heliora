"""HELIORA API — Explanation service for the LLM pipeline (LLM-001).

Implements Architecture §16.2 (full flow), PRD FR-030/031/032,
BR-LLM-000 (non-blocking fallback), BR-LLM-003 (grounding), BR-LLM-005
(traceable citations), AC-LLM-01 (human-friendly + deterministic fallback)
and AC-LLM-02 (retrieval before generation, safe response when evidence
is missing).

Flow: derive queries → retrieval.search_evidence → build context →
Gemini generation → output validation/guardrail → LLM text, else
deterministic template (source="fallback").
"""

import logging
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict

from app.ai import explanation_prompt as ep
from app.ai import retrieval
from app.ai.llm_client import GeminiClient, LLMUnavailableError
from app.core.config import settings

logger = logging.getLogger(__name__)


class ExplanationResult(BaseModel):
    """Explanation returned to the caller (API/FE later)."""

    model_config = ConfigDict(from_attributes=True)

    text: str
    evidence_refs: list[str]
    source: Literal["llm", "fallback"]


def _render_llm_text(
    parsed: ep.ExplanationOutput, evidence_by_id: dict[str, dict[str, Any]]
) -> str:
    sections = [parsed.ringkasan, "", parsed.penjelasan_faktor, "", parsed.rekomendasi]
    seen: list[str] = []
    for ref in parsed.kutipan_evidence:
        if ref not in seen:
            seen.append(ref)
    if seen:
        sections.append("")
        sections.append("Sumber evidence:")
        for ref in seen:
            item = evidence_by_id.get(ref, {})
            sections.append(
                f"- [{ref}] {item.get('title', ref)} "
                f"({item.get('organization', '?')}, {item.get('year', '?')})"
            )
    sections.append("")
    sections.append(ep.STATUTORY_DISCLAIMER)
    return "\n".join(sections)


def build_fallback_explanation(
    risks: list[dict[str, Any]],
    factors: list[dict[str, Any]],
    recommendations: list[dict[str, Any]],
    evidence: list[dict[str, Any]],
) -> ExplanationResult:
    """Deterministic template explanation. Never invents evidence."""
    lines = ["Ringkasan hasil asesmen Anda:", ""]
    for risk in risks:
        lines.append(
            f"- {risk.get('label', risk.get('condition', '?'))}: "
            f"estimasi risiko level {risk.get('risk_level', '?')}."
        )
    lines.append("")
    lines.append("Faktor yang paling berkontribusi:")
    for factor in factors:
        lines.append(
            f"- {factor.get('label', factor.get('feature', '?'))} "
            f"({factor.get('impact', '?')})."
        )
    lines.append("")
    lines.append("Rekomendasi untuk Anda:")
    for rec in recommendations:
        lines.append(f"- {rec.get('title', '?')}.")
    lines.append("")
    refs = [item["evidence_id"] for item in evidence if item.get("evidence_id")]
    if refs:
        lines.append("Evidence pendukung:")
        for item in evidence:
            lines.append(
                f"- [{item.get('evidence_id', '?')}] {item.get('title', '?')} "
                f"({item.get('organization', '?')}, {item.get('year', '?')})."
            )
        lines.append("")
    lines.append(ep.STATUTORY_DISCLAIMER)
    return ExplanationResult(
        text="\n".join(lines), evidence_refs=refs, source="fallback"
    )


def _derive_queries(
    factors: list[dict[str, Any]], recommendations: list[dict[str, Any]]
) -> list[str]:
    queries: list[str] = []
    for factor in factors:
        for key in ("label", "description", "feature"):
            value = str(factor.get(key, "") or "").strip()
            if value and value not in queries:
                queries.append(value)
                break
    for rec in recommendations:
        for key in ("title", "action"):
            value = str(rec.get(key, "") or "").strip()
            if value and value not in queries:
                queries.append(value)
                break
    return queries


async def explain_assessment(
    risks: list[dict[str, Any]],
    factors: list[dict[str, Any]],
    recommendations: list[dict[str, Any]],
    *,
    api_key: str | None = None,
    model: str | None = None,
    timeout_seconds: float | None = None,
    client: GeminiClient | None = None,
) -> ExplanationResult:
    """Generate a human-friendly explanation for an assessment result."""
    key = api_key if api_key is not None else settings.GEMINI_API_KEY
    if not key:
        # BR-LLM-000: core flow works without any LLM call or network.
        return build_fallback_explanation(risks, factors, recommendations, [])

    evidence: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    try:
        for query in _derive_queries(factors, recommendations):
            for hit in retrieval.search_evidence(query, top_k=3):
                evidence_id = hit.get("evidence_id")
                if evidence_id and evidence_id not in seen_ids:
                    seen_ids.add(evidence_id)
                    evidence.append(hit)
    except Exception as exc:
        logger.warning(
            "Evidence retrieval encountered an error, proceeding with empty evidence: %s",
            exc,
        )
        evidence = []

    context = ep.build_explanation_context(risks, factors, recommendations, evidence)
    user_message = ep.build_user_message(context)
    active_client = client or GeminiClient(
        api_key=key,
        model=model or settings.GEMINI_MODEL,
        timeout_seconds=(
            timeout_seconds
            if timeout_seconds is not None
            else settings.LLM_TIMEOUT_SECONDS
        ),
    )
    try:
        raw = await active_client.generate_text(ep.SYSTEM_PROMPT, user_message)
    except Exception as exc:
        if isinstance(exc, LLMUnavailableError):
            logger.info(
                "LLM unavailable, falling back to deterministic explanation: %s", exc
            )
        else:
            logger.warning(
                "Unexpected error during LLM generation, falling back to deterministic explanation: %s",
                exc,
            )
        return build_fallback_explanation(risks, factors, recommendations, evidence)

    parsed = ep.validate_llm_output(raw, context["evidence_ids"])
    if parsed is None:
        return build_fallback_explanation(risks, factors, recommendations, evidence)

    evidence_by_id = {item["evidence_id"]: item for item in evidence}
    ordered_refs = list(dict.fromkeys(parsed.kutipan_evidence))
    return ExplanationResult(
        text=_render_llm_text(parsed, evidence_by_id),
        evidence_refs=ordered_refs,
        source="llm",
    )
