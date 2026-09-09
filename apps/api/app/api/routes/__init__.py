"""HELIORA API — Route aggregation.

Mounts all API route modules under the versioned prefix.
"""

from fastapi import APIRouter

from app.api.routes import auth, consent

router = APIRouter()

# ── Mounted Routes ───────────────────────────────────────────────
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(consent.router, prefix="/consent", tags=["consent"])
