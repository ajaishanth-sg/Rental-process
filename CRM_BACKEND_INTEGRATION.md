# CRM Backend Integration Documentation

## Overview
Complete backend integration for the CRM Leads Management system. All lead data, emails, calls, tasks, and notes are now stored in MongoDB via FastAPI endpoints.

## Backend Changes

### File: `rigit-main/backend/app/routers/crm.py`

Added comprehensive API endpoints for complete leads management:

#### Models Added
1. **Lead** - Lead data model with all fields
2. **Email** - Email data model
3. **Call** - Call log model
4. **Task** - Task model
5. **Note** - Note model
6. **ConvertToDeal** - Deal conversion model

#### Endpoints Added

**Leads Management:**
- `GET /api/crm/leads` - Get all leads
- `GET /api/crm/leads/{lead_id}` - Get specific lead
- `POST /api/crm/leads` - Create new lead
- `PUT /api/crm/leads/{lead_id}` - Update lead
- `PUT /api/crm/leads/{lead_id}/status` - Update lead status
- `DELETE /api/crm/leads/{lead_id}` - Delete lead and related data

**Email Management:**
- `GET /api/crm/leads/{lead_id}/emails` - Get all emails for a lead
- `POST /api/crm/leads/{lead_id}/emails` - Send email to lead

**Call Management:**
- `GET /api/crm/leads/{lead_id}/calls` - Get all calls for a lead
- `POST /api/crm/leads/{lead_id}/calls` - Log a call with lead

**Task Management:**
- `GET /api/crm/leads/{lead_id}/tasks` - Get all tasks for a lead
- `POST /api/crm/leads/{lead_id}/tasks` - Create task for lead
- `PUT /api/crm/tasks/{task_id}` - Update task

**Note Management:**
- `GET /api/crm/leads/{lead_id}/notes` - Get all notes for a lead
- `POST /api/crm/leads/{lead_id}/notes` - Create note for lead

**Deal Conversion:**
- `POST /api/crm/leads/{lead_id}/convert-to-deal` - Convert lead to deal

### MongoDB Collections

**New Collections:**
1. **leads** - All lead records
2. **lead_emails** - Email communications
3. **lead_calls** - Call logs
4. **lead_tasks** - Tasks for followups
5. **lead_notes** - Notes and documentation

### Lead Document Structure
```json
{
  "lead_id": "LEAD-001",
  "salutation": "Mr",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "+1234567890",
  "organization": "Example Corp",
  "website": "www.example.com",
  "jobTitle": "CEO",
  "industry": "Technology",
  "source": "LinkedIn",
  "status": "New",
  "gender": "Male",
  "noOfEmployees": "100-500",
  "annualRevenue": 1000000,
  "territory": "USA",
  "leadOwner": "Shariq Ansari",
  "createdAt": "2025-01-20T10:00:00",
  "createdBy": "user_id",
  "updatedAt": "2025-01-20T10:00:00",
  "activities": [
    {
      "type": "created",
      "description": "Lead created",
      "by": "Shariq Ansari",
      "timestamp": "2025-01-20T10:00:00"
    }
  ]
}
```

### Email Document Structure
```json
{
  "lead_id": "LEAD-001",
  "from": "admin@company.com",
  "to": "john@example.com",
  "cc": null,
  "bcc": null,
  "subject": "Follow up meeting",
  "body": "Email content...",
  "timestamp": "2025-01-20T10:00:00",
  "status": "sent",
  "sentBy": "Shariq Ansari"
}
```

### Call Document Structure
```json
{
  "lead_id": "LEAD-001",
  "type": "Outbound Call",
  "duration": 180,
  "from": "Shariq Ansari",
  "to": "John Doe",
  "phone": "+1234567890",
  "timestamp": "2025-01-20T10:00:00",
  "status": "completed",
  "loggedBy": "Shariq Ansari"
}
```

### Task Document Structure
```json
{
  "lead_id": "LEAD-001",
  "title": "Follow up call",
  "description": "Call to discuss proposal",
  "status": "Backlog",
  "assignedTo": "Shariq Ansari",
  "dueDate": "2025-01-25T14:00:00",
  "priority": "High",
  "createdAt": "2025-01-20T10:00:00",
  "createdBy": "Shariq Ansari"
}
```

### Note Document Structure
```json
{
  "lead_id": "LEAD-001",
  "title": "Call notes",
  "content": "Discussed project requirements...",
  "createdAt": "2025-01-20T10:00:00",
  "createdBy": "Shariq Ansari"
}
```

