"""HELIORA API — Attribute-based profile stand-in.

Lightweight container used wherever a HealthProfile-shaped object is needed
without a database row (simulation overrides, evaluation samples, SHAP dummy
profiles). Exposes constructor keywords directly as attributes, mirroring ORM
profile attribute access.
"""

from typing import Any


class AttributeProfile:
    """Attribute container mirroring profile attribute access."""

    def __init__(self, **kwargs: Any) -> None:
        self.__dict__.update(kwargs)
