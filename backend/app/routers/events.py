from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import os
from bson import ObjectId

from ..models.event import (
    EventCreate, EventResponse, EventUpdate,
    EventType, EventPriority, EventStatus
)
from ..utils.database import get_database
from ..utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.post("/", response_model=EventResponse)
async def create_event(
    event_data: EventCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new event (all authenticated users)"""
    db = get_database()

    event_dict = event_data.dict()
    event_dict.update({
        "status": EventStatus.SCHEDULED,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": current_user["email"],
    })

    result = await db.events.insert_one(event_dict)
    event_dict["id"] = str(result.inserted_id)

    return EventResponse(**event_dict)

@router.get("/", response_model=List[EventResponse])
async def get_events(
    type: Optional[EventType] = None,
    status: Optional[EventStatus] = None,
    priority: Optional[EventPriority] = None,
    assigned_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all events with optional filters"""
    db = get_database()

    # Build query
    query = {}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if assigned_to:
        query["assigned_to"] = assigned_to

    events_cursor = db.events.find(query).sort("created_at", -1)
    events = []
    async for event in events_cursor:
        event["id"] = str(event["_id"])
        del event["_id"]
        events.append(event)

    return events

@router.get("/{event_id}", response_model=EventResponse)
async def get_event_by_id(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get event by ID"""
    db = get_database()
    event = await db.events.find_one({"_id": ObjectId(event_id)})

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event["id"] = str(event["_id"])
    del event["_id"]

    return EventResponse(**event)

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update event"""
    db = get_database()
    event = await db.events.find_one({"_id": ObjectId(event_id)})

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_dict = event_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()

        await db.events.update_one({"_id": ObjectId(event_id)}, {"$set": update_dict})

    # Return updated event
    updated_event = await db.events.find_one({"_id": ObjectId(event_id)})
    updated_event["id"] = str(updated_event["_id"])
    del updated_event["_id"]

    return EventResponse(**updated_event)

@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete event (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete events"
        )

    db = get_database()
    event = await db.events.find_one({"_id": ObjectId(event_id)})

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.events.delete_one({"_id": ObjectId(event_id)})

    return {"message": "Event deleted successfully"}