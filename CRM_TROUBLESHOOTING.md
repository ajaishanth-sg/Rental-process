# CRM Leads Troubleshooting Guide

## Issue: "Create Lead" Button Not Working

### Quick Fix Checklist ✅

1. **Is the Backend Server Running?**
   ```bash
   cd "rigit-main/backend"
   python -m uvicorn app.main:app --reload --port 8000
   ```
   - Backend MUST be running on port 8000
   - You should see: "Uvicorn running on http://127.0.0.1:8000"

2. **Is the Frontend Server Running?**
   ```bash
   cd "rigit-main"
   npm run dev -- --port 3000
   ```
   - Frontend should be running on port 3000

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Click "Create Lead" button
   - Look for error messages

4. **Check Network Tab**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Click "Create Lead" button
   - Look for failed requests to `http://localhost:8000/api/crm/leads`

## Common Issues & Solutions

### Issue 1: "Failed to create lead. Make sure the backend server is running on port 8000"

**Cause**: Backend server is not running or not accessible.

**Solution**:
```bash
# Terminal 1 - Start Backend
cd "rigit-main/backend"
python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

# Terminal 2 - Start Frontend  
cd "rigit-main"
npm run dev -- --port 3000
```

### Issue 2: CORS Error in Console

**Cause**: Frontend cannot connect to backend due to CORS policy.

**Solution**: Check that backend has CORS configured in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 3: 403 Forbidden Error

**Cause**: Authentication token is invalid or missing.

**Solution**:
1. Make sure you're logged in as admin
2. Check localStorage for `auth_token`
3. Try logging out and logging back in

### Issue 4: MongoDB Connection Error

**Cause**: Backend cannot connect to MongoDB.

**Solution**:
```bash
# Check backend logs for MongoDB connection errors
# Ensure MongoDB is running
# Check connection string in backend/.env
```

### Issue 5: "Network Error" in Console

**Cause**: Cannot reach backend server.

**Solution**:
1. Verify backend is running: `http://localhost:8000/docs`
2. Check if port 8000 is available
3. Try restarting the backend server

## Testing the Complete Flow

### Step 1: Start Backend
```bash
cd "X:\new folder for cursor\Construction ERP\rigit-main\backend"
python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 2: Start Frontend
```bash
cd "X:\new folder for cursor\Construction ERP\rigit-main"
npm run dev -- --port 3000
```

**Expected Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 3: Test Backend API
Open browser and go to: `http://localhost:8000/docs`

You should see the FastAPI Swagger documentation.

Try the `/api/crm/leads` endpoint:
1. Click on `GET /api/crm/leads`
2. Click "Try it out"
3. Click "Execute"
4. Should return `[]` (empty array) or list of leads

### Step 4: Test Frontend
1. Go to: `http://localhost:3000`
2. Login as admin
3. Navigate to CRM → Leads tab
4. Click "Create Lead" button
5. Fill in:
   - First Name: John
   - Email: john@example.com
6. Click "Create Lead"

**What to Check**:
- Button should show "Creating..." while processing
- Success toast should appear: "✅ Lead Created"
- Dialog should close
- New lead should appear in the list

### Step 5: Check Browser Console
Press F12 → Console tab

**Expected Console Output**:
```
Creating lead: {firstName: 'John', email: 'john@example.com', ...}
Lead created: {message: 'Lead created successfully', lead_id: 'LEAD-001', id: '...'}
Fetching leads from backend...
Leads fetched: [{lead_id: 'LEAD-001', firstName: 'John', ...}]
```

### Step 6: Verify in MongoDB
If you have MongoDB Compass or similar:
1. Connect to your MongoDB
2. Find database (usually `erp_db` or similar)
3. Check `leads` collection
4. You should see your new lead document

## Debugging Steps

### Enable Detailed Logging

**Frontend** (`src/services/crmService.ts`):
```typescript
export const createLead = async (leadData: any) => {
  console.log('API Call: Creating lead', leadData);
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leadData),
  });
  console.log('API Response:', response.status, response.statusText);
  if (!response.ok) {
    const error = await response.text();
    console.error('API Error:', error);
    throw new Error('Failed to create lead');
  }
  const result = await response.json();
  console.log('API Result:', result);
  return result;
};
```

**Backend** (`backend/app/routers/crm.py`):
Add print statements:
```python
@router.post("/leads")
async def create_lead(lead_data: Lead, current_user: dict = Depends(get_current_user)):
    print(f"Creating lead: {lead_data}")
    print(f"Current user: {current_user}")
    try:
        # ... existing code
        print(f"Lead created successfully: {lead_id}")
        return result
    except Exception as e:
        print(f"Error creating lead: {str(e)}")
        raise
```

## Quick Test Script

Save this as `test_crm_api.py` in backend folder:

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/crm"

# Replace with your actual auth token
AUTH_TOKEN = "your_token_here"

headers = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}

# Test create lead
lead_data = {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "salutation": "Mr",
    "status": "New",
    "leadOwner": "Shariq Ansari"
}

response = requests.post(f"{BASE_URL}/leads", headers=headers, json=lead_data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Test get leads
response = requests.get(f"{BASE_URL}/leads", headers=headers)
print(f"Leads: {response.json()}")
```

Run with: `python test_crm_api.py`

## Still Not Working?

### Check These Files:

1. **Backend Running?**
   ```bash
   netstat -ano | findstr :8000
   ```
   Should show a process listening on port 8000

2. **Frontend Config**
   Check `src/services/crmService.ts`:
   ```typescript
   const API_BASE_URL = 'http://localhost:8000/api/crm';
   ```

3. **Auth Token**
   Open browser console:
   ```javascript
   console.log(localStorage.getItem('auth_token'));
   ```
   Should show a token, not null

4. **Network Request**
   - F12 → Network tab
   - Click "Create Lead"
   - Look for request to `/api/crm/leads`
   - Check Request Headers (should have Authorization)
   - Check Request Payload (should have lead data)
   - Check Response (should be 200 OK)

## Error Messages Explained

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Failed to fetch leads" | Backend not responding | Start backend server |
| "First name and email are required" | Form validation | Fill required fields |
| "Failed to create lead" | Backend error | Check backend logs |
| "403 Forbidden" | Auth issue | Re-login as admin |
| "Network error" | Cannot reach backend | Check backend is running |
| "CORS policy error" | CORS not configured | Check backend CORS settings |

## Success Indicators

When everything is working correctly, you'll see:

1. ✅ "Creating..." button text while processing
2. ✅ Green success toast: "Lead Created"
3. ✅ Dialog closes automatically
4. ✅ New lead appears in the leads table
5. ✅ Console shows: "Lead created: {lead_id: 'LEAD-XXX'}"
6. ✅ Backend logs show: "Lead created successfully"

## Contact Support

If still having issues:
1. Check all console logs (frontend & backend)
2. Verify both servers are running
3. Test API directly using `/docs` endpoint
4. Check MongoDB connection
5. Verify user has admin role

## Quick Commands Reference

**Start Everything:**
```bash
# Terminal 1 - Backend
cd "rigit-main/backend"
python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

# Terminal 2 - Frontend
cd "rigit-main"
npm run dev -- --port 3000
```

**Check Logs:**
```bash
# Backend logs are in Terminal 1
# Frontend logs are in Terminal 2
# Browser logs are in F12 → Console
```

**Test API:**
```bash
# Open browser: http://localhost:8000/docs
# Or use curl:
curl -X GET http://localhost:8000/api/crm/leads -H "Authorization: Bearer YOUR_TOKEN"
```

