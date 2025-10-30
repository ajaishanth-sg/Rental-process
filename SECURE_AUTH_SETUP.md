# Secure Admin Authentication Setup Guide

## Overview
This guide provides instructions for setting up secure, admin-controlled user authentication for the Rigit Control Hub application. The system enforces manual user creation by administrators only, with no self-registration or demo accounts.

## Prerequisites
- Node.js 16+ and npm
- Python 3.8+ with pip (for backend)
- MongoDB database
- Git

## Initial Setup

### 1. Database Setup
```bash
# Ensure MongoDB is running on localhost:27017
# Default database: rigit-control-hub
```

### 2. Environment Configuration
Create `.env` files in both root and backend directories:

**Root `.env`:**
```env
VITE_MONGODB_URI=mongodb://localhost:27017/rigit-control-hub
```

**Backend `.env`:**
```env
MONGODB_URL=mongodb://localhost:27017/rigit-control-hub
SECRET_KEY=your-super-secure-secret-key-here-change-this-in-production
```

### 3. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies (when Python is available)
cd backend
pip install -r requirements.txt
```

## Admin User Creation

### Method 1: Direct Database Insertion (Recommended for Initial Setup)
Since the backend requires an admin user to create other users, you'll need to manually create the first admin user in MongoDB:

```javascript
// Run this in MongoDB shell or MongoDB Compass
use rigit-control-hub

db.users.insertOne({
  "email": "admin@yourcompany.com",
  "full_name": "System Administrator",
  "role": "admin",
  "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMJyHnUe", // Hash for "admin123" - CHANGE THIS!
  "created_at": new Date(),
  "updated_at": new Date()
})
```

**Important:** Change the default password hash immediately after first login!

### Method 2: Using Backend API (After First Admin Exists)
Once you have an admin user, you can use the admin dashboard to create additional users.

## Running the Application

### Frontend Only (Current Setup)
```bash
npm run dev
```
- Access at: http://localhost:3000
- Login with admin credentials created above

### Full Stack (When Backend is Available)
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend
npm run dev
```

## User Management Workflow

### 1. Admin Login
- Use the admin credentials created during setup
- Navigate to Admin Dashboard → Users & Roles tab

### 2. Create Users
- Click "Create User" button
- Fill in: Email, Full Name, Role, Password
- Supported roles: admin, manager, viewer, sales, warehouse, finance, customer

### 3. Manage Existing Users
- View all users in the table
- Edit user details and roles
- Delete users (with confirmation)

### 4. Role-Based Access
- **Admin**: Full system access, user management
- **Manager**: Operational oversight
- **Viewer**: Read-only access
- **Sales/Warehouse/Finance/Customer**: Role-specific dashboards

## Security Features

### Password Security
- Passwords are hashed using bcrypt
- Minimum complexity requirements enforced
- No plaintext password storage

### Audit Logging
- All user creation, updates, and deletions logged
- Failed login attempts tracked
- Admin actions recorded with timestamps

### Access Control
- Only admin users can create/manage other users
- No self-registration allowed
- JWT-based authentication with expiration
- Role-based route protection

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Admin-only user creation
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### User Management (Admin Only)
- `GET /api/auth/users` - List all users
- `PUT /api/auth/users/{user_id}` - Update user
- `DELETE /api/auth/users/{user_id}` - Delete user
- `GET /api/auth/audit-log` - View audit logs

## Troubleshooting

### Common Issues

1. **"Python not recognized"**
   - Install Python from python.org
   - Ensure "Add to PATH" is checked during installation

2. **"MongoDB connection failed"**
   - Ensure MongoDB is running
   - Check connection string in .env files

3. **"No admin user exists"**
   - Create initial admin user via direct database insertion
   - Use the JavaScript command provided above

4. **"Cannot create users"**
   - Ensure you're logged in as admin
   - Check network connectivity to backend

### Resetting Admin Password
If you forget the admin password, you can reset it directly in MongoDB:

```javascript
// Update admin password hash
db.users.updateOne(
  { "email": "admin@yourcompany.com" },
  { "$set": { "hashed_password": "$2b$12$NEW_HASH_HERE" } }
)
```

## Production Deployment

### Security Checklist
- [ ] Change SECRET_KEY to a strong, random value
- [ ] Use HTTPS in production
- [ ] Configure MongoDB authentication
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Set up monitoring and logging

### Environment Variables
```env
# Production settings
NODE_ENV=production
VITE_MONGODB_URI=mongodb://username:password@host:port/database
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://yourdomain.com
```

## Support
For issues with this setup:
1. Check the audit logs in the admin dashboard
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check browser console for frontend errors
5. Check backend logs for API errors

## Next Steps
- Implement MFA for enhanced security
- Add password reset functionality
- Set up email notifications for user actions
- Implement session management
- Add user activity monitoring