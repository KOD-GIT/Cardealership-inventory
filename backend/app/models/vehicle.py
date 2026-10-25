from datetime import datetime

from sqlalchemy import BigInteger, CheckConstraint, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utcnow
from app.models.enums import VehicleCategory


class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        CheckConstraint("price_cents > 0", name="ck_vehicle_price_positive"),
        CheckConstraint("quantity >= 0", name="ck_vehicle_quantity_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    make: Mapped[str] = mapped_column(String(80), index=True)
    model: Mapped[str] = mapped_column(String(80), index=True)
    category: Mapped[VehicleCategory] = mapped_column(Enum(VehicleCategory), index=True)
    # Money is stored as integer cents to avoid float rounding errors (decision D5).
    price_cents: Mapped[int] = mapped_column(BigInteger, index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    purchases: Mapped[list["Purchase"]] = relationship(back_populates="vehicle")  # noqa: F821
