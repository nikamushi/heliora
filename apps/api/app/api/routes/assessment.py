"""HELIORA API — Assessment routes.

Endpoints for executing and retrieving health risk assessments.
Implements Architecture §6.6, §8.7, §21.1, PRD FR-042, and BE-004.
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db, require_active_consent
from app.db.models.consent import Consent
from app.db.models.user import User
from app.schemas.assessment import AssessmentSummaryResponse
from app.services.assessment_service import assessment_service

router = APIRouter()


@router.post(
    "",
    response_model=AssessmentSummaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger and run new health assessment",
    description=(
        "Executes the Preventive Lifestyle Risk Engine against the user's active health profile. "
        "Calculates multi-condition risks, scores, factors, and stores outcomes. "
        "Requires active consent agreement before processing."
    ),
)
async def create_assessment(
    current_user: User = Depends(get_current_user),
    _consent: Consent = Depends(require_active_consent),
    db: AsyncSession = Depends(get_db),
) -> AssessmentSummaryResponse:
    """Trigger new risk assessment session for authenticated user."""
    return await assessment_service.run_assessment(db, current_user.id)


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
    return await assessment_service.get_latest_assessment(db, current_user.id)


@router.get(
    "/{assessment_id}",
    response_model=AssessmentSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get assessment by ID",
    description="Retrieves a specific assessment session by UUID for the authenticated user.",
)
async def get_assessment_by_id(
    assessment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssessmentSummaryResponse:
    """Retrieve specific assessment session for authenticated user."""
    return await assessment_service.get_assessment_by_id(
        db, assessment_id, current_user.id
    )

@router.get(
    "/{assessment_id}/explanation",
    status_code=status.HTTP_200_OK,
    summary="Get clinical explanation for assessment session",
)
async def get_assessment_explanation(
    assessment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve clinical explanation for an assessment session."""
    res = await assessment_service.get_assessment_by_id(
        db, assessment_id, current_user.id
    )
    return {
        "text": res.ai_explanation,
        "evidence_refs": res.ai_evidence_refs or [],
        "source": res.ai_source or "fallback",
    }

