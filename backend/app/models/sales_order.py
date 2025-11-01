from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SalesOrderStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class SalesOrderItem(BaseModel):
    id: str = Field(..., description="Item ID")
    equipment: str = Field(..., description="Equipment name")
    quantity: int = Field(..., ge=1, description="Quantity")
    unit: str = Field(..., description="Unit of measurement")
    rate: float = Field(..., ge=0, description="Rate per unit")
    total: float = Field(..., ge=0, description="Total amount for this item")

class SalesOrderBase(BaseModel):
    quotation_id: str = Field(..., description="Related quotation ID")
    customer_id: str = Field(..., description="Customer ID")
    customer_name: str = Field(..., description="Customer name")
    company: str = Field(..., description="Company name")
    project: str = Field(..., description="Project name")
    items: List[SalesOrderItem] = Field(..., description="List of order items")
    total_amount: float = Field(..., ge=0, description="Total order amount")
    delivery_address: str = Field(..., description="Delivery address")
    contact_person: str = Field(..., description="Contact person")
    contact_phone: str = Field(..., description="Contact phone")
    contact_email: str = Field(..., description="Contact email")
    special_requirements: Optional[str] = Field(None, description="Special requirements")
    notes: Optional[str] = Field(None, description="Additional notes")

class SalesOrderCreate(SalesOrderBase):
    pass

class SalesOrderUpdate(BaseModel):
    status: Optional[SalesOrderStatus] = None
    stock_checked: Optional[bool] = None
    stock_available: Optional[bool] = None
    notes: Optional[str] = None
    special_requirements: Optional[str] = None

class SalesOrderInDB(SalesOrderBase):
    id: str
    sales_order_id: str = Field(..., description="Unique sales order ID (e.g., SO-2025-001)")
    status: SalesOrderStatus = Field(default=SalesOrderStatus.DRAFT)
    stock_checked: bool = Field(default=False, description="Whether stock has been checked")
    stock_available: bool = Field(default=False, description="Whether stock is available")
    created_at: datetime
    updated_at: datetime
    created_by: str = Field(..., description="User ID who created the sales order")

class SalesOrderResponse(SalesOrderBase):
    id: str
    sales_order_id: str
    status: SalesOrderStatus
    stock_checked: bool
    stock_available: bool
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True
