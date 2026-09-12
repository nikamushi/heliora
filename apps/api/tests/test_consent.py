"""Tests for Consent API and privacy gating (BE-002).

Covers consent recording, status checking, revocation, and the
require_active_consent dependency guard.
"""

import uuid

import pytest
from fastapi import Depends
from httpx import AsyncClient

from app.api.dependencies import require_active_consent
from app.core.config import settings
from app.db.models.consent import Consent
from app.main import app


# Add a temporary test-only route to test require_active_consent guard
@app.get("/api/v1/test-protected-health-action", tags=["test"])
async def protected_health_action(
    consent: Consent = Depends(require_active_consent),
):
    return {"status": "success", "consent_id": str(consent.id)}


async def create_authenticated_user(client: AsyncClient) -> dict:
    """Helper creating a distinct user and returning token and headers."""
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"consent_test_{unique_suffix}@heliora.health"
    password = "ConsentUserPass123!"
    full_name = "Consent Tester"

    reg_res = await client.post(
        f"{settings.API_V1_PREFIX}/auth/register",
        json={"email": email, "password": password, "full_name": full_name},
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    token = data["access_token"]
    return {
        "user": data["user"],
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.mark.asyncio
async def test_consent_lifecycle(client: AsyncClient):
    """Lifecycle test: check initial status, grant consent, recheck, and revoke."""
    auth = await create_authenticated_user(client)
    headers = auth["headers"]

    # 1. Initially, user has no active consent
    status_res = await client.get(
        f"{settings.API_V1_PREFIX}/consent/status",
        headers=headers,
    )
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["has_active_consent"] is False
    assert status_data["active_consent"] is None
    assert "bukan alat diagnosis medis" in status_data["medical_disclaimer"]

    # 2. Protected action should be blocked before consent (HTTP 403)
    blocked_res = await client.get(
        f"{settings.API_V1_PREFIX}/test-protected-health-action",
        headers=headers,
    )
    assert blocked_res.status_code == 403
    assert "Active consent" in blocked_res.json()["detail"]

    # 3. User grants consent
    grant_res = await client.post(
        f"{settings.API_V1_PREFIX}/consent",
        headers=headers,
        json={"agreed": True, "consent_version": "1.0"},
    )
    assert grant_res.status_code == 201
    grant_data = grant_res.json()
    assert grant_data["is_active"] is True
    assert grant_data["consent_version"] == "1.0"
    assert grant_data["revoked_at"] is None

    # 4. Status now reports active consent
    active_status_res = await client.get(
        f"{settings.API_V1_PREFIX}/consent/status",
        headers=headers,
    )
    assert active_status_res.status_code == 200
    assert active_status_res.json()["has_active_consent"] is True

    # 5. Protected action is now permitted (HTTP 200)
    allowed_res = await client.get(
        f"{settings.API_V1_PREFIX}/test-protected-health-action",
        headers=headers,
    )
    assert allowed_res.status_code == 200
    assert allowed_res.json()["status"] == "success"

    # 6. User revokes consent
    revoke_res = await client.post(
        f"{settings.API_V1_PREFIX}/consent/revoke",
        headers=headers,
    )
    assert revoke_res.status_code == 200
    revoke_data = revoke_res.json()
    assert revoke_data["is_active"] is False
    assert revoke_data["revoked_at"] is not None

    # 7. Status now reports consent revoked
    post_revoke_status = await client.get(
        f"{settings.API_V1_PREFIX}/consent/status",
        headers=headers,
    )
    assert post_revoke_status.status_code == 200
    assert post_revoke_status.json()["has_active_consent"] is False

    # 8. Protected action is blocked again after revocation (HTTP 403)
    blocked_again_res = await client.get(
        f"{settings.API_V1_PREFIX}/test-protected-health-action",
        headers=headers,
    )
    assert blocked_again_res.status_code == 403


@pytest.mark.asyncio
async def test_consent_disagreed_validation(client: AsyncClient):
    """POST /consent with agreed=False must return 400 Bad Request."""
    auth = await create_authenticated_user(client)
    res = await client.post(
        f"{settings.API_V1_PREFIX}/consent",
        headers=auth["headers"],
        json={"agreed": False, "consent_version": "1.0"},
    )
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_consent_revoke_not_found(client: AsyncClient):
    """Revoking when no active consent exists returns 404."""
    auth = await create_authenticated_user(client)
    res = await client.post(
        f"{settings.API_V1_PREFIX}/consent/revoke",
        headers=auth["headers"],
    )
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_consent_unauthorized(client: AsyncClient):
    """Accessing consent endpoints without auth returns 401."""
    res_status = await client.get(f"{settings.API_V1_PREFIX}/consent/status")
    assert res_status.status_code == 401

    res_post = await client.post(
        f"{settings.API_V1_PREFIX}/consent",
        json={"agreed": True},
    )
    assert res_post.status_code == 401
