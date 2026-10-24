from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enums import Role


class RegisterRequest(BaseModel):
    """`role` is intentionally absent: registration always creates a USER (decision D3)."""

    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def _fits_bcrypt(cls, value: str) -> str:
        # bcrypt only uses the first 72 BYTES and (v5+) raises an error for longer input, so reject it
        # here with a clear 422 instead of letting registration crash with a 500.
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: Role


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead  # decision D8: the frontend needs the role without an extra /me call
