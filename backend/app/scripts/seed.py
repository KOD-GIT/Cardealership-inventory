"""Seed an admin user and sample vehicles. Run: python -m app.scripts.seed

Implement AFTER registration/hash helpers exist (TDD phase 2). Must be idempotent.
"""
import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import Role, VehicleCategory
from app.models.user import User
from app.models.vehicle import Vehicle
from app.repositories.user_repository import UserRepository
from app.repositories.vehicle_repository import VehicleRepository

_P = "/images/vehicles/"  # photographs live in frontend/public/images/vehicles

# (make, model, category, price in paise, quantity, year, image). Prices are rupees x 100. Quantity 0 and 1
# are deliberate: they show the "Out of stock" (Purchase disabled) and "Only 1 left" states. Year is None
# where the source design gave none (the app then shows "Not provided"). The list order is arrival order.
SAMPLE_VEHICLES = [
    ("Maruti Suzuki", "Swift ZXi", VehicleCategory.HATCHBACK, 81_500_000, 6, None, f"{_P}swift-zxi.jpg"),
    ("Hyundai", "Creta SX", VehicleCategory.SUV, 162_000_000, 4, None, f"{_P}creta-sx.jpg"),
    ("Honda", "City V", VehicleCategory.SEDAN, 131_000_000, 3, None, f"{_P}city-v.jpg"),
    ("Tata", "Nexon Fearless", VehicleCategory.SUV, 124_000_000, 2, None, f"{_P}nexon-fearless.jpg"),
    ("Toyota", "Fortuner 4x4", VehicleCategory.SUV, 468_000_000, 1, None, f"{_P}fortuner-4x4.jpg"),
    ("Mahindra", "Thar LX", VehicleCategory.SUV, 173_000_000, 0, None, f"{_P}thar-lx.jpg"),
    ("Isuzu", "D-Max V-Cross", VehicleCategory.TRUCK, 270_000_000, 4, None, f"{_P}dmax-vcross.jpg"),
    ("Toyota", "Innova Crysta", VehicleCategory.VAN, 255_000_000, 3, None, f"{_P}innova-crysta.jpg"),
    ("BMW", "330Li M Sport", VehicleCategory.SEDAN, 620_000_000, 1, None, f"{_P}bmw-330li-front.jpg"),
    ("Audi", "R8 Coupé V10", VehicleCategory.COUPE, 2_400_000_000, 3, 2024, f"{_P}audi-r8-v10.jpg"),
    ("Mercedes-AMG", "GT 63 S", VehicleCategory.SEDAN, 2_420_000_000, 3, 2023, f"{_P}amg-gt63s-front.jpg"),
    ("Iso Rivolta", "Islero 400 GT", VehicleCategory.COUPE, 1_850_000_000, 1, 1969, f"{_P}islero-400gt.jpg"),
    ("Mercedes-AMG", "G 63 6x6", VehicleCategory.TRUCK, 4_100_000_000, 2, 2021, f"{_P}g63-6x6.jpg"),
    ("Mercedes-Benz", "CL 63 AMG", VehicleCategory.COUPE, 950_000_000, 0, 2011,
     f"{_P}cl63-amg.jpg"),
]

# 60 more cars from the DVM-CAR dataset (CC BY-NC 4.0, see README credits), built by
# backend/tools/build_dvm_catalogue.py. Prices are historical UK pounds converted at a fixed 105 rupees
# per pound; stock is generated, as the dataset has none.
DVM_VEHICLES = json.loads((Path(__file__).with_name("dvm_catalogue.json")).read_text(encoding="utf-8"))


def seed(db: Session) -> None:
    """Create the admin account and the sample vehicles. Safe to run twice."""
    settings = get_settings()
    users = UserRepository(db)
    email = settings.admin_email.lower()
    if users.get_by_email(email) is None:  # an existing admin is left alone, even its password
        users.add(User(email=email, hashed_password=hash_password(settings.admin_password), role=Role.ADMIN))
    vehicles = VehicleRepository(db)
    rows = list(SAMPLE_VEHICLES) + [
        (v["make"], v["model"], VehicleCategory(v["category"]), v["price_cents"], v["quantity"], v["year"],
         v["image_url"])
        for v in DVM_VEHICLES
    ]
    for make, model, category, price_cents, quantity, year, image_url in rows:
        if vehicles.exists(make, model, year):
            continue
        vehicles.add(
            Vehicle(
                make=make,
                model=model,
                category=category,
                price_cents=price_cents,
                quantity=quantity,
                year=year,
                image_url=image_url,
            )
        )


def main() -> None:
    with SessionLocal() as db:
        seed(db)


if __name__ == "__main__":
    main()
