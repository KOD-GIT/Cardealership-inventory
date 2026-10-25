"""Application settings, loaded from environment variables / .env (12-factor style)."""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Car Dealership Inventory API"
    # PostgreSQL via psycopg 3. Format: postgresql+psycopg://USER:PASSWORD@HOST:PORT/DBNAME
    database_url: str = "postgresql+psycopg://dealership:dealership@localhost:5432/dealership"
    # Separate database used ONLY by the test suite (tables are dropped/recreated).
    test_database_url: str = "postgresql+psycopg://dealership:dealership@localhost:5432/dealership_test"
    secret_key: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:5173"]

    # Used only by app/scripts/seed.py
    admin_email: str = "admin@dealership.com"
    admin_password: str = "Admin@12345"

    @field_validator("database_url", "test_database_url")
    @classmethod
    def _use_the_psycopg_driver(cls, url: str) -> str:
        """Hosts such as Neon hand out `postgresql://...`; SQLAlchemy needs the driver named explicitly."""
        for plain in ("postgresql://", "postgres://"):
            if url.startswith(plain):
                return "postgresql+psycopg://" + url[len(plain):]
        return url

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
