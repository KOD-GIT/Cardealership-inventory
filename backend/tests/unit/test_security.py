from datetime import timedelta

import jwt
import pytest

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_password_does_not_return_the_plain_password() -> None:
    assert hash_password("Secret123") != "Secret123"


def test_verify_password_accepts_the_right_password() -> None:
    hashed = hash_password("Secret123")
    assert verify_password("Secret123", hashed) is True


def test_verify_password_rejects_a_wrong_password() -> None:
    hashed = hash_password("Secret123")
    assert verify_password("Wrong456", hashed) is False


def test_verify_password_returns_false_for_a_password_over_72_bytes() -> None:
    hashed = hash_password("Secret123")
    assert verify_password("a" * 73, hashed) is False


def test_access_token_round_trip_keeps_subject_and_role() -> None:
    token = create_access_token("42", "ADMIN")
    claims = decode_access_token(token)
    assert claims["sub"] == "42"
    assert claims["role"] == "ADMIN"


def test_decode_access_token_rejects_an_expired_token() -> None:
    token = create_access_token("42", "ADMIN", expires_delta=timedelta(seconds=-1))
    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(token)
