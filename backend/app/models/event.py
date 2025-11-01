from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    MAINTENANCE = "maintenance"
    INSPECTION = "inspection"
    DELIVERY = "delivery"
    PICKUP = "pickup"
    ALERT = "alert"
    NOTIFICATION = "notification"

class EventPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class EventStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    type: EventType
    priority: EventPriority = EventPriority.MEDIUM
    status: EventStatus = EventStatus.SCHEDULED
    assigned_to: Optional[str] = None
    due_date: datetime

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    type: Optional[EventType] = None
    priority: Optional[EventPriority] = None
    status: Optional[EventStatus] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None

class EventResponse(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True