"""HELIORA API — Simulation routes.

Endpoints for Future Health Simulation and What-if exploration.
Implements Architecture §12, §12.3, §18, §19, PRD BR-SIM-001–004, 007, 008, BR-WHATIF-001–006, FR-020–023, AC-SIM-01/02, AC-WHATIF-01/02, SIM-001–SIM-004.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db, require_active_consent
from app.db.models.consent import Consent
from app.db.models.user import User
from app.schemas.simulation import (
    FutureSimulationRequest,
    FutureSimulationResponse,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
)
from app.services.simulation_service import simulation_service

router = APIRouter()


@router.post(
    "/future",
    response_model=FutureSimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Run future health trajectory simulation",
    description=(
        "Projects estimated health scores and multi-condition chronic disease risk "
        "trajectories over specified horizons (30, 90, 180 days) based on current habits. "
        "Operates in-memory without mutating persistent profile data (BR-SIM-007)."
    ),
)
async def simulate_future_health(
    request: FutureSimulationRequest,
    current_user: User = Depends(get_current_user),
    _consent: Consent = Depends(require_active_consent),
    db: AsyncSession = Depends(get_db),
) -> FutureSimulationResponse:
    """Run future trajectory simulation for authenticated user."""
    return await simulation_service.simulate_future_trajectory(
        db, current_user.id, request
    )


@router.post(
    "/what-if",
    response_model=WhatIfSimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Run what-if scenario simulation",
    description=(
        "Recalculates multi-condition risks and health scores in real-time based on "
        "interactive lifestyle overrides (sleep, activity, weight, smoking). "
        "Zero permanent mutation to persistent user profile (BR-SIM-007)."
    ),
)
async def simulate_what_if_scenario(
    request: WhatIfSimulationRequest,
    current_user: User = Depends(get_current_user),
    _consent: Consent = Depends(require_active_consent),
    db: AsyncSession = Depends(get_db),
) -> WhatIfSimulationResponse:
    """Run what-if scenario simulation for authenticated user."""
    return await simulation_service.simulate_what_if(db, current_user.id, request)

