def test_anonymous_purchase_returns_401(client, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.post(f"/api/vehicles/{vehicle.id}/purchase")
    assert response.status_code == 401
