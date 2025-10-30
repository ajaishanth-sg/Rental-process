from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..utils.auth import get_current_user
from ..utils.database import get_database

router = APIRouter()

@router.get("/")
async def get_invoices(current_user: dict = Depends(get_current_user)):
    """Get invoices for the current user or all invoices for finance/admin"""
    try:
        db = get_database()

        # For demo users, return mock data
        if current_user["id"].startswith("demo-") or "68fd" in str(current_user["id"]):
            mock_invoices = [
                {
                    "id": "1",
                    "invoice_number": "INV-2025-156",
                    "contract_id": "1",
                    "amount": 12500,
                    "status": "paid",
                    "created_at": "2025-10-15T00:00:00Z",
                    "due_date": "2025-10-30T00:00:00Z",
                    "contract_number": "RC-2025-056",
                },
                {
                    "id": "2",
                    "invoice_number": "INV-2025-168",
                    "contract_id": "2",
                    "amount": 8900,
                    "status": "pending",
                    "created_at": "2025-10-20T00:00:00Z",
                    "due_date": "2025-11-04T00:00:00Z",
                    "contract_number": "RC-2025-068",
                },
                {
                    "id": "3",
                    "invoice_number": "INV-2025-142",
                    "contract_id": "3",
                    "amount": 15200,
                    "status": "paid",
                    "created_at": "2025-10-10T00:00:00Z",
                    "due_date": "2025-10-25T00:00:00Z",
                    "contract_number": "RC-2025-042",
                },
            ]
            return mock_invoices

        # Finance/Admin can see all invoices, customers see only their own
        if current_user.get("role") in ["finance", "admin"]:
            invoices_cursor = db.invoices.find({}).sort("created_at", -1)
        else:
            invoices_cursor = db.invoices.find({"customer_id": current_user["id"]}).sort("created_at", -1)
        
        invoices_raw = await invoices_cursor.to_list(length=None)
        
        # Convert _id to id for frontend
        invoices = []
        for invoice in invoices_raw:
            invoice_copy = invoice.copy()
            invoice_copy["id"] = str(invoice_copy.pop("_id"))
            invoices.append(invoice_copy)
        
        return invoices

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")

@router.get("/{invoice_id}/download")
async def download_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    """Download invoice PDF (mock implementation)"""
    try:
        # In a real implementation, this would generate or retrieve a PDF file
        # For now, return a success message
        return {
            "message": f"Invoice {invoice_id} download initiated",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading invoice: {str(e)}")