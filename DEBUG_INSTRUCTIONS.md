# Debug Instructions - Sales Enquiries Not Showing

## Step 1: Check if Rental Data Exists

### Option A: Login as Customer and Create Rental
1. Go to: http://localhost:3001
2. **Login as Customer**
3. Navigate to: **My Rentals**
4. Click: **"Order"** button
5. Fill the form:
   - Project Name: `Test Project ABC`
   - Project Type: `Commercial Building`
   - Equipment Category: `Scaffolding Systems`
   - Equipment Type: `Frame Scaffolding`
   - Quantity: `100`
   - Unit: `Piece`
   - Start Date: (select a future date)
   - End Date: (select a date after start)
   - Delivery Address: `123 Test Street, Dubai`
   - Contact Person: `John Doe`
   - Contact Phone: `+971501234567`
   - Contact Email: `test@example.com`
   - Special Requirements: `Urgent delivery required`
6. ✅ Check "I accept the terms"
7. Click: **"Submit Order Request"**
8. **Wait for success message**

### Option B: Check Backend Logs
Look at your backend terminal window for:
```
=== SALES ENQUIRIES REQUEST ===
User: sales@example.com (Role: sales)
Found 0 regular enquiries
Found X rental orders in database  ← CHECK THIS NUMBER
Total enquiries to return: X
=== END SALES ENQUIRIES REQUEST ===
```

## Step 2: Check Sales Enquiries Tab

1. **Logout from Customer**
2. **Login as Sales** user
3. Click **"Enquiries"** in the sidebar
4. **Check browser console** (Press F12):
   ```
   Fetching sales enquiries from /api/sales/enquiries
   Sales enquiries response status: 200
   Sales enquiries data received: X items  ← CHECK THIS NUMBER
   ```

## Step 3: Check Network Tab

1. Open **F12 Developer Tools**
2. Go to **Network** tab
3. Click **Enquiries** in sidebar
4. Look for request: `GET /api/sales/enquiries`
5. Click on it
6. Check **Response** tab - should see JSON array with rentals

## Step 4: Common Issues & Solutions

### Issue 1: "Found 0 rental orders in database"
**Solution**: No rental data exists yet
- Create a rental order as Customer (Step 1)

### Issue 2: "Sales enquiries data received: 0 items"
**Solution**: Backend not returning data
- Check backend terminal for errors
- Verify MongoDB connection

### Issue 3: "401 Unauthorized" or "403 Forbidden"
**Solution**: Authentication issue
- Logout and login again
- Check if token is valid in localStorage:
  ```javascript
  // In browser console:
  localStorage.getItem('auth_token')
  ```

### Issue 4: Network request fails
**Solution**: Backend not running
- Check backend terminal shows: "Application startup complete"
- Verify: http://localhost:8000/docs opens

### Issue 5: Frontend shows empty list but network shows data
**Solution**: Frontend rendering issue
- Hard refresh: Ctrl + Shift + R
- Clear localStorage:
  ```javascript
  localStorage.clear()
  // Then login again
  ```

## Step 5: Verify Complete Flow

### 1. Customer Creates Order:
```
✅ Customer Dashboard → My Rentals → Order button
✅ Fill form and submit
✅ See success message
✅ See order in "My Rentals" table
```

### 2. Backend Stores Data:
```
✅ Backend terminal shows: POST /api/rentals/ - 201 Created
✅ MongoDB stores rental with contract_number like "RC-2025-001"
```

### 3. Sales Views Enquiries:
```
✅ Sales Dashboard → Enquiries tab
✅ Backend terminal shows:
   === SALES ENQUIRIES REQUEST ===
   Found X rental orders in database
   Total enquiries to return: X
✅ Browser console shows:
   Sales enquiries data received: X items
✅ Table shows rental orders
```

## Step 6: Manual Database Check (Advanced)

If you have MongoDB installed:
```bash
# Connect to MongoDB
mongo

# Switch to database
use rigit_db

# Check rentals count
db.rentals.count()

# View all rentals
db.rentals.find().pretty()

# View specific fields
db.rentals.find({}, {
  contract_number: 1,
  customer_name: 1,
  equipment_type: 1,
  status: 1
}).pretty()
```

## Expected Output:

### Backend Terminal:
```
=== SALES ENQUIRIES REQUEST ===
User: sales@example.com (Role: sales)
Found 0 regular enquiries
Found 3 rental orders in database
Total enquiries to return: 3
=== END SALES ENQUIRIES REQUEST ===
```

### Browser Console:
```
Fetching sales enquiries from /api/sales/enquiries
Sales enquiries response status: 200
Sales enquiries data received: 3 items
```

### Sales Enquiries Table:
```
| Enquiry ID  | Customer    | Equipment           | Quantity | Status           |
|-------------|-------------|---------------------|----------|------------------|
| RC-2025-001 | John Doe    | Scaffolding - Frame | 100      | PENDING_APPROVAL |
| RC-2025-002 | Jane Smith  | Formwork - Wall     | 50       | PENDING_APPROVAL |
```

## Quick Test Commands

### Test Backend is Running:
Open browser and go to: http://localhost:8000/docs

### Test Frontend is Running:
Open browser and go to: http://localhost:3001

### Test Authentication:
```javascript
// In browser console (F12):
console.log('Token:', localStorage.getItem('auth_token'));
console.log('User:', localStorage.getItem('user'));
console.log('Role:', localStorage.getItem('role'));
```

## Still Not Working?

### 1. Check Servers:
```powershell
netstat -ano | findstr ":8000 :3001"
```
Should show both ports listening.

### 2. Restart Everything:
```powershell
# Stop both servers (Ctrl+C in each terminal)

# Start backend:
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend (new terminal):
npm run dev
```

### 3. Clear Everything:
```javascript
// Browser console:
localStorage.clear();
sessionStorage.clear();
// Hard refresh: Ctrl + Shift + R
// Login again
```

## Contact Points:

1. Backend logs: Check terminal running uvicorn
2. Frontend logs: Check browser console (F12)
3. Network: Check browser Network tab (F12)
4. Database: Check MongoDB connection in backend logs

## Success Indicators:

✅ Backend shows: "Found X rental orders in database" (X > 0)
✅ Frontend shows: "Sales enquiries data received: X items" (X > 0)
✅ Table displays rental orders with proper data
✅ Can click "Details" and see full information
✅ Can click "Create Quotation" button

