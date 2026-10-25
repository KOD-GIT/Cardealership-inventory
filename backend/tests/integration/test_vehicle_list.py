def test_anonymous_list_vehicles_returns_401(client) -> None:
    response = client.get("/api/vehicles")
    assert response.status_code == 401


def test_list_vehicles_returns_all_vehicles_including_zero_stock(client, user_headers, make_vehicle) -> None:
    make_vehicle(model="Camry", quantity=5)
    make_vehicle(model="Corolla", quantity=0)
    response = client.get("/api/vehicles", headers=user_headers)
    assert response.status_code == 200
    assert sorted(vehicle["model"] for vehicle in response.json()) == ["Camry", "Corolla"]
