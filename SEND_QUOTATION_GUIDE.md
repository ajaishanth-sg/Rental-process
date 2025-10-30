# How to Send Quotations to Admin - Complete Guide

## 🎯 The Issue

You created a quotation but it didn't appear in the Admin dashboard. This is because:

1. ✅ Quotations are created with status **"draft"**
2. ❌ Admin only sees quotations with status **"sent"**
3. ✅ You must click the **"Send" button** to change status from "draft" to "sent"

---

## 🔄 Correct Workflow

```
SALES ROLE:
1. Create Quotation → Status: "draft" (only visible to sales)
                ↓
2. Click "Send" button → Status: "sent" (now visible to admin)
                ↓
ADMIN ROLE:
3. Admin sees quotation in Contract Oversight
4. Admin clicks "Approve" or "Reject"
```

---

## 📋 Step-by-Step Instructions

### Step 1: Create a Quotation (Sales)

```
1. Login as SALES
2. Go to "Enquiries" tab
3. Click "Create Quotation" on any enquiry
4. Fill quotation details
5. Click "Create Quotation" button
```

**What happens:**
- ✅ Quotation saved to database
- ✅ Status: "draft"
- ✅ Appears in Quotations list
- ✅ Toast: "Quotation created successfully. Click 'Send' to submit for admin approval."

### Step 2: Send Quotation for Approval (Sales)

```
1. Stay in Sales Dashboard
2. Click "Quotations" tab (if not already there)
3. Find your newly created quotation in the list
4. Look at the "Actions" column
5. Click the "Send" button (📤 paper plane icon)
```

**What happens:**
- ✅ API call to `/api/sales/quotations/{id}/send`
- ✅ Status changes from "draft" to "sent"
- ✅ Badge updates to show "SENT"
- ✅ Toast: "Quotation sent to Admin Contract Oversight for approval"
- ✅ Send button becomes disabled (can only send once)

**Console logs you should see:**
```javascript
Sending quotation: {id: "QT-2025-001", status: "draft", ...}
Quotation sent successfully, refreshing list
Fetching quotations from backend...
Fetched quotations: [{id: "QT-2025-001", status: "sent", ...}]
```

### Step 3: View in Admin (Admin)

```
1. Logout from Sales
2. Login as ADMIN
3. Click "Contract Oversight" in sidebar
4. Go to "Enquiries / Quotations" tab
```

**What you should see:**
- ✅ Your quotation appears in the list
- ✅ Quote ID: QT-2025-001
- ✅ Customer name
- ✅ Total amount
- ✅ Status badge: "SENT"
- ✅ "Approve" button (green checkmark)
- ✅ "Reject" button (red X)

---

## 🔍 Visual Guide

### Quotations Table (Sales)

```
┌────────────┬──────────┬─────────┬────────┬────────┬───────────┬─────────────┐
│ Quote ID   │ Customer │ Project │ Amount │ Status │ Valid     │ Actions     │
├────────────┼──────────┼─────────┼────────┼────────┼───────────┼─────────────┤
│ QT-2025-001│ John Doe │ Rental  │ $1,325 │ DRAFT  │ 2025-01-25│ [PDF] [Send]│
│            │          │ Order   │        │        │           │     [Edit]  │
└────────────┴──────────┴─────────┴────────┴────────┴───────────┴─────────────┘

After clicking Send button:

┌────────────┬──────────┬─────────┬────────┬────────┬───────────┬─────────────┐
│ Quote ID   │ Customer │ Project │ Amount │ Status │ Valid     │ Actions     │
├────────────┼──────────┼─────────┼────────┼────────┼───────────┼─────────────┤
│ QT-2025-001│ John Doe │ Rental  │ $1,325 │ SENT   │ 2025-01-25│ [PDF] [Send]│
│            │          │ Order   │        │ ✅     │           │   (disabled)│
│            │          │         │        │        │           │     [Edit]  │
└────────────┴──────────┴─────────┴────────┴────────┴───────────┴─────────────┘
```

---

## 🔧 What I Fixed

### 1. Added Fetch Quotations on Load
**Problem**: Quotations were stored in memory only, lost on refresh
**Fix**: Now fetches from backend on component mount

```typescript
const fetchQuotations = async () => {
  const response = await fetch('http://localhost:8000/api/sales/quotations', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setQuotations(data);
};

useEffect(() => {
  fetchQuotations();
}, []);
```

### 2. Refresh After Create
**Problem**: New quotations didn't appear immediately
**Fix**: Refresh list after successful creation

```typescript
if (response.ok) {
  await fetchQuotations(); // Refresh from backend
  toast({
    title: 'Success',
    description: 'Quotation created. Click "Send" to submit for admin approval.'
  });
}
```

### 3. Refresh After Send
**Problem**: Status didn't update in UI
**Fix**: Refresh list after sending

