"""HELIORA API — Security utilities.

Password hashing (bcrypt) and JWT token helpers.
Implements Architecture §20.2 (password hashing) and §20.1 (auth flow).
"""

import time
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import httpx
from jose import jwk, jwt

from app.core.config import settings


# ── Password Hashing ────────────────────────────────────────────
def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pw_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    if not hashed_password:
        return False
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


# ── Supabase JWKS Verifier (ADR-011 / Issue #18) ────────────────
class SupabaseJWKSVerifier:
    """Verifier for Supabase JWT tokens via JWKS public keys (ADR-011)."""

    def __init__(self) -> None:
        self._keys: dict[str, Any] = {}
        self._last_fetched: float = 0.0

    def fetch_keys(self, force: bool = False) -> dict[str, Any]:
        """Fetch and cache public keys from Supabase JWKS endpoint."""
        now = time.time()
        ttl = settings.SUPABASE_JWKS_CACHE_TTL_SECONDS
        if not force and self._keys and (now - self._last_fetched < ttl):
            return self._keys

        jwks_url = settings.SUPABASE_JWKS_URL
        if not jwks_url:
            return self._keys

        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(jwks_url)
                resp.raise_for_status()
                data = resp.json()
                keys = data.get("keys", [])
                parsed_keys = {}
                for k in keys:
                    kid = k.get("kid")
                    if kid:
                        parsed_keys[kid] = jwk.construct(k)
                self._keys = parsed_keys
                self._last_fetched = now
        except Exception as exc:
            if force and not self._keys:
                raise jwt.JWTError(f"Cannot reach JWKS endpoint: {exc}") from exc

        return self._keys

    def verify_supabase_token(self, token: str) -> dict[str, Any]:
        """Verify Supabase JWT token against JWKS public key."""
        try:
            header = jwt.get_unverified_header(token)
        except Exception as exc:
            raise jwt.JWTError(f"Invalid token header: {exc}") from exc

        kid = header.get("kid")
        if not kid:
            raise jwt.JWTError("Token header missing 'kid' (Key ID)")

        alg = header.get("alg")
        if alg not in settings.SUPABASE_ALLOWED_ALGS:
            raise jwt.JWTError(
                f"Algorithm '{alg}' is not in allowed algorithms "
                f"{settings.SUPABASE_ALLOWED_ALGS}"
            )

        keys = self.fetch_keys(force=False)
        if kid not in keys:
            keys = self.fetch_keys(force=True)

        if kid not in keys:
            raise jwt.JWTError(f"Key ID '{kid}' not found in Supabase JWKS")

        key = keys[kid]

        options = {
            "verify_signature": True,
            "verify_aud": bool(settings.SUPABASE_AUDIENCE),
            "verify_iat": True,
            "verify_exp": True,
            "verify_nbf": True,
            "verify_iss": bool(settings.SUPABASE_ISSUER),
        }

        return jwt.decode(
            token,
            key,
            algorithms=settings.SUPABASE_ALLOWED_ALGS,
            audience=settings.SUPABASE_AUDIENCE,
            issuer=settings.SUPABASE_ISSUER,
            options=options,
        )


supabase_jwks_verifier = SupabaseJWKSVerifier()


def verify_token(token: str) -> dict[str, Any]:
    """Unified token verifier supporting Supabase JWKS and legacy HS256 tokens."""
    try:
        header = jwt.get_unverified_header(token)
    except Exception:
        return decode_access_token(token)

    if header.get("kid") and settings.SUPABASE_JWKS_URL:
        return supabase_jwks_verifier.verify_supabase_token(token)

    return decode_access_token(token)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify a legacy HS256 JWT access token.

    Raises ``jose.JWTError`` on invalid/expired tokens.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.TOKEN_ALGORITHM])
