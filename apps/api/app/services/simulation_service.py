"""HELIORA API — Simulation service.

Orchestrates model-based future health simulation and scenario exploration.
Implements Architecture §12, §19, PRD BR-SIM-001–004, 007, 008, AC-SIM-01/02, SIM-001, SIM-002.
Enforces non-mutation of persistent health profiles (BR-SIM-007).
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.risk_engine import risk_engine
from app.repositories.health_profile_repo import health_profile_repo
from app.schemas.simulation import (
    FutureSimulationRequest,
    FutureSimulationResponse,
    SimulationHorizon,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
)


class SimulationService:
    """Service providing exploratory health projections and what-if simulation."""

    @classmethod
    async def simulate_future_trajectory(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        request: FutureSimulationRequest,
    ) -> FutureSimulationResponse:
        """Execute in-memory model trajectory projection for given horizon."""
        profile = await health_profile_repo.get_by_user_id(db, user_id)
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil kesehatan belum ditemukan. Silakan isi profil kesehatan terlebih dahulu.",
            )

        horizon: SimulationHorizon = request.horizon_days
        raw_result = risk_engine.simulate_future_trajectory(profile, horizon)
        return FutureSimulationResponse(**raw_result)

    @classmethod
    async def simulate_what_if(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        request: WhatIfSimulationRequest,
    ) -> WhatIfSimulationResponse:
        """Execute in-memory real-time risk recalculation for what-if scenario overrides."""
        profile = await health_profile_repo.get_by_user_id(db, user_id)
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil kesehatan belum ditemukan. Silakan isi profil kesehatan terlebih dahulu.",
            )

        overrides = request.model_dump(exclude_unset=True)
        raw_result = risk_engine.simulate_what_if(profile, overrides)
        return WhatIfSimulationResponse(**raw_result)


simulation_service = SimulationService()
