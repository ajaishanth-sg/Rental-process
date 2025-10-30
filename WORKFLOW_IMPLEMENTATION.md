# Complete Workflow Implementation Guide

## Overview
This document describes the complete end-to-end workflow implementation for the Rigit Control Hub application, connecting rental orders from customer dashboard through to warehouse dispatch.

## Workflow Steps

### 1. **Customer Creates Rental Order** (Customer Dashboard)
**Location**: Customer Dashboard → Rentals Module

- Customer logs in to their dashboard
- Navigates to "My Rentals" tab
- Clicks "Order" button to create a new rental request
- Fills out the rental order form with:
  - Project Information (name, type)
  - Equipment Details (category, type, quantity, unit)
  - Rental Period (start/end dates)
  - Delivery Information (address)
  - Contact Information (person, phone, email)
  - Special Requirements
- Submits the order
- **Status**: `pending_approval`
- **Database**: Stored in `rentals` collection

### 2. **Sales Team Views Enquiries** (Sales Dashboard)
**Location**: Sales Dashboard → Enquiries Tab

- Sales representative logs in
- Views all rental orders (enquiries) in the Enquiries Management Module
- Rental orders are automatically converted to enquiry format
- Sales can:
  - View detailed information about each rental order
  - Click "Create Quotation" to convert enquiry to quotation

### 3. **Sales Creates Quotation** (Sales Dashboard)
**Location**: Sales Dashboard → Quotations Tab

- Sales clicks "Create Quotation" from enquiry
- Quotation form auto-fills with customer and project details
- Sales adds:
  - Equipment items with dimensions (length, breadth)
  - Rate per square foot
  - Wastage and cutting charges
  - Additional notes
- System calculates totals automatically
- Saves quotation as **Draft**
- **Database**: Stored in `quotations` collection with reference to rental_id

### 4. **Sales Sends Quotation** (Sales Dashboard)
**Location**: Sales Dashboard → Quotations Tab

- Sales reviews draft quotation
- Clicks "Send" button
- **Status**: Changes from `draft` to `sent`
- Quotation is now visible to Admin for approval
- **Database**: `quotations.status` updated to `sent`

### 5. **Admin Approves Quotation** (Admin Dashboard)
**Location**: Admin Dashboard → Contract Oversight → Enquiries/Quotations Tab

- Admin logs in
- Views all quotations with status `sent`
- Reviews quotation details:
  - Customer information
  - Project details
  - Total amount
  - Equipment items
- Admin can:
  - **Approve**: Creates a sales order automatically
  - **Reject**: Returns to sales with rejected status

**On Approval**:
- **Quotation Status**: Changes to `approved`
- **Sales Order Created**: Automatically generated with unique SO ID
- **Status**: `approved`
- **Database**: 
  - `quotations.status` → `approved`
  - New document in `sales_orders` collection

### 6. **Sales Order Management** (Sales Dashboard)
**Location**: Sales Dashboard → Sales Orders Tab

- Sales views approved sales orders
- For each order, sales must:
  1. **Check Stock**: Click "Check Stock" button
     - System checks inventory availability
     - Updates `stock_checked` and `stock_available` flags
  2. **Send to Warehouse**: Click "Send to Warehouse" button
     - Only available after stock is checked
     - **Status**: Changes to `processing`

### 7. **Warehouse Processing** (Warehouse Dashboard)
**Location**: Warehouse Dashboard → Sales Orders Tab

- Warehouse staff logs in
- Views all sales orders with status `processing`
- Reviews order details:
  - Customer information
  - Project name
  - Equipment items
  - Stock availability status
- Clicks "Dispatch" button when ready
- **Status**: Changes to `completed`
- **Database**: `sales_orders.status` → `completed`, `dispatched_at` timestamp added

## Database Collections

### 1. **rentals**
```javascript
{
  _id: ObjectId,
  contract_number: "RC-2025-001",
  customer_id: "user_id",
  customer_name: "John Doe",
  customer_email: "john@example.com",
  project_name: "Downtown Tower",
  project_type: "commercial",
  equipment_category: "scaffolding",
  equipment_type: "frame-scaffolding",
  quantity: 100,
  unit: "piece",
  start_date: "2025-01-15",
  end_date: "2025-03-15",
  delivery_address: "123 Main St",
  contact_person: "John Doe",
  contact_phone: "+1234567890",
  contact_email: "john@example.com",
  special_requirements: "Deliver before 8 AM",
  status: "pending_approval",
  total_amount: 0,
  created_at: "2025-01-01T10:00:00Z",
  updated_at: "2025-01-01T10:00:00Z"
}
```

