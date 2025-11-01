# Quotation to Admin Approval Workflow - Complete

## ✅ Workflow Implemented

**Complete Flow**: Customer Rental → Sales Enquiry → Create Quotation → Send for Approval → Admin Reviews → Approve/Reject → Sales Order

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER ROLE                               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ├─► 1. Create Rental Order
                                 │    (My Rentals Module)
                                 │    - Fill equipment details
                                 │    - Delivery info
                                 │    - Submit
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         SALES ROLE                                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ├─► 2. View Enquiries
                                 │    (Enquiries Tab)
                                 │    - See all rental orders
                                 │    - Review customer requests
                                 │
                                 ├─► 3. Create Quotation
                                 │    (Click "Create Quotation" button)
                                 │    - Tab switches to Quotations
                                 │    - Dialog opens with pre-filled data
                                 │    - Edit equipment details
                                 │    - Add pricing
                                 │    - Save quotation (Status: "draft")
                                 │
                                 ├─► 4. Send Quotation
                                 │    (Click "Send" button on quotation)
                                 │    - Status changes to "sent"
                                 │    - Quotation sent for admin approval
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN ROLE                                  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ├─► 5. Review Quotations
                                 │    (Contract Oversight → Enquiries/Quotations Tab)
                                 │    - View all quotations with status "sent"
                                 │    - Review details
                                 │    - Check pricing
                                 │
                                 ├─► 6a. APPROVE Quotation
                                 │     - Status → "approved"
                                 │     - Sales Order created automatically
                                 │     - Appears in Sales Orders tab
                                 │
                                 ├─► 6b. REJECT Quotation
                                 │     - Status → "rejected"
                                 │     - Sales team notified
                                 │     - No sales order created
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    BACK TO SALES ROLE                               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ├─► 7. View Sales Orders
                                 │    (Sales Orders Tab)
                                 │    - See approved quotations as orders
                                 │    - Check stock
                                 │    - Send to warehouse
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         WAREHOUSE ROLE                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 └─► 8. Dispatch Orders
                                      (Sales Orders Tab)
                                      - View pending orders
                                      - Prepare equipment
                                      - Mark as dispatched
```

---

## 🔧 Technical Implementation

### Backend Changes

#### 1. Sales Router (`backend/app/routers/sales.py`)

**QuotationCreate Model**:
```python
class QuotationCreate(BaseModel):
    id: str
    quotation_id: Optional[str] = None  # For compatibility
    customerName: str
    company: str
    project: str
    items: List[Dict[str, Any]]
    totalAmount: float
    status: str
    createdDate: str
    validUntil: str
    notes: str
```

**Create Quotation Endpoint**:
```python
@router.post("/quotations")
async def create_quotation(quotation_data: QuotationCreate, current_user: dict):
    """Create a new quotation"""
    - Converts quotation data to dict
    - Sets quotation_id = id if not provided
    - Adds metadata (created_at, created_by, etc.)
    - Inserts into MongoDB quotations collection
    - Status: "draft" initially
```

**Send Quotation Endpoint**:
```python
@router.put("/quotations/{quotation_id}/send")
async def send_quotation(quotation_id: str, current_user: dict):
    """Send a quotation for admin approval"""
    - Finds quotation by id or quotation_id
    - Updates status to "sent"
    - Adds sent_at timestamp
    - Records sent_by user
    - Makes quotation visible to admin
```

#### 2. Admin Router (`backend/app/routers/admin.py`)

**Get Pending Quotations**:
```python
@router.get("/quotations/pending")
async def get_pending_quotations(current_user: dict):
    """Get quotations pending admin approval"""
    - Only accessible to admin role
    - Fetches quotations with status "sent"
    - Returns list of quotations for review
```

**Approve Quotation**:
```python
@router.put("/quotations/{quotation_id}/approve")
async def approve_quotation(quotation_id: str, current_user: dict):
    """Approve a quotation and convert it to a sales order"""
    - Updates quotation status to "approved"
    - Records approval metadata
    - Creates new Sales Order automatically:
      * Generates SO-2025-XXX ID
      * Copies all quotation data
      * Links to original quotation
      * Status: "approved"
      * stock_checked: false (needs checking)
    - Returns success message
