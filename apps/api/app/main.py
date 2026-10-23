"""HELIORA API — FastAPI application entry point.

Creates the FastAPI app instance with:
- CORS middleware (Architecture §22.1)
- Lifespan context (DB connection pool management)
- Health check endpoint (SETUP-003 acceptance criteria)
- Versioned API router mount
"""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.api.routes import router as api_router
from app.core.config import settings
from app.schemas.health import HealthCheckResponse

logger = logging.getLogger(__name__)


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
        logger.info("[DB] Database connectivity check succeeded.")
    except Exception as exc:
        logger.warning(
            "Database connectivity check failed on startup: %s", exc, exc_info=True
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
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
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
        or "connect call failed" in err_str
        or "1225" in err_str
        or "10061" in err_str
    )
    if is_socket_conn_failure:
        logger.error(
            f"[DB ERROR 503] Socket connection failure on {request.method} {request.url.path}: {exc}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "Koneksi ke database gagal. Pastikan service database PostgreSQL aktif dan kredensial valid."
                )
            },
        )
    logger.error(
        f"[SYSTEM ERROR 500] Unhandled OSError on {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Terjadi kesalahan internal sistem."},
    )


@app.exception_handler(
    __import__("sqlalchemy.exc", fromlist=["SQLAlchemyError"]).SQLAlchemyError
)
async def sqlalchemy_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle database operational/connection errors from SQLAlchemy."""
    err_str = str(exc).lower()
    is_conn_failure = (
        "connection refused" in err_str
        or "connect call failed" in err_str
        or "cannot connect" in err_str
        or "connection error" in err_str
        or "10061" in err_str
        or "1225" in err_str
    )
    if is_conn_failure:
        logger.error(
            f"[DB ERROR 503] SQLAlchemy connection error on {request.method} {request.url.path}: {exc}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "Koneksi ke database gagal. Pastikan service database PostgreSQL aktif dan kredensial valid."
                )
            },
        )
    logger.error(
        f"[DB ERROR 500] Database error on {request.method} {request.url.path}: {exc}",
        exc_info=True,
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


@app.get(
    "/health",
    response_model=HealthCheckResponse,
    tags=["system"],
    summary="Health check (root)",
)
async def health_check_root() -> HealthCheckResponse:
    return HealthCheckResponse(environment=settings.APP_ENV)
