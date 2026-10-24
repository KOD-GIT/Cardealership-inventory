from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, PlainSerializer, model_validator

from app.core.money import from_cents
from app.models.enums import VehicleCategory
from app.models.vehicle import Vehicle

# Pydantic writes Decimal as a JSON *string* ("27999.99"); the API contract (and the frontend) want a number.
Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]


class VehicleBase(BaseModel):
    make: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=80)
    category: VehicleCategory
    price: Money = Field(gt=0, max_digits=10, decimal_places=2)  # currency units, e.g. 25999.99
    quantity: int = Field(ge=0)
    year: int | None = Field(default=None, ge=1886, le=2100)
    image_url: str | None = Field(default=None, max_length=500)


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    """All fields optional -> partial update semantics."""

    make: str | None = Field(default=None, min_length=1, max_length=80)
    model: str | None = Field(default=None, min_length=1, max_length=80)
    category: VehicleCategory | None = None
    price: Money | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    quantity: int | None = Field(default=None, ge=0)
    year: int | None = Field(default=None, ge=1886, le=2100)
    image_url: str | None = Field(default=None, max_length=500)


class VehicleRead(VehicleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

    @classmethod
    def from_model(cls, vehicle: Vehicle) -> "VehicleRead":
        """Convert DB cents -> API decimal price."""
        return cls(
            id=vehicle.id,
            make=vehicle.make,
            model=vehicle.model,
            category=vehicle.category,
            price=from_cents(vehicle.price_cents),
            quantity=vehicle.quantity,
            year=vehicle.year,
            image_url=vehicle.image_url,
        )


class VehicleSearchCriteria(BaseModel):
    make: str | None = None
    model: str | None = None
    category: VehicleCategory | None = None
    min_price: Decimal | None = Field(default=None, ge=0)
    max_price: Decimal | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def _min_not_above_max(self) -> "VehicleSearchCriteria":
        if self.min_price is not None and self.max_price is not None and self.min_price > self.max_price:
            raise ValueError("min_price must be <= max_price")
        return self


class PurchaseRequest(BaseModel):
    quantity: int = Field(default=1, ge=1)


class RestockRequest(BaseModel):
    quantity: int = Field(ge=1)
