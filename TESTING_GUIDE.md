# Rental Order Submission - Testing Guide

## Quick Start

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3001`
- MongoDB running (or using mock database)

### Step 1: Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Connected to MongoDB
```

### Step 2: Start Frontend
```bash
npm run dev
```

Expected output:
```
VITE v5.4.19  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 3: Manual Testing

#### 3.1 Login
1. Navigate to `http://localhost:3001/auth`
2. Login with demo credentials:
   - Email: `customer@demo.com`
   - Password: `password123`
3. You should be redirected to Customer Dashboard

#### 3.2 Submit Rental Order
1. Click "New Rental Order" button
2. Fill in the form:
   - **Project Name**: "Test Construction Project"
   - **Project Type**: "Commercial"
   - **Equipment Category**: "Scaffolding"
   - **Equipment Type**: "Frame Scaffolding"
   - **Quantity**: "50"
   - **Unit**: "Piece"
   - **Start Date**: Today's date
   - **End Date**: 30 days from today
   - **Delivery Address**: "123 Main Street, City, State 12345"
   - **Contact Person**: "John Doe"
   - **Contact Phone**: "+1-555-123-4567"
   - **Contact Email**: "john@example.com"
   - **Special Requirements**: "Urgent delivery needed"
3. Check "I accept the terms and conditions"
4. Click "Submit Order Request"

#### 3.3 Verify Success
✓ **Success Toast**: "Rental order submitted successfully! Your request is pending approval."
✓ **Dialog Closes**: Form dialog should close automatically
✓ **Form Resets**: If you open the form again, all fields should be empty
✓ **Dashboard Updates**: New rental should appear in the rental list

### Step 4: Browser Console Verification

Open Developer Tools (F12) and check Console tab:

**Expected logs**:
```
Token: Present
User: {email: "customer@demo.com", role: "customer", ...}
Response status: 201
New rental created: {id: "...", contract_number: "RC-2025-001", ...}
```

**No errors should appear** - if you see CORS errors, the backend CORS is not configured correctly.

### Step 5: Backend Console Verification

Check the backend terminal for:

**Expected logs**:
```
Returning mock rentals for user: demo-customer
POST /api/rentals/ - 201 Created
```

**No exceptions should appear** - if you see errors, check the error message in the response.

## Automated Testing

### Run Python Test Suite
```bash
cd backend
python test_rentals_api.py
```

Expected output:
```
============================================================
Rigit Control Hub - Rentals API Test Suite
============================================================

1. Testing authentication...
   Status: 200
   ✓ Authentication successful
   Token: eyJhbGciOiJIUzI1NiIs...

2. Testing GET /api/rentals/...
   Status: 200
   ✓ Successfully fetched 2 rentals

3. Testing POST /api/rentals/...
   Status: 201
   ✓ Rental created successfully!
   Rental ID: 507f1f77bcf86cd799439011
   Contract Number: RC-2025-001
   Status: pending_approval

4. Testing CORS headers...
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: *
   Access-Control-Allow-Headers: *
   ✓ CORS headers are correct

============================================================
✓ All tests passed!
============================================================
```

## Troubleshooting

### Issue: CORS Error in Browser
**Error**: "Access to fetch at 'http://localhost:8000/api/rentals/' from origin 'http://localhost:3001' has been blocked by CORS policy"

**Solution**:
1. Verify backend CORS config in `backend/app/main.py`
2. Check that `http://localhost:3001` is in `allow_origins`
3. Restart backend server

### Issue: 500 Error on Submit
**Error**: "Failed to submit rental order: Error creating rental: ..."

**Solution**:
1. Check backend console for detailed error
2. Verify MongoDB is running (or mock database is available)
3. Check that all required fields are filled in frontend
4. Verify authentication token is valid

### Issue: 401 Unauthorized
**Error**: "Could not validate credentials"

**Solution**:
1. Login again to get a fresh token
2. Check that token is stored in `localStorage.auth_token`
3. Verify backend SECRET_KEY matches frontend expectations

### Issue: Form Not Resetting After Submit
**Symptom**: Form fields still contain data after successful submission

**Solution**:
1. Check browser console for JavaScript errors
2. Verify `setOrderForm` state update is working
3. Refresh page manually

## Database Verification

### Check MongoDB for Created Rentals
```bash
# Connect to MongoDB
mongosh

# Use the database
use rigit_control_hub

# Find all rentals
db.rentals.find().pretty()

# Find rentals for specific customer
db.rentals.find({customer_email: "customer@demo.com"}).pretty()
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "contract_number": "RC-2025-001",
  "project_name": "Test Construction Project",
  "status": "pending_approval",
  "customer_email": "customer@demo.com",
  "created_at": "2025-10-26T12:34:56.789Z",
  ...
}
```

## Performance Checklist

- [ ] Form submission completes in < 2 seconds
- [ ] Success toast appears immediately
- [ ] Dashboard updates within 1 second
- [ ] No console errors or warnings
- [ ] Backend logs show successful database insert
- [ ] New rental appears in rental list with correct data
- [ ] Contract number is unique and properly formatted
- [ ] Status is set to "pending_approval"
- [ ] Customer information is correctly associated

## Success Criteria

✅ All of the following must be true:
1. Form submits without CORS errors
2. Backend returns 201 status code
3. Success toast appears
4. Form resets
5. Dashboard refreshes
6. New rental appears in list
7. Rental data is saved to database
8. No console errors
9. No backend exceptions

