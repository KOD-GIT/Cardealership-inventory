"""Domain exceptions. Services raise these; the API layer maps them to HTTP responses.

Keeping HTTP concerns out of the services makes them easy to unit test (SRP / DIP).
"""


class DomainError(Exception):
    """Base class for all business-rule violations.

    `default_message` is what the API sends as `detail` (the frontend shows it to the user), so it
    is plain words and never the class name.
    """

    default_message = "The request could not be completed"

    def __str__(self) -> str:
        return super().__str__() or self.default_message


class EmailAlreadyRegisteredError(DomainError):
    default_message = "Email already registered"


class InvalidCredentialsError(DomainError):
    default_message = "Invalid credentials"


class VehicleNotFoundError(DomainError):
    default_message = "Vehicle not found"


class OutOfStockError(DomainError):
    """Raised when a purchase asks for more units than are available."""

    default_message = "Out of stock"


class PermissionDeniedError(DomainError):
    ...
