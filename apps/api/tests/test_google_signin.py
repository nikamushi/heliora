"""Integration tests for the Google sign-in path as the frontend experiences it.

ADR-011 requires the API to accept Supabase-issued ES256 tokens and resolve them
to a local user row. These tests drive the exact request sequence that
/auth/callback performs once a real Google login has completed, so a regression
in token dispatch, user resolution, or the consent gate surfaces here instead of
only in a browser.
"""

import uuid
from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from jose import jwk, jwt

from app.api.dependencies import get_db
from app.core.config import settings
from app.db.models.user import User
from app.main import app

JWKS_URL = "https://example.supabase.co/auth/v1/.well-known/jwks.json"
GOOGLE_EMAIL = "google.user@heliora.health"


def _mint_supabase_token(kid: str = "google-key") -> tuple[str, str, dict]:
    """Return a signed ES256 token, its subject, and the JWKS entry for it."""
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ec

    private_key = ec.generate_private_key(ec.SECP256R1())
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    jwk_dict = jwk.construct(private_key.public_key(), algorithm="ES256").to_dict()
    jwk_dict["kid"] = kid

    now = datetime.now(UTC)
    claims = {
        "sub": str(uuid.uuid4()),
        "email": GOOGLE_EMAIL,
        "aud": settings.SUPABASE_AUDIENCE,
        "iat": now,
        "exp": now + timedelta(hours=1),
    }
    if settings.SUPABASE_ISSUER:
        claims["iss"] = settings.SUPABASE_ISSUER

    token = jwt.encode(claims, pem, algorithm="ES256", headers={"kid": kid})
    return token, claims["sub"], jwk_dict


@pytest.mark.asyncio
async def test_google_signin_satisfies_callback_requests(client: AsyncClient):
    """A signed Supabase token authorises /auth/me and reports missing consent.

    This is the contract /auth/callback depends on: hydrate the profile, then
    read consent state to decide between the dashboard and onboarding. A first
    time Google user must be able to read that state while holding no consent
    record, otherwise the callback can never route them onward.
    """
    token, sub, jwk_dict = _mint_supabase_token()
    oauth_user = User(
        id=uuid.UUID(sub),
        email=GOOGLE_EMAIL,
        password_hash=None,
        full_name="Google User",
        created_at=datetime.now(UTC),
    )

    app.dependency_overrides[get_db] = lambda: AsyncMock()
    try:
        with (
            patch.object(settings, "SUPABASE_JWKS_URL", JWKS_URL),
            patch(
                "app.core.security.supabase_jwks_verifier.fetch_keys",
                return_value={jwk_dict["kid"]: jwk.construct(jwk_dict)},
            ),
            patch(
                "app.api.dependencies.user_repo.get_by_id",
                new_callable=AsyncMock,
                return_value=oauth_user,
            ),
            patch(
                "app.api.dependencies.consent_repo.get_active_by_user_id",
                new_callable=AsyncMock,
                return_value=None,
            ),
        ):
            headers = {"Authorization": f"Bearer {token}"}

            me_response = await client.get(
                f"{settings.API_V1_PREFIX}/auth/me", headers=headers
            )
            assert me_response.status_code == 200
            assert me_response.json()["email"] == GOOGLE_EMAIL

            consent_response = await client.get(
                f"{settings.API_V1_PREFIX}/consent/status", headers=headers
            )
            assert consent_response.status_code == 200
            assert consent_response.json()["has_active_consent"] is False
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_google_signin_without_local_user_row_is_unauthorised(
    client: AsyncClient,
):
    """A valid token whose user row is missing fails with the trigger diagnosis.

    The handle_new_user() trigger writes public.users, so a missing row means
    the trigger is absent from the Supabase Postgres. The API must reject the
    request rather than fabricate a session, and must name the cause.
    """
    token, sub, jwk_dict = _mint_supabase_token()

    app.dependency_overrides[get_db] = lambda: AsyncMock()
    try:
        with (
            patch.object(settings, "SUPABASE_JWKS_URL", JWKS_URL),
            patch(
                "app.core.security.supabase_jwks_verifier.fetch_keys",
                return_value={jwk_dict["kid"]: jwk.construct(jwk_dict)},
            ),
            patch(
                "app.api.dependencies.user_repo.get_by_id",
                new_callable=AsyncMock,
                return_value=None,
            ),
        ):
            response = await client.get(
                f"{settings.API_V1_PREFIX}/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )

            assert response.status_code == 401
            assert "no user row exists" in response.json()["detail"]
            assert "handle_new_user" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()
