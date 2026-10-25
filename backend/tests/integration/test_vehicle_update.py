def test_update_vehicle_changes_only_the_fields_sent(client, admin_headers, make_vehicle) -> None:
    vehicle = make_vehicle(make="Toyota", model="Camry", price_cents=2799999, quantity=5)
    response = client.put(f"/api/vehicles/{vehicle.id}", json={"price": 24999.5}, headers=admin_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["price"] == 24999.5
    assert body["make"] == "Toyota"
    assert body["model"] == "Camry"
    assert body["quantity"] == 5


def test_update_vehicle_with_an_unknown_id_returns_404(client, admin_headers) -> None:
    response = client.put("/api/vehicles/999999", json={"price": 24999.5}, headers=admin_headers)
    assert response.status_code == 404


def test_anonymous_update_vehicle_returns_401(client, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.put(f"/api/vehicles/{vehicle.id}", json={"price": 24999.5})
    assert response.status_code == 401


def test_regular_user_update_vehicle_returns_403(client, user_headers, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.put(f"/api/vehicles/{vehicle.id}", json={"price": 24999.5}, headers=user_headers)
    assert response.status_code == 403
