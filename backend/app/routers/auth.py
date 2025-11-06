from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import Dict, Any
import os
from bson import ObjectId

from ..models.user import UserCreate, UserResponse, Token, TokenData, UserUpdate, UserLogin
from ..utils.database import get_database
from ..utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    is_admin_or_super_admin
)

router = APIRouter()
security = HTTPBearer()

# Removed demo credentials - only admin-created users allowed

@router.post("/login")
async def login(credentials: UserLogin):
    # Support both email and username fields for flexibility
    email = credentials.email or credentials.username
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username is required",
        )
    email = email.lower().strip()
    password = credentials.password

    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required",
        )

    # Check database for registered users
    db = get_database()
    user = await db.users.find_one({"email": email})

    if not user or not verify_password(password, user["hashed_password"]):
        # Log failed login attempt
        await db.audit_log.insert_one({
            "action": "failed_login",
            "email": email,
            "timestamp": datetime.utcnow(),
            "ip_address": None,  # Would be populated by middleware in production
            "user_agent": None
        })
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    # Only admins and super_admins can create users
    if not is_admin_or_super_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create user accounts"
        )

    db = get_database()

    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    del user_dict["password"]
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()

    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)

    # Log user creation
    await db.audit_log.insert_one({
        "action": "user_created",
        "admin_email": current_user["email"],
        "target_user_email": user_data.email,
        "target_user_role": user_data.role,
        "timestamp": datetime.utcnow()
    })

    return UserResponse(**user_dict)

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout():
    # For stateless JWT, logout is handled on frontend by removing token
    return {"message": "Logged out successfully"}

@router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    """Admin/Super Admin only: Get all users"""
    if not is_admin_or_super_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view users"
        )

    db = get_database()
    users_cursor = db.users.find({}, {"hashed_password": 0})
    users = []
    async for user in users_cursor:
        user["id"] = str(user["_id"])
        del user["_id"]
        users.append(user)
    return users

@router.put("/users/{user_id}")
async def update_user(user_id: str, user_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Admin/Super Admin only: Update user details"""
    if not is_admin_or_super_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update users"
        )

    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_dict = user_data.dict(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_dict})

        # Log role change if role was updated
        if "role" in update_dict:
            await db.audit_log.insert_one({
                "action": "user_role_updated",
                "admin_email": current_user["email"],
                "target_user_email": user["email"],
                "old_role": user.get("role"),
                "new_role": update_dict["role"],
                "timestamp": datetime.utcnow()
            })

    return {"message": "User updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Admin/Super Admin only: Delete user"""
    if not is_admin_or_super_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete users"
        )

    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.delete_one({"_id": ObjectId(user_id)})

    # Log user deletion
    await db.audit_log.insert_one({
        "action": "user_deleted",
        "admin_email": current_user["email"],
        "target_user_email": user["email"],
        "timestamp": datetime.utcnow()
    })

    return {"message": "User deleted successfully"}

@router.get("/audit-log")
async def get_audit_log(current_user: dict = Depends(get_current_user)):
    """Admin-only: Get audit log"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view audit logs"
        )

    db = get_database()
    logs_cursor = db.audit_log.find().sort("timestamp", -1)
    logs = []
    async for log in logs_cursor:
        log["id"] = str(log["_id"])
        del log["_id"]
        logs.append(log)
    return logs
