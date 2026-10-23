"""Domain exceptions. Services raise these; the API layer maps them to HTTP responses.

Keeping HTTP concerns out of the services makes them easy to unit test (SRP / DIP).
"""


class DomainError(Exception):
    """Base class for all business-rule violations."""


class EmailAlreadyRegisteredError(DomainError):
    ...


class InvalidCredentialsError(DomainError):
    ...


class VehicleNotFoundError(DomainError):
    ...


class OutOfStockError(DomainError):
    """Raised when a purchase asks for more units than are available."""


class PermissionDeniedError(DomainError):
    ...
