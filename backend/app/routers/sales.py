from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from ..utils.auth import get_current_user
from ..utils.database import get_database
from ..models.enquiry import EnquiryResponse, EnquiryStatus

router = APIRouter()

class QuotationCreate(BaseModel):
    id: str
    quotation_id: Optional[str] = None  # For compatibility
    customerName: str
    company: str
    project: str
    items: List[Dict[str, Any]]
    totalAmount: float
    status: str
    createdDate: str
    validUntil: str
    notes: str

@router.get("/dashboard")
async def get_sales_dashboard(current_user: dict = Depends(get_current_user)):
    """Get sales dashboard data"""
    try:
        db = get_database()

        # Get all rentals (since assigned_salesperson_id is not set in rental creation)
        rentals_cursor = db.rentals.find({})
        rentals_raw = await rentals_cursor.to_list(length=None)
        rentals = []
        for rental in rentals_raw:
            rental_copy = rental.copy()
            rental_copy["id"] = str(rental_copy.pop("_id"))
            rentals.append({
                "id": rental_copy["contract_number"],
                "customer": rental_copy["customer_name"],
                "project": rental_copy.get("project_name", "N/A"),
                "date": rental_copy["created_at"][:10] if rental_copy.get("created_at") else "",
                "status": rental_copy.get("status", "unknown"),
                "amount": rental_copy.get("total_amount", 0)  # Add amount field
            })

        # Get active rentals (approved)
        active_count = await db.rentals.count_documents({"status": {"$in": ["active", "approved"]}})

        # Calculate monthly revenue (sum of total_amount for active rentals)
        pipeline = [
            {"$match": {"status": {"$in": ["active", "approved"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]
        revenue_cursor = db.rentals.aggregate(pipeline)
        revenue_result = await revenue_cursor.to_list(length=1)
        monthly_revenue = revenue_result[0]["total"] if revenue_result else 0

        # Get quotations count
        quotations_count = await db.quotations.count_documents({"status": "sent"})

        # Get recent quotations
        quotations_cursor = db.quotations.find({}).sort("created_at", -1).limit(5)
        quotations_raw = await quotations_cursor.to_list(length=5)
        recent_quotations = []
        for quot in quotations_raw:
            recent_quotations.append({
                "id": quot.get("quotation_id", str(quot["_id"])),
                "customer": quot.get("customerName", ""),
                "project": quot.get("project", ""),
                "amount": quot.get("totalAmount", 0),
                "status": quot.get("status", "")
            })

        total_customers = await db.users.count_documents({"role": "customer"})

        return {
            "totalEnquiries": len(rentals),
            "activeQuotations": quotations_count,
            "convertedContracts": active_count,
            "monthlyRevenue": monthly_revenue,
            "activeContracts": active_count,
            "pendingApprovals": quotations_count,
            "totalCustomers": total_customers,
            "newContractsThisWeek": 0,
            "revenueGrowth": 0,
            "newCustomersThisMonth": 0,
            "recentEnquiries": rentals[-5:] if rentals else [],  # Last 5 rentals
            "recentQuotations": recent_quotations,
            "recentContracts": rentals[-5:] if rentals else [],
            "topCustomers": [],
            "pendingQuotations": []
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales dashboard: {str(e)}")

@router.get("/enquiries")
async def get_sales_enquiries(current_user: dict = Depends(get_current_user)):
    """Get sales enquiries"""
    try:
        db = get_database()
        
        print(f"\n=== SALES ENQUIRIES REQUEST ===")
        print(f"User: {current_user.get('email')} (Role: {current_user.get('role')})")

        # Query enquiries collection and include those unassigned or assigned to the current salesperson
        enquiries_cursor = db.enquiries.find({})
        enquiries_raw = await enquiries_cursor.to_list(length=None)
        enquiries = []
        for enquiry in enquiries_raw:
            assigned_id = enquiry.get("assigned_salesperson_id")
            if assigned_id is None or str(assigned_id) == current_user["id"]:
                enquiry_copy = enquiry.copy()
                enquiry_copy["id"] = str(enquiry_copy.pop("_id"))
                enquiries.append(enquiry_copy)
        
        print(f"Found {len(enquiries)} regular enquiries")

        # Also include all rentals (since assigned_salesperson_id is not set in rental creation)
        rentals_cursor = db.rentals.find({})
        rentals_raw = await rentals_cursor.to_list(length=None)
        
        print(f"Found {len(rentals_raw)} rental orders in database")

        for rental in rentals_raw:
            rental_copy = rental.copy()
            rental_copy["id"] = str(rental_copy.pop("_id"))
            # Convert rental to enquiry format
            enquiry_format = {
                "id": rental_copy["id"],
                "enquiry_id": rental_copy.get("contract_number", f"RENTAL-{rental_copy['id'][:8]}"),
                "customer_id": rental_copy.get("customer_id", ""),
                "customer_name": rental_copy.get("customer_name", "Unknown Customer"),
                "customer_email": rental_copy.get("contact_email", ""),
                "equipment_name": f"{rental_copy.get('equipment_category', '')} - {rental_copy.get('equipment_type', '')}".strip(' - '),
                "quantity": rental_copy.get("quantity", 1),
                "rental_duration_days": 30,  # Default duration
                "delivery_location": rental_copy.get("delivery_address", ""),
                "expected_delivery_date": rental_copy.get("start_date", ""),
                "special_instructions": rental_copy.get("special_requirements", ""),
                "assigned_salesperson_id": rental_copy.get("assigned_salesperson_id", None),
                "assigned_salesperson_name": rental_copy.get("assigned_salesperson_name", None),
                "status": rental_copy.get("status", "submitted_by_customer"),  # Use actual status
                "enquiry_date": rental_copy.get("created_at", ""),
                "created_at": rental_copy.get("created_at", ""),
                "updated_at": rental_copy.get("updated_at", rental_copy.get("created_at", "")),
                "is_rental_order": True  # Flag to identify rental-based enquiries
            }
            enquiries.append(enquiry_format)

        print(f"Total enquiries to return: {len(enquiries)}")
        print(f"=== END SALES ENQUIRIES REQUEST ===\n")
        
        return enquiries

    except Exception as e:
        print(f"ERROR in get_sales_enquiries: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching enquiries: {str(e)}")

@router.put("/enquiries/{enquiry_id}/status")
async def update_enquiry_status(enquiry_id: str, status_data: dict, current_user: dict = Depends(get_current_user)):
    """Update enquiry status"""
    try:
        db = get_database()

        # Check if this is a rental order (starts with RC-)
        if enquiry_id.startswith("RC-"):
            # Update rental status instead
            update_data = {
                "status": status_data.get("status"),
                "updated_at": datetime.now()
            }

            if status_data.get("assigned_salesperson_id"):
                update_data["assigned_salesperson_id"] = status_data["assigned_salesperson_id"]
                update_data["assigned_salesperson_name"] = status_data.get("assigned_salesperson_name")

            result = await db.rentals.update_one(
                {"contract_number": enquiry_id},
                {"$set": update_data}
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Rental order not found")

            return {"message": "Rental order status updated successfully"}
        else:
            # Update regular enquiry status
            update_data = {
                "status": status_data.get("status"),
                "updated_at": datetime.now()
            }

            if status_data.get("assigned_salesperson_id"):
                update_data["assigned_salesperson_id"] = status_data["assigned_salesperson_id"]
                update_data["assigned_salesperson_name"] = status_data.get("assigned_salesperson_name")

            result = await db.enquiries.update_one(
                {"enquiry_id": enquiry_id},
                {"$set": update_data}
            )

            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Enquiry not found")

            return {"message": "Enquiry status updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating enquiry status: {str(e)}")

@router.get("/quotations")
async def get_sales_quotations(current_user: dict = Depends(get_current_user)):
    """Get sales quotations"""
    try:
        db = get_database()

        # Query from quotations collection
        quotations_cursor = db.quotations.find({})
        quotations_raw = await quotations_cursor.to_list(length=None)
        quotations = []
        for quotation in quotations_raw:
            quotation_copy = quotation.copy()
            quotation_copy["id"] = str(quotation_copy.pop("_id"))
            quotations.append(quotation_copy)

        return quotations

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quotations: {str(e)}")

@router.post("/quotations")
async def create_quotation(quotation_data: QuotationCreate, current_user: dict = Depends(get_current_user)):
    """Create a new quotation"""
    try:
        db = get_database()

        # Convert to dict for database insertion
        quotation_dict = quotation_data.dict()
        
        # Ensure quotation_id is set (use id if quotation_id not provided)
        if not quotation_dict.get("quotation_id"):
            quotation_dict["quotation_id"] = quotation_dict["id"]

        # Add metadata
        now = datetime.now()
        quotation_dict["created_at"] = now.isoformat()
        quotation_dict["updated_at"] = now.isoformat()
        quotation_dict["created_by"] = current_user["id"]
        
        print(f"Creating quotation with ID: {quotation_dict['quotation_id']}, Status: {quotation_dict['status']}")

        # Insert into database
        result = await db.quotations.insert_one(quotation_dict)

        return {
            "id": str(result.inserted_id),
            "quotation_id": quotation_dict["quotation_id"],
            "message": "Quotation created successfully"
        }

    except Exception as e:
        print(f"Error creating quotation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating quotation: {str(e)}")

@router.put("/quotations/{quotation_id}/send")
async def send_quotation(quotation_id: str, current_user: dict = Depends(get_current_user)):
    """Send a quotation for admin approval"""
    try:
        db = get_database()

        # Update quotation status to 'sent'
        update_data = {
            "status": "sent",
            "sent_at": datetime.now().isoformat(),
            "sent_by": current_user["id"],
            "updated_at": datetime.now().isoformat()
        }
        
        print(f"Sending quotation {quotation_id} for approval")

        # Try to find by id first, then by quotation_id
        result = await db.quotations.update_one(
            {"id": quotation_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            # Try with quotation_id field
            result = await db.quotations.update_one(
                {"quotation_id": quotation_id},
                {"$set": update_data}
            )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        print(f"Quotation {quotation_id} sent successfully, status updated to 'sent'")

        return {"message": "Quotation sent for approval successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending quotation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending quotation: {str(e)}")

@router.get("/orders")
async def get_sales_orders(current_user: dict = Depends(get_current_user)):
    """Get sales orders"""
    try:
        db = get_database()

        # Query from sales_orders collection
        orders_cursor = db.sales_orders.find({})
        orders_raw = await orders_cursor.to_list(length=None)
        orders = []
        for order in orders_raw:
            order_copy = order.copy()
            order_copy["id"] = str(order_copy.pop("_id"))
            orders.append(order_copy)

        return orders

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales orders: {str(e)}")

@router.put("/orders/{order_id}/check-stock")
async def check_order_stock(order_id: str, current_user: dict = Depends(get_current_user)):
    """Check stock availability for a sales order"""
    try:
        db = get_database()

        # Mock stock check - in production this would query inventory
        stock_available = True  # Assume stock is available for now

        # Update sales order
        result = await db.sales_orders.update_one(
            {"sales_order_id": order_id},
            {"$set": {
                "stock_checked": True,
                "stock_available": stock_available,
                "updated_at": datetime.now().isoformat()
            }}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Sales order not found")

        return {
            "message": "Stock check completed",
            "stock_available": stock_available
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking stock: {str(e)}")

@router.put("/orders/{order_id}/create-contract")
async def create_contract_request(order_id: str, current_user: dict = Depends(get_current_user)):
    """Create contract request for admin approval"""
    try:
        db = get_database()

        # Find the sales order
        sales_order = await db.sales_orders.find_one({"sales_order_id": order_id})
        if not sales_order:
            raise HTTPException(status_code=404, detail="Sales order not found")

        # Check if contract request already exists
        existing_contract = await db.contracts.find_one({"sales_order_id": order_id})
        if existing_contract:
            raise HTTPException(status_code=400, detail="Contract request already exists for this sales order")

        # Create contract request
        contract_count = await db.contracts.count_documents({})
        contract_id = f"CNT-2025-{str(contract_count + 1).zfill(3)}"
        
        contract_request = {
            "contract_id": contract_id,
            "sales_order_id": order_id,
            "quotation_id": sales_order.get("quotation_id", ""),
            "customer_name": sales_order.get("customer_name", ""),
            "customer": sales_order.get("customer_name", ""),  # Add customer field for consistency
            "company": sales_order.get("company", ""),
            "project": sales_order.get("project", ""),
            "equipment": ", ".join([item.get("equipment_name", "") for item in sales_order.get("items", [])]) if sales_order.get("items") else "Various Equipment",
            "total_amount": sales_order.get("total_amount", 0),
            "amount": sales_order.get("total_amount", 0),  # Add amount field for consistency
            "items": sales_order.get("items", []),
            "status": "pending_approval",  # pending_approval, active, rejected
            "approval_status": "pending",  # pending, approved, rejected
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=365)).isoformat(),  # Default 1 year contract
            "created_at": datetime.now().isoformat(),
            "created_by": current_user["id"],
            "updated_at": datetime.now().isoformat(),
            "stock_checked": sales_order.get("stock_checked", False),
            "stock_available": sales_order.get("stock_available", False)
        }
        
        await db.contracts.insert_one(contract_request)

        # Update sales order status to pending_contract_approval
        await db.sales_orders.update_one(
            {"sales_order_id": order_id},
            {"$set": {
                "status": "pending_contract_approval",
                "contract_requested_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }}
        )

        return {
            "message": "Contract request created successfully",
            "contract_id": contract_id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating contract request: {str(e)}")

@router.get("/contracts")
async def get_sales_contracts(current_user: dict = Depends(get_current_user)):
    """Get sales contracts"""
    try:
        db = get_database()

        # Query from contracts collection
        contracts_cursor = db.contracts.find({})
        contracts_raw = await contracts_cursor.to_list(length=None)
        contracts = []
        for contract in contracts_raw:
            contract_copy = contract.copy()
            contract_copy["id"] = str(contract_copy.pop("_id"))
            contracts.append(contract_copy)

        return contracts

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contracts: {str(e)}")

@router.get("/customers")
async def get_sales_customers(current_user: dict = Depends(get_current_user)):
    """Get sales customers"""
    try:
        db = get_database()

        # TODO: Query from customers collection
        return []

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customers: {str(e)}")

@router.get("/reports")
async def get_sales_reports(current_user: dict = Depends(get_current_user)):
    """Get sales reports"""
    try:
        db = get_database()

        # TODO: Implement proper sales reporting
        return {
            "conversionRate": 0,
            "averageDealSize": 0,
            "monthlyTargets": {
                "target": 0,
                "achieved": 0,
                "percentage": 0
            },
            "topCustomers": []
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")