```

**Reject Quotation**:
```python
@router.put("/quotations/{quotation_id}/reject")
async def reject_quotation(quotation_id: str, current_user: dict):
    """Reject a quotation"""
    - Updates quotation status to "rejected"
    - Records rejection metadata
    - Sales team can see rejection
    - No sales order created
```

### Frontend Changes

#### 1. QuotationManagementModule (`src/components/sales/QuotationManagementModule.tsx`)

**Interface Update**:
```typescript
interface Quotation {
  id: string;
  quotation_id?: string; // Added for backend compatibility
  customerName: string;
  company: string;
  project: string;
  items: QuotationItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdDate: string;
  validUntil: string;
  notes: string;
}
```

**Create Quotation**:
```typescript
const handleCreateQuotation = () => {
  // Generate quotation ID
  const quotationId = `QT-2025-${String(quotations.length + 1).padStart(3, '0')}`;
  
  // Create quotation data
  const quotationData: Quotation = {
    id: quotationId,
    quotation_id: quotationId, // Added
    ...formData,
    items: quotationItems,
    totalAmount: calculatedTotal,
    status: 'draft',
    createdDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  
  // Save to backend
  POST /api/sales/quotations
  
  // Update enquiry status if from rental order
  if (selectedEnquiry?.is_rental_order) {
    PUT /api/sales/enquiries/${enquiry_id}/status
    body: { status: 'quotation_created' }
  }
};
```

**Send Quotation**:
```typescript
const handleSendQuotation = async (quotation: Quotation) => {
  console.log('Sending quotation:', quotation);
  
  // Send for approval
  const response = await fetch(
    `http://localhost:8000/api/sales/quotations/${quotation.id}/send`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  if (response.ok) {
    // Update local state
    setQuotations(quotations.map(q =>
      q.id === quotation.id ? { ...q, status: 'sent' } : q
    ));
    
    // Show success message
    toast({
      title: 'Quotation Sent for Approval',
      description: `Quotation ${quotation.id} has been sent to Admin for approval`
    });
  }
};
```

#### 2. ContractOversightModule (`src/components/admin/ContractOversightModule.tsx`)

**Fetch Quotations**:
```typescript
const fetchData = async () => {
  const token = localStorage.getItem('auth_token');
  
  // Fetch quotations pending approval (status: "sent")
  const response = await fetch(
    'http://localhost:8000/api/admin/quotations/pending',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  if (response.ok) {
    const data = await response.json();
    setQuotations(data);
  }
};
```

**Approve Quotation**:
```typescript
const handleApproveQuotation = async (quotationId: string) => {
  const response = await fetch(
    `http://localhost:8000/api/admin/quotations/${quotationId}/approve`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    toast.success('Quotation approved successfully and sent to Sales Orders');
    fetchData(); // Refresh list
  }
};
```

**Reject Quotation**:
```typescript
const handleRejectQuotation = async (quotationId: string) => {
  const response = await fetch(
    `http://localhost:8000/api/admin/quotations/${quotationId}/reject`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    toast.success('Quotation rejected');
    fetchData(); // Refresh list
  }
};
```

---

## 🧪 Complete Testing Guide

### Step 1: Create Rental Order (Customer)

```
1. Login as CUSTOMER
   - Email: customer@example.com
   - Password: customer123

2. Go to "My Rentals" module

3. Click "Order" button

4. Fill the form:
   - Equipment Category: Scaffolding
   - Equipment Type: Frame Scaffolding
   - Quantity: 10
   - Rental Duration: 30 days
   - Delivery Location: 123 Main St
   - Expected Delivery: [Select date]
   - Special Instructions: Handle with care

5. Click "Submit"
   ✅ Success: "Rental order created successfully"

6. Logout
```

### Step 2: View Enquiry and Create Quotation (Sales)

```
1. Login as SALES
   - Email: sales@example.com
   - Password: sales123

2. Click "Enquiries" tab

3. Verify:
   ✅ Rental order appears in the list
   ✅ Shows customer name
   ✅ Shows equipment details
   ✅ Shows delivery location

4. Click "Create Quotation" button

5. Verify:
   ✅ Tab switches to "Quotations"
   ✅ Dialog opens automatically
   ✅ Customer name pre-filled
   ✅ Project shows "Rental Order: Frame Scaffolding"
   ✅ One equipment item already added
   ✅ Special instructions filled

6. Edit quotation (optional):
   - Adjust dimensions
   - Change pricing
   - Add more items
   - Edit notes

7. Click "Create Quotation" button

8. Verify:
   ✅ Dialog closes
   ✅ New quotation appears in list
   ✅ Status: "DRAFT"
   ✅ Shows customer name
   ✅ Shows total amount
```

### Step 3: Send Quotation for Approval (Sales)

```
1. Still in Sales Quotations tab

2. Find the quotation you just created

3. Click "Send" button (paper plane icon)

4. Verify:
   ✅ Toast: "Quotation Sent for Approval"
   ✅ Status badge changes to "SENT"
   ✅ Send button becomes disabled

5. Check console (F12):
   ✅ "Sending quotation: {id: 'QT-2025-001', ...}"
   ✅ "Quotation sent successfully, updating local state"

6. Logout
```

### Step 4: Review and Approve Quotation (Admin)

```
1. Login as ADMIN
   - Email: admin@example.com
   - Password: admin123

2. Click "Contract Oversight" in sidebar

3. Verify default tab is "Enquiries / Quotations"

4. Verify:
   ✅ Quotation appears in the list
   ✅ Quote ID: QT-2025-001
   ✅ Customer name shown
   ✅ Company name shown
   ✅ Project name shown
   ✅ Total Amount displayed
   ✅ Status: "SENT"
   ✅ Valid Until date shown

5. Click "View" button

6. Review quotation details in dialog:
   ✅ Customer information correct
   ✅ Equipment items listed
   ✅ Pricing details shown
   ✅ Total amount matches

7. Close dialog

8. Click "Approve" button (green checkmark)

9. Verify:
   ✅ Toast: "Quotation approved successfully and sent to Sales Orders"
   ✅ Quotation disappears from list
   ✅ (It now has status "approved")

10. Click "Sales Orders" tab

11. Verify:
    ✅ New sales order created
    ✅ SO ID: SO-2025-001
    ✅ Customer name matches
    ✅ Amount matches quotation
    ✅ Stock Status: "Not Checked"
    ✅ Status: "APPROVED"
```

### Step 5: Verify Sales Order Created (Sales)

```
1. Logout from Admin

2. Login as SALES again

3. Click "Sales Orders" tab

4. Verify:
   ✅ Sales order appears (SO-2025-001)
   ✅ Customer name shown
   ✅ Project name shown
   ✅ Amount matches quotation
   ✅ "Check Stock" button available
   ✅ Status: "APPROVED"
```

### Step 6: Test Rejection Flow (Optional)

```
1. As SALES:
   - Create another quotation
   - Click "Send" button
   - Logout

2. As ADMIN:
   - Go to Contract Oversight
   - See new quotation in list
   - Click "Reject" button (red X)

3. Verify:
   ✅ Toast: "Quotation rejected"
   ✅ Quotation disappears from pending list
   ✅ Status changed to "rejected"
   ✅ No sales order created

4. As SALES:
   - Check Quotations tab
   - Find the rejected quotation
   - Status should show "REJECTED"
```

---

## 📊 Data Flow

### Quotation Status Lifecycle

```
draft → sent → approved → sales_order_created
          ↓
       rejected
```

### Database Collections

1. **quotations** collection:
```json
{
  "_id": ObjectId("..."),
  "id": "QT-2025-001",
  "quotation_id": "QT-2025-001",
  "customerName": "John Doe",
  "company": "John Doe",
  "project": "Rental Order: Frame Scaffolding",
  "items": [
    {
      "id": "1",
      "equipment": "Frame Scaffolding",
      "length": 10,
      "breadth": 5,
      "sqft": 50,
      "ratePerSqft": 25,
      "subtotal": 1250,
      "wastageCharges": 50,
      "cuttingCharges": 25,
      "total": 1325
    }
  ],
  "totalAmount": 1325,
  "status": "sent",
  "createdDate": "2025-01-15",
  "validUntil": "2025-01-25",
  "notes": "Handle with care",
  "created_at": "2025-01-15T10:30:00",
  "updated_at": "2025-01-15T10:35:00",
  "created_by": "sales_user_id",
  "sent_at": "2025-01-15T10:35:00",
  "sent_by": "sales_user_id"
}
```

2. **sales_orders** collection (after approval):
```json
{
  "_id": ObjectId("..."),
  "sales_order_id": "SO-2025-001",
  "quotation_id": "QT-2025-001",
  "customer_name": "John Doe",
  "company": "John Doe",
  "project": "Rental Order: Frame Scaffolding",
  "total_amount": 1325,
  "items": [...],
  "status": "approved",
  "stock_checked": false,
  "stock_available": false,
  "created_at": "2025-01-15T10:40:00",
  "updated_at": "2025-01-15T10:40:00",
  "created_by": "admin_user_id",
  "enquiry_id": "RC-2025-001",
  "rental_id": "rental_doc_id"
}
```

---

## 🎯 Key Features

### ✅ Quotation Creation
- Pre-filled from rental order
- Customizable pricing
- Multiple equipment items
- Special instructions included

### ✅ Approval Workflow
- Sales team sends quotations
- Admin reviews and decides
- Clear status tracking
- Automatic sales order generation

### ✅ Status Tracking
- Draft: Being prepared
- Sent: Awaiting admin approval
- Approved: Converted to sales order
- Rejected: Not approved

### ✅ Data Consistency
- Quotation ID preserved in sales order
- Link to original rental/enquiry
- Metadata tracked (created_by, sent_by, approved_by)
- Timestamps for all actions

---

## 🐛 Troubleshooting

### Issue 1: Quotations not appearing in Admin

**Check**:
```
1. Quotation status is "sent" (not "draft")
2. Admin endpoint returns data:
   - Open browser console
   - Network tab
   - Filter: /admin/quotations/pending
   - Response shows quotations array

3. Backend logs show query:
   - Check terminal running uvicorn
   - Look for: "Fetching quotations with status: sent"
```

**Fix**:
```
- Ensure Send button was clicked
- Hard refresh admin page (Ctrl+Shift+R)
- Check authentication token is valid
```

### Issue 2: Send button not working

**Check Console**:
```javascript
// Should see:
Sending quotation: {id: "QT-2025-001", ...}
Quotation sent successfully, updating local state
```

**Check Network**:
```
- PUT /api/sales/quotations/QT-2025-001/send
- Status: 200 OK
- Response: {"message": "Quotation sent for approval successfully"}
```

**Fix**:
```
- Verify backend is running
- Check quotation has valid id
- Ensure auth token is present
```

### Issue 3: Approve button doesn't create sales order

**Check Backend Logs**:
```
- Should see: "Quotation approved and sales order created"
- Should see: Sales Order ID generated (SO-2025-XXX)
```

**Check MongoDB**:
```javascript
// In MongoDB Compass or shell
db.sales_orders.find({quotation_id: "QT-2025-001"})
// Should return 1 document
```

**Fix**:
```
- Check admin role is correct
- Verify quotation exists in DB
- Check MongoDB connection
```

---

## 🎉 Success Indicators

You know the workflow is complete when:

1. ✅ Customer creates rental order
2. ✅ Sales sees it in Enquiries
3. ✅ Sales creates quotation (status: draft)
4. ✅ Sales sends quotation (status: sent)
5. ✅ Admin sees quotation in Contract Oversight
6. ✅ Admin approves quotation
7. ✅ Sales Order created automatically
8. ✅ Sales sees sales order in Sales Orders tab
9. ✅ All statuses update correctly
10. ✅ Data consistency maintained

---

## 📝 Files Modified

### Backend:
1. ✅ `backend/app/routers/sales.py`
   - Updated QuotationCreate model
   - Enhanced create_quotation endpoint
   - Improved send_quotation endpoint
   - Added logging

2. ✅ `backend/app/routers/admin.py`
   - Already had approval endpoints (no changes)

### Frontend:
1. ✅ `src/components/sales/QuotationManagementModule.tsx`
   - Updated Quotation interface
   - Enhanced handleCreateQuotation
   - Improved handleSendQuotation
   - Added console logging

2. ✅ `src/components/admin/ContractOversightModule.tsx`
   - Already had approval UI (no changes)

---

## 🚀 What's Next?

After approval, the workflow continues:

```
Sales Order (Approved)
        ↓
Sales Checks Stock
        ↓
Sales Sends to Warehouse
        ↓
Warehouse Dispatches Order
        ↓
Customer Receives Equipment
```

**All steps from Rental to Admin Approval are now complete!** 🎊

---

**Test the complete flow now!** Create a rental as customer, then follow it through sales quotation creation, sending for approval, and admin approval! 🚀


