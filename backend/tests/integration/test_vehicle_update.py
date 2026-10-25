def test_update_vehicle_changes_only_the_fields_sent(client, admin_headers, make_vehicle) -> None:
    vehicle = make_vehicle(make="Toyota", model="Camry", price_cents=2799999, quantity=5)
    response = client.put(f"/api/vehicles/{vehicle.id}", json={"price": 24999.5}, headers=admin_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["price"] == 24999.5
    assert body["make"] == "Toyota"
    assert body["model"] == "Camry"
    assert body["quantity"] == 5
