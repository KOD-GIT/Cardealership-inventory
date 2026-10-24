"""The environment doctor turns raw PostgreSQL / driver errors into plain-English fixes."""
import pytest

from app.scripts.doctor import diagnose, driver_hint, unsafe_test_database


@pytest.mark.parametrize(
    "raw,expected",
    [
        (
            'connection failed: connection to server at "127.0.0.1", port 5432 failed: Connection refused',
            "not running",
        ),
        ('FATAL:  password authentication failed for user "dealership"', "username or password"),
        ('FATAL:  database "dealership_test" does not exist', "CREATE DATABASE dealership_test"),
        ('FATAL:  role "bob" does not exist', "CREATE USER"),
        ("could not translate host name \"dbb\" to address: Name or service not known", "host name"),
    ],
)
def test_diagnose_explains_common_postgres_errors(raw: str, expected: str) -> None:
    assert expected.lower() in diagnose(raw).lower()


def test_diagnose_falls_back_to_the_raw_message() -> None:
    assert diagnose("something unexpected") == "something unexpected"


def test_driver_hint_flags_a_url_without_the_psycopg_driver() -> None:
    assert "postgresql+psycopg://" in (driver_hint("postgresql://u:p@localhost:5432/db") or "")


def test_driver_hint_accepts_the_right_url() -> None:
    assert driver_hint("postgresql+psycopg://u:p@localhost:5432/db") is None


@pytest.mark.parametrize("name", ["dealership", "production", "postgres", ""])
def test_a_test_database_without_the_test_suffix_is_unsafe(name: str) -> None:
    # the suite DROPS every table in this database, so it must never be a real one
    url = f"postgresql+psycopg://u:p@localhost:5432/{name}"
    assert "_test" in (unsafe_test_database(url) or "")


@pytest.mark.parametrize("name", ["dealership_test", "x_test", "ci_test"])
def test_a_database_ending_in_test_is_safe(name: str) -> None:
    assert unsafe_test_database(f"postgresql+psycopg://u:p@localhost:5432/{name}") is None
