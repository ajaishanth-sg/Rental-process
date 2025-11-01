from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
from bson import ObjectId

from ..models.currency import (
    CurrencyCreate, CurrencyResponse, CurrencyUpdate,
    CurrencyStatus
)
from ..utils.database import get_database
from ..utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.post("/", response_model=CurrencyResponse)
async def create_currency(
    currency_data: CurrencyCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new currency (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create currencies"
        )

    db = get_database()

    # Check if code already exists
    existing = await db.currencies.find_one({"code": currency_data.code})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currency with this code already exists"
        )

    currency_dict = currency_data.dict()
    currency_dict.update({
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    result = await db.currencies.insert_one(currency_dict)
    currency_dict["id"] = str(result.inserted_id)

    return CurrencyResponse(**currency_dict)

@router.get("/", response_model=List[CurrencyResponse])
async def get_currencies(
    status: Optional[CurrencyStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all currencies"""
    db = get_database()

    # Build query
    query = {}
    if status:
        query["status"] = status

    currencies_cursor = db.currencies.find(query).sort("created_at", -1)
    currencies_list = []
    async for item in currencies_cursor:
        item["id"] = str(item["_id"])
        del item["_id"]
        currencies_list.append(item)

    return currencies_list

@router.get("/{currency_id}", response_model=CurrencyResponse)
async def get_currency_by_id(
    currency_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get currency by ID"""
    db = get_database()
    currency = await db.currencies.find_one({"_id": ObjectId(currency_id)})

    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")

    currency["id"] = str(currency["_id"])
    del currency["_id"]

    return CurrencyResponse(**currency)

@router.put("/{currency_id}", response_model=CurrencyResponse)
async def update_currency(
    currency_id: str,
    currency_data: CurrencyUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update currency (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update currencies"
        )

    db = get_database()
    currency = await db.currencies.find_one({"_id": ObjectId(currency_id)})

    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")

    update_dict = currency_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()

        await db.currencies.update_one({"_id": ObjectId(currency_id)}, {"$set": update_dict})

    # Return updated currency
    updated_currency = await db.currencies.find_one({"_id": ObjectId(currency_id)})
    updated_currency["id"] = str(updated_currency["_id"])
    del updated_currency["_id"]

    return CurrencyResponse(**updated_currency)

@router.delete("/{currency_id}")
async def delete_currency(
    currency_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete currency (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete currencies"
        )

    db = get_database()
    currency = await db.currencies.find_one({"_id": ObjectId(currency_id)})

    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")

    await db.currencies.delete_one({"_id": ObjectId(currency_id)})

    return {"message": "Currency deleted successfully"}