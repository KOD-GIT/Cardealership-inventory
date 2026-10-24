"""Password hashing and JWT helpers.

TDD TARGET: write tests/unit/test_security.py first (hash != plain, verify works,
token round-trip, expired token rejected, tampered token rejected), then implement.
"""
from datetime import timedelta
from typing import Any

import bcrypt


def hash_password(plain_password: str) -> str:
    """Return a salted bcrypt hash of the password."""
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the plain password matches the stored hash."""
    raise NotImplementedError


def create_access_token(subject: str, role: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT carrying `sub` (user id), `role` and `exp` claims."""
    raise NotImplementedError


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT. Raise an error for expired/invalid tokens."""
    raise NotImplementedError
