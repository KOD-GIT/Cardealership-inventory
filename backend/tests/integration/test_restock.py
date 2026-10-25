import pytest

from app.models.vehicle import Vehicle


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


def test_restock_of_an_unknown_vehicle_returns_404(client, admin_headers) -> None:
    response = client.post("/api/vehicles/999999/restock", json={"quantity": 5}, headers=admin_headers)
    assert response.status_code == 404


def test_regular_user_restock_returns_403_and_changes_nothing(
    client, user_headers, make_vehicle, db_session
) -> None:
    vehicle = make_vehicle(quantity=2)
    vehicle_id = vehicle.id
    response = client.post(
        f"/api/vehicles/{vehicle_id}/restock", json={"quantity": 5}, headers=user_headers
    )
    assert response.status_code == 403
    db_session.expire_all()
    assert db_session.get(Vehicle, vehicle_id).quantity == 2


@pytest.mark.parametrize("quantity", [0, -3], ids=["zero", "negative"])
def test_restock_rejects_a_quantity_below_one_with_422(client, admin_headers, make_vehicle, quantity) -> None:
    vehicle = make_vehicle()
    response = client.post(
        f"/api/vehicles/{vehicle.id}/restock", json={"quantity": quantity}, headers=admin_headers
    )
    assert response.status_code == 422
