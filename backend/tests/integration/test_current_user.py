import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.deps import get_current_user


def test_get_current_user_without_credentials_raises_401(db_session) -> None:
    with pytest.raises(HTTPException) as error:
        get_current_user(None, db_session)
    assert error.value.status_code == 401


def test_get_current_user_returns_the_user_for_a_valid_token(client, db_session) -> None:
    credentials = {"email": "jane@example.com", "password": "Secret123"}
    registered = client.post("/api/auth/register", json=credentials).json()
    token = client.post("/api/auth/login", json=credentials).json()["access_token"]
    bearer = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    user = get_current_user(bearer, db_session)
    assert user.id == registered["id"]
    assert user.email == "jane@example.com"