## Frontend Changes

### New File: `rigit-main/src/services/crmService.ts`

Created API service layer with all CRM endpoints:
- Lead CRUD operations
- Email sending and retrieval
- Call logging and retrieval
- Task management
- Note management
- Deal conversion

### File: `rigit-main/src/components/admin/CRMModule.tsx`

**Changes Made:**

1. **Removed Mock Data**
   - Removed hardcoded `leadsData` array
   - Initialized `leads` state as empty array

2. **Added API Integration**
   - Imported `crmService`
   - Added `loading` state
   - Added `useEffect` to fetch leads on mount
   - Added `useEffect` to fetch lead details when viewing a lead

3. **Updated All Handlers to Use API:**
   - `handleCreateLead()` - Now calls backend API
   - `handleUpdateLeadStatus()` - Calls API and refreshes data
   - `handleEndCall()` - Logs call to backend
   - `handleSendEmail()` - Sends email via API
   - `handleCreateTask()` - Creates task in backend
   - `handleCreateNote()` - Creates note in backend
   - `handleConvertToDeal()` - Converts lead via API

4. **Added Data Fetching Functions:**
   - `fetchLeads()` - Fetches all leads from backend
   - `fetchLeadDetails()` - Fetches emails, calls, tasks, notes for a lead

5. **Real-time Updates:**
   - All actions now refresh data from backend
   - Activity timeline updates automatically
   - Lead list refreshes after operations

## API Request Flow

### Create Lead Flow
```
Frontend                  Backend                  Database
   |                         |                        |
   ├─ User fills form       |                        |
   ├─ Clicks "Create Lead"  |                        |
   ├─ POST /api/crm/leads──>|                        |
   |                        ├─ Validate data         |
   |                        ├─ Generate lead_id      |
   |                        ├─ Create activity       |
   |                        ├─ Insert document ─────>|
   |                        |                        ├─ Save to leads collection
   |                        |<─ Success ──────────────┤
   |<─ 200 OK ──────────────┤                        |
   ├─ Show success toast    |                        |
   ├─ Close dialog          |                        |
   ├─ Refresh leads list    |                        |
```

### Send Email Flow
```
Frontend                  Backend                  Database
   |                         |                        |
   ├─ Compose email         |                        |
   ├─ Click "Send"          |                        |
   ├─ POST /emails ────────>|                        |
   |                        ├─ Create email doc      |
   |                        ├─ Insert to lead_emails>|
   |                        ├─ Add activity to lead──>|
   |                        |<─ Success ──────────────┤
   |<─ 200 OK ──────────────┤                        |
   ├─ Show toast            |                        |
   ├─ Refresh lead details  |                        |
```

### View Lead Details Flow
```
Frontend                  Backend                  Database
   |                         |                        |
   ├─ Click on lead         |                        |
   ├─ GET /leads/{id} ─────>|                        |
   |                        ├─ Query leads ─────────>|
   |                        |<─ Lead data ────────────┤
   |<─ Lead data ───────────┤                        |
   ├─ GET /emails ─────────>|                        |
   |                        ├─ Query lead_emails ───>|
   |                        |<─ Emails data ──────────┤
   |<─ Emails ──────────────┤                        |
   ├─ GET /calls ──────────>|                        |
   ├─ GET /tasks ──────────>|                        |
   ├─ GET /notes ──────────>|                        |
   ├─ Display all data      |                        |
```

## Activity Tracking

Every action automatically updates the lead's activity timeline:

- **Lead Created** - Automatic on lead creation
- **Email Sent** - When email is sent
- **Call Logged** - When call is ended and logged
- **Task Created** - When task is added
- **Note Added** - When note is created
- **Status Changed** - When lead status is updated
- **Converted to Deal** - When lead is converted

## Error Handling

All API calls include comprehensive error handling:

1. **Network Errors** - Toast notification shown
2. **Validation Errors** - User-friendly error messages
3. **Authentication Errors** - 403 Forbidden responses
4. **Not Found Errors** - 404 for missing resources
5. **Server Errors** - 500 with error details

## Authentication

All endpoints require authentication:
- Bearer token from `localStorage.getItem('auth_token')`
- User role must be "admin"
- Current user info retrieved from token

## Testing the Integration

### Prerequisites
1. Backend server running on `http://localhost:8000`
2. MongoDB connection established
3. Valid authentication token

### Test Steps

