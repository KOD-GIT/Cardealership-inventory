def test_anonymous_restock_returns_401(client, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.post(f"/api/vehicles/{vehicle.id}/restock", json={"quantity": 5})
    assert response.status_code == 401


def test_admin_restock_adds_to_the_stock_and_returns_the_vehicle(client, admin_headers, make_vehicle) -> None:
    vehicle = make_vehicle(quantity=2)
    response = client.post(
        f"/api/vehicles/{vehicle.id}/restock", json={"quantity": 5}, headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == vehicle.id
    assert response.json()["quantity"] == 7
