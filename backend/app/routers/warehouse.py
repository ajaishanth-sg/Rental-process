from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..utils.auth import get_current_user
from ..utils.database import get_database

router = APIRouter()

@router.get("/dashboard")
async def get_warehouse_dashboard(current_user: dict = Depends(get_current_user)):
    """Get warehouse dashboard data"""
    try:
        db = get_database()

        # Get pending dispatches
        pending_dispatch = db.equipment_dispatch.count_documents({"status": "active"})

        # Get expected returns (rentals ending in next 7 days)
        next_week = datetime.utcnow() + timedelta(days=7)
        expected_returns = db.rentals.count_documents({
            "status": {"$in": ["active", "extended"]},
            "end_date": {"$lte": next_week.isoformat()}
        })

        # Get low stock items (available < 10)
        low_stock_items = db.equipment.count_documents({"quantity_available": {"$lt": 10}})

        # Get equipment utilization
        total_equipment = db.equipment.count_documents({})
        available_equipment = db.equipment.count_documents({"quantity_available": {"$gt": 0}})
        rented_equipment = db.equipment.count_documents({"quantity_rented": {"$gt": 0}})

        equipment_utilization = [
            {"status": "Available", "count": available_equipment, "color": "bg-green-500"},
            {"status": "Rented", "count": rented_equipment, "color": "bg-blue-500"},
            {"status": "Maintenance", "count": 0, "color": "bg-yellow-500"},  # TODO: Add maintenance tracking
            {"status": "Damaged", "count": 0, "color": "bg-red-500"}  # TODO: Add damaged tracking
        ]

        return {
            "pendingDispatch": pending_dispatch,
            "expectedReturns": expected_returns,
            "lowStockItems": low_stock_items,
            "totalEquipment": total_equipment,
            "equipmentUtilization": equipment_utilization
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching warehouse dashboard: {str(e)}")

@router.get("/sales-orders")
async def get_warehouse_sales_orders(current_user: dict = Depends(get_current_user)):
    """Get sales orders pending warehouse processing"""
    try:
        db = get_database()

        # Get sales orders with status 'processing'
        orders_cursor = db.sales_orders.find({"status": "processing"})
        orders_raw = await orders_cursor.to_list(length=None)
        
        orders = []
        for order in orders_raw:
            order_copy = order.copy()
            order_copy["id"] = str(order_copy.pop("_id"))
            orders.append(order_copy)

        return orders

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales orders: {str(e)}")

@router.put("/sales-orders/{order_id}/dispatch")
async def dispatch_sales_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Mark sales order as dispatched and move to dispatch tab"""
    try:
        db = get_database()

        # Find the sales order first
        sales_order = await db.sales_orders.find_one({"sales_order_id": order_id})
        if not sales_order:
            raise HTTPException(status_code=404, detail="Sales order not found")

        # Update sales order status to 'dispatched'
        result = await db.sales_orders.update_one(
            {"sales_order_id": order_id},
            {"$set": {
                "status": "dispatched",
                "dispatched_at": datetime.now().isoformat(),
                "dispatched_by": current_user["id"],
                "updated_at": datetime.now().isoformat()
            }}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Sales order not found")

        # Create dispatch record for the dispatch tab
        dispatch_record = {
            "sales_order_id": order_id,
            "quotation_id": sales_order.get("quotation_id", ""),
            "customer_name": sales_order.get("customer_name", ""),
            "company": sales_order.get("company", ""),
            "project": sales_order.get("project", ""),
            "total_amount": sales_order.get("total_amount", 0),
            "items": sales_order.get("items", []),
            "status": "pending",  # pending dispatch, can be: pending, in_transit, delivered
            "created_at": datetime.now().isoformat(),
            "created_by": current_user["id"],
            "dispatch_date": None,  # Set when actually dispatched
            "delivered_date": None  # Set when delivered
        }
        
        await db.dispatches.insert_one(dispatch_record)

        return {"message": "Sales order dispatched successfully and added to dispatch queue"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error dispatching order: {str(e)}")

@router.get("/dispatch")
async def get_warehouse_dispatch(current_user: dict = Depends(get_current_user)):
    """Get dispatches from sales orders for delivery management"""
    try:
        db = get_database()

        # Get dispatch records created from sales orders
        dispatches_cursor = db.dispatches.find({})
        dispatches_raw = await dispatches_cursor.to_list(length=None)
        
        dispatches = []
        for dispatch in dispatches_raw:
            dispatch_copy = dispatch.copy()
            dispatch_copy["id"] = str(dispatch_copy.pop("_id"))
            dispatches.append(dispatch_copy)

        return dispatches

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dispatches: {str(e)}")

@router.get("/returns")
async def get_warehouse_returns(current_user: dict = Depends(get_current_user)):
    """Get expected returns for warehouse"""
    try:
        db = get_database()

        # Get active rentals ending soon
        next_week = datetime.utcnow() + timedelta(days=7)
        rentals_cursor = db.rentals.find({
            "status": {"$in": ["active", "extended"]},
            "end_date": {"$lte": next_week.isoformat()}
        })
        rentals = await rentals_cursor.to_list(length=None)

        returns = []
        for rental in rentals:
            returns.append({
                "id": str(rental["_id"]),
                "contract_id": rental["contract_number"],
                "customer_id": rental["customer_id"],
                "quantity": rental["quantity"],
                "return_date": rental["end_date"],
                "condition": "pending"
            })

        return returns

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching returns: {str(e)}")

@router.get("/stock")
async def get_warehouse_stock(current_user: dict = Depends(get_current_user)):
    """Get equipment stock for warehouse"""
    try:
        db = get_database()

        equipment_cursor = db.equipment.find().sort("item_code", 1)
        stock = []
        async for item in equipment_cursor:
            utilization = 0
            if item["quantity_total"] > 0:
                utilization = round((item["quantity_rented"] / item["quantity_total"]) * 100)

            stock_item = {
                "id": str(item["_id"]),
                "item_code": item["item_code"],
                "description": item["description"],
                "quantity_available": item["quantity_available"],
                "quantity_reserved": 0,  # TODO: Add reserved quantity tracking
                "quantity_maintenance": item.get("quantity_maintenance", 0),
                "quantity_rented": item["quantity_rented"],
                "quantity_total": item["quantity_total"],
                "category": item["category"],
                "unit": item["unit"],
                "utilization": utilization,
                "status": "good" if item["quantity_available"] >= 10 else ("low" if item["quantity_available"] > 0 else "critical")
            }
            stock.append(stock_item)

        return stock

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock: {str(e)}")

@router.get("/reports")
async def get_warehouse_reports(current_user: dict = Depends(get_current_user)):
    """Get warehouse reports"""
    try:
        db = get_database()

        # Calculate stock utilization
        total_equipment = db.equipment.count_documents({})
        rented_equipment = db.equipment.count_documents({"quantity_rented": {"$gt": 0}})
        stock_utilization = round((rented_equipment / total_equipment) * 100) if total_equipment > 0 else 0

        # Get damaged items
        damaged_items = db.equipment.count_documents({"quantity_damaged": {"$gt": 0}})

        # Get missing items (simplified - would need proper tracking)
        missing_items = 0  # TODO: Add missing items tracking

        # Get damaged/missing items details
        damaged_missing_items = []
        damaged_cursor = db.equipment.find({"$or": [
            {"quantity_damaged": {"$gt": 0}},
            {"quantity_total": {"$lt": 1}}  # Simplified missing check
        ]})
        damaged_list = await damaged_cursor.to_list(length=None)
        for item in damaged_list:
            damaged_missing_items.append({
                "id": str(item["_id"]),
                "item_code": item["item_code"],
                "description": item["description"],
                "quantity_damaged": item.get("quantity_damaged", 0),
                "quantity_missing": max(0, item["quantity_total"] - item["quantity_available"] - item.get("quantity_damaged", 0)),
                "status": "damaged" if item.get("quantity_damaged", 0) > 0 else "missing"
            })

        return {
            "stockUtilization": stock_utilization,
            "damagedItems": damaged_items,
            "missingItems": missing_items,
            "damagedMissingItems": damaged_missing_items
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")