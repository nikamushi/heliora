"""Tests for core security utilities: bcrypt hashing, JWT tokens, and Supabase JWKS verification."""

import time
from datetime import timedelta
from unittest.mock import MagicMock, patch

import pytest
from jose import jwt

from app.core.config import settings
from app.core.security import (
    SupabaseJWKSVerifier,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
    verify_token,
)


def test_password_hashing():
    raw = "SuperSecret123!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_lifecycle():
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(subject=user_id, expires_delta=timedelta(minutes=15))
    decoded = decode_access_token(token)
    assert decoded["sub"] == user_id
    assert "exp" in decoded


def test_jwt_token_expired():
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-1))
    with pytest.raises(jwt.JWTError):
        decode_access_token(token)


def test_verify_token_fallback_legacy_hs256():
    """verify_token correctly resolves legacy HS256 tokens."""
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(subject=user_id, expires_delta=timedelta(minutes=15))
    payload = verify_token(token)
    assert payload["sub"] == user_id


def test_supabase_jwks_caching():
    """fetch_keys respects cache TTL without redundant network calls."""
    verifier = SupabaseJWKSVerifier()
    verifier._keys = {"dummy-key": "mock"}
    verifier._last_fetched = time.time() - 10  # 10s ago, well within default 3600s TTL

    keys = verifier.fetch_keys(force=False)
    assert keys == {"dummy-key": "mock"}


def test_supabase_jwks_verifier_missing_kid():
    """Token with header missing kid should raise JWTError."""
    token_missing_kid = jwt.encode(
        {"sub": "123"},
        settings.SECRET_KEY,
        algorithm=settings.TOKEN_ALGORITHM,
        headers={},
    )
    verifier = SupabaseJWKSVerifier()
    with pytest.raises(jwt.JWTError, match="missing 'kid'"):
        verifier.verify_supabase_token(token_missing_kid)


def test_supabase_jwks_verifier_unallowed_alg():
    """Token with disallowed algorithm raises JWTError."""
    verifier = SupabaseJWKSVerifier()
    token = jwt.encode(
        {"sub": "123"},
        settings.SECRET_KEY,
        algorithm="HS384",
        headers={"kid": "some-key"},
    )
    with pytest.raises(jwt.JWTError, match="not in allowed algorithms"):
        verifier.verify_supabase_token(token)


def test_supabase_jwks_verifier_key_not_found():
    """Token with kid not in JWKS raises JWTError."""
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ec

    private_key = ec.generate_private_key(ec.SECP256R1())
    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    token = jwt.encode(
        {"sub": "123"},
        pem_private,
        algorithm="ES256",
        headers={"kid": "unknown-kid"},
    )
    verifier = SupabaseJWKSVerifier()
    with patch.object(verifier, "fetch_keys", return_value={"different-kid": MagicMock()}):
        with pytest.raises(jwt.JWTError, match="not found in Supabase JWKS"):
            verifier.verify_supabase_token(token)


def test_supabase_jwks_verifier_end_to_end():
    """Verify Supabase JWT token with constructed EC public key in JWKS."""
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ec
    from jose import jwk

    private_key = ec.generate_private_key(ec.SECP256R1())
    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pem_public = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )

    claims = {
        "sub": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@heliora.health",
        "iss": settings.SUPABASE_ISSUER,
        "aud": settings.SUPABASE_AUDIENCE,
    }

    token = jwt.encode(
        claims,
        pem_private,
        algorithm="ES256",
        headers={"kid": "my-test-kid"},
    )

    ec_jwk = jwk.construct(pem_public, algorithm="ES256")

    verifier = SupabaseJWKSVerifier()
    verifier._keys = {"my-test-kid": ec_jwk}
    verifier._last_fetched = time.time()

    with patch.object(verifier, "fetch_keys", return_value=verifier._keys):
        payload = verifier.verify_supabase_token(token)
        assert payload["sub"] == "123e4567-e89b-12d3-a456-426614174000"
        assert payload["email"] == "test@heliora.health"


@pytest.mark.asyncio
async def test_get_current_user_resolves_existing():
    """get_current_user resolves existing user using verified token."""
    import uuid
    from unittest.mock import AsyncMock

    from app.api.dependencies import get_current_user
    from app.db.models.user import User

    user_id = uuid.uuid4()
    dummy_user = User(
        id=user_id,
        email="existing@heliora.health",
        password_hash="hashed",
        full_name="Existing User",
    )
    mock_db = AsyncMock()

    with (
        patch("app.api.dependencies.verify_token", return_value={"sub": str(user_id)}),
        patch("app.api.dependencies.user_repo.get_by_id", new_callable=AsyncMock, return_value=dummy_user),
    ):
        resolved_user = await get_current_user(token="mock.jwt.token", db=mock_db)
        assert resolved_user.id == user_id
        assert resolved_user.email == "existing@heliora.health"


@pytest.mark.asyncio
async def test_get_current_user_jit_provisioning():
    """get_current_user provisions new user if absent from local DB."""
    import uuid
    from unittest.mock import AsyncMock

    from app.api.dependencies import get_current_user

    user_id = uuid.uuid4()
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    payload = {
        "sub": str(user_id),
        "email": "newuser@heliora.health",
        "user_metadata": {"full_name": "New Supabase User"},
    }

    with (
        patch("app.api.dependencies.verify_token", return_value=payload),
        patch("app.api.dependencies.user_repo.get_by_id", new_callable=AsyncMock, return_value=None),
    ):
        resolved_user = await get_current_user(token="mock.supabase.token", db=mock_db)
        assert resolved_user.id == user_id
        assert resolved_user.email == "newuser@heliora.health"
        assert resolved_user.full_name == "New Supabase User"
        assert resolved_user.password_hash == "supabase_managed"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_awaited_once()



