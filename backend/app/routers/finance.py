from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..utils.auth import get_current_user, is_admin_or_super_admin
from ..utils.database import get_database

router = APIRouter()

@router.get("/dashboard")
async def get_finance_dashboard(current_user: dict = Depends(get_current_user)):
    """Get finance dashboard data"""
    try:
        # Check if user is admin or super_admin
        if not is_admin_or_super_admin(current_user):
            raise HTTPException(status_code=403, detail="Access denied. Admin or Super Admin role required.")

        db = get_database()

        # Get total revenue from invoices
        total_revenue = 0
        try:
            invoices_cursor = db.invoices.find({})
            invoices = await invoices_cursor.to_list(length=None)
            for invoice in invoices:
                total_revenue += invoice.get("total", 0) or invoice.get("amount", 0) or 0
        except Exception:
            total_revenue = 0

        # Get outstanding amount from pending invoices
        outstanding_amount = 0
        outstanding_count = 0
        try:
            pending_invoices_cursor = db.invoices.find({"status": "pending"})
            pending_invoices = await pending_invoices_cursor.to_list(length=None)
            for invoice in pending_invoices:
                outstanding_amount += invoice.get("total", 0) or invoice.get("amount", 0) or 0
                outstanding_count += 1
        except Exception:
            outstanding_amount = 0
            outstanding_count = 0

        # Get pending approvals
        try:
            pending_approvals = await db.rentals.count_documents({"status": "pending_approval"})
        except Exception:
            pending_approvals = 0

        # Get recent invoices
        recent_invoices = []
        try:
            recent_invoices_cursor = db.invoices.find({}).sort("created_at", -1).limit(5)
            recent_invoices_raw = await recent_invoices_cursor.to_list(length=5)
            for invoice in recent_invoices_raw:
                created_at = invoice.get("created_at")
                if isinstance(created_at, datetime):
                    date_str = created_at.strftime("%Y-%m-%d")
                elif isinstance(created_at, str):
                    date_str = created_at[:10] if len(created_at) >= 10 else ""
                else:
                    date_str = ""
                
                recent_invoices.append({
                    "id": invoice.get("invoice_id", str(invoice["_id"])),
                    "customer": invoice.get("customer_name", ""),
                    "date": date_str,
                    "amount": invoice.get("amount", invoice.get("total", 0)),
                    "vat": invoice.get("vat", 0),
                    "status": invoice.get("status", "pending")
                })
        except Exception:
            recent_invoices = []

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
        # Check if user is admin or super_admin
        if not is_admin_or_super_admin(current_user):
            raise HTTPException(status_code=403, detail="Access denied. Admin or Super Admin role required.")
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
        # Check if user is admin or super_admin
        if not is_admin_or_super_admin(current_user):
            raise HTTPException(status_code=403, detail="Access denied. Admin or Super Admin role required.")
        db = get_database()

        # Query from payments collection
        payments_cursor = db.payments.find({})
        payments_raw = await payments_cursor.to_list(length=None)
        payments = []
        for payment in payments_raw:
            payment_copy = payment.copy()
            payment_copy["id"] = str(payment_copy.pop("_id"))
            payments.append(payment_copy)

        return payments

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payments: {str(e)}")

@router.get("/deposits")
async def get_finance_deposits(current_user: dict = Depends(get_current_user)):
    """Get deposits for finance"""
    try:
        # Check if user is admin or super_admin
        if not is_admin_or_super_admin(current_user):
            raise HTTPException(status_code=403, detail="Access denied. Admin or Super Admin role required.")
        db = get_database()

        # Query from deposits collection
        deposits_cursor = db.deposits.find({})
        deposits_raw = await deposits_cursor.to_list(length=None)
        deposits = []
        for deposit in deposits_raw:
            deposit_copy = deposit.copy()
            deposit_copy["id"] = str(deposit_copy.pop("_id"))
            deposits.append(deposit_copy)

        return deposits

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching deposits: {str(e)}")


@router.get("/approvals")
async def get_finance_approvals(current_user: dict = Depends(get_current_user)):
    """Get pending approvals for finance"""
    try:
        # Check if user is admin or super_admin
        if not is_admin_or_super_admin(current_user):
            raise HTTPException(status_code=403, detail="Access denied. Admin or Super Admin role required.")
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
        # Check if user is admin or super_admin
        if not is_admin_or_super_admin(current_user):
            raise HTTPException(status_code=403, detail="Access denied. Admin or Super Admin role required.")
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