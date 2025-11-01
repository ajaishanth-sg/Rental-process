from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..utils.auth import get_current_user
from ..utils.database import get_database

router = APIRouter()

@router.get("/dashboard")
async def get_finance_dashboard(current_user: dict = Depends(get_current_user)):
    """Get finance dashboard data"""
    try:
        db = get_database()

        # Get total revenue from invoices
        total_revenue = 0
        invoices_cursor = db.invoices.find({})
        invoices = await invoices_cursor.to_list(length=None)
        for invoice in invoices:
            total_revenue += invoice.get("total", 0)

        # Get outstanding amount from pending invoices
        outstanding_amount = 0
        outstanding_count = 0
        pending_invoices_cursor = db.invoices.find({"status": "pending"})
        pending_invoices = await pending_invoices_cursor.to_list(length=None)
        for invoice in pending_invoices:
            outstanding_amount += invoice.get("total", 0)
            outstanding_count += 1

        # Get pending approvals
        pending_approvals = await db.rentals.count_documents({"status": "pending_approval"})

        # Get recent invoices
        recent_invoices_cursor = db.invoices.find({}).sort("created_at", -1).limit(5)
        recent_invoices_raw = await recent_invoices_cursor.to_list(length=5)
        recent_invoices = []
        for invoice in recent_invoices_raw:
            recent_invoices.append({
                "id": invoice.get("invoice_id", str(invoice["_id"])),
                "customer": invoice.get("customer_name", ""),
                "date": invoice.get("created_at", "")[:10] if invoice.get("created_at") else "",
                "amount": invoice.get("amount", 0),
                "vat": invoice.get("vat", 0),
                "status": invoice.get("status", "pending")
            })

        # Get contract profitability (simplified)
        contract_profitability = []  # TODO: Calculate from contracts and costs

        # Get deposit tracking (simplified)
        deposit_tracking = []  # TODO: Query from deposits collection

        return {
            "totalRevenue": total_revenue,
            "revenueGrowth": 0,  # TODO: Calculate growth
            "outstandingAmount": outstanding_amount,
            "outstandingInvoices": outstanding_count,
            "profitMargin": 0,  # TODO: Calculate margin
            "pendingApprovals": pending_approvals,
            "recentInvoices": recent_invoices,
            "contractProfitability": contract_profitability,
            "depositTracking": deposit_tracking
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching finance dashboard: {str(e)}")

@router.get("/invoices")
async def get_finance_invoices(current_user: dict = Depends(get_current_user)):
    """Get invoices for finance"""
    try:
        db = get_database()

        # Query from invoices collection
        invoices_cursor = db.invoices.find({})
        invoices_raw = await invoices_cursor.to_list(length=None)
        invoices = []
        for invoice in invoices_raw:
            invoice_copy = invoice.copy()
            invoice_copy["id"] = str(invoice_copy.pop("_id"))
            invoices.append(invoice_copy)

        return invoices

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")

@router.get("/payments")
async def get_finance_payments(current_user: dict = Depends(get_current_user)):
    """Get payments for finance"""
    try:
        db = get_database()

        # TODO: Query from payments collection
        return []

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payments: {str(e)}")

@router.get("/deposits")
async def get_finance_deposits(current_user: dict = Depends(get_current_user)):
    """Get deposits for finance"""
    try:
        db = get_database()

        # TODO: Query from deposits collection
        return []

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching deposits: {str(e)}")


@router.get("/approvals")
async def get_finance_approvals(current_user: dict = Depends(get_current_user)):
    """Get pending approvals for finance"""
    try:
        db = get_database()

        # Get pending rental approvals
        pending_rentals_cursor = db.rentals.find({"status": "pending_approval"})
        pending_rentals = await pending_rentals_cursor.to_list(length=None)

        approvals = []
        for rental in pending_rentals:
            approvals.append({
                "id": str(rental["_id"]),
                "type": "rental",
                "contract_id": rental["contract_number"],
                "customer": rental["customer_name"],
                "amount": 0,  # TODO: Calculate amount
                "date": rental["created_at"].strftime("%b %d, %Y"),
                "status": "pending"
            })

        return approvals

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching approvals: {str(e)}")

@router.get("/reports")
async def get_finance_reports(current_user: dict = Depends(get_current_user)):
    """Get finance reports"""
    try:
        db = get_database()

        # TODO: Implement proper reporting queries
        return {
            "monthlyRevenue": 0,
            "outstandingAmount": 0,
            "profitMargin": 0,
            "paymentTrends": []
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")