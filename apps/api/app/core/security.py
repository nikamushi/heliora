"""HELIORA API — Security utilities.

Password hashing (bcrypt) and JWT token helpers.
Implements Architecture §20.2 (password hashing) and §20.1 (auth flow).
"""

from datetime import UTC, datetime, timedelta

import bcrypt
from jose import jwt

from app.core.config import settings


# ── Password Hashing ────────────────────────────────────────────
def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pw_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


# ── JWT Tokens ──────────────────────────────────────────────────
def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a signed JWT access token.

    Parameters
    ----------
    subject:
        The token subject (typically user ID as string).
    expires_delta:
        Optional custom expiration. Defaults to settings value.
    """
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.TOKEN_ALGORITHM
    )


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT access token.

    Raises ``jose.JWTError`` on invalid/expired tokens.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.TOKEN_ALGORITHM])
