# Contract Approval Navigation Fix

## Problem Statement
When an admin approves a contract in the Contract Oversight module, the approve and reject buttons were not providing proper feedback or navigation to view the created invoice in the Finance or Sales dashboards.

### Issues Identified:
1. ❌ No clear indication that an invoice was created
2. ❌ No way to navigate to Finance dashboard to view the invoice
3. ❌ No way to navigate to Sales dashboard to view the updated contract
4. ❌ Limited feedback on what happened after approval

## Solution Implemented

### Backend Changes (`rigit-main/backend/app/routers/admin.py`)

#### Enhanced Response Data
Updated the contract approval endpoint to return more detailed information:

```python
return {
    "message": "Contract approved, sent to warehouse, and invoice created",
    "invoice_id": invoice_id,
    "contract_id": contract_id,
    "sales_order_id": contract.get("sales_order_id"),
    "customer_name": contract.get("customer_name", ""),
    "total_amount": total,
    "status": "success"
}
```

**What it does:**
- Returns invoice ID for reference
- Returns contract and sales order IDs for tracking
- Returns customer name and total amount for display
- Provides success status confirmation

### Frontend Changes (`rigit-main/src/components/admin/ContractOversightModule.tsx`)

#### 1. Added Navigation Support
```typescript
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const navigate = useNavigate();
```

#### 2. Enhanced Approve Contract Handler
Implemented rich toast notifications with action buttons:

```typescript
const handleApproveContract = async (contractId: string) => {
  // ... API call ...
  
  if (response.ok) {
    const result = await response.json();
    
    // Primary toast with Finance navigation
    toast.success(
      `✅ Contract Approved! Invoice ${result.invoice_id} created and sent to warehouse. Click below to view in Finance or Sales dashboard.`,
      {
        duration: 10000,
        action: {
          label: 'View in Finance',
          onClick: () => {
            navigate('/finance');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('financeTabChange', { detail: 'invoices' }));
            }, 100);
          },
        },
      }
    );

    // Secondary toast with Sales navigation
    setTimeout(() => {
      toast.info('💼 View contract in Sales Dashboard', {
        duration: 8000,
        action: {
          label: 'Go to Sales',
          onClick: () => {
            navigate('/sales');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('salesTabChange', { detail: 'contracts' }));
            }, 100);
          },
        },
      });
    }, 500);
    
    fetchData();
  }
};
```

**Features:**
- ✅ Shows invoice ID in success message
- ✅ Provides "View in Finance" button to navigate to Finance Dashboard → Invoices tab
- ✅ Provides "Go to Sales" button to navigate to Sales Dashboard → Contracts tab
- ✅ Toast notifications stay visible for 10 seconds (Finance) and 8 seconds (Sales)
- ✅ Automatically switches to the correct tab in the target dashboard

#### 3. Enhanced Reject Contract Handler
Improved feedback for contract rejection:

```typescript
const handleRejectContract = async (contractId: string) => {
  // ... API call ...
  
  if (response.ok) {
    toast.error(
      `❌ Contract ${contractId} rejected. Sales order status reverted to approved.`,
      { duration: 5000 }
    );
    fetchData();
  }
};
```

**Features:**
- ✅ Clear rejection message with contract ID
- ✅ Explains that sales order status is reverted
- ✅ Better error handling with detailed error messages

## Workflow After Fix

### Contract Approval Flow:
1. **Admin clicks "Approve" button** on a contract in Contract Oversight
2. **Backend processes approval:**
   - Updates contract status to "active"
   - Updates sales order status to "processing"
   - Creates invoice with 5% VAT
   - Sends to warehouse for processing
3. **Frontend shows success notifications:**
   - Primary toast: "✅ Contract Approved! Invoice INV-2025-XXX created..."
   - Action button: "View in Finance" → Navigates to Finance Dashboard → Invoices tab
   - Secondary toast: "💼 View contract in Sales Dashboard"
   - Action button: "Go to Sales" → Navigates to Sales Dashboard → Contracts tab
4. **Admin can click either button to:**
   - View the newly created invoice in Finance Dashboard
   - View the approved contract in Sales Dashboard

### Contract Rejection Flow:
1. **Admin clicks "Reject" button** on a contract
2. **Backend processes rejection:**
   - Updates contract status to "rejected"
   - Reverts sales order status to "approved"
3. **Frontend shows rejection notification:**
   - Toast: "❌ Contract CNT-2025-XXX rejected. Sales order status reverted to approved."

## Navigation Mechanism

The solution uses custom events to trigger tab changes in the target dashboards:

### Finance Dashboard Navigation:
```typescript
navigate('/finance');
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('financeTabChange', { detail: 'invoices' }));
}, 100);
```

### Sales Dashboard Navigation:
```typescript
navigate('/sales');
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('salesTabChange', { detail: 'contracts' }));
}, 100);
```

These events are already handled by the respective dashboard components (`FinanceDashboard.tsx` and `SalesDashboard.tsx`).

## Testing Checklist

- [ ] Admin can approve a contract from Contract Oversight
- [ ] Success toast appears with invoice ID
- [ ] "View in Finance" button navigates to Finance Dashboard → Invoices tab
- [ ] "Go to Sales" button navigates to Sales Dashboard → Contracts tab
- [ ] Invoice appears in Finance Dashboard with correct details
- [ ] Contract status is updated in Sales Dashboard
- [ ] Admin can reject a contract
- [ ] Rejection toast appears with contract ID
- [ ] Sales order status is reverted to "approved"
- [ ] Error messages are displayed for failed operations

## Files Modified

1. **Backend:**
   - `rigit-main/backend/app/routers/admin.py` (lines 255-263)
     - Enhanced response data for contract approval

2. **Frontend:**
   - `rigit-main/src/components/admin/ContractOversightModule.tsx`
     - Added `useNavigate` hook and `ExternalLink` icon (lines 1-11)
     - Enhanced `handleApproveContract` function (lines 160-220)
     - Enhanced `handleRejectContract` function (lines 222-247)

## Benefits

✅ **Better User Experience:** Clear feedback on what happened after approval
✅ **Easy Navigation:** One-click access to view invoices and contracts
✅ **Transparency:** Shows invoice ID and explains the workflow
✅ **Error Handling:** Detailed error messages for troubleshooting
✅ **Workflow Clarity:** Users understand the complete approval process

## Future Enhancements

- Add a notification center to track all approvals and rejections
- Add email notifications to finance team when invoices are created
- Add ability to preview invoice before navigating
- Add bulk approval functionality for multiple contracts

