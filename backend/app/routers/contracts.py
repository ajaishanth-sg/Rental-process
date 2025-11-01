from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional
import os
from bson import ObjectId

from ..models.contract import ContractCreate, ContractResponse, ContractUpdate
from ..utils.database import get_database
from ..utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.get("/", response_model=List[ContractResponse])
async def get_contracts(
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None
):
    """Get all contracts with optional filtering"""
    if current_user["role"] not in ["admin", "sales", "finance"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    db = get_database()
    query = {}
    if status_filter:
        query["status"] = status_filter

    contracts_cursor = db.contracts.find(query).skip(skip).limit(limit).sort("created_at", -1)
    contracts = []
    async for contract in contracts_cursor:
        contract["id"] = str(contract["_id"])
        del contract["_id"]
        contracts.append(contract)
    return contracts

@router.post("/", response_model=ContractResponse)
async def create_contract(
    contract_data: ContractCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new contract"""
    if current_user["role"] not in ["admin", "sales"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and sales can create contracts"
        )

    db = get_database()

    # Generate contract ID
    year = datetime.utcnow().year
    count = await db.contracts.count_documents({"created_at": {"$gte": datetime(year, 1, 1)}})
    contract_id = f"RC-{year}-{str(count + 1).zfill(3)}"

    contract_dict = contract_data.dict()
    contract_dict["contract_id"] = contract_id
    contract_dict["created_at"] = datetime.utcnow()
    contract_dict["updated_at"] = datetime.utcnow()

    result = await db.contracts.insert_one(contract_dict)
    contract_dict["id"] = str(result.inserted_id)

    # Log contract creation
    await db.audit_log.insert_one({
        "action": "contract_created",
        "contract_id": contract_id,
        "created_by": current_user["email"],
        "timestamp": datetime.utcnow()
    })

    return ContractResponse(**contract_dict)

@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific contract by ID"""
    if current_user["role"] not in ["admin", "sales", "finance"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    db = get_database()
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract["id"] = str(contract["_id"])
    del contract["_id"]
    return ContractResponse(**contract)

@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: str,
    contract_data: ContractUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a contract"""
    if current_user["role"] not in ["admin", "sales"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and sales can update contracts"
        )

    db = get_database()
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    update_dict = contract_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()
        await db.contracts.update_one({"_id": ObjectId(contract_id)}, {"$set": update_dict})

        # Log contract update
        await db.audit_log.insert_one({
            "action": "contract_updated",
            "contract_id": contract.get("contract_id"),
            "updated_by": current_user["email"],
            "changes": list(update_dict.keys()),
            "timestamp": datetime.utcnow()
        })

    # Return updated contract
    updated_contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    updated_contract["id"] = str(updated_contract["_id"])
    del updated_contract["_id"]
    return ContractResponse(**updated_contract)

@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a contract"""
    if current_user["role"] not in ["admin", "sales"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and sales can delete contracts"
        )

    db = get_database()
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    await db.contracts.delete_one({"_id": ObjectId(contract_id)})

    # Log contract deletion
    await db.audit_log.insert_one({
        "action": "contract_deleted",
        "contract_id": contract.get("contract_id"),
        "deleted_by": current_user["email"],
        "timestamp": datetime.utcnow()
    })

    return {"message": "Contract deleted successfully"}

@router.post("/{contract_id}/approve")
async def approve_contract(
    contract_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Approve a contract"""
    if current_user["role"] not in ["admin", "finance"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and finance can approve contracts"
        )

    db = get_database()
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    await db.contracts.update_one(
        {"_id": ObjectId(contract_id)},
        {"$set": {"approval_status": "approved", "status": "active", "updated_at": datetime.utcnow()}}
    )

    # Log approval
    await db.audit_log.insert_one({
        "action": "contract_approved",
        "contract_id": contract.get("contract_id"),
        "approved_by": current_user["email"],
        "timestamp": datetime.utcnow()
    })

    return {"message": "Contract approved successfully"}

@router.post("/{contract_id}/reject")
async def reject_contract(
    contract_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Reject a contract"""
    if current_user["role"] not in ["admin", "finance"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and finance can reject contracts"
        )

    db = get_database()
    contract = await db.contracts.find_one({"_id": ObjectId(contract_id)})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    await db.contracts.update_one(
        {"_id": ObjectId(contract_id)},
        {"$set": {"approval_status": "rejected", "status": "cancelled", "updated_at": datetime.utcnow()}}
    )

    # Log rejection
    await db.audit_log.insert_one({
        "action": "contract_rejected",
        "contract_id": contract.get("contract_id"),
        "rejected_by": current_user["email"],
        "timestamp": datetime.utcnow()
    })

    return {"message": "Contract rejected successfully"}