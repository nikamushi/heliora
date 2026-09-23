"""Tests for Authentication endpoints (BE-001).

Covers user registration, credential authentication, JWT token issuance,
OAuth2 compatibility, and protected /auth/me access.
"""

import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.api.dependencies import get_db
from app.core.config import settings
from app.db.models.user import User
from app.main import app


@pytest.mark.asyncio
async def test_register_and_login_lifecycle(client: AsyncClient):
    """Complete lifecycle: register, login, me, and error cases."""
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"user_{unique_suffix}@heliora.health"
    password = "SuperSecretPassword123!"
    full_name = "Test User Registration"

    users_db: dict[str, User] = {}

    async def mock_get_by_email(session, em):
        return users_db.get(em.lower())

    async def mock_get_by_id(session, uid):
        for u in users_db.values():
            if u.id == uid:
                return u
        return None

    async def mock_create(session, **kwargs):
        now = datetime.now(UTC)
        u = User(
            id=kwargs.get("id") or uuid.uuid4(),
            email=kwargs["email"],
            password_hash=kwargs.get("password_hash"),
            full_name=kwargs["full_name"],
            created_at=now,
            updated_at=now,
        )
        users_db[u.email.lower()] = u
        return u

    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with (
            patch(
                "app.services.auth_service.user_repo.get_by_email",
                side_effect=mock_get_by_email,
            ),
            patch(
                "app.services.auth_service.user_repo.create",
                side_effect=mock_create,
            ),
            patch(
                "app.api.dependencies.user_repo.get_by_id",
                side_effect=mock_get_by_id,
            ),
        ):
            # ── 1. Register new user ─────────────────────────────────────
            reg_response = await client.post(
                f"{settings.API_V1_PREFIX}/auth/register",
                json={
                    "email": email,
                    "password": password,
                    "full_name": full_name,
                },
            )
            assert reg_response.status_code == 201
            reg_data = reg_response.json()
            assert "access_token" in reg_data
            assert reg_data["token_type"] == "bearer"
            assert reg_data["user"]["email"] == email
            assert reg_data["user"]["full_name"] == full_name
            token = reg_data["access_token"]

            # ── 2. Duplicate registration should fail with 409 ───────────
            dup_response = await client.post(
                f"{settings.API_V1_PREFIX}/auth/register",
                json={
                    "email": email,
                    "password": password,
                    "full_name": full_name,
                },
            )
            assert dup_response.status_code == 409
            assert "already registered" in dup_response.json()["detail"].lower()

            # ── 3. Login with correct credentials (JSON) ─────────────────
            login_response = await client.post(
                f"{settings.API_V1_PREFIX}/auth/login",
                json={
                    "email": email,
                    "password": password,
                },
            )
            assert login_response.status_code == 200
            login_data = login_response.json()
            assert "access_token" in login_data
            assert login_data["user"]["email"] == email

            # ── 4. Login with OAuth2 form (Swagger UI compatibility) ─────
            oauth_response = await client.post(
                f"{settings.API_V1_PREFIX}/auth/token",
                data={
                    "username": email,
                    "password": password,
                },
            )
            assert oauth_response.status_code == 200
            assert "access_token" in oauth_response.json()

            # ── 5. Login with incorrect password should return 401 ───────
            wrong_pw_response = await client.post(
                f"{settings.API_V1_PREFIX}/auth/login",
                json={
                    "email": email,
                    "password": "WrongPasswordHere!",
                },
            )
            assert wrong_pw_response.status_code == 401

            # ── 6. Login with nonexistent email should return 401 ────────
            nonexistent_response = await client.post(
                f"{settings.API_V1_PREFIX}/auth/login",
                json={
                    "email": f"nonexistent_{unique_suffix}@heliora.health",
                    "password": password,
                },
            )
            assert nonexistent_response.status_code == 401

            # ── 7. Access /auth/me with valid bearer token ───────────────
            me_response = await client.get(
                f"{settings.API_V1_PREFIX}/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert me_response.status_code == 200
            me_data = me_response.json()
            assert me_data["email"] == email
            assert me_data["full_name"] == full_name
            assert "id" in me_data
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_auth_me_unauthorized(client: AsyncClient):
    """Accessing /auth/me without token or invalid token should return 401."""
    # No header
    no_auth_res = await client.get(f"{settings.API_V1_PREFIX}/auth/me")
    assert no_auth_res.status_code == 401

    # Invalid token
    invalid_token_res = await client.get(
        f"{settings.API_V1_PREFIX}/auth/me",
        headers={"Authorization": "Bearer invalid.fake.token"},
    )
    assert invalid_token_res.status_code == 401


@pytest.mark.asyncio
async def test_register_validation_errors(client: AsyncClient):
    """Validation errors for password length and email format."""
    # Password too short (< 8 chars)
    short_pw_res = await client.post(
        f"{settings.API_V1_PREFIX}/auth/register",
        json={
            "email": "valid@heliora.health",
            "password": "short",
            "full_name": "Valid Name",
        },
    )
    assert short_pw_res.status_code == 422

    # Invalid email format
    invalid_email_res = await client.post(
        f"{settings.API_V1_PREFIX}/auth/register",
        json={
            "email": "not-an-email",
            "password": "ValidPassword123!",
            "full_name": "Valid Name",
        },
    )
    assert invalid_email_res.status_code == 422
