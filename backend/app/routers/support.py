from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..utils.auth import get_current_user
from ..utils.database import get_database

router = APIRouter()

@router.get("/chats")
async def get_support_chats(current_user: dict = Depends(get_current_user)):
    """Get support chats for the current user"""
    try:
        db = get_database()

        chats = await db.support_chats.find({"customer_id": current_user["id"]}).to_list(length=None)
        return chats

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching support chats: {str(e)}")

@router.get("/chats/{chat_id}/messages")
async def get_chat_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages for a specific chat"""
    try:
        db = get_database()

        messages = await db.chat_messages.find({"chat_id": chat_id}).to_list(length=None)
        return messages

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat messages: {str(e)}")

@router.post("/chats")
async def create_support_chat(chat_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new support chat"""
    try:
        db = get_database()

        chat_doc = {
            **chat_data,
            "customer_id": current_user["id"],
            "status": "open",
            "created_at": "2025-10-24T10:00:00Z"
        }

        result = await db.support_chats.insert_one(chat_doc)
        chat_doc["id"] = str(result.inserted_id)

        return {"message": "Chat created successfully", "chat": chat_doc}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating support chat: {str(e)}")

@router.post("/chats/{chat_id}/messages")
async def send_message(chat_id: str, message_data: dict, current_user: dict = Depends(get_current_user)):
    """Send a message in a chat"""
    try:
        db = get_database()

        message_doc = {
            **message_data,
            "chat_id": chat_id,
            "sender": "customer",
            "timestamp": "2025-10-24T10:00:00Z",
            "read": True
        }

        result = await db.chat_messages.insert_one(message_doc)
        message_doc["id"] = str(result.inserted_id)

        return {"message": "Message sent successfully", "message": message_doc}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")