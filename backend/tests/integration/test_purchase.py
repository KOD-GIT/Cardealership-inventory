from sqlalchemy import func, select

from app.models.purchase import Purchase
from app.models.user import User
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


def test_purchase_of_an_unknown_vehicle_returns_404(client, user_headers) -> None:
    response = client.post("/api/vehicles/999999/purchase", headers=user_headers)
    assert response.status_code == 404


def test_purchase_records_who_bought_what_and_at_which_price(
    client, user_headers, make_vehicle, db_session
) -> None:
    vehicle = make_vehicle(quantity=5, price_cents=2799999)
    client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers)
    purchase = db_session.scalar(select(Purchase))
    buyer = db_session.scalar(select(User).where(User.email == "user@example.com"))
    assert purchase is not None
    assert (purchase.user_id, purchase.vehicle_id) == (buyer.id, vehicle.id)
    assert (purchase.quantity, purchase.unit_price_cents) == (1, 2799999)


def test_purchase_with_a_custom_quantity_lowers_the_stock_by_that_much(
    client, user_headers, make_vehicle
) -> None:
    vehicle = make_vehicle(quantity=5)
    response = client.post(
        f"/api/vehicles/{vehicle.id}/purchase", json={"quantity": 3}, headers=user_headers
    )
    assert response.status_code == 200
    assert response.json()["quantity"] == 2


def test_purchase_with_quantity_zero_returns_422(client, user_headers, make_vehicle) -> None:
    vehicle = make_vehicle(quantity=5)
    response = client.post(
        f"/api/vehicles/{vehicle.id}/purchase", json={"quantity": 0}, headers=user_headers
    )
    assert response.status_code == 422


def test_purchase_keeps_the_price_it_was_bought_at(
    client, user_headers, admin_headers, make_vehicle, db_session
) -> None:
    vehicle = make_vehicle(quantity=5, price_cents=2799999)
    client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers)
    client.put(f"/api/vehicles/{vehicle.id}", json={"price": 19999.0}, headers=admin_headers)
    db_session.expire_all()
    assert db_session.scalar(select(Purchase)).unit_price_cents == 2799999
