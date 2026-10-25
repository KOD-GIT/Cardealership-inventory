"""Seed an admin user and sample vehicles. Run: python -m app.scripts.seed

Implement AFTER registration/hash helpers exist (TDD phase 2). Must be idempotent.
"""
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.enums import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository


def seed(db: Session) -> None:
    """Create the admin account and the sample vehicles. Safe to run twice."""
    settings = get_settings()
    users = UserRepository(db)
    email = settings.admin_email.lower()
    if users.get_by_email(email) is None:  # an existing admin is left alone, even its password
        users.add(User(email=email, hashed_password=hash_password(settings.admin_password), role=Role.ADMIN))


def main() -> None:
    with SessionLocal() as db:
        seed(db)


if __name__ == "__main__":
    main()
