"""HELIORA API — Route aggregation.

Mounts all API route modules under the versioned prefix.
"""

from fastapi import APIRouter

from app.api.routes import auth

router = APIRouter()

# ── Mounted Routes ───────────────────────────────────────────────
router.include_router(auth.router, prefix="/auth", tags=["auth"])
