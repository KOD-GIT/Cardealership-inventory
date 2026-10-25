import pytest
from fastapi import HTTPException

from app.api.deps import get_current_user


def test_get_current_user_without_credentials_raises_401(db_session) -> None:
    with pytest.raises(HTTPException) as error:
        get_current_user(None, db_session)
    assert error.value.status_code == 401
