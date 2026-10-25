def test_anonymous_restock_returns_401(client, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.post(f"/api/vehicles/{vehicle.id}/restock", json={"quantity": 5})
    assert response.status_code == 401
