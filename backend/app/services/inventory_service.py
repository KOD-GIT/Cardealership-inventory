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
        raise NotImplementedError

    def restock(self, vehicle_id: int, quantity: int) -> VehicleRead:
        """Increase stock. Admin-only is enforced at the API layer (`require_admin`)."""
        raise NotImplementedError
