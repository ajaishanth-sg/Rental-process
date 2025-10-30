from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class QuotationStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONVERTED_TO_ORDER = "converted_to_order"

class QuotationItem(BaseModel):
    id: str = Field(..., description="Item ID")
    equipment: str = Field(..., description="Equipment name")
    length: float = Field(..., ge=0, description="Length in feet")
    breadth: float = Field(..., ge=0, description="Breadth in feet")
    sqft: float = Field(..., ge=0, description="Square feet")
    ratePerSqft: float = Field(..., ge=0, description="Rate per square foot")
    subtotal: float = Field(..., ge=0, description="Subtotal amount")
    wastageCharges: float = Field(default=0, ge=0, description="Wastage charges")
    cuttingCharges: float = Field(default=0, ge=0, description="Cutting charges")
    total: float = Field(..., ge=0, description="Total amount for this item")

class QuotationBase(BaseModel):
    customerName: str = Field(..., description="Customer name")
    company: str = Field(..., description="Company name")
    project: str = Field(..., description="Project name")
    items: List[QuotationItem] = Field(..., description="List of quotation items")
    totalAmount: float = Field(..., ge=0, description="Total quotation amount")
    notes: Optional[str] = Field(None, description="Additional notes")
    enquiry_id: Optional[str] = Field(None, description="Related enquiry ID")
    rental_id: Optional[str] = Field(None, description="Related rental ID")

class QuotationCreate(QuotationBase):
    pass

class QuotationUpdate(BaseModel):
    customerName: Optional[str] = None
    company: Optional[str] = None
    project: Optional[str] = None
    items: Optional[List[QuotationItem]] = None
    totalAmount: Optional[float] = None
    status: Optional[QuotationStatus] = None
    notes: Optional[str] = None

class QuotationInDB(QuotationBase):
    id: str
    quotation_id: str = Field(..., description="Unique quotation ID (e.g., QT-2025-001)")
    status: QuotationStatus = Field(default=QuotationStatus.DRAFT)
    createdDate: str = Field(..., description="Creation date (YYYY-MM-DD)")
    validUntil: str = Field(..., description="Valid until date (YYYY-MM-DD)")
    created_at: datetime
    updated_at: datetime
    created_by: str = Field(..., description="User ID who created the quotation")

class QuotationResponse(QuotationBase):
    id: str
    quotation_id: str
    status: QuotationStatus
    createdDate: str
    validUntil: str
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True
