from pathlib import Path

from sqlalchemy import func, select

from app.core.config import get_settings
from app.core.security import verify_password
from app.models.enums import Role
from app.models.user import User
from app.models.vehicle import Vehicle
from app.repositories.user_repository import UserRepository
from app.scripts.seed import DVM_VEHICLES, SAMPLE_VEHICLES, seed


def test_seed_creates_the_admin_from_the_settings(db_session) -> None:
    seed(db_session)
    settings = get_settings()
    admin = UserRepository(db_session).get_by_email(settings.admin_email.lower())
    assert admin is not None
    assert admin.role == Role.ADMIN
    assert verify_password(settings.admin_password, admin.hashed_password)


def test_running_the_seed_twice_creates_only_one_admin(db_session) -> None:
    seed(db_session)
    seed(db_session)
    admins = db_session.scalars(select(User).where(User.role == Role.ADMIN)).all()
    assert len(admins) == 1


def test_seed_creates_sample_vehicles_with_an_out_of_stock_and_a_last_one(db_session) -> None:
    seed(db_session)
    quantities = db_session.scalars(select(Vehicle.quantity)).all()
    assert 0 in quantities  # shows the disabled Purchase button
    assert 1 in quantities  # shows "Only 1 left"


def test_running_the_seed_twice_does_not_duplicate_the_vehicles(db_session) -> None:
    seed(db_session)
    seed(db_session)
    count = db_session.scalar(select(func.count()).select_from(Vehicle))
    assert count == len(SAMPLE_VEHICLES) + len(DVM_VEHICLES)


def test_the_seeded_admin_can_log_in_through_the_api(client, db_session) -> None:
    seed(db_session)
    settings = get_settings()
    response = client.post(
        "/api/auth/login", json={"email": settings.admin_email, "password": settings.admin_password}
    )
    assert response.status_code == 200
    assert response.json()["user"]["role"] == "ADMIN"


def test_every_seeded_vehicle_has_a_local_image_path(db_session) -> None:
    seed(db_session)
    images = db_session.scalars(select(Vehicle.image_url)).all()
    assert images
    assert all(url is not None and url.startswith("/images/vehicles/") for url in images)


def test_seed_adds_about_sixty_dvm_car_vehicles_next_to_the_original_fourteen(db_session) -> None:
    seed(db_session)
    count = db_session.scalar(select(func.count()).select_from(Vehicle))
    assert count == 14 + len(DVM_VEHICLES)
    assert 55 <= len(DVM_VEHICLES) <= 65


def test_dvm_vehicles_cover_every_category_but_no_duplicates() -> None:
    keys = [(v["make"], v["model"], v["year"]) for v in DVM_VEHICLES]
    assert len(keys) == len(set(keys))
    categories = {v["category"] for v in DVM_VEHICLES}
    assert categories >= {"SEDAN", "SUV", "HATCHBACK", "COUPE", "CONVERTIBLE", "VAN"}


def test_dvm_prices_are_converted_to_whole_rupee_paise() -> None:
    for v in DVM_VEHICLES:
        assert v["price_cents"] > 0
        assert v["price_cents"] % 100_000 == 0  # rounded to the nearest 1,000 rupees


def test_every_dvm_photo_exists_in_the_frontend_images_folder() -> None:
    folder = Path(__file__).resolve().parents[3] / "frontend" / "public" / "images" / "vehicles"
    for v in DVM_VEHICLES:
        assert v["image_url"].startswith("/images/vehicles/dvm-")
        assert (folder / v["image_url"].rsplit("/", 1)[1]).is_file(), v["image_url"]


def test_dvm_stock_is_between_zero_and_eight_with_some_scarce_ones() -> None:
    quantities = [v["quantity"] for v in DVM_VEHICLES]
    assert all(0 <= q <= 8 for q in quantities)
    assert 0 in quantities and 1 in quantities
