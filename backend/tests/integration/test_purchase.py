def test_anonymous_purchase_returns_401(client, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.post(f"/api/vehicles/{vehicle.id}/purchase")
    assert response.status_code == 401


def test_purchase_lowers_the_stock_by_one_and_returns_the_vehicle(client, user_headers, make_vehicle) -> None:
    vehicle = make_vehicle(quantity=5)
    response = client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["id"] == vehicle.id
    assert response.json()["quantity"] == 4
