"""HELIORA API — FastAPI application entry point.

Creates the FastAPI app instance with:
- CORS middleware (Architecture §22.1)
- Lifespan context (DB connection pool management)
- Health check endpoint (SETUP-003 acceptance criteria)
- Versioned API router mount
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.api.routes import router as api_router
from app.core.config import settings
from app.schemas.health import HealthCheckResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — startup and shutdown hooks.

    On startup: verify database connectivity.
    On shutdown: dispose engine connection pool.
    """
    # ── Startup ──────────────────────────────────────────────
    from app.db.session import engine

    # Quick connectivity check (fail fast if DB is unreachable)
    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
    except Exception as exc:
        import logging

        logging.getLogger(__name__).warning(
            "Database connectivity check failed on startup: %s", exc
        )

    yield

    # ── Shutdown ─────────────────────────────────────────────
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "AI-Powered Preventive Health Intelligence Platform API. "
        "HELIORA is not a medical diagnosis tool."
    ),
    version="0.1.0",
    lifespan=lifespan,
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# ── CORS Middleware (Architecture §22.1) ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Exception Handlers ─────────────────────────────────────
@app.exception_handler(OSError)
async def os_error_handler(request: Request, exc: OSError) -> JSONResponse:
    """Handle low-level socket connection errors when the database is unavailable."""
    err_str = str(exc).lower()
    is_socket_conn_failure = (
        isinstance(exc, ConnectionRefusedError)
        or "connection refused" in err_str
        or "1225" in err_str
    )
    if is_socket_conn_failure:
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "Koneksi ke database gagal. Pastikan service database PostgreSQL aktif dan kredensial valid."
                )
            },
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Terjadi kesalahan internal sistem."},
    )


# ── Root & Docs Redirection ───────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    """Redirect root path to interactive Swagger documentation."""
    return RedirectResponse(url=f"{settings.API_V1_PREFIX}/docs")


@app.get("/docs", include_in_schema=False)
async def docs_shortcut() -> RedirectResponse:
    """Convenience alias for standard /docs path."""
    return RedirectResponse(url=f"{settings.API_V1_PREFIX}/docs")


# ── Mount versioned API routes ───────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ── Health Check ─────────────────────────────────────────────────
@app.get(
    f"{settings.API_V1_PREFIX}/health",
    response_model=HealthCheckResponse,
    tags=["system"],
    summary="Health check",
    description="Returns application health status.",
)
async def health_check() -> HealthCheckResponse:
    """Health check endpoint — verifies the API is running.

    Acceptance criteria (SETUP-003): Health check endpoint tersedia.
    """
    return HealthCheckResponse(environment=settings.APP_ENV)
