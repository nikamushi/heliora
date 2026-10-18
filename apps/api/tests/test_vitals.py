"""HELIORA API — tests for shared vital-sign / lifestyle normalization (ARC-001).

Pins the canonical parsing contract used by the rule engine, the XAI feature
builders, and offline model tooling:
- Blood pressure strings parse to (systolic, diastolic) or (None, None)
- Smoking status values (enum or string) normalize to lowercase text
"""

from enum import Enum

from app.core.vitals import normalize_smoking_status, parse_blood_pressure


class _Smoking(Enum):
    NEVER = "never"
    FORMER = "former"
    CURRENT = "current"


# ── parse_blood_pressure ───────────────────────────────────────────────────
def test_parse_blood_pressure_happy_path():
    assert parse_blood_pressure("120/80") == (120.0, 80.0)


def test_parse_blood_pressure_strips_whitespace():
    assert parse_blood_pressure(" 130 / 85 ") == (130.0, 85.0)


def test_parse_blood_pressure_none_and_empty():
    assert parse_blood_pressure(None) == (None, None)
    assert parse_blood_pressure("") == (None, None)


def test_parse_blood_pressure_without_slash():
    assert parse_blood_pressure("120") == (None, None)


def test_parse_blood_pressure_non_numeric_parts():
    assert parse_blood_pressure("abc/def") == (None, None)
    assert parse_blood_pressure("120/") == (None, None)


# ── normalize_smoking_status ───────────────────────────────────────────────
def test_normalize_smoking_status_string_is_lowercased():
    assert normalize_smoking_status("NEVER") == "never"


def test_normalize_smoking_status_enum_unwraps_value():
    assert normalize_smoking_status(_Smoking.FORMER) == "former"


def test_normalize_smoking_status_passthrough_lowercase():
    assert normalize_smoking_status("current") == "current"
