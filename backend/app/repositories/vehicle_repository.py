"""Data access for vehicles. No business rules here - only queries."""
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleSearchCriteria


class VehicleRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add(self, vehicle: Vehicle) -> Vehicle:
        raise NotImplementedError

    def get(self, vehicle_id: int) -> Vehicle | None:
        raise NotImplementedError

    def list_all(self, skip: int = 0, limit: int = 50) -> list[Vehicle]:
        raise NotImplementedError

    def search(self, params: VehicleSearchCriteria, skip: int = 0, limit: int = 50) -> list[Vehicle]:
        """Dynamic filters; make/model use case-insensitive partial match."""
        raise NotImplementedError

    def delete(self, vehicle: Vehicle) -> None:
        raise NotImplementedError

    def decrement_stock(self, vehicle_id: int, quantity: int) -> bool:
        """Atomic conditional UPDATE (quantity >= :q). Return False when stock is insufficient."""
        raise NotImplementedError

    def increment_stock(self, vehicle_id: int, quantity: int) -> None:
        raise NotImplementedError
