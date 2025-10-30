# 🧪 Complete Testing Guide - Sales Enquiries from Customer Rentals

## 📋 What You Need to Do

Follow these steps **in order** to test the complete workflow:

---

## Step 1: Create Rental Order as Customer ✅

### 1.1 Login as Customer
```
1. Open: http://localhost:3001
2. Click "Sign In"
3. Login with Customer credentials
   - If you don't have a customer account, create one first
```

### 1.2 Navigate to My Rentals
```
1. After login, you should be on Customer Dashboard
2. In the left sidebar, click: "My Rentals"
```

### 1.3 Create New Rental Order
```
1. Click the green "Order" button (top right)
2. A large dialog form will open
3. Fill ALL required fields (*):

PROJECT INFORMATION:
  - Project Name *: Test Construction Project
  - Project Type: Commercial Building

EQUIPMENT DETAILS:
  - Equipment Category *: Scaffolding Systems
  - Specific Equipment Type *: Frame Scaffolding
  - Quantity *: 100
  - Unit: Piece

RENTAL PERIOD:
  - Start Date *: (Pick tomorrow's date)
  - End Date *: (Pick date 30 days from start)

DELIVERY INFORMATION:
  - Delivery Address *: 123 Sheikh Zayed Road, Dubai, UAE

CONTACT INFORMATION:
  - Contact Person *: John Smith
  - Contact Phone *: +971501234567
  - Contact Email *: john.smith@company.com

ADDITIONAL INFORMATION:
  - Special Requirements: Urgent delivery required before 8 AM

TERMS:
  ✅ Check: "I accept the rental terms and conditions"

4. Click: "Submit Order Request"
5. Wait for GREEN success message: "Rental order submitted successfully!"
6. The dialog will close
7. You should see your order in the table below
```

### 1.4 Verify Order Created
```
✅ Check the "My Rentals" table shows your new order:
   - Contract ID: RC-2025-XXX
   - Project: Test Construction Project
   - Equipment: Frame Scaffolding
   - Status: PENDING_APPROVAL (orange badge)
```

---

## Step 2: View in Sales Enquiries ✅

### 2.1 Logout from Customer
```
1. Click "Sign Out" button (bottom of sidebar)
2. You'll be redirected to login page
```

### 2.2 Login as Sales
```
1. Click "Sign In"
2. Login with Sales credentials
   Email: sales@example.com (or your sales account)
   Password: (your sales password)
```

### 2.3 Navigate to Enquiries Tab
```
1. After login, you're on Sales Dashboard
2. In the top tabs, click: "Enquiries"
   (Second tab after "Overview")
```

### 2.4 Check What You See

#### If You See the Rental Order: ✅ SUCCESS!
```
✅ Table shows:
   Enquiry ID: RC-2025-XXX
   Customer: John Smith
   Equipment: Scaffolding Systems - Frame Scaffolding
   Quantity: 100
   Status: PENDING_APPROVAL
   
✅ Actions available:
   - [Details] button
   - [Create Quotation] button
```

#### If You See "No Rental Enquiries Yet": ❌ ISSUE
```
Possible reasons:
1. No rental order was created (go back to Step 1)
2. Backend not returning data (check Step 3)
3. Authentication issue (check Step 4)
```

---

## Step 3: Check Backend Logs 🔍

### 3.1 Look at Backend Terminal Window
```
You should see this output when you clicked "Enquiries" tab:

=== SALES ENQUIRIES REQUEST ===
User: sales@example.com (Role: sales)
Found 0 regular enquiries
Found 1 rental orders in database  ← IMPORTANT: Should be > 0
Total enquiries to return: 1        ← IMPORTANT: Should be > 0
=== END SALES ENQUIRIES REQUEST ===
```

### 3.2 If "Found 0 rental orders in database"
```
❌ Problem: No data in database
✅ Solution: Go back to Step 1 and create a rental order
```

### 3.3 If "Found X rental orders" but frontend shows 0
```
❌ Problem: Frontend not receiving or displaying data
✅ Solution: Check Step 4 (Browser Console)
```

---

## Step 4: Check Browser Console 🖥️

### 4.1 Open Developer Tools
```
1. Press F12 (or Right-click → Inspect)
2. Click "Console" tab
```

### 4.2 Click "Enquiries" Tab Again
```
Look for these console messages:

✅ Expected Output:
Fetching sales enquiries from /api/sales/enquiries
Sales enquiries response status: 200
Sales enquiries data received: 1 items
Rendering EnquiryManagementModule with 1 rentals
```

### 4.3 Check for Errors
```
❌ If you see RED errors:
   - 401 Unauthorized → Token expired, logout and login again
   - 403 Forbidden → Wrong role, use sales account
   - 500 Server Error → Check backend logs for error
   - Network error → Backend not running
```

### 4.4 Check Network Tab
```
1. Click "Network" tab in DevTools
2. Filter by "Fetch/XHR"
3. Click "Enquiries" tab again
4. Look for: GET /api/sales/enquiries
5. Click on it
6. Check "Response" tab
7. Should see JSON array with rental data
```

