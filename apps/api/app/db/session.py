"""HELIORA API — Async database session management.

Creates the async engine and session factory used throughout the
application. The engine is configured from ``DATABASE_URL`` in the
environment (Architecture §28.1).
"""

import logging

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

logger = logging.getLogger(__name__)

# Safe host logging for diagnostics
try:
    _db_host = settings.DATABASE_URL.split("@")[-1]
    logger.info(f"[DB] Initializing async engine target: {_db_host}")
except Exception:
    pass

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.APP_ENV == "development"),
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
