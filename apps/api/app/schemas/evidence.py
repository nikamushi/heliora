"""HELIORA API — Clinical evidence schemas.

Schemas for Evidence Center and clinical guideline citations.
Implements Architecture §8, §14, PRD FR-027, FR-028, FR-029, BR-EVIDENCE-001–005.
"""

from typing import Any, Literal

from pydantic import BaseModel, Field

EvidenceCategory = Literal[
    "activity",
    "sleep",
    "nutrition",
    "cardiovascular",
    "weight",
    "smoking",
    "stress",
    "consultation",
]

EvidenceLevel = Literal["Level A (Kuat)", "Level B (Sedang)", "Level C (Konsensus Pakar)"]


class ClinicalEvidenceItem(BaseModel):
    """A verified clinical evidence or guideline citation entry."""

    id: str = Field(..., description="Unique evidence identifier (e.g., 'evi-01').")
    slug: str | None = Field(default=None, description="URL-friendly slug (e.g., 'who-pa-2020').")
    rule_id: str = Field(..., description="Referenced intervention rule ID (e.g., 'REC-ACT-01').")
    title: str = Field(..., description="Full title of the clinical guideline or study.")
    title_translation: str | None = Field(
        default=None,
        description="Indonesian translation of title if source title is in English.",
    )
    organization: str = Field(..., description="Authoring medical body or guideline publisher.")
    short_org: str | None = Field(default=None, description="Short organization acronym (e.g., 'WHO', 'PERKENI').")
    publication: str | None = Field(default=None, description="Journal or publication name and year.")
    evidence_type: str | None = Field(default=None, description="Document/evidence type (e.g., 'Pedoman Resmi').")
    evidence_type_category: str | None = Field(
        default=None,
        description="BR-EVIDENCE-003 hierarchy category.",
    )
    year: int = Field(..., description="Publication year.")
    version: str | None = Field(default=None, description="Document version or edition.")
    evidence_level: EvidenceLevel = Field(..., description="Strength of clinical evidence grade.")
    has_formal_grading: bool | None = Field(
        default=True,
        description="Whether this source uses a formal clinical recommendation grading system (e.g. GRADE).",
    )
    grading_badge_label: str | None = Field(
        default=None,
        description="Short label displayed on list badge (e.g. 'Rekomendasi kuat', 'Studi observasional').",
    )
    recommendation_strength: str | None = Field(default=None, description="Strength of recommendation ('Kuat' | 'Kondisional').")
    evidence_certainty: str | None = Field(default=None, description="Certainty of evidence ('Tinggi' | 'Sedang' | 'Terbatas' | 'Konsensus Klinis').")
    evidence_grading_system: str | None = Field(
        default=None,
        description="Original grading system of the authoring body (e.g., WHO GRADE).",
    )
    evidence_grading_detail: str | None = Field(
        default=None,
        description="Translated explanation of original grading system.",
    )
    category: EvidenceCategory = Field(..., description="Domain category of evidence.")
    category_label: str = Field(..., description="Human-readable category title.")
    supported_recommendations: list[Any] = Field(
        default_factory=list,
        description="List of HELIORA recommendation titles or action objects supported by this evidence.",
    )
    plain_summary: str | None = Field(
        default=None,
        description="Layperson-friendly summary explaining what this means for the user.",
    )
    biological_mechanism: str | None = Field(
        default=None,
        description="Detailed physiological / biochemical mechanism (progressive disclosure).",
    )
    summary: str = Field(..., description="Structured clinical abstract / evidentiary justification.")
    clinical_section: str = Field(..., description="Specific recommendation section or chapter.")
    citation: str = Field(..., description="Standard academic / clinical citation.")
    primary_citation: str | None = Field(default=None, description="Primary official citation.")
    related_publication: str | None = Field(default=None, description="Related journal article or study citation.")
    related_publication_doi: str | None = Field(
        default=None,
        description="DOI of the related scientific journal article if applicable.",
    )
    external_url: str = Field(..., description="Direct reference URL to source guideline publication.")
    last_verified: str | None = Field(default=None, description="Date of last verification (BR-EVIDENCE-004).")
    doi: str | None = Field(default=None, description="Digital Object Identifier.")


class EvidenceListResponse(BaseModel):
    """Response payload containing clinical evidence citation items."""

    items: list[ClinicalEvidenceItem] = Field(..., description="List of clinical evidence records.")
    total: int = Field(..., description="Total count of returned items.")