**1. Create a Lead:**
```bash
# Frontend: Admin → CRM → Leads → Create Lead
# Fill form and submit
# Expected: Lead created in database, appears in list
```

**2. Send Email:**
```bash
# Click on lead → Emails tab → New Email
# Compose and send
# Expected: Email saved to lead_emails collection
# Activity added to lead's timeline
```

**3. Log a Call:**
```bash
# Click on lead → Calls tab → Make a Call
# Wait a few seconds → End Call
# Expected: Call logged with duration
# Activity added to timeline
```

**4. Create Task:**
```bash
# Click on lead → Tasks tab → New Task
# Fill details and create
# Expected: Task saved to lead_tasks
# Activity added to timeline
```

**5. Create Note:**
```bash
# Click on lead → Notes tab → New Note
# Fill and save
# Expected: Note saved to lead_notes
# Activity added to timeline
```

**6. Convert to Deal:**
```bash
# Click "Convert to Deal" button
# Select organization/contact options
# Convert
# Expected: Lead status → "Qualified"
# convertedToDeal flag set
```

## Benefits of Backend Integration

1. **Data Persistence** - All data saved to MongoDB
2. **Multi-user Support** - Centralized data store
3. **Activity Tracking** - Complete audit trail
4. **Scalability** - Can handle large datasets
5. **Security** - Role-based access control
6. **Real-time Updates** - Latest data always available
7. **Backup & Recovery** - Database backups possible
8. **Analytics** - Query data for insights
9. **API Access** - Can integrate with other systems
10. **Production Ready** - Proper error handling and validation

## API Response Examples

### GET /api/crm/leads
```json
[
  {
    "id": "ObjectId",
    "lead_id": "LEAD-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "status": "New",
    "activitiesCount": 5,
    ...
  }
]
```

### POST /api/crm/leads
```json
{
  "message": "Lead created successfully",
  "lead_id": "LEAD-001",
  "id": "ObjectId"
}
```

### GET /api/crm/leads/{lead_id}/emails
```json
[
  {
    "id": "ObjectId",
    "lead_id": "LEAD-001",
    "subject": "Follow up",
    "body": "...",
    "timestamp": "2025-01-20T10:00:00",
    "status": "sent"
  }
]
```

## Future Enhancements

1. **Real-time Notifications** - WebSocket for live updates
2. **File Attachments** - Attach files to emails/notes
3. **Email Templates** - Pre-defined email templates
4. **Bulk Operations** - Import/export leads
5. **Advanced Search** - Full-text search across leads
6. **Lead Scoring** - Automatic lead qualification
7. **Pipeline Stages** - Visual pipeline management
8. **Reporting** - Analytics dashboard
9. **Webhooks** - External system integration
10. **WhatsApp Integration** - Send messages via WhatsApp API

## Files Modified

1. `rigit-main/backend/app/routers/crm.py` - Added all lead endpoints
2. `rigit-main/src/services/crmService.ts` - NEW - API service layer
3. `rigit-main/src/components/admin/CRMModule.tsx` - Backend integration
4. `rigit-main/CRM_BACKEND_INTEGRATION.md` - NEW - This documentation

## Migration Notes

**Existing Data:**
- If you have test leads in the UI, they will not appear after integration
- Create new leads through the UI to populate the database
- All new leads will have proper `lead_id` format (LEAD-001, LEAD-002, etc.)

**Database Indexes:**
Recommended indexes for performance:
```javascript
db.leads.createIndex({ "lead_id": 1 }, { unique: true });
db.leads.createIndex({ "email": 1 });
db.leads.createIndex({ "status": 1 });
db.leads.createIndex({ "createdAt": -1 });
db.lead_emails.createIndex({ "lead_id": 1 });
db.lead_calls.createIndex({ "lead_id": 1 });
db.lead_tasks.createIndex({ "lead_id": 1 });
db.lead_notes.createIndex({ "lead_id": 1 });
```

## Support

For issues or questions:
1. Check backend logs for error details
2. Verify MongoDB connection
3. Ensure authentication token is valid
4. Check network requests in browser DevTools
5. Verify all required fields are provided

## Complete Integration ✅

All CRM features are now fully integrated with the backend:
- ✅ Leads CRUD
- ✅ Email Management
- ✅ Call Logging
- ✅ Task Management
- ✅ Note Management
- ✅ Convert to Deal
- ✅ Activity Tracking
- ✅ Real-time Updates
- ✅ Error Handling
- ✅ Authentication

**Status**: Production Ready 🎉

