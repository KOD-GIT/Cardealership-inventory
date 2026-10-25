import pytest

from app.core.security import verify_password
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


def test_register_returns_the_public_user_without_the_password_hash(client) -> None:
    response = client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    body = response.json()
    assert body["email"] == "jane@example.com"
    assert body["role"] == "USER"
    assert isinstance(body["id"], int)
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_stores_a_hash_not_the_plain_password(client, db_session) -> None:
    client.post("/api/auth/register", json={"email": "jane@example.com", "password": "Secret123"})
    user = UserRepository(db_session).get_by_email("jane@example.com")
    assert user is not None
    assert user.hashed_password != "Secret123"
    assert verify_password("Secret123", user.hashed_password)


def test_register_ignores_a_role_sent_in_the_request(client) -> None:
    payload = {"email": "mallory@example.com", "password": "Secret123", "role": "ADMIN"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["role"] == "USER"


@pytest.mark.parametrize(
    "payload",
    [
        {"email": "not-an-email", "password": "Secret123"},
        {"email": "jane@example.com", "password": "1234567"},
        {"email": "jane@example.com", "password": "a" * 73},
    ],
    ids=["invalid-email", "short-password", "73-byte-password"],
)
def test_register_rejects_invalid_input_with_422(client, payload) -> None:
    assert client.post("/api/auth/register", json=payload).status_code == 422


def test_register_duplicate_email_explains_why_in_plain_words(client) -> None:
    payload = {"email": "jane@example.com", "password": "Secret123"}
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.json() == {"detail": "Email already registered"}
