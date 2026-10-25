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
