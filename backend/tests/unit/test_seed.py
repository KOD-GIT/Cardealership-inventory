from app.core.config import get_settings
from app.core.security import verify_password
from app.models.enums import Role
from app.repositories.user_repository import UserRepository
from app.scripts.seed import seed


def test_seed_creates_the_admin_from_the_settings(db_session) -> None:
    seed(db_session)
    settings = get_settings()
    admin = UserRepository(db_session).get_by_email(settings.admin_email.lower())
    assert admin is not None
    assert admin.role == Role.ADMIN
    assert verify_password(settings.admin_password, admin.hashed_password)
