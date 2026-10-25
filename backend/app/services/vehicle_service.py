"""Vehicle CRUD + search rules."""
from app.core.money import to_cents
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleSearchCriteria, VehicleUpdate
from app.services.lookups import get_vehicle_or_raise


class VehicleService:
    def __init__(self, vehicles: VehicleRepository) -> None:
        self._vehicles = vehicles

    def create(self, data: VehicleCreate) -> VehicleRead:
        vehicle = Vehicle(**data.model_dump(exclude={"price"}), price_cents=to_cents(data.price))
        return VehicleRead.from_model(self._vehicles.add(vehicle))

    def list_all(self, skip: int = 0, limit: int = 50) -> list[VehicleRead]:
        return [VehicleRead.from_model(vehicle) for vehicle in self._vehicles.list_all(skip, limit)]

    def search(self, params: VehicleSearchCriteria, skip: int = 0, limit: int = 50) -> list[VehicleRead]:
        return [VehicleRead.from_model(vehicle) for vehicle in self._vehicles.search(params, skip, limit)]

    def update(self, vehicle_id: int, data: VehicleUpdate) -> VehicleRead:
        vehicle = get_vehicle_or_raise(self._vehicles, vehicle_id)
        changes = data.model_dump(exclude_unset=True)  # only the fields the client actually sent
        if "price" in changes:
            changes["price_cents"] = to_cents(changes.pop("price"))
        for field, value in changes.items():
            setattr(vehicle, field, value)
        return VehicleRead.from_model(self._vehicles.save(vehicle))

    def delete(self, vehicle_id: int) -> None:
        self._vehicles.delete(get_vehicle_or_raise(self._vehicles, vehicle_id))
