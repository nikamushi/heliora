"""HELIORA API — Prompt design for the LLM explanation pipeline (LLM-001).

Implements Architecture §16.2 (Prompt Builder), §16.3 (constraints),
PRD FR-030/031/032, BR-LLM-001..005, AC-LLM-01, and Design §2.4 (no diagnosis
claims) + §2.6 (statutory disclaimer, verbatim).

The LLM only restructures already-computed results into human-friendly
Indonesian. It never calculates or modifies risk scores: the output schema
deliberately has no score fields.
"""

import json
import re
from typing import Any

from pydantic import BaseModel, Field

STATUTORY_DISCLAIMER = (
    "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. "
    "Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data "
    "dan model yang digunakan, bukan diagnosis medis dan bukan pengganti "
    "konsultasi tenaga kesehatan."
)

SYSTEM_PROMPT = """Anda adalah lapisan penjelasan (explanation layer) HELIORA,
platform preventive health berbasis lifestyle. Tugas Anda HANYA menyusun ulang
hasil yang sudah dihitung sistem menjadi penjelasan berbahasa Indonesia yang
mudah dipahami.

ATURAN MUTLAK (pelanggaran = output ditolak):
1. Anda BUKAN alat diagnosis: jangan menyatakan pengguna memiliki penyakit,
   jangan memberikan diagnosis, resep, dosis, atau rencana pengobatan.
2. Anda TIDAK MENGHITUNG dan TIDAK MENGUBAH skor atau estimasi risiko apa pun.
   Gunakan angka "estimasi risiko" persis seperti yang diberikan pada konteks.
3. Anda TIDAK MENGGANTI rule rekomendasi: hanya narasikan ulang rekomendasi
   yang diberikan pada konteks.
4. Anda TIDAK MENGARANG evidence: setiap klaim kesehatan harus merujuk pada
   evidence yang diberikan pada konteks, dengan format kutipan [evi-NN].
   Jangan mengutip ID yang tidak ada pada konteks.
5. Bahasa: Indonesia yang sederhana dan suportif, tanpa istilah medis berat
   tanpa penjelasan.
6. Akhiri penjelasan dengan disclaimer berikut, KATA-PER-KATA:
   "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan."

Format output HARUS berupa JSON valid dengan kunci persis:
{"ringkasan": "...", "penjelasan_faktor": "...", "rekomendasi": "...",
 "kutipan_evidence": ["evi-NN", ...]}
"""

FORBIDDEN_PATTERNS = (
    r"anda menderita",
    r"terdiagnosis",
    r"diagnosis",
    r"penyakit anda",
    r"meresepkan",
    r"\bresep\b",
    r"minum obat",
    r"\bdosis\b",
    r"rencana pengobatan",
    r"dipastikan (akan|terkena|menderita)",
    r"100\s?%",
)
_FORBIDDEN_RE = re.compile("|".join(FORBIDDEN_PATTERNS), re.IGNORECASE)
_CITATION_RE = re.compile(r"evi-(\d+)")


class ExplanationOutput(BaseModel):
    """Validated LLM output. No score/diagnosis fields by design."""

    ringkasan: str = Field(min_length=1)
    penjelasan_faktor: str = Field(min_length=1)
    rekomendasi: str = Field(min_length=1)
    kutipan_evidence: list[str] = Field(default_factory=list)


def build_explanation_context(
    risks: list[dict[str, Any]],
    factors: list[dict[str, Any]],
    recommendations: list[dict[str, Any]],
    evidence: list[dict[str, Any]],
) -> dict[str, Any]:
    """Assemble the structured context the LLM is allowed to use."""
    return {
        "risks": risks,
        "factors": factors,
        "recommendations": recommendations,
        "evidence": evidence,
        "evidence_ids": [
            item["evidence_id"] for item in evidence if item.get("evidence_id")
        ],
    }


def build_user_message(context: dict[str, Any]) -> str:
    """Render the context as the user message for the LLM."""
    lines = ["HASIL SISTEM (gunakan HANYA data ini):", ""]
    lines.append("Estimasi risiko:")
    for risk in context["risks"]:
        lines.append(
            f"- {risk.get('label', risk.get('condition', '?'))}: "
            f"level {risk.get('risk_level', '?')}, "
            f"estimasi risiko {risk.get('estimated_risk_score', '?')}"
        )
    lines.append("")
    lines.append("Faktor yang berkontribusi:")
    for factor in context["factors"]:
        lines.append(
            f"- {factor.get('label', factor.get('feature', '?'))} "
            f"({factor.get('impact', '?')}, {factor.get('weight_percentage', '?')}%)"
            + (f": {factor['description']}" if factor.get("description") else "")
        )
    lines.append("")
    lines.append("Rekomendasi sistem:")
    for rec in context["recommendations"]:
        lines.append(
            f"- {rec.get('title', '?')} "
            f"[kategori: {rec.get('category', '?')}, prioritas: {rec.get('priority', '?')}]"
            + (f" — {rec['action']}" if rec.get("action") else "")
        )
    lines.append("")
    if context["evidence"]:
        lines.append("Evidence yang diambil (sumber kutipan yang sah):")
        for item in context["evidence"]:
            lines.append(
                f"- [{item.get('evidence_id', '?')}] {item.get('title', '?')} "
                f"({item.get('organization', '?')}, {item.get('year', '?')})"
                + (f": {item['summary']}" if item.get("summary") else "")
            )
    else:
        lines.append("Evidence: tidak ditemukan. Jangan mengutip sumber apa pun.")
    return "\n".join(lines)


def _extract_json_object(text: str) -> str | None:
    """Return the embedded JSON object, tolerating fences and surrounding prose.

    Live Gemini responses sometimes wrap the JSON in a code fence and append
    the statutory disclaimer as plain text after it.
    """
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```", "", cleaned)
    try:
        json.loads(cleaned)
        return cleaned
    except (ValueError, TypeError):
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        return match.group(0) if match else None


def validate_llm_output(text: str, evidence_ids: list[str]) -> ExplanationOutput | None:
    """Validate raw LLM text. Returns parsed output, or None (→ fallback).

    Rejects: non-JSON, schema violations, empty sections, citations to
    evidence not provided, and forbidden diagnosis/prescription phrases.
    """
    candidate = _extract_json_object(text)
    if candidate is None:
        return None
    try:
        parsed = ExplanationOutput.model_validate(json.loads(candidate))
    except (ValueError, TypeError):
        return None

    allowed = set(evidence_ids)
    if any(ref not in allowed for ref in parsed.kutipan_evidence):
        return None

    narrative = " ".join(
        (parsed.ringkasan, parsed.penjelasan_faktor, parsed.rekomendasi)
    )
    if any(f"evi-{num}" not in allowed for num in _CITATION_RE.findall(narrative)):
        return None
    if _FORBIDDEN_RE.search(narrative):
        return None
    return parsed
