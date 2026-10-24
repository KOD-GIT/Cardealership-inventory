"""Money helpers. The database stores integer cents; the API exposes decimals.

TDD phase 1: write the tests first (tests/unit/test_money.py), then implement.
"""
from decimal import ROUND_HALF_UP, Decimal


def to_cents(amount: Decimal) -> int:
    """Convert a decimal amount (e.g. 27999.99) to integer cents (2799999)."""
    return int((amount * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def from_cents(cents: int) -> Decimal:
    """Convert integer cents to a 2-decimal Decimal."""
    return (Decimal(cents) / 100).quantize(Decimal("0.01"))
