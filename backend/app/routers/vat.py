from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
from bson import ObjectId

from ..models.vat import (
    VATCreate, VATResponse, VATUpdate,
    VATStatus
)
from ..utils.database import get_database
from ..utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.post("/", response_model=VATResponse)
async def create_vat(
    vat_data: VATCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new VAT rate (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create VAT rates"
        )

    db = get_database()

    vat_dict = vat_data.dict()
    vat_dict.update({
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    result = await db.vat_rates.insert_one(vat_dict)
    vat_dict["id"] = str(result.inserted_id)

    return VATResponse(**vat_dict)

@router.get("/", response_model=List[VATResponse])
async def get_vat_rates(
    status: Optional[VATStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all VAT rates"""
    db = get_database()

    # Build query
    query = {}
    if status:
        query["status"] = status

    vat_cursor = db.vat_rates.find(query).sort("created_at", -1)
    vat_list = []
    async for item in vat_cursor:
        item["id"] = str(item["_id"])
        del item["_id"]
        vat_list.append(item)

    return vat_list

@router.get("/{vat_id}", response_model=VATResponse)
async def get_vat_by_id(
    vat_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get VAT rate by ID"""
    db = get_database()
    vat = await db.vat_rates.find_one({"_id": ObjectId(vat_id)})

    if not vat:
        raise HTTPException(status_code=404, detail="VAT rate not found")

    vat["id"] = str(vat["_id"])
    del vat["_id"]

    return VATResponse(**vat)

@router.put("/{vat_id}", response_model=VATResponse)
async def update_vat(
    vat_id: str,
    vat_data: VATUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update VAT rate (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update VAT rates"
        )

    db = get_database()
    vat = await db.vat_rates.find_one({"_id": ObjectId(vat_id)})

    if not vat:
        raise HTTPException(status_code=404, detail="VAT rate not found")

    update_dict = vat_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()

        await db.vat_rates.update_one({"_id": ObjectId(vat_id)}, {"$set": update_dict})

    # Return updated vat
    updated_vat = await db.vat_rates.find_one({"_id": ObjectId(vat_id)})
    updated_vat["id"] = str(updated_vat["_id"])
    del updated_vat["_id"]

    return VATResponse(**updated_vat)

@router.delete("/{vat_id}")
async def delete_vat(
    vat_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete VAT rate (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete VAT rates"
        )

    db = get_database()
    vat = await db.vat_rates.find_one({"_id": ObjectId(vat_id)})

    if not vat:
        raise HTTPException(status_code=404, detail="VAT rate not found")

    await db.vat_rates.delete_one({"_id": ObjectId(vat_id)})

    return {"message": "VAT rate deleted successfully"}