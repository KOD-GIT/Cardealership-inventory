"""Schema-level guarantees (constraints) that the services rely on."""
import pytest
from sqlalchemy.exc import IntegrityError

from app.models import Vehicle, VehicleCategory


def test_negative_quantity_is_rejected_by_database(db_session):
    db_session.add(Vehicle(make="Toyota", model="Camry", category=VehicleCategory.SEDAN,
                           price_cents=2500000, quantity=-1))
    with pytest.raises(IntegrityError):
        db_session.commit()


def test_non_positive_price_is_rejected_by_database(db_session):
    db_session.add(Vehicle(make="Toyota", model="Camry", category=VehicleCategory.SEDAN,
                           price_cents=0, quantity=1))
    with pytest.raises(IntegrityError):
        db_session.commit()
