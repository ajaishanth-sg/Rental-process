from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class EnquiryStatus(str, Enum):
    SUBMITTED_BY_CUSTOMER = "submitted_by_customer"
    QUOTATION_CREATED = "quotation_created"
    QUOTATION_SENT = "quotation_sent"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONVERTED_TO_ORDER = "converted_to_order"

class EnquiryBase(BaseModel):
    customer_id: str = Field(..., description="Customer user ID")
    customer_name: str = Field(..., description="Customer full name")
    customer_email: str = Field(..., description="Customer email")
    equipment_name: str = Field(..., description="Equipment name requested")
    quantity: int = Field(..., ge=1, description="Quantity requested")
    rental_duration_days: int = Field(..., ge=1, description="Rental duration in days")
    delivery_location: str = Field(..., description="Delivery location")
    expected_delivery_date: str = Field(..., description="Expected delivery date (YYYY-MM-DD)")
    special_instructions: Optional[str] = Field(None, description="Special instructions")
    assigned_salesperson_id: Optional[str] = Field(None, description="Assigned salesperson user ID")
    assigned_salesperson_name: Optional[str] = Field(None, description="Assigned salesperson name")

class EnquiryCreate(EnquiryBase):
    pass

class EnquiryUpdate(BaseModel):
    status: Optional[EnquiryStatus] = None
    assigned_salesperson_id: Optional[str] = None
    assigned_salesperson_name: Optional[str] = None
    special_instructions: Optional[str] = None

class EnquiryInDB(EnquiryBase):
    id: str
    enquiry_id: str = Field(..., description="Unique enquiry ID (e.g., ENQ-2025-001)")
    status: EnquiryStatus = Field(default=EnquiryStatus.SUBMITTED_BY_CUSTOMER)
    enquiry_date: datetime
    created_at: datetime
    updated_at: datetime

class EnquiryResponse(EnquiryBase):
    id: str
    enquiry_id: str
    status: EnquiryStatus
    enquiry_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True