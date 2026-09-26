"""HELIORA API — Clinical evidence schemas.

Schemas for Evidence Center and clinical guideline citations.
Implements Architecture §8, §14, PRD FR-027, FR-028, FR-029, BR-EVIDENCE-001.
"""

from typing import Literal

from pydantic import BaseModel, Field

EvidenceCategory = Literal["activity", "sleep", "nutrition", "cardiovascular", "stress"]
EvidenceLevel = Literal["Level A (Kuat)", "Level B (Sedang)", "Level C (Konsensus Pakar)"]


class ClinicalEvidenceItem(BaseModel):
    """A verified clinical evidence or guideline citation entry."""

    id: str = Field(..., description="Unique evidence identifier (e.g., 'evi-01').")
    rule_id: str = Field(..., description="Referenced intervention rule ID (e.g., 'REC-ACT-01').")
    title: str = Field(..., description="Full title of the clinical guideline or study.")
    organization: str = Field(..., description="Authoring medical body or guideline publisher.")
    year: int = Field(..., description="Publication year.")
    evidence_level: EvidenceLevel = Field(..., description="Strength of clinical evidence grade.")
    category: EvidenceCategory = Field(..., description="Domain category of evidence.")
    category_label: str = Field(..., description="Human-readable category title.")
    summary: str = Field(..., description="Structured clinical abstract / evidentiary justification.")
    clinical_section: str = Field(..., description="Specific recommendation section or chapter.")
    citation: str = Field(..., description="Standard academic / clinical citation.")
    external_url: str = Field(..., description="Direct reference URL to source guideline publication.")


class EvidenceListResponse(BaseModel):
    """Response payload containing clinical evidence citation items."""

    items: list[ClinicalEvidenceItem] = Field(..., description="List of clinical evidence records.")
    total: int = Field(..., description="Total count of returned items.")
