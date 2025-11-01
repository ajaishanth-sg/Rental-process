from fastapi import APIRouter, Depends, HTTPException
from ..utils.auth import get_current_user
from ..utils.database import get_database
from ..models.enquiry import EnquiryResponse

router = APIRouter()

@router.get("/profile")
async def get_customer_profile(current_user: dict = Depends(get_current_user)):
    """Get customer profile information"""
    try:
        db = get_database()

        # For demo users, return mock data
        if current_user["id"].startswith("demo-") or str(current_user["id"]).startswith("68fd"):
            mock_profile = {
                "id": current_user["id"],
                "name": "ABC Construction LLC",
                "email": current_user["email"],
                "phone": "+971-50-123-4567",
                "address": "123 Business District, Dubai, UAE",
                "cr_number": "CR123456789",
                "vat_number": "VAT987654321",
                "credit_limit": 50000,
                "deposit_amount": 5000,
            }
            return mock_profile

        # For registered users, query database
        profile = await db.customers.find_one({"_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return profile

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@router.put("/profile")
async def update_customer_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    """Update customer profile information"""
    try:
        db = get_database()

        # For demo users, simulate successful update
        if current_user["id"].startswith("demo-") or str(current_user["id"]).startswith("68fd"):
            return {
                "message": "Profile updated successfully",
                "profile": {**profile_data, "id": current_user["id"]}
            }

        # For registered users, update database
        result = await db.customers.update_one(
            {"_id": current_user["id"]},
            {"$set": profile_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Profile not found or no changes made")

        return {"message": "Profile updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@router.get("/dashboard")
async def get_customer_dashboard(current_user: dict = Depends(get_current_user)):
    """Get customer dashboard data"""
    try:
        db = get_database()

        # For demo users, return mock data
        if current_user["id"].startswith("demo-") or "68fd" in str(current_user["id"]):
            mock_dashboard = {
                "activeRentals": 3,
                "outstandingBalance": 2500,
                "balanceDueText": "Due in 15 days",
                "nextReturnDays": 7,
                "nextReturnDate": "Nov 2, 2025",
                "recentActivity": [
                    {
                        "action": "Equipment Returned",
                        "detail": "Scaffolding system returned from Downtown Tower project",
                        "date": "Oct 20, 2025",
                        "type": "return"
                    },
                    {
                        "action": "Payment Received",
                        "detail": "Invoice RC-2025-056 payment processed",
                        "date": "Oct 18, 2025",
                        "type": "payment"
                    },
                    {
                        "action": "New Rental Started",
                        "detail": "Formwork equipment delivered to Marina Development",
                        "date": "Oct 15, 2025",
                        "type": "rental"
                    }
                ]
            }
            return mock_dashboard

        # For registered users, query database
        # Get active rentals count
        active_rentals = await db.rentals.count_documents({
            "customer_id": current_user["id"],
            "status": {"$in": ["active", "extended"]}
        })

        # Get outstanding balance (simplified - would need proper calculation)
        outstanding_balance = 0  # TODO: Calculate from invoices

        # Get next return
        next_return = await db.rentals.find_one(
            {"customer_id": current_user["id"], "status": "active"},
            sort=[("end_date", 1)]
        )

        dashboard_data = {
            "activeRentals": active_rentals,
            "outstandingBalance": outstanding_balance,
            "balanceDueText": "No outstanding balance",
            "nextReturnDays": 0,
            "nextReturnDate": "N/A"
        }

        if next_return:
            from datetime import datetime
            end_date = next_return["end_date"]
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            days_until_return = (end_date.date() - datetime.now().date()).days
            dashboard_data["nextReturnDays"] = max(0, days_until_return)
            dashboard_data["nextReturnDate"] = end_date.strftime("%b %d, %Y")

        return dashboard_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard: {str(e)}")

@router.get("/enquiries")
async def get_customer_enquiries(current_user: dict = Depends(get_current_user)):
    """Get customer's rental enquiries"""
    try:
        db = get_database()

        # Query enquiries for the current customer
        enquiries_cursor = db.enquiries.find({"customer_id": current_user["id"]})
        enquiries_raw = await enquiries_cursor.to_list(length=None)
        enquiries = []
        for enquiry in enquiries_raw:
            enquiry_copy = enquiry.copy()
            enquiry_copy["id"] = str(enquiry_copy.pop("_id"))
            enquiries.append(enquiry_copy)

        return enquiries

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching enquiries: {str(e)}")