# Super Admin Login Credentials

## Default Super Admin Credentials

After running the seed script or creating the super admin user, you can login with:

**Email:** `superadmin@yourcompany.com`  
**Password:** `superadmin123`

## How to Create Super Admin User

### Method 1: Automatic (Recommended) ✅

The super admin user is **automatically created** when you start the backend server! The seed data script runs on startup and creates the super admin user if it doesn't exist.

Just start your backend:
```bash
cd backend
uvicorn app.main:app --reload
```

You'll see a message: `Super admin user created: superadmin@yourcompany.com / superadmin123`

### Method 2: Using the Standalone Script

Run the standalone script:

```bash
python create_super_admin.py
```

Or from the root directory:

```bash
python create_super_admin.py
```

### Method 3: Create via Admin Dashboard

1. Login as admin: `admin@yourcompany.com` / `admin123`
2. Go to **Users & Roles** module
3. Click **Add User**
4. Fill in:
   - Email: `superadmin@yourcompany.com`
   - Full Name: `Super Administrator`
   - Role: Select `super_admin`
   - Password: `superadmin123`
5. Click **Create User**

### Method 4: Direct MongoDB Insert

If you have MongoDB access, you can insert directly:

```javascript
db.users.insertOne({
  "email": "superadmin@yourcompany.com",
  "full_name": "Super Administrator",
  "role": "super_admin",
  "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fEtTT2/D2", // superadmin123
  "created_at": new Date(),
  "updated_at": new Date()
})
```

## Login Steps

1. Navigate to: `http://localhost:3000/auth`
2. Enter Email: `superadmin@yourcompany.com`
3. Enter Password: `superadmin123`
4. Click **Login**
5. You will be redirected to `/super-admin` dashboard

## Available Roles

- `super_admin` - Full system access (NEW!)
- `admin` - Administrative access
- `sales` - Sales team access
- `warehouse` - Warehouse operations
- `finance` - Finance department
- `customer` - Customer portal

## Security Note

⚠️ **Important:** Change the default password after first login in production!

