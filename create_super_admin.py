"""
Script to create a Super Admin user
Run this script to create a super_admin user in the database
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.utils.database import get_database, connect_to_mongo
from backend.app.utils.auth import get_password_hash
from datetime import datetime, timezone

async def create_super_admin():
    """Create a super admin user"""
    await connect_to_mongo()
    db = get_database()
    
    # Super Admin credentials
    email = "superadmin@yourcompany.com"
    password = "superadmin123"
    full_name = "Super Administrator"
    
    # Check if super admin already exists
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        print(f"WARNING: Super Admin user already exists: {email}")
        print(f"   Current role: {existing_user.get('role')}")
        
        # Update to super_admin if not already
        if existing_user.get('role') != 'super_admin':
            await db.users.update_one(
                {"email": email},
                {"$set": {"role": "super_admin", "updated_at": datetime.now(timezone.utc)}}
            )
            print(f"SUCCESS: Updated user role to super_admin")
        return
    
    # Create super admin user
    super_admin_data = {
        "email": email,
        "full_name": full_name,
        "role": "super_admin",
        "hashed_password": get_password_hash(password),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(super_admin_data)
    print("=" * 60)
    print("SUCCESS: Super Admin User Created Successfully!")
    print("=" * 60)
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Name: {full_name}")
    print(f"Role: super_admin")
    print("=" * 60)
    print("\nYou can now login with these credentials at:")
    print("   http://localhost:3000/auth")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(create_super_admin())

