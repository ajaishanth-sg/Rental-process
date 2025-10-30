from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..utils.auth import get_current_user
from ..utils.database import get_database

router = APIRouter()

@router.get("/")
async def get_reports(current_user: dict = Depends(get_current_user)):
    """Get reports for the current user"""
    try:
        db = get_database()

        # For demo users, return mock data
        if current_user["id"].startswith("demo-") or str(current_user["id"]).startswith("68fd"):
            mock_reports = [
                {
                    "id": "1",
                    "type": "rental_summary",
                    "title": "Rental Summary - October 2025",
                    "description": "Complete overview of your rental activities for October 2025",
                    "generated_date": "2025-10-01",
                    "period": "monthly",
                },
                {
                    "id": "2",
                    "type": "outstanding_balance",
                    "title": "Outstanding Balance Report",
                    "description": "Current outstanding balances and payment due dates",
                    "generated_date": "2025-10-15",
                    "period": "current",
                },
                {
                    "id": "3",
                    "type": "rental_summary",
                    "title": "Rental Summary - September 2025",
                    "description": "Complete overview of your rental activities for September 2025",
                    "generated_date": "2025-09-01",
                    "period": "monthly",
                },
            ]
            return mock_reports

        # For registered users, query database
        reports = await db.reports.find({"customer_id": current_user["id"]}).to_list(length=None)
        return reports

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@router.post("/")
async def generate_report(report_data: dict, current_user: dict = Depends(get_current_user)):
    """Generate a new report"""
    try:
        db = get_database()

        # For demo users, simulate successful report generation
        if current_user["id"].startswith("demo-") or str(current_user["id"]).startswith("68fd"):
            new_report = {
                "id": f"report-{len(report_data)}",
                "type": report_data.get("type"),
                "title": f"{report_data.get('type')} Report - Generated",
                "description": f"Generated {report_data.get('type')} report",
                "generated_date": "2025-10-24",
                "period": report_data.get("period"),
                "customer_id": current_user["id"]
            }
            return {"message": "Report generated successfully", "report": new_report}

        # For registered users, insert into database
        report_doc = {
            **report_data,
            "customer_id": current_user["id"],
            "generated_date": "2025-10-24"
        }

        result = await db.reports.insert_one(report_doc)
        report_doc["id"] = str(result.inserted_id)

        return {"message": "Report generated successfully", "report": report_doc}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/{report_id}/download")
async def download_report(report_id: str, current_user: dict = Depends(get_current_user)):
    """Download report (mock implementation)"""
    try:
        # In a real implementation, this would generate or retrieve a file
        # For now, return a success message
        return {
            "message": f"Report {report_id} download initiated",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading report: {str(e)}")