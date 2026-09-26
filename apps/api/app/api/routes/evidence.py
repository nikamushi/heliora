"""HELIORA API — Clinical evidence routes.

Endpoints for Evidence Center and guideline citations.
Implements Architecture §8, §14, PRD FR-027, FR-028, FR-029, BR-EVIDENCE-001.
"""

from fastapi import APIRouter, Query, status

from app.schemas.evidence import EvidenceListResponse
from app.services.evidence_service import evidence_service

router = APIRouter()


@router.get(
    "",
    response_model=EvidenceListResponse,
    status_code=status.HTTP_200_OK,
    summary="List clinical evidence entries",
    description=(
        "Retrieves verified clinical evidence citations and international/national "
        "guidelines (WHO, PERKENI, CDC, ESC, AHA) with optional category, rule_id, "
        "and search keyword filtering (PRD FR-027, BR-EVIDENCE-001)."
    ),
)
async def get_clinical_evidence(
    category: str | None = Query(
        default=None,
        description="Filter by intervention domain category (e.g., 'activity', 'sleep', 'nutrition').",
    ),
    rule_id: str | None = Query(
        default=None,
        description="Filter by associated clinical recommendation rule ID (e.g., 'REC-ACT-01').",
    ),
    search: str | None = Query(
        default=None,
        description="Search query to filter by guideline title, organization, or clinical text.",
    ),
) -> EvidenceListResponse:
    """Retrieve list of clinical evidence and citations."""
    return evidence_service.list_evidence(
        category=category,
        rule_id=rule_id,
        search=search,
    )
