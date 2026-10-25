from app.core.config import Settings


def test_a_plain_postgresql_url_from_a_hosting_provider_gets_the_psycopg_driver() -> None:
    settings = Settings(database_url="postgresql://user:pw@host.example/db?sslmode=require")
    assert settings.database_url == "postgresql+psycopg://user:pw@host.example/db?sslmode=require"


def test_the_old_postgres_scheme_is_accepted_too() -> None:
    settings = Settings(database_url="postgres://user:pw@host.example/db")
    assert settings.database_url == "postgresql+psycopg://user:pw@host.example/db"


def test_a_url_that_already_names_the_driver_is_left_alone() -> None:
    url = "postgresql+psycopg://user:pw@host.example/db"
    assert Settings(database_url=url).database_url == url
