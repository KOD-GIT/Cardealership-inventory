"""Vehicle + inventory routes. All require a JWT (D1). create/update/delete/restock are
admin-only (D4); list/search/purchase are open to any logged-in user.

NOTE: /search must be declared BEFORE /{vehicle_id} so it is not captured as an id.
Auth dependencies get wired in during TDD phase 2.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_vehicle_service, require_admin
from app.models.user import User
from app.schemas.vehicle import (
    PurchaseRequest,
    RestockRequest,
    VehicleCreate,
    VehicleRead,
    VehicleUpdate,
)
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])
_NOT_IMPLEMENTED = HTTPException(status.HTTP_501_NOT_IMPLEMENTED)


@router.post("", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    _admin: User = Depends(require_admin),
    service: VehicleService = Depends(get_vehicle_service),
) -> VehicleRead:
    return service.create(payload)


@router.get("", response_model=list[VehicleRead])
def list_vehicles(
    skip: int = 0,
    limit: int = 50,
    _user: User = Depends(get_current_user),
    service: VehicleService = Depends(get_vehicle_service),
) -> list[VehicleRead]:
    return service.list_all(skip, limit)


@router.get("/search", response_model=list[VehicleRead])
def search_vehicles(
    make: str | None = None,
    model: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> list[VehicleRead]:
    raise _NOT_IMPLEMENTED


@router.put("/{vehicle_id}", response_model=VehicleRead)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate) -> VehicleRead:
    raise _NOT_IMPLEMENTED


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int) -> None:  # admin only
    raise _NOT_IMPLEMENTED


@router.post("/{vehicle_id}/purchase", response_model=VehicleRead)
def purchase_vehicle(vehicle_id: int, payload: PurchaseRequest | None = None) -> VehicleRead:
    raise _NOT_IMPLEMENTED


@router.post("/{vehicle_id}/restock", response_model=VehicleRead)
def restock_vehicle(vehicle_id: int, payload: RestockRequest) -> VehicleRead:  # admin only
    raise _NOT_IMPLEMENTED
