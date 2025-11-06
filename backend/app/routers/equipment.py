from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os

from ..models.equipment import (
    EquipmentCreate, EquipmentResponse, EquipmentUpdate,
    EquipmentAdjustment, EquipmentHistory, EquipmentStatus,
    EquipmentCategory, EquipmentUnit
)
from ..models.user import UserResponse
from ..utils.database import get_database
from ..utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.post("/", response_model=EquipmentResponse)
async def create_equipment(
    equipment_data: EquipmentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new equipment (warehouse/admin only)"""
    if current_user["role"] not in ["warehouse", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only warehouse staff and administrators can add equipment"
        )

    db = get_database()

    # Check if item code already exists
    existing = await db.equipment.find_one({"item_code": equipment_data.item_code})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment with this item code already exists"
        )

    equipment_dict = equipment_data.dict()
    # Auto-approve equipment created by warehouse and admin staff so it's immediately available to customers
    equipment_dict.update({
        "quantity_rented": 0,
        "quantity_maintenance": 0,
        "quantity_damaged": 0,
        "status": EquipmentStatus.AVAILABLE,
        "approval_status": "approved",  # Auto-approve warehouse and admin created equipment
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": current_user["email"],
        "approved_by": current_user["email"],
        "approved_at": datetime.utcnow()
    })

    result = await db.equipment.insert_one(equipment_dict)
    equipment_dict["id"] = str(result.inserted_id)

    # Log equipment creation
    await db.equipment_history.insert_one({
        "equipment_id": equipment_dict["id"],
        "action": "created",
        "quantity_change": equipment_data.quantity_total,
        "previous_quantity": 0,
        "new_quantity": equipment_data.quantity_total,
        "performed_by": current_user["email"],
        "approved_by": current_user["email"],
        "reason": "Initial equipment creation - auto-approved",
        "timestamp": datetime.utcnow()
    })

    return EquipmentResponse(**equipment_dict)

@router.get("/", response_model=List[EquipmentResponse])
async def get_equipment(
    category: Optional[EquipmentCategory] = None,
    status: Optional[EquipmentStatus] = None,
    approval_status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all equipment with optional filters"""
    db = get_database()

    # Build query
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    
    # For customer role, only show approved equipment
    # Warehouse and admin can see all equipment or use approval_status filter
    if current_user["role"] == "customer":
        query["approval_status"] = "approved"
    elif approval_status:
        query["approval_status"] = approval_status
    
    if search:
        query["$or"] = [
            {"item_code": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]

    equipment_cursor = db.equipment.find(query).sort("created_at", -1)
    equipment = []
    async for item in equipment_cursor:
        item["id"] = str(item["_id"])
        del item["_id"]
        # Normalize category and unit to lowercase to match enum values
        if "category" in item:
            item["category"] = item["category"].lower()
        if "unit" in item:
            item["unit"] = item["unit"].lower()
        equipment.append(item)

    return equipment

@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment_by_id(
    equipment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get equipment by ID"""
    db = get_database()
    equipment = await db.equipment.find_one({"_id": equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # For customer role, only allow access to approved equipment
    if current_user["role"] == "customer" and equipment.get("approval_status") != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This equipment is not available for rental"
        )

    equipment["id"] = str(equipment["_id"])
    del equipment["_id"]
    # Normalize category and unit to lowercase to match enum values
    if "category" in equipment:
        equipment["category"] = equipment["category"].lower()
    if "unit" in equipment:
        equipment["unit"] = equipment["unit"].lower()

    return EquipmentResponse(**equipment)

@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: str,
    equipment_data: EquipmentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update equipment (admin only for approvals, warehouse for details)"""
    db = get_database()
    equipment = await db.equipment.find_one({"_id": equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    update_dict = equipment_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()

        # Check permissions
        if "approval_status" in update_dict and current_user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can change approval status"
            )

        await db.equipment.update_one({"_id": equipment_id}, {"$set": update_dict})

        # Log the update
        await db.equipment_history.insert_one({
            "equipment_id": equipment_id,
            "action": "updated",
            "quantity_change": 0,
            "previous_quantity": equipment.get("quantity_total", 0),
            "new_quantity": equipment.get("quantity_total", 0),
            "performed_by": current_user["email"],
            "reason": f"Equipment updated: {', '.join(update_dict.keys())}",
            "timestamp": datetime.utcnow()
        })

    # Return updated equipment
    updated_equipment = await db.equipment.find_one({"_id": equipment_id})
    updated_equipment["id"] = str(updated_equipment["_id"])
    del updated_equipment["_id"]
    # Normalize category and unit to lowercase to match enum values
    if "category" in updated_equipment:
        updated_equipment["category"] = updated_equipment["category"].lower()
    if "unit" in updated_equipment:
        updated_equipment["unit"] = updated_equipment["unit"].lower()

    return EquipmentResponse(**updated_equipment)

@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete equipment (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete equipment"
        )

    db = get_database()
    equipment = await db.equipment.find_one({"_id": equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # Check if equipment is currently rented
    if equipment.get("quantity_rented", 0) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete equipment that is currently rented"
        )

    await db.equipment.delete_one({"_id": equipment_id})

    # Log deletion
    await db.equipment_history.insert_one({
        "equipment_id": equipment_id,
        "action": "deleted",
        "quantity_change": -equipment.get("quantity_total", 0),
        "previous_quantity": equipment.get("quantity_total", 0),
        "new_quantity": 0,
        "performed_by": current_user["email"],
        "reason": "Equipment deleted",
        "timestamp": datetime.utcnow()
    })

    return {"message": "Equipment deleted successfully"}

@router.post("/{equipment_id}/adjust")
async def adjust_equipment_quantity(
    equipment_id: str,
    adjustment: EquipmentAdjustment,
    current_user: dict = Depends(get_current_user)
):
    """Adjust equipment quantity (add/remove/damage/repair)"""
    if current_user["role"] not in ["warehouse", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only warehouse staff and administrators can adjust equipment quantities"
        )

    db = get_database()
    equipment = await db.equipment.find_one({"_id": equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # Calculate new quantities based on adjustment type
    updates = {}
    quantity_change = adjustment.quantity

    if adjustment.adjustment_type == "add":
        updates["quantity_total"] = equipment["quantity_total"] + quantity_change
        updates["quantity_available"] = equipment["quantity_available"] + quantity_change
    elif adjustment.adjustment_type == "remove":
        if equipment["quantity_available"] < quantity_change:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough available quantity to remove"
            )
        updates["quantity_total"] = equipment["quantity_total"] - quantity_change
        updates["quantity_available"] = equipment["quantity_available"] - quantity_change
    elif adjustment.adjustment_type == "damage":
        if equipment["quantity_available"] < quantity_change:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough available quantity to mark as damaged"
            )
        updates["quantity_available"] = equipment["quantity_available"] - quantity_change
        updates["quantity_damaged"] = equipment["quantity_damaged"] + quantity_change
    elif adjustment.adjustment_type == "repair":
        if equipment["quantity_damaged"] < quantity_change:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough damaged quantity to repair"
            )
        updates["quantity_damaged"] = equipment["quantity_damaged"] - quantity_change
        updates["quantity_available"] = equipment["quantity_available"] + quantity_change

    updates["updated_at"] = datetime.utcnow()

    await db.equipment.update_one({"_id": equipment_id}, {"$set": updates})

    # Log the adjustment
    await db.equipment_history.insert_one({
        "equipment_id": equipment_id,
        "action": adjustment.adjustment_type,
        "quantity_change": quantity_change,
        "previous_quantity": equipment["quantity_total"],
        "new_quantity": updates.get("quantity_total", equipment["quantity_total"]),
        "performed_by": current_user["email"],
        "approved_by": adjustment.approved_by,
        "reason": adjustment.reason,
        "notes": adjustment.notes,
        "timestamp": datetime.utcnow()
    })

    return {"message": f"Equipment {adjustment.adjustment_type} adjustment completed"}

@router.get("/history/{equipment_id}")
async def get_equipment_history(
    equipment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get equipment history"""
    db = get_database()

    history_cursor = db.equipment_history.find(
        {"equipment_id": equipment_id}
    ).sort("timestamp", -1)

    history = []
    async for entry in history_cursor:
        entry["id"] = str(entry["_id"])
        del entry["_id"]
        history.append(entry)

    return history

@router.post("/approve/{equipment_id}")
async def approve_equipment(
    equipment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Approve pending equipment (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can approve equipment"
        )

    db = get_database()
    equipment = await db.equipment.find_one({"_id": equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if equipment["approval_status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment is not pending approval"
        )

    await db.equipment.update_one(
        {"_id": equipment_id},
        {"$set": {
            "approval_status": "approved",
            "approved_by": current_user["email"],
            "approved_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )

    # Log approval
    await db.equipment_history.insert_one({
        "equipment_id": equipment_id,
        "action": "approved",
        "quantity_change": 0,
        "previous_quantity": equipment["quantity_total"],
        "new_quantity": equipment["quantity_total"],
        "performed_by": current_user["email"],
        "reason": "Equipment approved for use",
        "timestamp": datetime.utcnow()
    })

    return {"message": "Equipment approved successfully"}

@router.post("/warehouse/adjust-stock")
async def warehouse_adjust_stock(
    adjustment: EquipmentAdjustment,
    current_user: dict = Depends(get_current_user)
):
    """Warehouse stock adjustment (warehouse/admin only)"""
    if current_user["role"] not in ["warehouse", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only warehouse staff and administrators can adjust stock"
        )

    db = get_database()
    equipment = await db.equipment.find_one({"_id": adjustment.equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # For warehouse adjustments, require admin approval unless it's a simple stock count
    if current_user["role"] == "warehouse" and adjustment.adjustment_type not in ["add", "remove"]:
        # Create pending adjustment for admin approval
        await db.pending_adjustments.insert_one({
            "equipment_id": adjustment.equipment_id,
            "adjustment_type": adjustment.adjustment_type,
            "quantity": adjustment.quantity,
            "reason": adjustment.reason,
            "location": adjustment.location,
            "performed_by": current_user["email"],
            "status": "pending",
            "created_at": datetime.utcnow()
        })
        return {"message": "Adjustment submitted for admin approval"}

    # Direct adjustment for admin or simple warehouse operations
    return await adjust_equipment_quantity(adjustment.equipment_id, adjustment, current_user)

@router.get("/warehouse/pending-adjustments")
async def get_pending_adjustments(current_user: dict = Depends(get_current_user)):
    """Get pending warehouse adjustments (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view pending adjustments"
        )

    db = get_database()
    adjustments = await db.pending_adjustments.find({"status": "pending"}).to_list(length=None)

    # Enrich with equipment details
    for adj in adjustments:
        equipment = await db.equipment.find_one({"_id": adj["equipment_id"]})
        if equipment:
            adj["equipment"] = {
                "item_code": equipment["item_code"],
                "description": equipment["description"]
            }

    return adjustments

@router.post("/warehouse/approve-adjustment/{adjustment_id}")
async def approve_warehouse_adjustment(
    adjustment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Approve warehouse adjustment (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can approve adjustments"
        )

    db = get_database()
    adjustment = await db.pending_adjustments.find_one({"_id": adjustment_id})

    if not adjustment:
        raise HTTPException(status_code=404, detail="Adjustment not found")

    # Apply the adjustment
    adj_data = EquipmentAdjustment(**adjustment)
    result = await adjust_equipment_quantity(adjustment["equipment_id"], adj_data, current_user)

    # Mark as approved
    await db.pending_adjustments.update_one(
        {"_id": adjustment_id},
        {"$set": {
            "status": "approved",
            "approved_by": current_user["email"],
            "approved_at": datetime.utcnow()
        }}
    )

    return result

@router.post("/warehouse/dispatch/{equipment_id}")
async def dispatch_equipment(
    equipment_id: str,
    dispatch_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Dispatch equipment for rental (warehouse/admin only)"""
    if current_user["role"] not in ["warehouse", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only warehouse staff and administrators can dispatch equipment"
        )

    quantity = dispatch_data.get("quantity", 0)
    contract_id = dispatch_data.get("contract_id", "")
    customer_id = dispatch_data.get("customer_id", "")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    db = get_database()
    equipment = await db.equipment.find_one({"_id": equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if equipment["quantity_available"] < quantity:
        raise HTTPException(status_code=400, detail="Insufficient available quantity")

    # Update equipment quantities
    await db.equipment.update_one(
        {"_id": equipment_id},
        {
            "$inc": {"quantity_available": -quantity, "quantity_rented": quantity},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    # Create dispatch record
    dispatch_record = {
        "equipment_id": equipment_id,
        "contract_id": contract_id,
        "customer_id": customer_id,
        "quantity": quantity,
        "dispatched_by": current_user["email"],
        "dispatch_date": datetime.utcnow(),
        "status": "active"
    }
    await db.equipment_dispatch.insert_one(dispatch_record)

    # Log the dispatch
    await db.equipment_history.insert_one({
        "equipment_id": equipment_id,
        "action": "dispatched",
        "quantity_change": -quantity,
        "previous_quantity": equipment["quantity_available"],
        "new_quantity": equipment["quantity_available"] - quantity,
        "performed_by": current_user["email"],
        "reason": f"Dispatched for contract {contract_id}",
        "timestamp": datetime.utcnow()
    })

    return {"message": f"Equipment dispatched successfully. {quantity} units sent."}

@router.post("/warehouse/return/{equipment_id}")
async def return_equipment(
    equipment_id: str,
    return_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Process equipment return (warehouse/admin only)"""
    if current_user["role"] not in ["warehouse", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only warehouse staff and administrators can process returns"
        )

    quantity = return_data.get("quantity", 0)
    contract_id = return_data.get("contract_id", "")
    condition = return_data.get("condition", "good")  # good, damaged, lost
    notes = return_data.get("notes", "")

    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    db = get_database()
    equipment = await db.equipment.find_one({"_id": equipment_id})

    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # Find active dispatch record
    dispatch_record = await db.equipment_dispatch.find_one({
        "equipment_id": equipment_id,
        "contract_id": contract_id,
        "status": "active"
    })

    if not dispatch_record:
        raise HTTPException(status_code=404, detail="No active dispatch found for this equipment and contract")

    if dispatch_record["quantity"] < quantity:
        raise HTTPException(status_code=400, detail="Return quantity exceeds dispatched quantity")

    # Update equipment quantities based on condition
    updates = {"updated_at": datetime.utcnow()}

    if condition == "good":
        updates["quantity_available"] = equipment["quantity_available"] + quantity
        updates["quantity_rented"] = equipment["quantity_rented"] - quantity
    elif condition == "damaged":
        updates["quantity_damaged"] = equipment["quantity_damaged"] + quantity
        updates["quantity_rented"] = equipment["quantity_rented"] - quantity
    elif condition == "lost":
        # Lost equipment is permanently removed
        updates["quantity_total"] = equipment["quantity_total"] - quantity
        updates["quantity_rented"] = equipment["quantity_rented"] - quantity

    await db.equipment.update_one({"_id": equipment_id}, {"$set": updates})

    # Update dispatch record
    remaining_quantity = dispatch_record["quantity"] - quantity
    if remaining_quantity <= 0:
        await db.equipment_dispatch.update_one(
            {"_id": dispatch_record["_id"]},
            {"$set": {"status": "completed", "return_date": datetime.utcnow()}}
        )
    else:
        await db.equipment_dispatch.update_one(
            {"_id": dispatch_record["_id"]},
            {"$set": {"quantity": remaining_quantity}}
        )

    # Create return record
    return_record = {
        "equipment_id": equipment_id,
        "contract_id": contract_id,
        "quantity": quantity,
        "condition": condition,
        "notes": notes,
        "processed_by": current_user["email"],
        "return_date": datetime.utcnow()
    }
    await db.equipment_returns.insert_one(return_record)

    # Log the return
    await db.equipment_history.insert_one({
        "equipment_id": equipment_id,
        "action": f"returned_{condition}",
        "quantity_change": quantity if condition == "good" else -quantity,
        "previous_quantity": equipment["quantity_available"],
        "new_quantity": updates.get("quantity_available", equipment["quantity_available"]),
        "performed_by": current_user["email"],
        "reason": f"Returned from contract {contract_id} - {condition}",
        "notes": notes,
        "timestamp": datetime.utcnow()
    })

    return {"message": f"Equipment return processed successfully. {quantity} units returned in {condition} condition."}