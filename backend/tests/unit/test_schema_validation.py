"""Example of a first, already-green unit test: pure schema validation, no DB involved."""
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.models.vehicle import VehicleCategory
from app.schemas.vehicle import VehicleCreate, VehicleSearchCriteria


def _valid_vehicle(**overrides):
    data = {
        "make": "Toyota",
        "model": "Camry",
        "category": VehicleCategory.SEDAN,
        "price": Decimal("27999.99"),
        "quantity": 3,
    }
    return {**data, **overrides}


def test_vehicle_create_accepts_valid_data() -> None:
    assert VehicleCreate(**_valid_vehicle()).make == "Toyota"


@pytest.mark.parametrize("field,value", [("price", Decimal("0")), ("quantity", -1), ("make", "")])
def test_vehicle_create_rejects_invalid_values(field: str, value: object) -> None:
    with pytest.raises(ValidationError):
        VehicleCreate(**_valid_vehicle(**{field: value}))


def test_search_rejects_min_price_above_max_price() -> None:
    with pytest.raises(ValidationError):
        VehicleSearchCriteria(min_price=Decimal("50000"), max_price=Decimal("10000"))
