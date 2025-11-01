from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UOMStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class UOMBase(BaseModel):
    code: str = Field(..., min_length=1, max_length=10)
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=255)
    status: UOMStatus = UOMStatus.ACTIVE

class UOMCreate(UOMBase):
    pass

class UOMUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=1, max_length=10)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[UOMStatus] = None

class UOMResponse(UOMBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True