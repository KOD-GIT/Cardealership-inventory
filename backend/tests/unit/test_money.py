from decimal import Decimal

from app.core.money import to_cents


def test_to_cents_converts_a_price_to_integer_cents() -> None:
    assert to_cents(Decimal("27999.99")) == 2799999
