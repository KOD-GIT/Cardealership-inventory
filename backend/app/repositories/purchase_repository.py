"""Data access for the purchases audit trail."""
from sqlalchemy.orm import Session

from app.models.purchase import Purchase


class PurchaseRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add(
        self, user_id: int, vehicle_id: int, quantity: int, unit_price_cents: int
    ) -> Purchase:
        """Save the purchase and commit. Commits the pending stock UPDATE in the same transaction."""
        purchase = Purchase(
            user_id=user_id, vehicle_id=vehicle_id, quantity=quantity, unit_price_cents=unit_price_cents
        )
        self._db.add(purchase)
        self._db.commit()
        return purchase
