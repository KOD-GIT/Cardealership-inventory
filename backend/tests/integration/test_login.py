from app.core.security import decode_access_token


def test_login_with_valid_credentials_returns_200_and_a_token(client) -> None:
    credentials = {"email": "jane@example.com", "password": "Secret123"}
    client.post("/api/auth/register", json=credentials)
    response = client.post("/api/auth/login", json=credentials)
    assert response.status_code == 200
    assert response.json()["access_token"]


def test_login_with_a_wrong_password_returns_401(client) -> None:
    client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    response = client.post("/api/auth/login", json={"email": "jane@example.com", "password": "Wrong456"})
    assert response.status_code == 401


def test_login_with_an_unknown_email_returns_401(client) -> None:
    response = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "Secret123"})
    assert response.status_code == 401


def test_login_returns_the_user_and_a_token_for_that_user(client) -> None:
    credentials = {"email": "jane@example.com", "password": "Secret123"}
    registered = client.post("/api/auth/register", json=credentials).json()
    body = client.post("/api/auth/login", json=credentials).json()
    assert body["token_type"] == "bearer"
    assert body["user"] == registered
    claims = decode_access_token(body["access_token"])
    assert claims["sub"] == str(registered["id"])
    assert claims["role"] == "USER"


def test_login_ignores_the_case_of_the_email(client) -> None:
    client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    response = client.post("/api/auth/login", json={"email": "JANE@Example.com", "password": "Secret123"})
    assert response.status_code == 200


def test_login_gives_the_same_error_for_a_wrong_password_and_an_unknown_email(client) -> None:
    client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    wrong_pw = client.post("/api/auth/login", json={"email": "jane@example.com", "password": "Wrong456"})
    unknown = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "Wrong456"})
    assert wrong_pw.status_code == unknown.status_code == 401
    assert wrong_pw.json() == unknown.json()
