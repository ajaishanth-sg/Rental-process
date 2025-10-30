from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class RateStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class RateBase(BaseModel):
    item_code: str = Field(..., min_length=1, max_length=50)
    item_name: str = Field(..., min_length=1, max_length=200)
    daily_rate: float = Field(..., gt=0)
    weekly_rate: float = Field(..., gt=0)
    monthly_rate: float = Field(..., gt=0)
    currency: str = Field(..., min_length=3, max_length=3)
    status: RateStatus = RateStatus.ACTIVE

class RateCreate(RateBase):
    pass

class RateUpdate(BaseModel):
    item_code: Optional[str] = Field(None, min_length=1, max_length=50)
    item_name: Optional[str] = Field(None, min_length=1, max_length=200)
    daily_rate: Optional[float] = Field(None, gt=0)
    weekly_rate: Optional[float] = Field(None, gt=0)
    monthly_rate: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    status: Optional[RateStatus] = None

class RateResponse(RateBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True