"""HELIORA API — Shared normalization for vital-sign and lifestyle inputs.

Single source of truth for turning ORM rows, API payloads, and simulation
overrides into the canonical forms used by the rule engine and the XAI
feature builders (Architecture §8, §14).
"""

from typing import Any


def parse_blood_pressure(bp_str: str | None) -> tuple[float | None, float | None]:
    """Parse a blood pressure string like '120/80' into (systolic, diastolic)."""
    if not bp_str or "/" not in bp_str:
        return None, None
    try:
        parts = bp_str.split("/")
        return float(parts[0].strip()), float(parts[1].strip())
    except (ValueError, IndexError):
        return None, None


def normalize_smoking_status(value: Any) -> str:
    """Normalize a smoking status (enum or string) to its lowercase text form."""
    raw = value.value if hasattr(value, "value") else value
    return str(raw).lower()
