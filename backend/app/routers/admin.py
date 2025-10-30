from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timedelta
from ..utils.auth import get_current_user
from ..utils.database import get_database
from pydantic import BaseModel

router = APIRouter()

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str
    cr_number: str
    vat_number: str
    credit_limit: int
    deposit_amount: int

class CustomerUpdate(BaseModel):
    name: str = None
    email: str = None
    phone: str = None
    cr_number: str = None
    vat_number: str = None
    credit_limit: int = None
    deposit_amount: int = None

@router.get("/quotations/pending")
async def get_pending_quotations(current_user: dict = Depends(get_current_user)):
    """Get quotations pending admin approval"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access this endpoint")
        
        db = get_database()
        
        # Fetch quotations with status 'sent'
        quotations_cursor = db.quotations.find({"status": "sent"})
        quotations_raw = await quotations_cursor.to_list(length=None)
        
        quotations = []
        for quotation in quotations_raw:
            quotation_copy = quotation.copy()
            quotation_copy["id"] = str(quotation_copy.pop("_id"))
            quotations.append(quotation_copy)
        
        return quotations

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quotations: {str(e)}")

@router.get("/enquiries")
async def get_all_enquiries(current_user: dict = Depends(get_current_user)):
    """Get all customer enquiries for admin view"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access this endpoint")
        
        db = get_database()
        
        # Get all rentals (enquiries) from database
        rentals_cursor = db.rentals.find({})
        rentals_raw = await rentals_cursor.to_list(length=None)
        
        enquiries = []
        for rental in rentals_raw:
            rental_copy = rental.copy()
            rental_copy["id"] = str(rental_copy.pop("_id"))
            
            # Convert rental to enquiry format
            enquiry_format = {
                "id": rental_copy["id"],
                "enquiry_id": rental_copy.get("contract_number", f"ENQ-{rental_copy['id'][:8]}"),
                "customer_id": rental_copy.get("customer_id", ""),
                "customer_name": rental_copy.get("customer_name", "Unknown Customer"),
                "customer_email": rental_copy.get("contact_email", rental_copy.get("customer_email", "")),
                "equipment_name": f"{rental_copy.get('equipment_category', '')} - {rental_copy.get('equipment_type', '')}".strip(' - '),
                "quantity": rental_copy.get("quantity", 1),
                "rental_duration_days": rental_copy.get("rental_duration_days", 0),
                "delivery_location": rental_copy.get("delivery_address", ""),
                "expected_delivery_date": rental_copy.get("start_date", ""),
                "special_instructions": rental_copy.get("special_requirements", ""),
                "assigned_salesperson_id": rental_copy.get("assigned_salesperson_id", None),
                "assigned_salesperson_name": rental_copy.get("assigned_salesperson_name", None),
                "status": rental_copy.get("status", "submitted_by_customer"),
                "enquiry_date": rental_copy.get("created_at", ""),
                "created_at": rental_copy.get("created_at", ""),
                "updated_at": rental_copy.get("updated_at", rental_copy.get("created_at", "")),
                "is_rental_order": True,
                "contract_number": rental_copy.get("contract_number", ""),
                "project_name": rental_copy.get("project_name", ""),
                "equipment_type": rental_copy.get("equipment_type", ""),
                "start_date": rental_copy.get("start_date", ""),
                "end_date": rental_copy.get("end_date", ""),
            }
            enquiries.append(enquiry_format)
        
        # Also get dedicated enquiries if they exist
        enquiries_cursor = db.enquiries.find({})
        enquiries_raw = await enquiries_cursor.to_list(length=None)
        
        for enquiry in enquiries_raw:
            enquiry_copy = enquiry.copy()
            enquiry_copy["id"] = str(enquiry_copy.pop("_id"))
            enquiries.append(enquiry_copy)
        
        return enquiries

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching enquiries: {str(e)}")

