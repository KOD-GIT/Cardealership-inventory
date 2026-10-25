"""Shared fixtures. Tests run against a real PostgreSQL database (TEST_DATABASE_URL).

Strategy: tables are created once per session; every test runs inside a transaction that is
rolled back afterwards, so tests are isolated and fast without needing to truncate tables.
Start the database first:  docker compose up -d db
"""
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

import app.models  # noqa: F401  (registers models on Base.metadata)
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.enums import Role
from app.models.user import User
from app.scripts.doctor import unsafe_test_database


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    url = get_settings().test_database_url
    unsafe = unsafe_test_database(url)
    if unsafe:  # safety net: never DROP the tables of a real database
        pytest.exit(f"Refusing to run: {unsafe}", returncode=2)
    test_engine = create_engine(url, pool_pre_ping=True)
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    yield test_engine
    Base.metadata.drop_all(test_engine)
    test_engine.dispose()


@pytest.fixture()
def db_session(engine: Engine) -> Iterator[Session]:
    connection = engine.connect()
    outer_transaction = connection.begin()
    # "create_savepoint": session.commit() inside a test only releases a SAVEPOINT,
    # so the outer transaction can still be rolled back.
    session = Session(bind=connection, join_transaction_mode="create_savepoint", autoflush=False)
    try:
        yield session
    finally:
        session.close()
        outer_transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db_session: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _auth_headers_for(db_session: Session, email: str, role: Role) -> dict[str, str]:
    """Create a user with this role straight in the database and return a Bearer header for them."""
    user = User(email=email, hashed_password=hash_password("Secret123"), role=role)
    db_session.add(user)
    db_session.commit()
    return {"Authorization": f"Bearer {create_access_token(str(user.id), role.value)}"}


@pytest.fixture()
def user_headers(db_session: Session) -> dict[str, str]:
    return _auth_headers_for(db_session, "user@example.com", Role.USER)


@pytest.fixture()
def admin_headers(db_session: Session) -> dict[str, str]:
    return _auth_headers_for(db_session, "admin@example.com", Role.ADMIN)


# TODO (TDD phases 6-10): add a `make_vehicle(...)` factory once vehicles can be created.
