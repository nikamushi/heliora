"""HELIORA API — Assessment routes.

Endpoints for retrieving user risk assessment results.
Implements Architecture §8.7 and PRD FR-042.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user, get_db
from app.db.models.assessment import Assessment
from app.db.models.user import User
from app.schemas.assessment import (
    AssessmentSummaryResponse,
    ContributingFactor,
    RecommendationItem,
    RiskAssessmentItem,
)

router = APIRouter()


@router.get(
    "/latest",
    response_model=AssessmentSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get latest assessment summary",
    description=(
        "Returns the most recent risk assessment outcome for the authenticated user. "
        "Returns 404 if the user has not completed any assessments."
    ),
)
async def get_latest_assessment(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssessmentSummaryResponse:
    """Retrieve the latest assessment and risk calculation for authenticated user."""
    stmt = (
        select(Assessment)
        .where(Assessment.user_id == current_user.id)
        .options(
            selectinload(Assessment.risk_result),
            selectinload(Assessment.recommendations),
        )
        .order_by(Assessment.created_at.desc())
    )
    result = await db.execute(stmt)
    assessment = result.scalars().first()

    if assessment is None or assessment.risk_result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Belum ada data asesmen risiko. Silakan lengkapi profil kesehatan terlebih dahulu.",
        )

    rr = assessment.risk_result

    def to_level(prob: float) -> str:
        if prob >= 0.5:
            return "high"
        if prob >= 0.25:
            return "moderate"
        return "low"

    risks = [
        RiskAssessmentItem(
            condition="diabetes",
            label="Diabetes Melitus",
            probability=float(rr.diabetes_risk),
            risk_level=to_level(float(rr.diabetes_risk)),
            trend="stable",
            description="Estimasi faktor risiko metabolik dan pola gaya hidup.",
        ),
        RiskAssessmentItem(
            condition="hypertension",
            label="Hipertensi",
            probability=float(rr.hypertension_risk),
            risk_level=to_level(float(rr.hypertension_risk)),
            trend="stable",
            description="Estimasi regulasi vaskular dan faktor stres/tidur.",
        ),
        RiskAssessmentItem(
            condition="cardiovascular",
            label="Penyakit Jantung",
            probability=float(rr.cardiovascular_risk),
            risk_level=to_level(float(rr.cardiovascular_risk)),
            trend="stable",
            description="Estimasi risiko kardiovaskular kumulatif.",
        ),
    ]

    recommendations: list[RecommendationItem] = []
    if assessment.recommendations:
        for rec in assessment.recommendations:
            recommendations.append(
                RecommendationItem(
                    id=str(rec.id),
                    title=rec.title,
                    category=getattr(rec, "category", "activity"),
                    action=rec.action,
                    evidence_level=getattr(rec, "evidence_level", "A"),
                    source=getattr(rec, "source", "Kemenkes / WHO"),
                )
            )

    return AssessmentSummaryResponse(
        id=str(assessment.id),
        user_id=str(current_user.id),
        health_score=float(rr.health_score),
        lifestyle_score=float(rr.lifestyle_score),
        risks=risks,
        top_factors=[],
        recommendations=recommendations,
        assessed_at=assessment.created_at.isoformat(),
        is_mock=False,
    )
