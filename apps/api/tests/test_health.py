"""Tests for the API health check endpoint (SETUP-003)."""

import pytest
from httpx import AsyncClient

from app.core.config import settings


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """GET /api/v1/health should return 200 OK with status and metadata."""
    response = await client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["project"] == "HELIORA"
    assert "environment" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_root_redirect_to_docs(client: AsyncClient):
    """GET / should redirect to /api/v1/docs."""
    response = await client.get("/", follow_redirects=False)
    assert response.status_code in (302, 307)
    assert response.headers["location"] == f"{settings.API_V1_PREFIX}/docs"


@pytest.mark.asyncio
async def test_docs_shortcut_redirect(client: AsyncClient):
    """GET /docs should redirect to /api/v1/docs."""
    response = await client.get("/docs", follow_redirects=False)
    assert response.status_code in (302, 307)
    assert response.headers["location"] == f"{settings.API_V1_PREFIX}/docs"
