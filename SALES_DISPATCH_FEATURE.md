# Sales Send to Warehouse Feature

## Overview
Modified the Contracts tab in the Sales Dashboard to replace the edit button with a "Send to Warehouse" button for approved contracts. This allows sales team to directly send approved contracts to the warehouse for processing.

## Changes Made

### File: `rigit-main/src/components/admin/ContractsModule.tsx`

#### 1. Added Role-Based UI
- Imported `useAuth` hook to get current user role
- Added `Truck` icon for dispatch button
- Added `sales_order_id` field to Contract interface

#### 2. New Function: `handleDispatchToWarehouse`
```typescript
const handleDispatchToWarehouse = async (contract: Contract) => {
  // Dispatches the sales order associated with the contract to warehouse
  // Calls: PUT /api/warehouse/sales-orders/{salesOrderId}/dispatch
}
```

#### 3. Role-Based Button Display

**For Admin Users:**
- Shows "Approve" and "Reject" buttons for pending contracts
- Shows "Edit" and "Delete" buttons for all contracts
- Shows "New Contract" button in header
- Shows both "Contracts" and "Enquires" tabs

**For Sales Users:**
- Shows "Send to Warehouse" button only for approved & active contracts
- Hides "Edit" and "Delete" buttons
- Hides "New Contract" button (contracts created via sales orders workflow)
- Shows only "Contracts" tab (no enquires tab)

#### 4. Updated Page Headers
- **Admin**: "Contract Oversight" - Approve/reject contracts, monitor renewals
- **Sales**: "Contracts Management" - View approved contracts and send to warehouse

## User Interface Changes

### Sales Dashboard - Contracts Tab

#### Before:
```
Contract ID | Customer | Project | Equipment | ... | Status | Actions
CNT-001     | ABC Co   | Proj 1  | Excavator | ... | active | [Edit] [Delete]
```

#### After:
```
Contract ID | Customer | Project | Equipment | ... | Status | Actions
CNT-001     | ABC Co   | Proj 1  | Excavator | ... | active | [🚛 Send to Warehouse]
```

### Button Visibility Rules

| Contract Status      | Approval Status | Admin Buttons                    | Sales Buttons              |
|---------------------|----------------|----------------------------------|----------------------------|
| pending_approval    | pending        | Approve, Reject, Edit, Delete    | (View only)                |
| active              | approved       | Edit, Delete                     | Send to Warehouse          |
| completed           | approved       | Edit, Delete                     | (View only)                |
| rejected            | rejected       | Edit, Delete                     | (View only)                |

## Workflow

### Complete Sales to Warehouse Flow

1. **Sales Team** (Sales Dashboard)
   - Navigate to: Sales Orders tab
   - Create sales order from quotation
   - Click "Create Contract" button
   - Contract created with status: `pending` approval

2. **Admin Team** (Admin Dashboard)
   - Navigate to: Contracts tab
   - See pending contract
   - Click ✅ "Approve" button
   - System automatically:
     - Sets contract status to `active`
     - Sets approval_status to `approved`
     - Creates invoice for finance
     - Updates sales order to `processing` status

3. **Sales Team** (Sales Dashboard)
   - Navigate to: Contracts tab
   - See approved contract with "Send to Warehouse" button
   - Click 🚛 "Send to Warehouse"
   - Sales order is sent to warehouse for processing

4. **Warehouse Team** (Warehouse Dashboard)
   - Navigate to: Sales Orders tab
   - See dispatched order with status `processing`
   - Process and fulfill the order
   - Click "Dispatch" to complete

5. **Finance Team** (Finance Dashboard)
   - Navigate to: Invoices tab
   - See auto-generated invoice
   - Track payments and income

## API Endpoints Used

### Dispatch to Warehouse
```
PUT /api/warehouse/sales-orders/{sales_order_id}/dispatch
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Order dispatched successfully",
  "sales_order_id": "SO-2025-001",
  "status": "dispatched"
}
```

### Get Contracts (Sales View)
```
GET /api/sales/contracts
Authorization: Bearer {token}
```

Returns all contracts including approved ones visible to sales team.

## Testing Instructions

### Test 1: Sales User View
1. Login as a **sales** user
2. Go to Sales Dashboard → Contracts tab
3. **Verify:**
   - ✅ Page title is "Contracts Management"
   - ✅ No "New Contract" button visible
   - ✅ Only "Contracts" tab visible (no Enquires tab)
   - ✅ Approved contracts show "Send to Warehouse" button
   - ✅ Pending contracts have no action buttons (view only)
   - ✅ No Edit or Delete buttons visible

### Test 2: Admin User View
1. Login as an **admin** user
2. Go to Admin Dashboard → Contracts tab
3. **Verify:**
   - ✅ Page title is "Contract Oversight"
   - ✅ "New Contract" button visible
   - ✅ Both "Contracts" and "Enquires" tabs visible
   - ✅ Pending contracts show Approve/Reject buttons
   - ✅ All contracts show Edit and Delete buttons
   - ✅ No "Send to Warehouse" button visible

### Test 3: Send to Warehouse
1. Login as **sales** user
2. Find an approved contract (approval_status: "approved", status: "active")
3. Click "Send to Warehouse" button
4. **Verify:**
   - ✅ Success toast message appears
   - ✅ Message says "Sent to warehouse for processing"
5. Login as **warehouse** user
6. Go to Warehouse Dashboard → Sales Orders tab
7. **Verify:**
   - ✅ Order appears in the list
   - ✅ Order status is "PROCESSING"
   - ✅ "Dispatch" button is enabled

### Test 4: Complete Workflow
1. **Sales**: Create sales order from quotation
2. **Sales**: Create contract from sales order → Status: pending
3. **Admin**: Approve contract → Status: approved, active
4. **Sales**: Click "Send to Warehouse"
5. **Warehouse**: See order in Sales Orders tab
6. **Finance**: See auto-created invoice in Invoices tab
7. **Verify all steps complete successfully**

## Error Handling

### Missing Sales Order ID
If a contract doesn't have an associated sales order:
```
Error: No sales order associated with this contract
```

### API Failures
- Network errors show: "Failed to send to warehouse. Please check your connection."
- Server errors show the specific error message from backend

### Permission Issues
- Only sales and admin users can view contracts
- Only warehouse users can process sent orders
- Auth token required for all operations

## Database Schema

### Contracts Collection
When dispatch to warehouse is triggered, the associated sales order is updated:

```javascript
{
  sales_order_id: "SO-2025-001",
  status: "dispatched", // or "processing" depending on backend implementation
  dispatched_at: "2025-10-30T10:30:00Z",
  dispatched_by: "sales_user_id"
}
```

## Benefits

1. **Clear Separation of Duties**
   - Admin: Approve/reject contracts
   - Sales: Send approved contracts to warehouse
   - Warehouse: Process sent orders

2. **Streamlined Workflow**
   - Sales can directly send contracts to warehouse without admin intervention
   - Reduces bottlenecks in order processing

3. **Better User Experience**
   - Role-appropriate buttons and actions
   - Clear visual indicators of contract status

4. **Audit Trail**
   - Track who sent each order to warehouse
   - Timestamp for send actions

## Future Enhancements

1. **Bulk Send**
   - Select multiple contracts
   - Send all to warehouse at once

2. **Send Notes**
   - Add special instructions when sending to warehouse
   - Attach documents or files

3. **Send Scheduling**
   - Schedule send for future date
   - Set priority levels

4. **Notifications**
   - Email/SMS to warehouse when order is sent
   - Real-time dashboard updates

5. **Send History**
   - View all send to warehouse actions
   - Filter by date, user, status

