from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
import datetime
from ..utils.auth import get_current_user
from ..utils.database import get_database

class ReturnRequestCreate(BaseModel):
    contract_number: str
    request_type: str  # 'early_return' or 'loss_report'
    description: str

class ReturnRequestResponse(BaseModel):
    id: str
    contract_number: str
    request_type: str
    status: str
    description: str
    created_at: str
    customer_id: str

router = APIRouter()

@router.get("/", response_model=List[ReturnRequestResponse])
async def get_return_requests(current_user: dict = Depends(get_current_user)):
    """Get return requests for the current user"""
    try:
        db = get_database()

        # For demo users, return mock data
        if current_user["id"].startswith("demo-") or str(current_user["id"]).startswith("68fd"):
            mock_requests = [
                {
                    "id": "1",
                    "contract_number": "RC-2025-056",
                    "request_type": "early_return",
                    "status": "pending",
                    "description": "Need to return equipment early due to project completion",
                    "created_at": "2025-10-01T00:00:00Z",
                    "customer_id": current_user["id"]
                },
                {
                    "id": "2",
                    "contract_number": "RC-2025-042",
                    "request_type": "loss_report",
                    "status": "approved",
                    "description": "Lost safety harness during transport",
                    "created_at": "2025-10-15T00:00:00Z",
                    "customer_id": current_user["id"]
                },
                {
                    "id": "3",
                    "contract_number": "RC-2025-068",
                    "request_type": "early_return",
                    "status": "completed",
                    "description": "Project finished ahead of schedule, returning formwork early",
                    "created_at": "2025-10-20T00:00:00Z",
                    "customer_id": current_user["id"]
                }
            ]
            return mock_requests

        # Fetch return requests from database for the current user
        requests_cursor = db.return_requests.find({"customer_id": current_user["id"]})
        requests = []

        async for request in requests_cursor:
            # Convert MongoDB _id to id for frontend compatibility
            request_data = {
                "id": str(request.pop("_id")),
                "contract_number": request["contract_number"],
                "request_type": request["request_type"],
                "status": request["status"],
                "description": request["description"],
                "created_at": request["created_at"],
                "customer_id": request["customer_id"]
            }
            requests.append(request_data)

        return requests

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching return requests: {str(e)}"
        )

@router.post("/", response_model=ReturnRequestResponse, status_code=201)
async def create_return_request(request_data: ReturnRequestCreate, current_user: dict = Depends(get_current_user)):
    """Create a new return request"""
    try:
        db = get_database()

        # Validate current_user has required fields
        if not current_user.get("id") or not current_user.get("email") or not current_user.get("name"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user information. Please log in again."
            )

        # For demo users, simulate successful creation
        if current_user["id"].startswith("demo-") or str(current_user["id"]).startswith("68fd"):
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            return {
                "id": f"return-{len(request_data)}",
                "contract_number": request_data.contract_number,
                "request_type": request_data.request_type,
                "status": "pending",
                "description": request_data.description,
                "created_at": now,
                "customer_id": current_user["id"]
            }

        # Create request document
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        request_doc = {
            "contract_number": request_data.contract_number,
            "request_type": request_data.request_type,
            "description": request_data.description,
            "customer_id": current_user["id"],
            "customer_name": current_user["name"],
            "customer_email": current_user["email"],
            "status": "pending",
            "created_at": now
        }

        # Insert into database
        result = await db.return_requests.insert_one(request_doc)

        # Return the created request in the expected format
        return {
            "id": str(result.inserted_id),
            "contract_number": request_doc["contract_number"],
            "request_type": request_doc["request_type"],
            "status": request_doc["status"],
            "description": request_doc["description"],
            "created_at": request_doc["created_at"],
            "customer_id": request_doc["customer_id"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating return request: {str(e)}"
        )