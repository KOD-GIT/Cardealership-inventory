"""Data access for users. No business rules here - only queries."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_email(self, email: str) -> User | None:
        return self._db.scalar(select(User).where(User.email == email))

    def get_by_id(self, user_id: int) -> User | None:
        raise NotImplementedError

    def add(self, user: User) -> User:
        self._db.add(user)
        self._db.commit()
        self._db.refresh(user)
        return user
