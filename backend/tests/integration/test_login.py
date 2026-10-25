def test_login_with_valid_credentials_returns_200_and_a_token(client) -> None:
    credentials = {"email": "jane@example.com", "password": "Secret123"}
    client.post("/api/auth/register", json=credentials)
    response = client.post("/api/auth/login", json=credentials)
    assert response.status_code == 200
    assert response.json()["access_token"]
