from app.models.vehicle import Vehicle


def test_admin_deletes_a_vehicle_and_gets_204(client, admin_headers, make_vehicle, db_session) -> None:
    vehicle = make_vehicle()
    vehicle_id = vehicle.id
    response = client.delete(f"/api/vehicles/{vehicle_id}", headers=admin_headers)
    assert response.status_code == 204
    db_session.expire_all()
    assert db_session.get(Vehicle, vehicle_id) is None
