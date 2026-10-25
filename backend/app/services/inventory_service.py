"""Purchase / restock rules (stock changes + purchases audit trail)."""
from app.repositories.purchase_repository import PurchaseRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.vehicle import VehicleRead


class InventoryService:
    def __init__(self, vehicles: VehicleRepository, purchases: PurchaseRepository) -> None:
        self._vehicles = vehicles
        self._purchases = purchases

    def purchase(self, vehicle_id: int, user_id: int, quantity: int = 1) -> VehicleRead:
        """Atomically decrease stock and record a purchase.

        Raise VehicleNotFoundError (404) / OutOfStockError (409).
        """
        vehicle = self._vehicles.get(vehicle_id)
        self._vehicles.decrement_stock(vehicle_id, quantity)
        self._purchases.add(user_id, vehicle_id, quantity, vehicle.price_cents)
        return VehicleRead.from_model(vehicle)

    def restock(self, vehicle_id: int, quantity: int) -> VehicleRead:
        """Increase stock. Admin-only is enforced at the API layer (`require_admin`)."""
        raise NotImplementedError
