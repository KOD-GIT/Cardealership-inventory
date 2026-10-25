"""Data access for users. No business rules here - only queries."""
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import EmailAlreadyRegisteredError
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
        try:
            self._db.commit()
        except IntegrityError:  # two requests passed the email check at once; the unique index decides
            self._db.rollback()
            raise EmailAlreadyRegisteredError from None
        self._db.refresh(user)
        return user
