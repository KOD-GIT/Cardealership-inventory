from datetime import datetime

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utcnow


class Purchase(Base):
    """Audit trail of sales. `unit_price_cents` snapshots the price at purchase time."""

    __tablename__ = "purchases"
    __table_args__ = (CheckConstraint("quantity >= 1", name="ck_purchase_quantity_positive"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_id: Mapped[int | None] = mapped_column(
        ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price_cents: Mapped[int] = mapped_column(BigInteger)
    purchased_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship(back_populates="purchases")  # noqa: F821
    vehicle: Mapped["Vehicle | None"] = relationship(back_populates="purchases")  # noqa: F821
