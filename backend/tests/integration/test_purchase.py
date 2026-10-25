from sqlalchemy import func, select

from app.models.purchase import Purchase
from app.models.vehicle import Vehicle


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


def test_purchase_with_too_little_stock_returns_409_and_changes_nothing(
    client, user_headers, make_vehicle, db_session
) -> None:
    vehicle = make_vehicle(quantity=2)
    vehicle_id = vehicle.id
    response = client.post(
        f"/api/vehicles/{vehicle_id}/purchase", json={"quantity": 3}, headers=user_headers
    )
    assert response.status_code == 409
    db_session.expire_all()
    assert db_session.get(Vehicle, vehicle_id).quantity == 2
    assert db_session.scalar(select(func.count()).select_from(Purchase)) == 0
