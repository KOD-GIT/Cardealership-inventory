"""Data access for vehicles. No business rules here - only queries."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleSearchCriteria


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
            query = query.where(Vehicle.make.ilike(f"%{params.make}%"))
        if params.model:
            query = query.where(Vehicle.model.ilike(f"%{params.model}%"))
        if params.category:
            query = query.where(Vehicle.category == params.category)
        return list(self._db.scalars(query.order_by(Vehicle.id).offset(skip).limit(limit)))

    def delete(self, vehicle: Vehicle) -> None:
        self._db.delete(vehicle)
        self._db.commit()

    def decrement_stock(self, vehicle_id: int, quantity: int) -> bool:
        """Atomic conditional UPDATE (quantity >= :q). Return False when stock is insufficient."""
        raise NotImplementedError

    def increment_stock(self, vehicle_id: int, quantity: int) -> None:
        raise NotImplementedError
