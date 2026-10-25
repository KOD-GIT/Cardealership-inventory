import pytest

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


def test_search_treats_a_percent_sign_in_the_make_literally(client, user_headers, make_vehicle) -> None:
    make_vehicle(make="Toyota", model="Camry")
    make_vehicle(make="100% Electric", model="Prototype")
    response = client.get("/api/vehicles/search", params={"make": "%"}, headers=user_headers)
    assert response.status_code == 200
    assert [vehicle["model"] for vehicle in response.json()] == ["Prototype"]


def test_anonymous_search_returns_401(client) -> None:
    assert client.get("/api/vehicles/search", params={"make": "Toyota"}).status_code == 401


def test_search_make_is_a_case_insensitive_partial_match(client, user_headers, make_vehicle) -> None:
    make_vehicle(make="Toyota", model="Camry")
    make_vehicle(make="Honda", model="Civic")
    response = client.get("/api/vehicles/search", params={"make": "toy"}, headers=user_headers)
    assert [vehicle["model"] for vehicle in response.json()] == ["Camry"]


def test_search_combines_filters_with_and(client, user_headers, make_vehicle) -> None:
    make_vehicle(make="Toyota", model="Camry", category=VehicleCategory.SEDAN, price_cents=2000000)
    make_vehicle(make="Toyota", model="RAV4", category=VehicleCategory.SUV, price_cents=2000000)
    make_vehicle(make="Honda", model="Accord", category=VehicleCategory.SEDAN, price_cents=2000000)
    params = {"make": "Toyota", "category": "SEDAN", "min_price": 10000, "max_price": 30000}
    response = client.get("/api/vehicles/search", params=params, headers=user_headers)
    assert [vehicle["model"] for vehicle in response.json()] == ["Camry"]


def test_search_prices_are_inclusive_at_both_ends(client, user_headers, make_vehicle) -> None:
    make_vehicle(model="Low", price_cents=1000000)
    make_vehicle(model="High", price_cents=2000000)
    make_vehicle(model="Outside", price_cents=2000001)
    params = {"min_price": 10000, "max_price": 20000}
    response = client.get("/api/vehicles/search", params=params, headers=user_headers)
    assert sorted(vehicle["model"] for vehicle in response.json()) == ["High", "Low"]


def test_search_with_no_match_returns_200_and_an_empty_list(client, user_headers, make_vehicle) -> None:
    make_vehicle(make="Toyota")
    response = client.get("/api/vehicles/search", params={"make": "Ferrari"}, headers=user_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_search_treats_an_underscore_in_the_model_literally(client, user_headers, make_vehicle) -> None:
    make_vehicle(model="Camry")
    make_vehicle(model="Model_S")
    response = client.get("/api/vehicles/search", params={"model": "_"}, headers=user_headers)
    assert [vehicle["model"] for vehicle in response.json()] == ["Model_S"]


@pytest.mark.parametrize(
    "params",
    [{"min_price": 30000, "max_price": 10000}, {"category": "SPACESHIP"}, {"min_price": -1}],
    ids=["min-above-max", "bad-category", "negative-min-price"],
)
def test_search_rejects_invalid_input_with_422(client, user_headers, params) -> None:
    assert client.get("/api/vehicles/search", params=params, headers=user_headers).status_code == 422
