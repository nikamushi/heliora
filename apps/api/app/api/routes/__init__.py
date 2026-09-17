"""HELIORA API — Route aggregation.

Mounts all API route modules under the versioned prefix.
"""

from fastapi import APIRouter

from app.api.routes import assessment, auth, consent, health_profile

router = APIRouter()

# ── Mounted Routes ───────────────────────────────────────────────
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(consent.router, prefix="/consent", tags=["consent"])
router.include_router(health_profile.router, prefix="/health-profile", tags=["health-profile"])
router.include_router(assessment.router, prefix="/assessment", tags=["assessment"])
