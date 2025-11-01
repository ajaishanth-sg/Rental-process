from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
from bson import ObjectId

from ..models.rate import (
    RateCreate, RateResponse, RateUpdate,
    RateStatus
)
from ..utils.database import get_database
from ..utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.post("/", response_model=RateResponse)
async def create_rate(
    rate_data: RateCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new rate configuration (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create rate configurations"
        )

    db = get_database()

    # Check if item code already exists
    existing = await db.rates.find_one({"item_code": rate_data.item_code})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rate configuration with this item code already exists"
        )

    rate_dict = rate_data.dict()
    rate_dict.update({
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    result = await db.rates.insert_one(rate_dict)
    rate_dict["id"] = str(result.inserted_id)

    return RateResponse(**rate_dict)

@router.get("/", response_model=List[RateResponse])
async def get_rates(
    status: Optional[RateStatus] = None,
    currency: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all rate configurations"""
    db = get_database()

    # Build query
    query = {}
    if status:
        query["status"] = status
    if currency:
        query["currency"] = currency

    rates_cursor = db.rates.find(query).sort("created_at", -1)
    rates_list = []
    async for item in rates_cursor:
        item["id"] = str(item["_id"])
        del item["_id"]
        rates_list.append(item)

    return rates_list

@router.get("/{rate_id}", response_model=RateResponse)
async def get_rate_by_id(
    rate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get rate configuration by ID"""
    db = get_database()
    rate = await db.rates.find_one({"_id": ObjectId(rate_id)})

    if not rate:
        raise HTTPException(status_code=404, detail="Rate configuration not found")

    rate["id"] = str(rate["_id"])
    del rate["_id"]

    return RateResponse(**rate)

@router.put("/{rate_id}", response_model=RateResponse)
async def update_rate(
    rate_id: str,
    rate_data: RateUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update rate configuration (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update rate configurations"
        )

    db = get_database()
    rate = await db.rates.find_one({"_id": ObjectId(rate_id)})

    if not rate:
        raise HTTPException(status_code=404, detail="Rate configuration not found")

    update_dict = rate_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()

        await db.rates.update_one({"_id": ObjectId(rate_id)}, {"$set": update_dict})

    # Return updated rate
    updated_rate = await db.rates.find_one({"_id": ObjectId(rate_id)})
    updated_rate["id"] = str(updated_rate["_id"])
    del updated_rate["_id"]

    return RateResponse(**updated_rate)

@router.delete("/{rate_id}")
async def delete_rate(
    rate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete rate configuration (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete rate configurations"
        )

    db = get_database()
    rate = await db.rates.find_one({"_id": ObjectId(rate_id)})

    if not rate:
        raise HTTPException(status_code=404, detail="Rate configuration not found")

    await db.rates.delete_one({"_id": ObjectId(rate_id)})

    return {"message": "Rate configuration deleted successfully"}