@router.put("/quotations/{quotation_id}/approve")
async def approve_quotation(quotation_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a quotation and convert it to a sales order"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can approve quotations")
        
        db = get_database()
        
        # Find quotation
        quotation = await db.quotations.find_one({"quotation_id": quotation_id})
        if not quotation:
            quotation = await db.quotations.find_one({"id": quotation_id})
        
        if not quotation:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        # Update quotation status to 'approved'
        await db.quotations.update_one(
            {"_id": quotation["_id"]},
            {"$set": {
                "status": "approved",
                "approved_at": datetime.now().isoformat(),
                "approved_by": current_user["id"],
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        # Create sales order from quotation
        sales_order_count = await db.sales_orders.count_documents({})
        sales_order_id = f"SO-2025-{str(sales_order_count + 1).zfill(3)}"
        
        sales_order = {
            "sales_order_id": sales_order_id,
            "quotation_id": quotation.get("quotation_id", quotation_id),
            "customer_name": quotation.get("customerName", ""),
            "company": quotation.get("company", ""),
            "project": quotation.get("project", ""),
            "total_amount": quotation.get("totalAmount", 0),
            "items": quotation.get("items", []),
            "status": "approved",
            "stock_checked": False,
            "stock_available": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "created_by": current_user["id"],
            "enquiry_id": quotation.get("enquiry_id"),
            "rental_id": quotation.get("rental_id")
        }
        
        await db.sales_orders.insert_one(sales_order)
        
        return {"message": "Quotation approved and sales order created", "sales_order_id": sales_order_id}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving quotation: {str(e)}")

@router.put("/quotations/{quotation_id}/reject")
async def reject_quotation(quotation_id: str, current_user: dict = Depends(get_current_user)):
    """Reject a quotation"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can reject quotations")
        
        db = get_database()
        
        # Update quotation status to 'rejected'
        result = await db.quotations.update_one(
            {"quotation_id": quotation_id},
            {"$set": {
                "status": "rejected",
                "rejected_at": datetime.now().isoformat(),
                "rejected_by": current_user["id"],
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        if result.modified_count == 0:
            # Try with id field
            result = await db.quotations.update_one(
                {"id": quotation_id},
                {"$set": {
                    "status": "rejected",
                    "rejected_at": datetime.now().isoformat(),
                    "rejected_by": current_user["id"],
                    "updated_at": datetime.now().isoformat()
                }}
            )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Quotation not found")
        
        return {"message": "Quotation rejected"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting quotation: {str(e)}")

@router.get("/sales-orders/pending")
async def get_pending_sales_orders(current_user: dict = Depends(get_current_user)):
    """Get sales orders pending processing"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access this endpoint")
        
        db = get_database()
        
        # Fetch sales orders with status 'approved' or 'pending_approval'
        orders_cursor = db.sales_orders.find({"status": {"$in": ["approved", "pending_approval"]}})
        orders_raw = await orders_cursor.to_list(length=None)
        
        orders = []
        for order in orders_raw:
            order_copy = order.copy()
            order_copy["id"] = str(order_copy.pop("_id"))
            orders.append(order_copy)
        
        return orders
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales orders: {str(e)}")

@router.get("/contracts/pending")
async def get_pending_contracts(current_user: dict = Depends(get_current_user)):
    """Get contract requests pending admin approval"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access this endpoint")
        
        db = get_database()
        
        # Fetch contracts with status 'pending_approval'
        contracts_cursor = db.contracts.find({"status": "pending_approval"})
        contracts_raw = await contracts_cursor.to_list(length=None)
        
        contracts = []
        for contract in contracts_raw:
            contract_copy = contract.copy()
            contract_copy["id"] = str(contract_copy.pop("_id"))
            contracts.append(contract_copy)
        
        return contracts
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contracts: {str(e)}")

@router.put("/contracts/{contract_id}/approve")
async def approve_contract(contract_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a contract request and send to warehouse"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can approve contracts")
        
        db = get_database()
        
        # Find contract
        contract = await db.contracts.find_one({"contract_id": contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Update contract status to 'approved' and 'active'
        await db.contracts.update_one(
            {"contract_id": contract_id},
            {"$set": {
                "status": "active",
                "approval_status": "approved",
                "approved_at": datetime.now().isoformat(),
                "approved_by": current_user["id"],
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        # Update sales order status to 'processing' and send to warehouse
        await db.sales_orders.update_one(
            {"sales_order_id": contract["sales_order_id"]},
            {"$set": {
                "status": "processing",
                "contract_approved_at": datetime.now().isoformat(),
                "sent_to_warehouse_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        # Create invoice for finance
        invoice_count = await db.invoices.count_documents({})
        invoice_id = f"INV-2025-{str(invoice_count + 1).zfill(3)}"
        
        # Calculate VAT (5% for AED)
        amount = contract.get("total_amount", 0)
        vat = amount * 0.05
        total = amount + vat
        
        invoice = {
            "invoice_id": invoice_id,
            "contract_id": contract_id,
            "sales_order_id": contract.get("sales_order_id"),
            "customer_name": contract.get("customer_name", ""),
            "company": contract.get("company", ""),
            "project": contract.get("project", ""),
            "amount": amount,
            "vat": vat,
            "vat_rate": 5,
            "total": total,
            "currency": "AED",
            "status": "pending",
            "due_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "created_at": datetime.now().isoformat(),
            "created_by": current_user["id"],
            "updated_at": datetime.now().isoformat()
        }

        await db.invoices.insert_one(invoice)

        return {
            "message": "Contract approved, sent to warehouse, and invoice created",
            "invoice_id": invoice_id,
            "contract_id": contract_id,
            "sales_order_id": contract.get("sales_order_id"),
            "customer_name": contract.get("customer_name", ""),
            "total_amount": total,
            "status": "success"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving contract: {str(e)}")

@router.put("/contracts/{contract_id}/reject")
async def reject_contract(contract_id: str, current_user: dict = Depends(get_current_user)):
    """Reject a contract request"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can reject contracts")
        
        db = get_database()
        
        # Find contract
        contract = await db.contracts.find_one({"contract_id": contract_id})
        if not contract:
            raise HTTPException(status_code=404, detail="Contract not found")
        
        # Update contract status to 'rejected'
        await db.contracts.update_one(
            {"contract_id": contract_id},
            {"$set": {
                "status": "rejected",
                "rejected_at": datetime.now().isoformat(),
                "rejected_by": current_user["id"],
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        # Update sales order status back to 'approved'
        await db.sales_orders.update_one(
            {"sales_order_id": contract["sales_order_id"]},
            {"$set": {
                "status": "approved",
                "contract_rejected_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }}
        )
        
        return {"message": "Contract rejected"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting contract: {str(e)}")

@router.get("/customers")
async def get_all_customers(current_user: dict = Depends(get_current_user)):
    """Get all customers for admin management"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access this endpoint")

        db = get_database()

        # Fetch all customers
        customers_cursor = db.customers.find({})
        customers_raw = await customers_cursor.to_list(length=None)

        customers = []
        for customer in customers_raw:
            customer_copy = customer.copy()
            customer_copy["id"] = str(customer_copy.pop("_id"))
            customers.append(customer_copy)

        return customers

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customers: {str(e)}")

@router.post("/customers")
async def create_customer(customer_data: CustomerCreate, current_user: dict = Depends(get_current_user)):
    """Create a new customer"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can create customers")

        db = get_database()

        # Check if customer with same email already exists
        existing = await db.customers.find_one({"email": customer_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Customer with this email already exists")

        # Create customer document
        customer_count = await db.customers.count_documents({})
        customer_id = f"CUST-{str(customer_count + 1).zfill(4)}"

        customer = {
            "customer_id": customer_id,
            "name": customer_data.name,
            "email": customer_data.email,
            "phone": customer_data.phone,
            "cr_number": customer_data.cr_number,
            "vat_number": customer_data.vat_number,
            "credit_limit": customer_data.credit_limit,
            "deposit_amount": customer_data.deposit_amount,
            "approval_status": "pending",
            "created_at": datetime.now().isoformat(),
            "created_by": current_user["id"],
            "updated_at": datetime.now().isoformat()
        }

        result = await db.customers.insert_one(customer)

        return {
            "message": "Customer created successfully",
            "customer_id": customer_id,
            "id": str(result.inserted_id)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating customer: {str(e)}")

@router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, customer_data: CustomerUpdate, current_user: dict = Depends(get_current_user)):
    """Update customer information"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can update customers")

        db = get_database()

        # Find customer
        customer = await db.customers.find_one({"customer_id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Prepare update data
        update_data = {}
        if customer_data.name is not None:
            update_data["name"] = customer_data.name
        if customer_data.email is not None:
            update_data["email"] = customer_data.email
        if customer_data.phone is not None:
            update_data["phone"] = customer_data.phone
        if customer_data.cr_number is not None:
            update_data["cr_number"] = customer_data.cr_number
        if customer_data.vat_number is not None:
            update_data["vat_number"] = customer_data.vat_number
        if customer_data.credit_limit is not None:
            update_data["credit_limit"] = customer_data.credit_limit
        if customer_data.deposit_amount is not None:
            update_data["deposit_amount"] = customer_data.deposit_amount

        update_data["updated_at"] = datetime.now().isoformat()

        # Update customer
        result = await db.customers.update_one(
            {"customer_id": customer_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")

        return {"message": "Customer updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating customer: {str(e)}")

@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a customer"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can delete customers")

        db = get_database()

        # Find customer
        customer = await db.customers.find_one({"customer_id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Delete customer
        result = await db.customers.delete_one({"customer_id": customer_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")

        return {"message": "Customer deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting customer: {str(e)}")

@router.put("/customers/{customer_id}/approve")
async def approve_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a customer for business operations"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can approve customers")

        db = get_database()

        # Find customer
        customer = await db.customers.find_one({"customer_id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Update approval status
        result = await db.customers.update_one(
            {"customer_id": customer_id},
            {"$set": {
                "approval_status": "approved",
                "approved_at": datetime.now().isoformat(),
                "approved_by": current_user["id"],
                "updated_at": datetime.now().isoformat()
            }}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Customer already approved or not found")

        return {"message": "Customer approved successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving customer: {str(e)}")

@router.put("/customers/{customer_id}/reject")
async def reject_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Reject a customer application"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can reject customers")

        db = get_database()

        # Find customer
        customer = await db.customers.find_one({"customer_id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Delete rejected customer
        result = await db.customers.delete_one({"customer_id": customer_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")

        return {"message": "Customer rejected and removed"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting customer: {str(e)}")
