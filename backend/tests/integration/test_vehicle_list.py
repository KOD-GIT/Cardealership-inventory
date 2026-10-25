def test_anonymous_list_vehicles_returns_401(client) -> None:
    response = client.get("/api/vehicles")
    assert response.status_code == 401
