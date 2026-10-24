from app.core.security import hash_password


def test_hash_password_does_not_return_the_plain_password() -> None:
    assert hash_password("Secret123") != "Secret123"
