from app.models.enums import VehicleCategory


def test_search_by_make_returns_only_that_make(client, user_headers, make_vehicle) -> None:
    make_vehicle(make="Toyota", model="Camry")
    make_vehicle(make="Honda", model="Civic")
    response = client.get("/api/vehicles/search", params={"make": "Toyota"}, headers=user_headers)
    assert response.status_code == 200
    assert [vehicle["model"] for vehicle in response.json()] == ["Camry"]


def test_search_by_model_returns_only_that_model(client, user_headers, make_vehicle) -> None:
    make_vehicle(make="Toyota", model="Camry")
    make_vehicle(make="Toyota", model="Corolla")
    response = client.get("/api/vehicles/search", params={"model": "Camry"}, headers=user_headers)
    assert response.status_code == 200
    assert [vehicle["model"] for vehicle in response.json()] == ["Camry"]


def test_search_by_category_returns_only_that_category(client, user_headers, make_vehicle) -> None:
    make_vehicle(model="Camry", category=VehicleCategory.SEDAN)
    make_vehicle(model="RAV4", category=VehicleCategory.SUV)
    response = client.get("/api/vehicles/search", params={"category": "SUV"}, headers=user_headers)
    assert response.status_code == 200
    assert [vehicle["model"] for vehicle in response.json()] == ["RAV4"]


def test_search_by_min_price_returns_only_vehicles_at_or_above_it(client, user_headers, make_vehicle) -> None:
    make_vehicle(model="Cheap", price_cents=1500000)
    make_vehicle(model="Pricey", price_cents=3000000)
    response = client.get("/api/vehicles/search", params={"min_price": 20000}, headers=user_headers)
    assert response.status_code == 200
    assert [vehicle["model"] for vehicle in response.json()] == ["Pricey"]


def test_search_by_max_price_returns_only_vehicles_at_or_below_it(client, user_headers, make_vehicle) -> None:
    make_vehicle(model="Cheap", price_cents=1500000)
    make_vehicle(model="Pricey", price_cents=3000000)
    response = client.get("/api/vehicles/search", params={"max_price": 20000}, headers=user_headers)
    assert response.status_code == 200
    assert [vehicle["model"] for vehicle in response.json()] == ["Cheap"]
