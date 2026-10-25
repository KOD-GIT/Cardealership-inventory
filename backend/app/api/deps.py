"""FastAPI dependencies: DB session, service factories, current user, role guards."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.repositories.purchase_repository import PurchaseRepository
from app.repositories.user_repository import UserRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.services.auth_service import AuthService
from app.services.inventory_service import InventoryService
from app.services.vehicle_service import VehicleService

bearer_scheme = HTTPBearer(auto_error=False)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


def get_vehicle_service(db: Session = Depends(get_db)) -> VehicleService:
    return VehicleService(VehicleRepository(db))


def get_inventory_service(db: Session = Depends(get_db)) -> InventoryService:
    return InventoryService(VehicleRepository(db), PurchaseRepository(db))


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Decode the Bearer token -> load user. 401 on missing/invalid/expired token."""
    if credentials is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    raise NotImplementedError


def require_admin(user: User = Depends(get_current_user)) -> User:
    """403 unless user.role == ADMIN."""
    raise NotImplementedError
