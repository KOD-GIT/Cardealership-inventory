"""Vehicle + inventory routes. All require a JWT (D1). create/update/delete/restock are
admin-only (D4); list/search/purchase are open to any logged-in user.

NOTE: /search must be declared BEFORE /{vehicle_id} so it is not captured as an id.
Auth dependencies get wired in during TDD phase 2.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_current_user, get_inventory_service, get_vehicle_service, require_admin
from app.models.user import User
from app.schemas.vehicle import (
    PurchaseRequest,
    RestockRequest,
    VehicleCreate,
    VehicleRead,
    VehicleSearchCriteria,
    VehicleUpdate,
)
from app.services.inventory_service import InventoryService
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


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
    params: Annotated[VehicleSearchCriteria, Query()],
    _user: User = Depends(get_current_user),
    service: VehicleService = Depends(get_vehicle_service),
) -> list[VehicleRead]:
    return service.search(params)


@router.put("/{vehicle_id}", response_model=VehicleRead)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    _admin: User = Depends(require_admin),
    service: VehicleService = Depends(get_vehicle_service),
) -> VehicleRead:
    return service.update(vehicle_id, payload)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    _admin: User = Depends(require_admin),
    service: VehicleService = Depends(get_vehicle_service),
) -> None:
    service.delete(vehicle_id)


@router.post("/{vehicle_id}/purchase", response_model=VehicleRead)
def purchase_vehicle(
    vehicle_id: int,
    payload: PurchaseRequest | None = None,
    user: User = Depends(get_current_user),
    service: InventoryService = Depends(get_inventory_service),
) -> VehicleRead:
    quantity = payload.quantity if payload else 1
    return service.purchase(vehicle_id, user.id, quantity)


@router.post("/{vehicle_id}/restock", response_model=VehicleRead)
def restock_vehicle(
    vehicle_id: int,
    payload: RestockRequest,
    _admin: User = Depends(require_admin),
    service: InventoryService = Depends(get_inventory_service),
) -> VehicleRead:
    return service.restock(vehicle_id, payload.quantity)
