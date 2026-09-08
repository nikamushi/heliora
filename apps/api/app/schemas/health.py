"""HELIORA API — Pydantic schemas for health check endpoint."""

from pydantic import BaseModel


class HealthCheckResponse(BaseModel):
    """Response schema for the health check endpoint."""

    status: str = "ok"
    environment: str
    project: str = "HELIORA"
    version: str = "0.1.0"
