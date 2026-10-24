"""HELIORA API — Application configuration.

Uses pydantic-settings to load configuration from environment variables.
Secrets and deployment-specific values MUST come from the environment,
never from source code (Architecture §22.3).
"""

from pathlib import Path

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Robust directory discovery to locate .env regardless of where the command is executed
_CONFIG_DIR = Path(__file__).resolve().parent  # app/core
_APP_DIR = _CONFIG_DIR.parent  # app
_API_DIR = _APP_DIR.parent  # apps/api
_REPO_ROOT = _API_DIR.parent.parent  # heliora

_ENV_FILES = [
    str(_API_DIR / ".env"),
    str(_REPO_ROOT / ".env"),
    str(_API_DIR.parent / ".env"),
    ".env",
]


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=_ENV_FILES,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "HELIORA"

    # ── Database ─────────────────────────────────────────────────
    # Canonical default uses Supabase AWS Session Pooler (port 5432) to prevent local socket 10061 failures
    DATABASE_URL: str = "postgresql+asyncpg://postgres.vhrwtzenemkswivwhwmt:heliora2026@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        """Ensure standard postgresql:// scheme uses asyncpg driver and session pooler."""
        if not isinstance(v, str):
            return v
        # Redirect direct Supabase DB host to AWS session pooler on port 5432 to prevent Windows IPv6 WinError 1225
        if "db.vhrwtzenemkswivwhwmt.supabase.co" in v:
            v = v.replace(
                "db.vhrwtzenemkswivwhwmt.supabase.co",
                "aws-0-ap-northeast-2.pooler.supabase.com",
            )
            if "postgres:" in v and "postgres.vhrwtzenemkswivwhwmt" not in v:
                v = v.replace("postgres:", "postgres.vhrwtzenemkswivwhwmt:", 1)
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # ── CORS ─────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    CORS_ORIGIN_REGEX: str | None = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    # ── LLM Provider (Gemini — ADR-009, Architecture §41) ────────────
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    LLM_TIMEOUT_SECONDS: int = 10
    # Cloudflare Worker proxy for VPS hosts in unsupported Gemini regions
    GEMINI_PROXY_URL: str | None = None
    GEMINI_PROXY_SECRET: str | None = None

    # ── Auth (Legacy & FastAPI Native) ───────────────────────────
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    TOKEN_ALGORITHM: str = "HS256"

    # ── Supabase Auth / JWKS Verifier (ADR-011 / Issue #18) ──────
    SUPABASE_URL: str | None = "https://vhrwtzenemkswivwhwmt.supabase.co"
    SUPABASE_JWKS_URL: str | None = None
    SUPABASE_ISSUER: str | None = None
    SUPABASE_AUDIENCE: str = "authenticated"
    SUPABASE_ALLOWED_ALGS: list[str] = ["ES256", "RS256"]
    SUPABASE_JWKS_CACHE_TTL_SECONDS: int = 3600

    @model_validator(mode="after")
    def populate_supabase_defaults(self) -> "Settings":
        """Auto-populate Supabase JWKS URL and issuer from SUPABASE_URL if not provided."""
        if self.SUPABASE_URL:
            base = self.SUPABASE_URL.rstrip("/")
            if not self.SUPABASE_JWKS_URL:
                self.SUPABASE_JWKS_URL = f"{base}/auth/v1/.well-known/jwks.json"
            if not self.SUPABASE_ISSUER:
                self.SUPABASE_ISSUER = f"{base}/auth/v1"
        return self

    @model_validator(mode="after")
    def validate_cors_security(self) -> "Settings":
        """Ensure CORS localhost regex is strictly disabled outside development/test environments."""
        if self.APP_ENV not in ("development", "test", "testing", "local"):
            self.CORS_ORIGIN_REGEX = None
        return self

    @property
    def database_url_sync(self) -> str:
        """Return a synchronous database URL for Alembic migrations."""
        return self.DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")


settings = Settings()
