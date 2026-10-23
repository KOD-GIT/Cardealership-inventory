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
from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    test_engine = create_engine(get_settings().test_database_url, pool_pre_ping=True)
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


# TODO (TDD phases 3-5): add fixtures once registration/login exist, e.g.
#   user_token / admin_token / auth_headers(token), and a `make_vehicle(...)` factory.