---

## Step 5: Test Complete Workflow 🔄

### 5.1 View Details
```
1. In Sales Enquiries table, click "Details" button
2. Dialog opens showing:
   ✅ Customer Name
   ✅ Equipment details
   ✅ Quantity
   ✅ Delivery location
   ✅ Expected delivery date
   ✅ Special instructions
   ✅ Status
3. Close dialog
```

### 5.2 Create Quotation
```
1. Click "Create Quotation" button
2. ✅ Should switch to "Quotations" tab
3. ✅ Quotation form should open
4. ✅ Customer and project details pre-filled
5. Add equipment items and pricing
6. Click "Create Quotation"
7. ✅ Success message appears
```

---

## Step 6: Troubleshooting 🔧

### Issue 1: "No Rental Enquiries Yet" message
**Cause**: No rental orders in database
**Solution**:
```
1. Logout from Sales
2. Login as Customer
3. Create rental order (Step 1)
4. Logout from Customer
5. Login as Sales
6. Click Enquiries tab
```

### Issue 2: Console shows "0 items" but backend shows data
**Cause**: Frontend not receiving data
**Solution**:
```
1. Check Network tab for failed requests
2. Hard refresh: Ctrl + Shift + R
3. Clear cache and localStorage:
   localStorage.clear()
4. Logout and login again
```

### Issue 3: 401 Unauthorized error
**Cause**: Token expired or invalid
**Solution**:
```
1. Logout
2. Login again
3. Token will refresh automatically
```

### Issue 4: Backend shows error in logs
**Cause**: Database or code issue
**Solution**:
```
1. Check full error message in backend terminal
2. Restart backend server:
   - Press Ctrl+C
   - Run: python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
3. Try again
```

### Issue 5: Table shows but data looks wrong
**Cause**: Field mapping mismatch
**Solution**:
```
1. Check browser console for errors
2. Take screenshot of:
   - Sales enquiries table
   - Browser console
   - Backend logs
```

---

## Expected Results Summary ✅

### Customer Side:
```
✅ Can create rental order
✅ Order appears in "My Rentals" table
✅ Status shows "PENDING_APPROVAL"
✅ Contract number like "RC-2025-001"
```

### Backend Side:
```
✅ POST /api/rentals/ returns 201 Created
✅ Data saved to MongoDB
✅ GET /api/sales/enquiries returns rental data
✅ Logs show "Found X rental orders"
```

### Sales Side:
```
✅ Enquiries tab shows rental orders
✅ Title shows "Rental Enquiries (1)"
✅ Table displays correct data
✅ Details button works
✅ Create Quotation button works
```

---

## Quick Checklist 📝

Before reporting an issue, verify:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3001
- [ ] MongoDB connected (check backend logs)
- [ ] Customer account exists and can login
- [ ] Sales account exists and can login
- [ ] Rental order created successfully
- [ ] Browser console shows no RED errors
- [ ] Backend logs show rental orders found
- [ ] Network tab shows 200 OK responses

---

## Success Indicators 🎉

You know it's working when:

1. ✅ Customer creates order → sees success message
2. ✅ Backend logs → "Found X rental orders"
3. ✅ Sales Enquiries → shows rental in table
4. ✅ Browser console → "data received: X items"
5. ✅ Can click Details → see full information
6. ✅ Can click Create Quotation → opens form

---

## Still Not Working? 🆘

### Collect This Information:

1. **Backend Terminal Output**:
   - Copy the "=== SALES ENQUIRIES REQUEST ===" section
   
2. **Browser Console Output**:
   - Copy all messages starting with "Fetching sales enquiries"
   
3. **Network Tab**:
   - Screenshot of GET /api/sales/enquiries request/response
   
4. **What You See**:
   - Screenshot of Sales Enquiries tab
   
5. **Steps Taken**:
   - List exactly what you did

### Then Check:
- DEBUG_INSTRUCTIONS.md - for detailed debugging
- ENQUIRY_DATA_FIX.md - for technical details
- Backend logs for any ERROR messages

---

## Test Data Examples 📊

### Sample Rental Order 1:
```
Project: Downtown Tower Construction
Equipment: Scaffolding Systems - Frame Scaffolding
Quantity: 200 Piece
Delivery: Burj Khalifa Area, Dubai
```

### Sample Rental Order 2:
```
Project: Villa Renovation
Equipment: Formwork & Shuttering - Wall Formwork  
Quantity: 50 Square Meter
Delivery: Palm Jumeirah, Dubai
```

### Sample Rental Order 3:
```
Project: Mall Extension
Equipment: Shoring & Support - Adjustable Props
Quantity: 100 Piece
Delivery: Dubai Mall Area
```

Create multiple orders to see a fuller table!

---

**Remember**: The data flows in real-time. As soon as a customer creates a rental order, it should appear immediately in Sales Enquiries!

🚀 Good luck testing!

