from .database import get_database, connect_to_mongo
from .auth import get_password_hash
from datetime import datetime

async def seed_demo_data():
    """Seed the database with demo data"""
    await connect_to_mongo()
    db = get_database()

    # Create initial admin user for development
    admin_exists = await db.users.find_one({"email": "admin@yourcompany.com"})
    if not admin_exists:
        admin_data = {
            "email": "admin@yourcompany.com",
            "full_name": "System Administrator",
            "role": "admin",
            "hashed_password": get_password_hash("admin123"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.users.insert_one(admin_data)
        print("Initial admin user created: admin@yourcompany.com / admin123")
    else:
        print("Admin user already exists")

    # Create initial super admin user
    super_admin_exists = await db.users.find_one({"email": "superadmin@yourcompany.com"})
    if not super_admin_exists:
        super_admin_data = {
            "email": "superadmin@yourcompany.com",
            "full_name": "Super Administrator",
            "role": "super_admin",
            "hashed_password": get_password_hash("superadmin123"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.users.insert_one(super_admin_data)
        print("Super admin user created: superadmin@yourcompany.com / superadmin123")
    else:
        # Update existing user to super_admin role if needed
        if super_admin_exists.get("role") != "super_admin":
            await db.users.update_one(
                {"email": "superadmin@yourcompany.com"},
                {"$set": {"role": "super_admin", "updated_at": datetime.utcnow()}}
            )
            print("Updated existing user to super_admin role")
        else:
            print("Super admin user already exists")

    # Create demo users for testing all roles
    demo_users = [
        {
            "email": "sales@yourcompany.com",
            "full_name": "Sales Manager",
            "role": "sales",
            "password": "sales123"
        },
        {
            "email": "warehouse@yourcompany.com",
            "full_name": "Warehouse Manager",
            "role": "warehouse",
            "password": "warehouse123"
        },
        {
            "email": "finance@yourcompany.com",
            "full_name": "Finance Manager",
            "role": "finance",
            "password": "finance123"
        },
        {
            "email": "customer@yourcompany.com",
            "full_name": "Demo Customer",
            "role": "customer",
            "password": "customer123"
        }
    ]

    for user_data in demo_users:
        user_exists = await db.users.find_one({"email": user_data["email"]})
        if not user_exists:
            user_doc = {
                "email": user_data["email"],
                "full_name": user_data["full_name"],
                "role": user_data["role"],
                "hashed_password": get_password_hash(user_data["password"]),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.users.insert_one(user_doc)
            print(f"Demo user created: {user_data['email']} / {user_data['password']}")
        else:
            print(f"User {user_data['email']} already exists")

    print("Seed data initialization completed")
    return