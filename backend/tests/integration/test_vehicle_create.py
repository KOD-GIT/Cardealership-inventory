import pytest

from app.models.vehicle import Vehicle

VEHICLE = {
    "make": "Toyota",
    "model": "Camry",
    "category": "SEDAN",
    "price": 27999.99,
    "quantity": 5,
    "year": 2024,
}


def test_anonymous_create_vehicle_returns_401(client) -> None:
    response = client.post("/api/vehicles", json=VEHICLE)
    assert response.status_code == 401


def test_regular_user_create_vehicle_returns_403(client, user_headers) -> None:
    response = client.post("/api/vehicles", json=VEHICLE, headers=user_headers)
    assert response.status_code == 403


def test_admin_creates_a_vehicle_and_gets_201(client, admin_headers) -> None:
    response = client.post("/api/vehicles", json=VEHICLE, headers=admin_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["make"] == "Toyota"
    assert body["model"] == "Camry"
    assert isinstance(body["id"], int)
    assert body["price"] == 27999.99


def test_created_vehicle_is_stored_with_the_price_in_cents(client, admin_headers, db_session) -> None:
    vehicle_id = client.post("/api/vehicles", json=VEHICLE, headers=admin_headers).json()["id"]
    stored = db_session.get(Vehicle, vehicle_id)
    assert stored is not None
    assert stored.price_cents == 2799999


@pytest.mark.parametrize(
    "changes",
    [
        {"price": 0},
        {"quantity": -1},
        {"category": "SPACESHIP"},
        {"make": ""},
    ],
    ids=["price-zero", "negative-quantity", "bad-category", "empty-make"],
)
def test_create_vehicle_rejects_an_invalid_body_with_422(client, admin_headers, changes) -> None:
    response = client.post("/api/vehicles", json={**VEHICLE, **changes}, headers=admin_headers)
    assert response.status_code == 422


def test_create_vehicle_accepts_a_price_in_crores(client, admin_headers) -> None:
    response = client.post("/api/vehicles", json={**VEHICLE, "price": 41000000}, headers=admin_headers)
    assert response.status_code == 201
    assert response.json()["price"] == 41000000
