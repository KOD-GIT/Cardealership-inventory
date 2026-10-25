"""Data access for vehicles. No business rules here - only queries."""
from sqlalchemy import ColumnElement, select, update
from sqlalchemy.orm import InstrumentedAttribute, Session

from app.core.money import to_cents
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleSearchCriteria


def _contains(column: InstrumentedAttribute[str], text: str) -> ColumnElement[bool]:
    """Case-insensitive 'contains'. % and _ in the user's text are matched literally, not as wildcards."""
    escaped = text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return column.ilike(f"%{escaped}%", escape="\\")


class VehicleRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add(self, vehicle: Vehicle) -> Vehicle:
        self._db.add(vehicle)
        self._db.commit()
        self._db.refresh(vehicle)
        return vehicle

    def get(self, vehicle_id: int) -> Vehicle | None:
        return self._db.get(Vehicle, vehicle_id)

    def exists(self, make: str, model: str, year: int | None) -> bool:
        query = select(Vehicle.id).where(Vehicle.make == make, Vehicle.model == model, Vehicle.year == year)
        return self._db.scalar(query.limit(1)) is not None

    def save(self, vehicle: Vehicle) -> Vehicle:
        """Persist changes made to a vehicle that is already loaded."""
        self._db.commit()
        self._db.refresh(vehicle)
        return vehicle

    def list_all(self, skip: int = 0, limit: int = 50) -> list[Vehicle]:
        query = select(Vehicle).order_by(Vehicle.id).offset(skip).limit(limit)
        return list(self._db.scalars(query))

    def search(self, params: VehicleSearchCriteria, skip: int = 0, limit: int = 50) -> list[Vehicle]:
        """Dynamic filters; make/model use case-insensitive partial match."""
        query = select(Vehicle)
        if params.make:
            query = query.where(_contains(Vehicle.make, params.make))
        if params.model:
            query = query.where(_contains(Vehicle.model, params.model))
        if params.category:
            query = query.where(Vehicle.category == params.category)
        if params.min_price is not None:
            query = query.where(Vehicle.price_cents >= to_cents(params.min_price))
        if params.max_price is not None:
            query = query.where(Vehicle.price_cents <= to_cents(params.max_price))
        return list(self._db.scalars(query.order_by(Vehicle.id).offset(skip).limit(limit)))

    def delete(self, vehicle: Vehicle) -> None:
        self._db.delete(vehicle)
        self._db.commit()

    def decrement_stock(self, vehicle_id: int, quantity: int) -> bool:
        """Atomic conditional UPDATE (quantity >= :q). Return False when stock is insufficient.

        Does not commit: the caller commits it together with the purchase row, in one transaction.
        """
        statement = (
            update(Vehicle)
            .where(Vehicle.id == vehicle_id, Vehicle.quantity >= quantity)
            .values(quantity=Vehicle.quantity - quantity)
        )
        return self._db.execute(statement).rowcount == 1

    def increment_stock(self, vehicle_id: int, quantity: int) -> None:
        """Add to the stock inside the database, so two restocks at once cannot overwrite each other."""
        self._db.execute(
            update(Vehicle).where(Vehicle.id == vehicle_id).values(quantity=Vehicle.quantity + quantity)
        )
        self._db.commit()
