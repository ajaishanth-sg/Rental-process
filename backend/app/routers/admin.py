from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import traceback
from ..utils.auth import get_current_user
from ..utils.database import get_database
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(get_current_user)):
    """Get admin dashboard data"""
    try:
        from ..utils.auth import is_admin_or_super_admin
        if not is_admin_or_super_admin(current_user):
            raise HTTPException(status_code=403, detail="Only admin or super admin can access this endpoint")
        
        db = get_database()
        
        # Get total customers
        total_customers = await db.customers.count_documents({})
        
        # Get total enquiries
        total_enquiries = await db.rentals.count_documents({})
        total_enquiries += await db.enquiries.count_documents({})
        
        # Get pending quotations
        pending_quotations = await db.quotations.count_documents({"status": "sent"})
        
        # Get active contracts
        active_contracts = await db.rentals.count_documents({"status": "active"})
        
        # Get total revenue
        total_revenue = 0
        try:
            invoices_cursor = db.invoices.find({})
            invoices = await invoices_cursor.to_list(length=None)
            total_revenue = sum(invoice.get("total", 0) or invoice.get("amount", 0) or 0 for invoice in invoices)
        except Exception:
            total_revenue = 0
        
        # Get equipment stats
        equipment_rented = await db.equipment.count_documents({"quantity_rented": {"$gt": 0}})
        equipment_available = await db.equipment.count_documents({"quantity_available": {"$gt": 0}})
        
        return {
            "totalCustomers": total_customers,
            "totalEnquiries": total_enquiries,
            "pendingQuotations": pending_quotations,
            "activeContracts": active_contracts,
            "totalRevenue": total_revenue,
            "equipmentRented": equipment_rented,
            "equipmentAvailable": equipment_available,
            "monthlyRevenue": total_revenue,  # Simplified
            "pendingApprovals": pending_quotations
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admin dashboard: {str(e)}")

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get admin statistics (alias for dashboard)"""
    return await get_admin_dashboard(current_user)

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
        # Sync leads for existing enquiries (create leads for enquiries that don't have one)
        await sync_leads_for_enquiries(db, current_user)

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

async def sync_leads_for_enquiries(db, current_user):
    """Sync leads for existing enquiries that don't have a corresponding lead"""
    try:
        # Get all rentals (enquiries)
        rentals = await db.rentals.find({}).to_list(length=None)
        
        # Get all existing leads
        existing_leads = await db.leads.find({}).to_list(length=None)
        existing_enquiry_ids = {lead.get("enquiry_id") for lead in existing_leads if lead.get("enquiry_id")}
        
        created_count = 0
        for rental in rentals:
            # Get enquiry_id - first check if it's stored in rental, otherwise use contract_number
            enquiry_id = rental.get("enquiry_id") or rental.get("contract_number", "")
            
            # If no enquiry_id in ENQ- format, try to generate one from contract_number
            if not enquiry_id or (not enquiry_id.startswith("ENQ-") and not enquiry_id.startswith("RC-")):
                # Generate enquiry_id similar to create_enquiry
                created_at = rental.get("created_at", datetime.now().isoformat())
                try:
                    if isinstance(created_at, str):
                        year = int(created_at[:4])
                    else:
                        year = created_at.year if hasattr(created_at, 'year') else datetime.now().year
                except:
                    year = datetime.now().year
                # This is a fallback - ideally all rentals should have enquiry_id
                rental_mongo_id = str(rental.get("_id", ""))
                enquiry_id = f"ENQ-{year}-{rental_mongo_id[:4]}"
            elif enquiry_id.startswith("RC-"):
                # If we have RC- format, convert to ENQ- format for consistency
                # Extract year and sequence from RC-YYYY-### format
                parts = enquiry_id.split("-")
                if len(parts) == 3 and parts[1].isdigit():
                    enquiry_id = f"ENQ-{parts[1]}-{parts[2].zfill(4)}"
                else:
                    # Fallback: use contract_number as-is or generate new
                    created_at = rental.get("created_at", datetime.now().isoformat())
                    try:
                        if isinstance(created_at, str):
                            year = int(created_at[:4])
                        else:
                            year = created_at.year if hasattr(created_at, 'year') else datetime.now().year
                    except:
                        year = datetime.now().year
                    rental_mongo_id = str(rental.get("_id", ""))
                    enquiry_id = f"ENQ-{year}-{rental_mongo_id[:4]}"
            
            # Check if lead exists for this enquiry_id
            if enquiry_id and enquiry_id not in existing_enquiry_ids:
                # Create lead for this enquiry
                customer_name = rental.get("customer_name", "Unknown")
                customer_email = rental.get("contact_email") or rental.get("customer_email", "")
                
                if not customer_email:
                    continue  # Skip if no email
                
                # Parse customer name
                customer_name_parts = customer_name.strip().split(maxsplit=1)
                first_name = customer_name_parts[0] if customer_name_parts else customer_name
                last_name = customer_name_parts[1] if len(customer_name_parts) > 1 else ""
                
                # Generate lead ID
                current_year = datetime.now().year
                all_leads = await db.leads.find({}).to_list(length=None)
                
                max_seq = 0
                for lead in all_leads:
                    lead_id_val = lead.get("lead_id", "")
                    if lead_id_val.startswith(f"LEAD-{current_year}-"):
                        try:
                            parts = lead_id_val.split("-")
                            if len(parts) == 3 and parts[1] == str(current_year) and parts[2].isdigit():
                                max_seq = max(max_seq, int(parts[2]))
                        except:
                            pass
                
                max_seq += 1
                lead_id = f"LEAD-{current_year}-{str(max_seq).zfill(4)}"
                
                # Verify lead_id doesn't exist
                existing_lead = await db.leads.find_one({"lead_id": lead_id})
                while existing_lead:
                    max_seq += 1
                    lead_id = f"LEAD-{current_year}-{str(max_seq).zfill(4)}"
                    existing_lead = await db.leads.find_one({"lead_id": lead_id})
                
                # Create lead document
                now = rental.get("created_at", datetime.now(timezone.utc).isoformat())
                lead_doc = {
                    "lead_id": lead_id,
                    "salutation": "Mr",
                    "firstName": first_name,
                    "lastName": last_name or "",
                    "email": customer_email,
                    "mobile": "",
                    "organization": customer_name if len(customer_name_parts) == 1 else "",
                    "website": "",
                    "jobTitle": "",
                    "industry": "",
                    "source": "Enquiry Form",
                    "status": "New",
                    "gender": "Male",
                    "noOfEmployees": "",
                    "annualRevenue": 0,
                    "territory": "",
                    "leadOwner": rental.get("assigned_salesperson_name", "Shariq Ansari"),
                    "createdAt": now,
                    "createdBy": current_user.get("id", ""),
                    "updatedAt": now,
                    "activities": [
                        {
                            "type": "created",
                            "description": f"Lead created from enquiry: {enquiry_id} (synced)",
                            "by": current_user.get("name", "System"),
                            "timestamp": now
                        }
                    ],
                    "enquiry_id": enquiry_id,
                    "enquiry_reference": str(rental.get("_id", ""))
                }
                
                # Insert lead
                await db.leads.insert_one(lead_doc)
                created_count += 1
                print(f"Created missing lead {lead_id} for enquiry {enquiry_id}")
        
        if created_count > 0:
            print(f"Synced {created_count} missing leads for enquiries")
    except Exception as e:
        print(f"Error syncing leads for enquiries: {str(e)}")
        print(traceback.format_exc())

class EnquiryCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_id: Optional[str] = None
    equipment_name: str
    quantity: int
    rental_duration_days: int
    delivery_location: str
    expected_delivery_date: str
    special_instructions: Optional[str] = None
    assigned_salesperson_name: Optional[str] = None
    status: str = "submitted_by_customer"

@router.post("/enquiries")
async def create_enquiry(enquiry_data: EnquiryCreate, current_user: dict = Depends(get_current_user)):
    """Create a new enquiry (admin only)"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can create enquiries")
        
        db = get_database()
        
        # Generate enquiry ID
        current_year = datetime.now().year
        enquiry_count = await db.rentals.count_documents({})
        enquiry_id = f"ENQ-{current_year}-{str(enquiry_count + 1).zfill(4)}"
        contract_number = f"RC-{current_year}-{str(enquiry_count + 1).zfill(3)}"
        
        # Calculate end date from start date and rental duration
        try:
            # Parse the date string (format: YYYY-MM-DD)
            start_date = datetime.strptime(enquiry_data.expected_delivery_date, '%Y-%m-%d')
            end_date = start_date + timedelta(days=enquiry_data.rental_duration_days)
            end_date_str = end_date.strftime('%Y-%m-%d')
        except:
            # Fallback: assume end date is same as start date if parsing fails
            end_date_str = enquiry_data.expected_delivery_date
        
        # Create rental document (enquiries are stored as rentals)
        now = datetime.now(timezone.utc).isoformat()
        rental_doc = {
            "contract_number": contract_number,
            "enquiry_id": enquiry_id,  # Store enquiry_id in rental document for lead lookup
            "project_name": enquiry_data.equipment_name,
            "project_type": "Rental",
            "equipment_category": enquiry_data.equipment_name.split(" - ")[0] if " - " in enquiry_data.equipment_name else enquiry_data.equipment_name,
            "equipment_type": enquiry_data.equipment_name.split(" - ")[-1] if " - " in enquiry_data.equipment_name else enquiry_data.equipment_name,
            "quantity": enquiry_data.quantity,
            "unit": "unit",
            "start_date": enquiry_data.expected_delivery_date,
            "end_date": end_date_str,
            "delivery_address": enquiry_data.delivery_location,
            "contact_person": enquiry_data.customer_name,
            "contact_phone": "",
            "contact_email": enquiry_data.customer_email,
            "special_requirements": enquiry_data.special_instructions or "",
            "customer_id": enquiry_data.customer_id or "",
            "customer_name": enquiry_data.customer_name,
            "customer_email": enquiry_data.customer_email,
            "status": enquiry_data.status,
            "total_amount": 0,
            "rental_duration_days": enquiry_data.rental_duration_days,
            "assigned_salesperson_name": enquiry_data.assigned_salesperson_name,
            "created_at": now,
            "updated_at": now
        }
        
        # Insert into database
        result = await db.rentals.insert_one(rental_doc)
        
        # Automatically create a lead from the enquiry
        # Each enquiry should create a separate lead, even if the email is the same
        try:
            # Check if a lead already exists for this enquiry_id to avoid duplicates
            existing_lead_by_enquiry = await db.leads.find_one({"enquiry_id": enquiry_id})
            if existing_lead_by_enquiry:
                print(f"Lead already exists for enquiry {enquiry_id}, skipping lead creation")
            else:
                # Parse customer name to extract first name and last name
                customer_name_parts = enquiry_data.customer_name.strip().split(maxsplit=1)
                first_name = customer_name_parts[0] if customer_name_parts else enquiry_data.customer_name
                last_name = customer_name_parts[1] if len(customer_name_parts) > 1 else ""
                
                # Generate lead ID with year-based format
                # Count ALL leads (including those without proper IDs) to ensure unique sequence
                current_year = datetime.now().year
                all_leads = await db.leads.find({}).to_list(length=None)
                
                max_seq = 0
                for lead in all_leads:
                    lead_id_val = lead.get("lead_id", "")
                    if lead_id_val.startswith(f"LEAD-{current_year}-"):
                        try:
                            parts = lead_id_val.split("-")
                            if len(parts) == 3 and parts[1] == str(current_year) and parts[2].isdigit():
                                max_seq = max(max_seq, int(parts[2]))
                        except:
                            pass
                
                # Increment to get the next sequence number
                max_seq += 1
                lead_id = f"LEAD-{current_year}-{str(max_seq).zfill(4)}"
                
                # Verify the lead_id doesn't already exist (safety check)
                existing_lead = await db.leads.find_one({"lead_id": lead_id})
                while existing_lead:
                    # If somehow the ID exists, increment and try again
                    max_seq += 1
                    lead_id = f"LEAD-{current_year}-{str(max_seq).zfill(4)}"
                    existing_lead = await db.leads.find_one({"lead_id": lead_id})
                
                # Create lead document
                lead_doc = {
                    "lead_id": lead_id,
                    "salutation": "Mr",
                    "firstName": first_name,
                    "lastName": last_name or "",
                    "email": enquiry_data.customer_email,
                    "mobile": "",
                    "organization": enquiry_data.customer_name if len(customer_name_parts) == 1 else "",
                    "website": "",
                    "jobTitle": "",
                    "industry": "",
                    "source": "Enquiry Form",
                    "status": "New",
                    "gender": "Male",
                    "noOfEmployees": "",
                    "annualRevenue": 0,
                    "territory": "",
                    "leadOwner": enquiry_data.assigned_salesperson_name or "Shariq Ansari",
                    "createdAt": now,
                    "createdBy": current_user.get("id", ""),
                    "updatedAt": now,
                    "activities": [
                        {
                            "type": "created",
                            "description": f"Lead created from enquiry: {enquiry_id}",
                            "by": current_user.get("name", enquiry_data.assigned_salesperson_name or "System"),
                            "timestamp": now
                        }
                    ],
                    "enquiry_id": enquiry_id,  # Link to the enquiry
                    "enquiry_reference": str(result.inserted_id)  # Link to the rental/enquiry
                }
                
                # Insert lead into database
                lead_result = await db.leads.insert_one(lead_doc)
                print(f"Successfully created lead {lead_id} from enquiry {enquiry_id}")
        except Exception as lead_error:
            # Log error but don't fail the enquiry creation
            print(f"Warning: Failed to create lead from enquiry {enquiry_id}: {str(lead_error)}")
            print(traceback.format_exc())
        
        # Return the created enquiry
        rental_doc["id"] = str(result.inserted_id)
        rental_doc["enquiry_id"] = enquiry_id
        
        return {
            "id": str(result.inserted_id),
            "enquiry_id": enquiry_id,
            "message": "Enquiry created successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating enquiry: {str(e)}")

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
        # Find maximum existing customer number
        max_customer_num = 0
        for customer in customers_raw:
            customer_id = customer.get("customer_id", "")
            if customer_id and customer_id.startswith("CUST-"):
                parts = customer_id.split("-")
                if len(parts) >= 2:
                    try:
                        if len(parts) == 2:
                            num = int(parts[1])
                            max_customer_num = max(max_customer_num, num)
                        elif len(parts) == 3 and parts[2].isdigit():
                            num = int(parts[2])
                            max_customer_num = max(max_customer_num, num)
                    except:
                        pass
        
        for customer in customers_raw:
            customer_copy = customer.copy()
            mongo_id = str(customer_copy.pop("_id"))
            display_customer_id = customer_copy.get("customer_id", "")
            
            # Normalize or generate customer ID
            if not display_customer_id or not display_customer_id.startswith("CUST-") or len(display_customer_id) > 15:
                max_customer_num += 1
                display_customer_id = f"CUST-{str(max_customer_num).zfill(4)}"
            else:
                # Normalize to simple format if in year format
                parts = display_customer_id.split("-")
                if len(parts) == 3 and parts[2].isdigit():
                    display_customer_id = f"CUST-{parts[2]}"
            
            customer_copy["id"] = display_customer_id
            customer_copy["_id"] = mongo_id
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

        # Create customer document with simple sequential ID
        # Get the maximum existing customer number
        all_customers = await db.customers.find({
            "customer_id": {"$regex": "^CUST-"}
        }).to_list(length=None)
        
        max_num = 0
        for cust in all_customers:
            cust_id = cust.get("customer_id", "")
            if cust_id.startswith("CUST-"):
                try:
                    parts = cust_id.split("-")
                    if len(parts) == 2:
                        # Simple format CUST-001
                        num = int(parts[1])
                        max_num = max(max_num, num)
                    elif len(parts) == 3 and parts[2].isdigit():
                        # Year format CUST-2025-0001, use sequence number
                        num = int(parts[2])
                        max_num = max(max_num, num)
                except:
                    pass
        
        customer_id = f"CUST-{str(max_num + 1).zfill(4)}"

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
