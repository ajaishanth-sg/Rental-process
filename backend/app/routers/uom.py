from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
from bson import ObjectId

from ..models.uom import (
    UOMCreate, UOMResponse, UOMUpdate,
    UOMStatus
)
from ..utils.database import get_database
from ..utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.post("/", response_model=UOMResponse)
async def create_uom(
    uom_data: UOMCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new unit of measurement (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create units of measurement"
        )

    db = get_database()

    # Check if code already exists
    existing = await db.uom.find_one({"code": uom_data.code})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="UOM with this code already exists"
        )

    uom_dict = uom_data.dict()
    uom_dict.update({
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    result = await db.uom.insert_one(uom_dict)
    uom_dict["id"] = str(result.inserted_id)

    return UOMResponse(**uom_dict)

@router.get("/", response_model=List[UOMResponse])
async def get_uom(
    status: Optional[UOMStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all units of measurement"""
    db = get_database()

    # Build query
    query = {}
    if status:
        query["status"] = status

    uom_cursor = db.uom.find(query).sort("created_at", -1)
    uom_list = []
    async for item in uom_cursor:
        item["id"] = str(item["_id"])
        del item["_id"]
        uom_list.append(item)

    return uom_list

@router.get("/{uom_id}", response_model=UOMResponse)
async def get_uom_by_id(
    uom_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get unit of measurement by ID"""
    db = get_database()
    uom = await db.uom.find_one({"_id": ObjectId(uom_id)})

    if not uom:
        raise HTTPException(status_code=404, detail="Unit of measurement not found")

    uom["id"] = str(uom["_id"])
    del uom["_id"]

    return UOMResponse(**uom)

@router.put("/{uom_id}", response_model=UOMResponse)
async def update_uom(
    uom_id: str,
    uom_data: UOMUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update unit of measurement (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update units of measurement"
        )

    db = get_database()
    uom = await db.uom.find_one({"_id": ObjectId(uom_id)})

    if not uom:
        raise HTTPException(status_code=404, detail="Unit of measurement not found")

    update_dict = uom_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()

        await db.uom.update_one({"_id": ObjectId(uom_id)}, {"$set": update_dict})

    # Return updated uom
    updated_uom = await db.uom.find_one({"_id": ObjectId(uom_id)})
    updated_uom["id"] = str(updated_uom["_id"])
    del updated_uom["_id"]

    return UOMResponse(**updated_uom)

@router.delete("/{uom_id}")
async def delete_uom(
    uom_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete unit of measurement (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete units of measurement"
        )

    db = get_database()
    uom = await db.uom.find_one({"_id": ObjectId(uom_id)})

    if not uom:
        raise HTTPException(status_code=404, detail="Unit of measurement not found")

    await db.uom.delete_one({"_id": ObjectId(uom_id)})

    return {"message": "Unit of measurement deleted successfully"}