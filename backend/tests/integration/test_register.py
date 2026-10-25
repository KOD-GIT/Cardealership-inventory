from app.repositories.user_repository import UserRepository


def test_register_creates_a_user_and_returns_201(client) -> None:
    response = client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    assert response.status_code == 201


def test_register_rejects_a_duplicate_email_with_409(client) -> None:
    payload = {"email": "jane@example.com", "password": "Secret123"}
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


def test_register_treats_emails_case_insensitively(client) -> None:
    client.post("/api/auth/register", json={"email": "Jane@Example.com", "password": "Secret123"})
    response = client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    assert response.status_code == 409


def test_register_returns_409_when_the_email_check_loses_a_race(client, monkeypatch) -> None:
    payload = {"email": "jane@example.com", "password": "Secret123"}
    client.post("/api/auth/register", json=payload)
    # Simulate the other request winning: the lookup finds nothing, but the unique index still fires.
    monkeypatch.setattr(UserRepository, "get_by_email", lambda self, email: None)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
