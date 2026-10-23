"""Registration and login rules."""
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserRead


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self._users = users

    def register(self, data: RegisterRequest) -> UserRead:
        """Create a USER (never an ADMIN). Reject duplicate emails."""
        raise NotImplementedError

    def login(self, data: LoginRequest) -> TokenResponse:
        """Verify credentials and return a JWT. Same error for unknown email / bad password."""
        raise NotImplementedError
