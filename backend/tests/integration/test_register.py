def test_register_creates_a_user_and_returns_201(client) -> None:
    response = client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    assert response.status_code == 201
