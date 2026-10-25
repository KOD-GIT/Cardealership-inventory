"""Seed an admin user and sample vehicles. Run: python -m app.scripts.seed

Implement AFTER registration/hash helpers exist (TDD phase 2). Must be idempotent.
"""
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import Role, VehicleCategory
from app.models.user import User
from app.models.vehicle import Vehicle
from app.repositories.user_repository import UserRepository
from app.repositories.vehicle_repository import VehicleRepository

# (make, model, category, price in cents, quantity, year). Quantity 0 and 1 are deliberate: they show the
# dashboard's "Out of stock" (Purchase disabled) and "Only 1 left" states.
SAMPLE_VEHICLES = [
    ("Toyota", "Camry", VehicleCategory.SEDAN, 2799999, 8, 2024),
    ("Honda", "Civic", VehicleCategory.SEDAN, 2349900, 12, 2024),
    ("Toyota", "RAV4", VehicleCategory.SUV, 3199900, 6, 2024),
    ("Ford", "F-150", VehicleCategory.TRUCK, 4299900, 4, 2023),
    ("Volkswagen", "Golf", VehicleCategory.HATCHBACK, 2599900, 1, 2024),
    ("Ford", "Mustang", VehicleCategory.COUPE, 4199900, 0, 2023),
    ("Mazda", "MX-5 Miata", VehicleCategory.CONVERTIBLE, 3149900, 3, 2024),
    ("Honda", "Odyssey", VehicleCategory.VAN, 3899900, 5, 2024),
]


def seed(db: Session) -> None:
    """Create the admin account and the sample vehicles. Safe to run twice."""
    settings = get_settings()
    users = UserRepository(db)
    email = settings.admin_email.lower()
    if users.get_by_email(email) is None:  # an existing admin is left alone, even its password
        users.add(User(email=email, hashed_password=hash_password(settings.admin_password), role=Role.ADMIN))
    vehicles = VehicleRepository(db)
    for make, model, category, price_cents, quantity, year in SAMPLE_VEHICLES:
        vehicles.add(
            Vehicle(
                make=make,
                model=model,
                category=category,
                price_cents=price_cents,
                quantity=quantity,
                year=year,
            )
        )


def main() -> None:
    with SessionLocal() as db:
        seed(db)


if __name__ == "__main__":
    main()
