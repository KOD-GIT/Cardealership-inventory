"""Guards two contract details that are easy to get wrong:
prices must reach the frontend as JSON *numbers*, and passwords must fit bcrypt's 72-byte limit."""
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.vehicle import VehicleRead


def _read(**overrides) -> VehicleRead:
    data = dict(id=1, make="Toyota", model="Camry", category="SEDAN", price=Decimal("27999.99"),
                quantity=4, year=2024, image_url=None)
    return VehicleRead(**{**data, **overrides})


def test_price_is_a_json_number_not_a_string() -> None:
    price = _read().model_dump(mode="json")["price"]
    assert isinstance(price, float)
    assert price == 27999.99


def test_whole_number_price_keeps_its_value() -> None:
    assert _read(price=Decimal("22500")).model_dump(mode="json")["price"] == 22500


def test_register_accepts_a_72_byte_password() -> None:
    assert RegisterRequest(email="a@b.com", password="x" * 72).password == "x" * 72


def test_register_rejects_a_password_over_72_bytes() -> None:
    with pytest.raises(ValidationError, match="72 bytes"):
        RegisterRequest(email="a@b.com", password="x" * 73)


def test_register_counts_bytes_not_characters() -> None:
    # 40 two-byte characters = 80 bytes, although it is only 40 characters long
    with pytest.raises(ValidationError, match="72 bytes"):
        RegisterRequest(email="a@b.com", password="é" * 40)


def test_register_still_requires_8_characters() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(email="a@b.com", password="short")


def test_login_does_not_reject_long_passwords_in_the_schema() -> None:
    # Login must answer 401 ("wrong password") rather than 422, so it accepts any length
    assert LoginRequest(email="a@b.com", password="x" * 200).password
