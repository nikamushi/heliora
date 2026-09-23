"""HELIORA API — Consent request and response schemas.

Implements Architecture §21 and BE-002.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

DEFAULT_MEDICAL_DISCLAIMER = (
    "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. "
    "Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan "
    "model yang digunakan, bukan diagnosis medis dan bukan pengganti "
    "konsultasi tenaga kesehatan."
)


class ConsentCreateRequest(BaseModel):
    """Payload for recording user agreement to terms and medical disclaimer."""

    agreed: bool = Field(
        ...,
        description=(
            "Explicit agreement to data processing and "
            "medical disclaimer acknowledgement."
        ),
        examples=[True],
    )
    consent_version: str = Field(
        default="1.0",
        min_length=1,
        max_length=20,
        description="Version string of the terms and disclaimer presented to user.",
        examples=["1.0"],
    )


class ConsentResponse(BaseModel):
    """Representation of an individual consent record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    consent_version: str
    accepted_at: datetime
    revoked_at: datetime | None = None
    is_active: bool


class ConsentStatusResponse(BaseModel):
    """Status indicating whether user has active consent along with disclaimer copy."""

    has_active_consent: bool
    active_consent: ConsentResponse | None = None
    terms_version: str = "1.0"
    medical_disclaimer: str = DEFAULT_MEDICAL_DISCLAIMER
