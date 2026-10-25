"""Registration and login rules."""
from app.core.exceptions import EmailAlreadyRegisteredError
from app.core.security import hash_password
from app.models.enums import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserRead


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self._users = users

    def register(self, data: RegisterRequest) -> UserRead:
        """Create a USER (never an ADMIN). Reject duplicate emails."""
        if self._users.get_by_email(data.email) is not None:
            raise EmailAlreadyRegisteredError
        user = User(email=data.email, hashed_password=hash_password(data.password), role=Role.USER)
        return UserRead.model_validate(self._users.add(user))

    def login(self, data: LoginRequest) -> TokenResponse:
        """Verify credentials and return a JWT. Same error for unknown email / bad password."""
        raise NotImplementedError
