"""Password hashing and JWT helpers.

TDD TARGET: write tests/unit/test_security.py first (hash != plain, verify works,
token round-trip, expired token rejected, tampered token rejected), then implement.
"""
from datetime import timedelta
from typing import Any

import bcrypt
import jwt

from app.core.config import get_settings


def hash_password(plain_password: str) -> str:
    """Return a salted bcrypt hash of the password."""
    return bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the plain password matches the stored hash."""
    try:
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    except ValueError:  # bcrypt 5 raises for passwords over 72 bytes
        return False


def create_access_token(subject: str, role: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT carrying `sub` (user id), `role` and `exp` claims."""
    settings = get_settings()
    payload = {"sub": subject, "role": role}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT. Raise an error for expired/invalid tokens."""
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
