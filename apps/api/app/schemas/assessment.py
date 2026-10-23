"""HELIORA API — Assessment request and response schemas.

Implements Architecture §8.7 and PRD FR-042.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict


class RiskAssessmentItem(BaseModel):
    condition: Literal["diabetes", "hypertension", "cardiovascular"]
    label: str
    probability: float
    estimated_risk_score: float
    risk_level: Literal["low", "moderate", "high"]
    risk_label: Literal[
        "Lower", "Moderate", "Higher", "Lebih Rendah", "Sedang", "Lebih Tinggi"
    ] = "Lower"
    trend: Literal["stable", "increasing", "decreasing"] = "stable"
    description: str


class ContributingFactor(BaseModel):
    feature: str
    label: str
    impact: Literal["increase", "decrease"]
    weight_percentage: float
    description: str
    value_display: str | None = None


class RecommendationItem(BaseModel):
    id: str
    rule_id: str | None = None
    title: str
    category: Literal["sleep", "activity", "nutrition", "stress", "consultation"]
    priority: Literal["high", "medium", "low", "protective"] = "medium"
    action: str
    evidence_level: Literal["High", "Moderate", "Limited", "A", "B", "C"] = "High"
    source: str


class AssessmentSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str | None = None
    health_score: float
    lifestyle_score: float
    risks: list[RiskAssessmentItem]
    top_factors: list[ContributingFactor]
    recommendations: list[RecommendationItem]
    assessed_at: str
    is_mock: bool = False
    is_baseline: bool = True
    ai_explanation: str | None = None
    ai_evidence_refs: list[str] | None = None
    ai_source: Literal["llm", "fallback"] | None = None
