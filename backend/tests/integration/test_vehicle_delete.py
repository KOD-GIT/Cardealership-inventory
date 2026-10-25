from app.models.enums import Role
from app.models.purchase import Purchase
from app.models.user import User
from app.models.vehicle import Vehicle


def test_admin_deletes_a_vehicle_and_gets_204(client, admin_headers, make_vehicle, db_session) -> None:
    vehicle = make_vehicle()
    vehicle_id = vehicle.id
    response = client.delete(f"/api/vehicles/{vehicle_id}", headers=admin_headers)
    assert response.status_code == 204
    db_session.expire_all()
    assert db_session.get(Vehicle, vehicle_id) is None


def test_delete_vehicle_with_an_unknown_id_returns_404(client, admin_headers) -> None:
    response = client.delete("/api/vehicles/999999", headers=admin_headers)
    assert response.status_code == 404


def test_anonymous_delete_vehicle_returns_401(client, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.delete(f"/api/vehicles/{vehicle.id}")
    assert response.status_code == 401


def test_regular_user_delete_vehicle_returns_403(client, user_headers, make_vehicle, db_session) -> None:
    vehicle = make_vehicle()
    response = client.delete(f"/api/vehicles/{vehicle.id}", headers=user_headers)
    assert response.status_code == 403
    assert db_session.get(Vehicle, vehicle.id) is not None


def test_deleting_a_vehicle_keeps_its_purchases_with_a_null_vehicle(
    client, admin_headers, make_vehicle, db_session
) -> None:
    buyer = User(email="buyer@example.com", hashed_password="x", role=Role.USER)
    db_session.add(buyer)
    db_session.commit()
    vehicle = make_vehicle()
    purchase = Purchase(user_id=buyer.id, vehicle_id=vehicle.id, quantity=1, unit_price_cents=2799999)
    db_session.add(purchase)
    db_session.commit()
    vehicle_id, purchase_id = vehicle.id, purchase.id

    assert client.delete(f"/api/vehicles/{vehicle_id}", headers=admin_headers).status_code == 204

    db_session.expire_all()
    kept = db_session.get(Purchase, purchase_id)
    assert kept is not None
    assert kept.vehicle_id is None
    assert kept.unit_price_cents == 2799999


def test_unknown_vehicle_says_vehicle_not_found_in_plain_words(client, admin_headers) -> None:
    response = client.delete("/api/vehicles/999999", headers=admin_headers)
    assert response.json() == {"detail": "Vehicle not found"}


def test_a_regular_user_is_told_admin_only_in_plain_words(client, user_headers, make_vehicle) -> None:
    vehicle = make_vehicle()
    response = client.delete(f"/api/vehicles/{vehicle.id}", headers=user_headers)
    assert response.json() == {"detail": "Admin only"}
