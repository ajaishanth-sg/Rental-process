from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
import datetime
from ..utils.auth import get_current_user
from ..utils.database import get_database
from ..models.enquiry import EnquiryCreate, EnquiryStatus

class RentalCreate(BaseModel):
    project_name: str
    project_type: str
    equipment_category: str
    equipment_type: str
    quantity: int
    unit: str
    start_date: str
    end_date: str
    delivery_address: str
    contact_person: str
    contact_phone: str
    contact_email: str
    special_requirements: str

class RentalExtend(BaseModel):
    new_end_date: str

class RentalResponse(BaseModel):
    id: str
    contract_number: str
    project_name: str
    project_type: str
    equipment_category: str
    equipment_type: str
    quantity: int
    unit: str
    start_date: str
    end_date: str
    delivery_address: str
    contact_person: str
    contact_phone: str
    contact_email: str
    special_requirements: str
    customer_id: str
    customer_name: str
    customer_email: str
    status: str
    total_amount: int
    created_at: str
    updated_at: str
    assigned_salesperson_id: Optional[str] = None

router = APIRouter()

@router.get("/")
async def get_rentals(current_user: dict = Depends(get_current_user)):
    """Get rentals for the current user or all for sales"""
    try:
        db = get_database()

        # Fetch rentals from database
        if current_user.get("role") == "sales":
            print(f"Fetching all rentals for sales user: {current_user['id']}")
            rentals_cursor = db.rentals.find({})
        else:
            print(f"Fetching rentals for customer user: {current_user['id']}")
            rentals_cursor = db.rentals.find({"customer_id": current_user["id"]})
        rentals = []

        async for rental in rentals_cursor:
            # Convert MongoDB _id to id for frontend compatibility
            rental["id"] = str(rental.pop("_id"))
            rentals.append(rental)

        print(f"Found {len(rentals)} rentals")
        return rentals

    except Exception as e:
        print(f"Error fetching rentals: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching rentals: {str(e)}"
        )

@router.get("/{rental_id}")
async def get_rental_details(rental_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed information for a specific rental"""
    try:
        db = get_database()

        # Query database for all users
        rental = await db.rentals.find_one({"_id": rental_id, "customer_id": current_user["id"]})
        if not rental:
            raise HTTPException(status_code=404, detail="Rental not found")

        # Convert _id to id for frontend compatibility
        rental["id"] = str(rental.pop("_id"))
        return rental

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rental details: {str(e)}")

@router.post("/", response_model=RentalResponse, status_code=201)
async def create_rental(rental_data: RentalCreate, current_user: dict = Depends(get_current_user)):
    """Create a new rental request"""
    try:
        db = get_database()

        # Validate current_user has required fields
        if not current_user.get("id") or not current_user.get("email") or not current_user.get("name"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user information. Please log in again."
            )

        # Generate a unique contract number
        current_year = datetime.datetime.now().year
        rental_count = await db.rentals.count_documents({})
        contract_number = f"RC-{current_year}-{str(rental_count + 1).zfill(3)}"

        # Create rental document
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        rental_doc = {
            "contract_number": contract_number,
            "project_name": rental_data.project_name,
            "project_type": rental_data.project_type,
            "equipment_category": rental_data.equipment_category,
            "equipment_type": rental_data.equipment_type,
            "quantity": rental_data.quantity,
            "unit": rental_data.unit,
            "start_date": rental_data.start_date,
            "end_date": rental_data.end_date,
            "delivery_address": rental_data.delivery_address,
            "contact_person": rental_data.contact_person,
            "contact_phone": rental_data.contact_phone,
            "contact_email": rental_data.contact_email,
            "special_requirements": rental_data.special_requirements,
            "customer_id": current_user["id"],
            "customer_name": current_user["name"],
            "customer_email": current_user["email"],
            "status": "pending_approval",
            "total_amount": 0,
            "created_at": now,
            "updated_at": now
        }

        # Insert into database
        result = await db.rentals.insert_one(rental_doc)

        # Return the created rental in the expected format
        rental_doc["id"] = str(result.inserted_id)
        return rental_doc

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating rental: {str(e)}"
        )

@router.put("/{rental_id}/extend", response_model=RentalResponse)
async def extend_rental(rental_id: str, extend_data: RentalExtend, current_user: dict = Depends(get_current_user)):
    """Extend the end date of a rental"""
    try:
        db = get_database()

        # Query database for rental
        rental = await db.rentals.find_one({"_id": rental_id, "customer_id": current_user["id"]})
        if not rental:
            raise HTTPException(status_code=404, detail="Rental not found")

        # Update the rental
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        update_data = {
            "end_date": extend_data.new_end_date,
            "status": "extended",
            "updated_at": now
        }
        await db.rentals.update_one({"_id": rental_id}, {"$set": update_data})

        # Return updated rental
        updated_rental = await db.rentals.find_one({"_id": rental_id})
        updated_rental["id"] = str(updated_rental.pop("_id"))
        return updated_rental

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extending rental: {str(e)}"
        )
