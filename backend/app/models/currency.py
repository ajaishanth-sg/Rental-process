from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class CurrencyStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class CurrencyBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=3)
    name: str = Field(..., min_length=1, max_length=100)
    symbol: str = Field(..., min_length=1, max_length=10)
    exchange_rate: float = Field(..., gt=0)
    status: CurrencyStatus = CurrencyStatus.ACTIVE

class CurrencyCreate(CurrencyBase):
    pass

class CurrencyUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=3, max_length=3)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    symbol: Optional[str] = Field(None, min_length=1, max_length=10)
    exchange_rate: Optional[float] = Field(None, gt=0)
    status: Optional[CurrencyStatus] = None

class CurrencyResponse(CurrencyBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True