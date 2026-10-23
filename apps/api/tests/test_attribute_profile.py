"""Unit tests for strongly-typed AttributeProfile dataclass and RiskEngineProtocols."""

from decimal import Decimal

import pytest

from app.core.attribute_profile import AttributeProfile
from app.core.risk_engine import risk_engine
from app.core.risk_engine._shared import RiskEngineProtocol


def test_attribute_profile_default_initialization():
    """Verify default values are populated correctly according to health profile schema."""
    profile = AttributeProfile()
    assert profile.age == 30
    assert profile.gender == "male"
    assert profile.height_cm == 170.0
    assert profile.weight_kg == 70.0
    assert profile.smoking_status == "never"
    assert profile.family_history is False
    # Derived BMI from 70kg / (1.7m * 1.7m) = 24.2
    assert profile.bmi == 24.2


def test_attribute_profile_explicit_fields():
    """Verify explicit field assignment without dynamic bypass."""
    profile = AttributeProfile(
        age=45,
        gender="female",
        height_cm=160.0,
        weight_kg=64.0,
        physical_activity_min_per_week=200.0,
        sleep_duration_hours=8.0,
        smoking_status="former",
        family_history=True,
    )
    assert profile.age == 45
    assert profile.gender == "female"
    # BMI = 64 / (1.6 * 1.6) = 25.0
    assert profile.bmi == 25.0


def test_attribute_profile_preserves_explicit_bmi():
    """Verify that if bmi is explicitly provided, it is not overwritten."""
    profile = AttributeProfile(
        height_cm=180.0,
        weight_kg=80.0,
        bmi=23.5,
    )
    assert profile.bmi == 23.5


def test_attribute_profile_rejects_arbitrary_kwargs():
    """Verify dynamic untyped kwargs are strictly rejected by python slots."""
    with pytest.raises(TypeError):
        AttributeProfile(invalid_field="should_fail")


def test_attribute_profile_with_decimal_types():
    """Verify decimal height and weight properly derive BMI."""
    profile = AttributeProfile(
        height_cm=Decimal("175.0"),
        weight_kg=Decimal("75.0"),
        bmi=None,
    )
    assert profile.bmi == 24.5


def test_risk_engine_implements_protocol():
    """Verify the concrete risk_engine conforms to RiskEngineProtocol."""
    assert isinstance(risk_engine, RiskEngineProtocol)
