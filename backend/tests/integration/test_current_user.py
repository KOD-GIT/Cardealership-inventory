from datetime import timedelta

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.deps import get_current_user, require_admin
from app.core.security import create_access_token
from app.models.enums import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository


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


def test_get_current_user_with_a_malformed_token_raises_401(db_session) -> None:
    bearer = HTTPAuthorizationCredentials(scheme="Bearer", credentials="not-a-real-token")
    with pytest.raises(HTTPException) as error:
        get_current_user(bearer, db_session)
    assert error.value.status_code == 401
    assert error.value.headers == {"WWW-Authenticate": "Bearer"}


def test_get_current_user_for_a_deleted_user_raises_401(client, db_session) -> None:
    credentials = {"email": "jane@example.com", "password": "Secret123"}
    client.post("/api/auth/register", json=credentials)
    token = client.post("/api/auth/login", json=credentials).json()["access_token"]
    db_session.delete(UserRepository(db_session).get_by_email("jane@example.com"))
    db_session.commit()
    bearer = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    with pytest.raises(HTTPException) as error:
        get_current_user(bearer, db_session)
    assert error.value.status_code == 401


def test_get_current_user_with_a_non_numeric_subject_raises_401(db_session) -> None:
    bearer = HTTPAuthorizationCredentials(scheme="Bearer", credentials=create_access_token("abc", "USER"))
    with pytest.raises(HTTPException) as error:
        get_current_user(bearer, db_session)
    assert error.value.status_code == 401


def test_get_current_user_with_an_expired_token_raises_401(client, db_session) -> None:
    credentials = {"email": "jane@example.com", "password": "Secret123"}
    user_id = client.post("/api/auth/register", json=credentials).json()["id"]
    expired = create_access_token(str(user_id), "USER", expires_delta=timedelta(seconds=-1))
    bearer = HTTPAuthorizationCredentials(scheme="Bearer", credentials=expired)
    with pytest.raises(HTTPException) as error:
        get_current_user(bearer, db_session)
    assert error.value.status_code == 401


def test_get_current_user_trusts_the_stored_role_not_the_token_role(client, db_session) -> None:
    credentials = {"email": "jane@example.com", "password": "Secret123"}
    user_id = client.post("/api/auth/register", json=credentials).json()["id"]
    claims_admin = create_access_token(str(user_id), "ADMIN")
    bearer = HTTPAuthorizationCredentials(scheme="Bearer", credentials=claims_admin)
    assert get_current_user(bearer, db_session).role == Role.USER


def test_require_admin_raises_403_for_a_regular_user() -> None:
    user = User(email="jane@example.com", hashed_password="x", role=Role.USER)
    with pytest.raises(HTTPException) as error:
        require_admin(user)
    assert error.value.status_code == 403
