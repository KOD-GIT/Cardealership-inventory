"""Seed an admin user and sample vehicles. Run: python -m app.scripts.seed

Implement AFTER registration/hash helpers exist (TDD phase 2). Must be idempotent.
"""
from sqlalchemy.orm import Session

from app.db.session import SessionLocal


def seed(db: Session) -> None:
    """Create the admin account and the sample vehicles. Safe to run twice."""
    raise NotImplementedError("Implement seeding after auth + vehicle services are done.")


def main() -> None:
    with SessionLocal() as db:
        seed(db)


if __name__ == "__main__":
    main()
