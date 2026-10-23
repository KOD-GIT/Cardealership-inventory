"""Vehicle CRUD + search rules."""
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleSearchCriteria, VehicleUpdate


class VehicleService:
    def __init__(self, vehicles: VehicleRepository) -> None:
        self._vehicles = vehicles

    def create(self, data: VehicleCreate) -> VehicleRead:
        raise NotImplementedError

    def list_all(self, skip: int = 0, limit: int = 50) -> list[VehicleRead]:
        raise NotImplementedError

    def search(self, params: VehicleSearchCriteria, skip: int = 0, limit: int = 50) -> list[VehicleRead]:
        raise NotImplementedError

    def update(self, vehicle_id: int, data: VehicleUpdate) -> VehicleRead:
        raise NotImplementedError

    def delete(self, vehicle_id: int) -> None:
        raise NotImplementedError
