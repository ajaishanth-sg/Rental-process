from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class VATStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class VATBase(BaseModel):
    rate: float = Field(..., ge=0, le=100)
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=255)
    effective_from: datetime
    status: VATStatus = VATStatus.ACTIVE

class VATCreate(VATBase):
    pass

class VATUpdate(BaseModel):
    rate: Optional[float] = Field(None, ge=0, le=100)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    effective_from: Optional[datetime] = None
    status: Optional[VATStatus] = None

class VATResponse(VATBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True