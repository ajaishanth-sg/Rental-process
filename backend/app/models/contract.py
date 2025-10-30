from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class ContractBase(BaseModel):
    customer: str = Field(..., description="Customer name")
    project: str = Field(..., description="Project name")
    equipment: str = Field(..., description="Equipment description")
    start_date: str = Field(..., description="Contract start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="Contract end date (YYYY-MM-DD)")
    amount: float = Field(..., description="Contract amount in AED")
    status: str = Field(default="pending", description="Contract status: pending, active, completed, cancelled")
    approval_status: str = Field(default="pending", description="Approval status: pending, approved, rejected")
    renewal_date: Optional[str] = Field(None, description="Renewal date (YYYY-MM-DD)")

class ContractCreate(ContractBase):
    pass

class ContractUpdate(BaseModel):
    customer: Optional[str] = None
    project: Optional[str] = None
    equipment: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    approval_status: Optional[str] = None
    renewal_date: Optional[str] = None

class ContractResponse(ContractBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True