```typescript
if (response.ok) {
  await fetchQuotations(); // Get updated status
  toast({
    title: 'Quotation Sent for Approval',
    description: 'Quotation sent to Admin Contract Oversight'
  });
}
```

### 4. Added Loading States
**Problem**: No feedback while loading
**Fix**: Show loading message and empty state

```typescript
{loading ? (
  <p>Loading quotations...</p>
) : quotations.length === 0 ? (
  <p>No quotations yet</p>
) : (
  <Table>...</Table>
)}
```

### 5. Better User Messages
**Problem**: Users didn't know to click Send
**Fix**: Clear instructions in toast and description

```
- "Quotation created. Click 'Send' to submit for admin approval."
- "Manage quotations and track their approval status. Click 'Send' to submit for admin approval."
```

---

## 🧪 Testing Now

### Test 1: Verify Existing Quotations

```
1. Hard refresh browser (Ctrl+Shift+R)
2. Login as SALES
3. Go to Quotations tab
4. Open F12 Console
```

**Expected logs:**
```
Fetching quotations from backend...
Fetched quotations: [...]
```

**If you see quotations:**
- ✅ Check their status badges
- ✅ If status is "DRAFT", click "Send" button
- ✅ Verify status changes to "SENT"

**If no quotations:**
- ✅ Create a new one from Enquiries tab

### Test 2: Create and Send New Quotation

```
1. Sales → Enquiries tab
2. Click "Create Quotation" on any enquiry
3. Fill form and click "Create Quotation"
4. Verify toast: "Quotation created. Click 'Send'..."
5. Go to Quotations tab
6. Find new quotation (status: DRAFT)
7. Click "Send" button
8. Verify:
   ✅ Toast: "Quotation Sent for Approval"
   ✅ Status badge changes to "SENT"
   ✅ Send button becomes disabled
```

### Test 3: Verify in Admin

```
1. Logout from Sales
2. Login as Admin
3. Go to Contract Oversight
4. Click "Enquiries / Quotations" tab
5. Verify quotation appears with:
   ✅ Status: "SENT"
   ✅ Approve button enabled
   ✅ Reject button enabled
```

---

## 🐛 Troubleshooting

### Issue 1: Quotations tab is empty

**Check Console (F12):**
```javascript
// Should see:
Fetching quotations from backend...
Fetched quotations: [array]
```

**If you see error:**
- Check backend is running (should see in terminal)
- Check auth token is valid
- Try logging out and back in

**If array is empty:**
- No quotations exist in database yet
- Create one from Enquiries tab

### Issue 2: Send button doesn't work

**Check Console:**
```javascript
// Should see:
Sending quotation: {id: "QT-2025-001", ...}
```

**If nothing happens:**
- Check quotation status is "draft" (not "sent")
- Send button is disabled for non-draft quotations
- Check browser console for errors

**Network tab:**
```
PUT /api/sales/quotations/QT-2025-001/send
Status: 200 OK
Response: {"message": "Quotation sent for approval successfully"}
```

### Issue 3: Status doesn't update

**Check:**
- Hard refresh browser (Ctrl+Shift+R)
- Close and reopen Quotations tab
- Check console logs show "Fetching quotations..."

**Backend logs:**
```
Sending quotation QT-2025-001 for approval
Quotation QT-2025-001 sent successfully, status updated to 'sent'
```

### Issue 4: Quotation not in Admin

**Verify quotation status in Sales:**
```
Status badge should show: "SENT" (not "DRAFT")
```

**If still "DRAFT":**
- You didn't click Send button yet
- Click Send button and try again

**If "SENT" but not in Admin:**
```
1. Check admin is logged in correctly
2. Hard refresh admin page
3. Check browser console for errors
4. Check backend logs for admin API call
```

---

## 📊 Status Reference

| Status | Description | Visible To | Actions Available |
|--------|-------------|------------|-------------------|
| **draft** | Just created, not sent yet | Sales only | Send, Edit, Delete |
| **sent** | Sent for approval | Sales + Admin | Admin: Approve/Reject |
| **approved** | Admin approved | Sales + Admin | Convert to SO (auto) |
| **rejected** | Admin rejected | Sales + Admin | Edit and resend |

---

## 🎯 Quick Checklist

Before asking admin to check:

- [ ] Quotation created successfully
- [ ] Quotation appears in Sales Quotations list
- [ ] Status badge shows "DRAFT" initially
- [ ] Clicked "Send" button
- [ ] Toast confirms "Quotation Sent for Approval"
- [ ] Status badge changed to "SENT"
- [ ] Send button is now disabled
- [ ] Console shows no errors

Now admin should see it! ✅

---

## 🚀 Summary

**The key point:** Creating a quotation is a **2-step process**:

1. **Create** → Saves as "draft" (only you see it)
2. **Send** → Changes to "sent" (admin can approve it)

**Always remember**: After creating a quotation, **you must click the Send button** to submit it for admin approval!

---

**Servers are running, just refresh your browser and test the Send button!** 🎊

