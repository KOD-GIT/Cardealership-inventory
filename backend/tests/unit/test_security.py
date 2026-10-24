from app.core.security import hash_password, verify_password


def test_hash_password_does_not_return_the_plain_password() -> None:
    assert hash_password("Secret123") != "Secret123"


def test_verify_password_accepts_the_right_password() -> None:
    hashed = hash_password("Secret123")
    assert verify_password("Secret123", hashed) is True


def test_verify_password_rejects_a_wrong_password() -> None:
    hashed = hash_password("Secret123")
    assert verify_password("Wrong456", hashed) is False
