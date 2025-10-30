from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EquipmentStatus(str, Enum):
    AVAILABLE = "available"
    RENTED = "rented"
    MAINTENANCE = "maintenance"
    DAMAGED = "damaged"
    SCRAPPED = "scrapped"

class EquipmentCategory(str, Enum):
    SCAFFOLDING = "scaffolding"
    FORMWORK = "formwork"
    SHORING = "shoring"
    SAFETY = "safety"
    TOOLS = "tools"
    OTHER = "other"

class EquipmentUnit(str, Enum):
    PIECE = "piece"
    SET = "set"
    METER = "meter"
    KG = "kg"
    TON = "ton"

class EquipmentBase(BaseModel):
    item_code: str = Field(..., description="Unique item code")
    description: str = Field(..., description="Equipment description")
    category: EquipmentCategory = Field(..., description="Equipment category")
    unit: EquipmentUnit = Field(..., description="Unit of measurement")
    daily_rate: float = Field(..., ge=0, description="Daily rental rate in AED")

class EquipmentCreate(EquipmentBase):
    quantity_total: int = Field(..., ge=0, description="Total quantity in inventory")
    quantity_available: int = Field(..., ge=0, description="Available quantity for rent")
    location: str = Field(..., description="Storage location")

class EquipmentUpdate(BaseModel):
    description: Optional[str] = None
    category: Optional[EquipmentCategory] = None
    unit: Optional[EquipmentUnit] = None
    daily_rate: Optional[float] = Field(None, ge=0)
    quantity_total: Optional[int] = Field(None, ge=0)
    quantity_available: Optional[int] = Field(None, ge=0)
    location: Optional[str] = None
    status: Optional[EquipmentStatus] = None

class EquipmentInDB(EquipmentBase):
    id: str
    quantity_total: int
    quantity_available: int
    quantity_rented: int = Field(default=0)
    quantity_maintenance: int = Field(default=0)
    quantity_damaged: int = Field(default=0)
    location: str
    status: EquipmentStatus = Field(default=EquipmentStatus.AVAILABLE)
    approval_status: str = Field(default="pending")  # pending, approved, rejected
    created_at: datetime
    updated_at: datetime
    created_by: str  # user ID who created
    approved_by: Optional[str] = None  # user ID who approved
    approved_at: Optional[datetime] = None

class EquipmentResponse(EquipmentBase):
    id: str
    quantity_total: int
    quantity_available: int
    quantity_rented: int
    quantity_maintenance: int
    quantity_damaged: int
    location: str
    status: EquipmentStatus
    approval_status: str
    created_at: datetime
    updated_at: datetime

class EquipmentAdjustment(BaseModel):
    equipment_id: str
    adjustment_type: str  # add, remove, damage, repair, rent, return
    quantity: int
    reason: str
    location: Optional[str] = None
    performed_by: str  # user ID
    approved_by: Optional[str] = None
    notes: Optional[str] = None

class EquipmentHistory(BaseModel):
    id: str
    equipment_id: str
    action: str
    quantity_change: int
    previous_quantity: int
    new_quantity: int
    performed_by: str
    approved_by: Optional[str] = None
    reason: str
    notes: Optional[str] = None
    timestamp: datetime