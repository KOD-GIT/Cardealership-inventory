"""Registration and login rules."""
from app.core.exceptions import EmailAlreadyRegisteredError, InvalidCredentialsError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserRead


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self._users = users

    def register(self, data: RegisterRequest) -> UserRead:
        """Create a USER (never an ADMIN). Reject duplicate emails."""
        email = data.email.lower()
        if self._users.get_by_email(email) is not None:
            raise EmailAlreadyRegisteredError
        user = User(email=email, hashed_password=hash_password(data.password), role=Role.USER)
        return UserRead.model_validate(self._users.add(user))

    def login(self, data: LoginRequest) -> TokenResponse:
        """Verify credentials and return a JWT. Same error for unknown email / bad password."""
        user = self._users.get_by_email(data.email.lower())
        if not verify_password(data.password, user.hashed_password):
            raise InvalidCredentialsError
        token = create_access_token(str(user.id), user.role.value)
        return TokenResponse(access_token=token, user=UserRead.model_validate(user))