### 2. **quotations**
```javascript
{
  _id: ObjectId,
  quotation_id: "QT-2025-001",
  customerName: "John Doe",
  company: "ABC Construction",
  project: "Downtown Tower",
  items: [
    {
      id: "1",
      equipment: "Frame Scaffolding",
      length: 10,
      breadth: 5,
      sqft: 50,
      ratePerSqft: 25,
      subtotal: 1250,
      wastageCharges: 50,
      cuttingCharges: 25,
      total: 1325
    }
  ],
  totalAmount: 1325,
  status: "sent",
  createdDate: "2025-01-02",
  validUntil: "2025-01-12",
  notes: "Standard rental terms apply",
  enquiry_id: "RC-2025-001",
  rental_id: "rental_mongodb_id",
  created_at: "2025-01-02T10:00:00Z",
  updated_at: "2025-01-02T10:00:00Z",
  created_by: "sales_user_id"
}
```

### 3. **sales_orders**
```javascript
{
  _id: ObjectId,
  sales_order_id: "SO-2025-001",
  quotation_id: "QT-2025-001",
  customer_id: "user_id",
  customer_name: "John Doe",
  company: "ABC Construction",
  project: "Downtown Tower",
  items: [...],
  total_amount: 1325,
  status: "processing",
  stock_checked: true,
  stock_available: true,
  delivery_address: "123 Main St",
  contact_person: "John Doe",
  contact_phone: "+1234567890",
  contact_email: "john@example.com",
  enquiry_id: "RC-2025-001",
  rental_id: "rental_mongodb_id",
  created_at: "2025-01-03T10:00:00Z",
  updated_at: "2025-01-03T14:00:00Z",
  created_by: "admin_user_id",
  sent_to_warehouse_at: "2025-01-03T14:00:00Z"
}
```

## API Endpoints

### Rentals
- `POST /api/rentals/` - Create rental order (Customer)
- `GET /api/rentals/` - Get rental orders (Customer/Sales)

### Sales
- `GET /api/sales/enquiries` - Get enquiries from rental orders (Sales)
- `POST /api/sales/quotations` - Create quotation (Sales)
- `PUT /api/sales/quotations/{id}/send` - Send quotation for approval (Sales)
- `GET /api/sales/orders` - Get sales orders (Sales)
- `PUT /api/sales/orders/{id}/check-stock` - Check stock availability (Sales)
- `PUT /api/sales/orders/{id}/send-to-warehouse` - Send to warehouse (Sales)

### Admin
- `GET /api/admin/quotations/pending` - Get pending quotations (Admin)
- `PUT /api/admin/quotations/{id}/approve` - Approve quotation (Admin)
- `PUT /api/admin/quotations/{id}/reject` - Reject quotation (Admin)
- `GET /api/admin/sales-orders/pending` - Get pending sales orders (Admin)

### Warehouse
- `GET /api/warehouse/sales-orders` - Get orders for dispatch (Warehouse)
- `PUT /api/warehouse/sales-orders/{id}/dispatch` - Mark as dispatched (Warehouse)

## Status Flow

### Rental Order Status
1. `pending_approval` → Initial state when customer creates order
2. (Converted to enquiry/quotation in sales)

### Quotation Status
1. `draft` → Initial state when created
2. `sent` → After sales sends for approval
3. `approved` → After admin approves (creates sales order)
4. `rejected` → After admin rejects

### Sales Order Status
1. `approved` → Initial state after quotation approval
2. `draft` → Can be created manually
3. `processing` → After sent to warehouse
4. `completed` → After warehouse dispatches

## User Roles and Access

### Customer
- Create rental orders
- View their rental orders
- Extend rental periods

### Sales
- View all rental orders as enquiries
- Create quotations from enquiries
- Send quotations for approval
- Manage sales orders
- Check stock availability
- Send orders to warehouse

### Admin
- View pending quotations
- Approve/reject quotations
- View sales orders overview
- Access all system modules

### Warehouse
- View sales orders pending dispatch
- Check stock levels
- Dispatch orders
- Manage inventory

## Frontend Components

### Customer
- `src/components/customer/RentalsModule.tsx` - Rental order creation and management

### Sales
- `src/components/sales/EnquiryManagementModule.tsx` - View rental orders as enquiries
- `src/components/sales/QuotationManagementModule.tsx` - Create and manage quotations
- `src/components/sales/SalesOrderManagementModule.tsx` - Manage sales orders

### Admin
- `src/components/admin/ContractOversightModule.tsx` - Approve/reject quotations

### Warehouse
- `src/components/admin/WarehouseOrdersModule.tsx` - Process and dispatch orders

## Backend Models

### Quotation Model
- `backend/app/models/quotation.py` - Quotation data structure and validation

### Sales Order Model
- `backend/app/models/sales_order.py` - Sales order data structure and validation

## Running the Application

### Backend (Port 8000)
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Port 3000)
```bash
npm run dev
```

### Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Testing the Workflow

1. **Login as Customer** → Create a rental order
2. **Login as Sales** → View enquiry, create quotation, send for approval
3. **Login as Admin** → Approve quotation (creates sales order)
4. **Login as Sales** → Check stock, send to warehouse
5. **Login as Warehouse** → View and dispatch order

## Notes

- All workflows are connected through the rental_id and enquiry_id references
- Database connections are maintained through MongoDB
- Real-time updates can be achieved through polling or WebSocket implementation
- Stock checking is currently simulated but can be connected to actual inventory system
- Email notifications can be added at key workflow stages

