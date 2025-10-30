# Contract Approval Workflow Fix

## Issue
The approve button in the Admin's Contract tab was not working properly. When contracts were approved, they were not:
1. Appearing in the Sales dashboard for dispatch to warehouse
2. Creating invoices for the Finance team to track income

## Root Cause
The frontend was calling the wrong backend API endpoint that didn't include the full workflow logic:
- **Wrong endpoint**: `POST /api/contracts/{id}/approve` (basic approval only)
- **Correct endpoint**: `PUT /api/admin/contracts/{contract_id}/approve` (full workflow)

Additionally, contracts created from sales orders were missing the `approval_status` field that the frontend checks.

## Changes Made

### Frontend Changes

#### File: `rigit-main/src/components/admin/ContractsModule.tsx`

1. **Fixed `handleApproveContract` function** (Line 274-307):
   - Changed endpoint from `/api/contracts/${contract.id}/approve` to `/api/admin/contracts/${contractId}/approve`
   - Changed HTTP method from `POST` to `PUT`
   - Updated to use `contract_id` instead of MongoDB `_id`
   - Enhanced success message to inform about invoice creation and warehouse dispatch

2. **Fixed `handleRejectContract` function** (Line 309-341):
   - Changed endpoint from `/api/contracts/${contract.id}/reject` to `/api/admin/contracts/${contractId}/reject`
   - Changed HTTP method from `POST` to `PUT`
   - Updated to use `contract_id` instead of MongoDB `_id`

### Backend Changes

#### File: `rigit-main/backend/app/routers/sales.py`

**Enhanced contract creation** (Line 381-402):
- Added `approval_status: "pending"` field (required for frontend filtering)
- Added `customer` field for consistency with other parts of the system
- Added `equipment` field with equipment names from line items
- Added `amount` field for consistency
- Added `start_date` and `end_date` fields (1-year default duration)

## Workflow After Fix

### 1. Sales Creates Contract Request
- Sales team creates a sales order from a quotation
- Sales team clicks "Create Contract" button
- Contract is created with `approval_status: "pending"`
- Contract appears in Admin's Contract tab for approval

### 2. Admin Approves Contract
- Admin reviews the contract in the Contracts tab
- Admin clicks the ✅ approve button
- **Backend processes**:
  - Updates contract: `status: "active"`, `approval_status: "approved"`
  - Updates sales order: `status: "processing"`, marks as sent to warehouse
  - Creates invoice for finance with 5% VAT calculation
- **User sees**:
  - Success message with invoice ID
  - Information that order is sent to warehouse

### 3. Sales Dashboard - Contracts Tab
- Sales team can view all contracts including approved ones
- Approved contracts show status badges:
  - Approval Status: "approved" (green)
  - Status: "active" (blue)
- No approve/reject buttons shown for already-approved contracts

### 4. Warehouse Dashboard - Sales Orders Tab
- Warehouse team sees the approved order with `status: "processing"`
- Order shows in "Pending Dispatch" section
- Warehouse can dispatch the equipment using the "Dispatch" button

### 5. Finance Dashboard - Invoices Tab
- Finance team sees the auto-created invoice
- Invoice includes:
  - Invoice ID (e.g., INV-2025-001)
  - Contract ID reference
  - Customer details
  - Base amount
  - VAT (5% for AED currency)
  - Total amount
  - Due date (30 days from creation)
  - Status: "pending"
- Finance can track income and payment status

## API Endpoints Used

### Contract Approval
```
PUT /api/admin/contracts/{contract_id}/approve
Authorization: Bearer {token}
```

**Response**:
```json
{
  "message": "Contract approved, sent to warehouse, and invoice created",
  "invoice_id": "INV-2025-001",
  "contract_id": "CNT-2025-001",
  "sales_order_id": "SO-2025-001",
  "customer_name": "Customer Name",
  "total_amount": 52500.00,
  "status": "success"
}
```

### Sales Orders for Warehouse
```
GET /api/warehouse/sales-orders
Authorization: Bearer {token}
```

Returns all sales orders with `status: "processing"` ready for dispatch.

### Finance Invoices
```
GET /api/finance/invoices
Authorization: Bearer {token}
```

Returns all invoices including those auto-created from approved contracts.

## Testing the Fix

1. **Login as Sales User**
   - Go to Sales Dashboard → Sales Orders tab
   - Create a sales order from a quotation
   - Click "Create Contract" button
   - Verify contract request is created

2. **Login as Admin User**
   - Go to Admin Dashboard → Contracts tab
   - Find the pending contract (Approval Status: "pending")
   - Click the ✅ approve button
   - Verify success message appears with invoice ID

3. **Login as Sales User**
   - Go to Sales Dashboard → Contracts tab
   - Verify the approved contract appears with:
     - Approval Status: "approved"
     - Status: "active"
   - No approve/reject buttons should be visible

4. **Login as Warehouse User**
   - Go to Warehouse Dashboard → Sales Orders tab
   - Verify the approved order appears with status "PROCESSING"
   - Dispatch button should be enabled

5. **Login as Finance User**
   - Go to Finance Dashboard → Invoices tab
   - Verify the auto-created invoice appears
   - Check all fields are populated correctly
   - Verify VAT is calculated (5% for AED)

## Database Schema Updates

### Contracts Collection
Contracts now include these fields when created:
- `contract_id`: Human-readable ID (e.g., CNT-2025-001)
- `approval_status`: "pending" | "approved" | "rejected"
- `status`: "pending_approval" | "active" | "rejected"
- `customer`: Customer name (for display)
- `customer_name`: Customer name (for consistency)
- `equipment`: Comma-separated equipment names
- `amount`: Contract amount (copy of total_amount)
- `total_amount`: Contract total amount
- `start_date`: Contract start date (ISO format)
- `end_date`: Contract end date (ISO format, default +365 days)

### Sales Orders Collection
When contract is approved, sales order is updated:
- `status`: Changed to "processing"
- `contract_approved_at`: Timestamp of approval
- `sent_to_warehouse_at`: Timestamp when sent to warehouse

### Invoices Collection
New invoice is created with:
- `invoice_id`: Human-readable ID (e.g., INV-2025-001)
- `contract_id`: Reference to contract
- `sales_order_id`: Reference to sales order
- `customer_name`: Customer name
- `company`: Company name
- `project`: Project name
- `amount`: Base amount
- `vat`: VAT amount (amount * 0.05)
- `vat_rate`: VAT rate (5)
- `total`: Total amount (amount + vat)
- `currency`: "AED"
- `status`: "pending"
- `due_date`: 30 days from creation
- `created_at`, `created_by`, `updated_at`: Audit fields

## Notes
- The fix ensures proper data flow between Sales → Admin → Warehouse → Finance
- All role dashboards now properly display approved contracts and related data
- Invoice creation is automatic upon contract approval
- VAT calculation is standardized at 5% for AED currency
- Contracts default to 1-year duration when created from sales orders

