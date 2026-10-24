"""setup_env creates .env files and generates a SECRET_KEY, without ever overwriting your own values."""
import pytest

from app.scripts.setup_env import ensure_secret_key, is_placeholder_secret

EXAMPLE = (
    "DATABASE_URL=postgresql+psycopg://dealership:dealership@localhost:5432/dealership\n"
    'SECRET_KEY=replace-with-a-long-random-string   # python -c "import secrets; print(1)"\n'
    "JWT_ALGORITHM=HS256\n"
)


@pytest.mark.parametrize("value", ["", "replace-with-a-long-random-string", "dev-only-change-me", "short"])
def test_placeholder_and_short_secrets_are_replaced(value: str) -> None:
    assert is_placeholder_secret(value)


def test_a_long_custom_secret_is_kept() -> None:
    assert not is_placeholder_secret("x" * 40)


def test_ensure_secret_key_generates_a_long_secret_and_keeps_everything_else() -> None:
    text, changed = ensure_secret_key(EXAMPLE)
    assert changed
    line = next(row for row in text.splitlines() if row.startswith("SECRET_KEY="))
    secret = line.split("=", 1)[1]
    assert len(secret) >= 32 and "replace-with" not in secret and "#" not in line
    assert "DATABASE_URL=postgresql+psycopg://dealership:dealership@localhost:5432/dealership" in text
    assert "JWT_ALGORITHM=HS256" in text


def test_ensure_secret_key_is_idempotent_and_never_overwrites_a_custom_secret() -> None:
    first, _ = ensure_secret_key(EXAMPLE)
    second, changed = ensure_secret_key(first)
    assert not changed and second == first


def test_ensure_secret_key_adds_the_line_when_it_is_missing() -> None:
    text, changed = ensure_secret_key("JWT_ALGORITHM=HS256\n")
    assert changed
    assert any(row.startswith("SECRET_KEY=") and len(row) > 40 for row in text.splitlines())


def test_two_runs_on_fresh_files_generate_different_secrets() -> None:
    a, _ = ensure_secret_key(EXAMPLE)
    b, _ = ensure_secret_key(EXAMPLE)
    assert a != b
