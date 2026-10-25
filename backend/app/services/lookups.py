"""Lookups shared by several services."""
from app.core.exceptions import VehicleNotFoundError
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository


def get_vehicle_or_raise(vehicles: VehicleRepository, vehicle_id: int) -> Vehicle:
    """Return the vehicle, or raise VehicleNotFoundError (mapped to 404 in main.py)."""
    vehicle = vehicles.get(vehicle_id)
    if vehicle is None:
        raise VehicleNotFoundError
    return vehicle
