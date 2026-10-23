"""Data access for the purchases audit trail."""
from sqlalchemy.orm import Session

from app.models.purchase import Purchase


class PurchaseRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add(
        self, user_id: int, vehicle_id: int, quantity: int, unit_price_cents: int
    ) -> Purchase:
        raise NotImplementedError
