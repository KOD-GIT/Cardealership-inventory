from decimal import Decimal

from app.core.money import from_cents, to_cents


def test_to_cents_converts_a_price_to_integer_cents() -> None:
    assert to_cents(Decimal("27999.99")) == 2799999


def test_to_cents_rounds_half_up() -> None:
    assert to_cents(Decimal("19.995")) == 2000


def test_from_cents_converts_cents_to_a_two_decimal_price() -> None:
    assert from_cents(2799999) == Decimal("27999.99")
