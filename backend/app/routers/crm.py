from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from ..utils.auth import get_current_user
from ..utils.database import get_database

router = APIRouter()

# Pydantic models for request/response
class CustomerDocument(BaseModel):
    name: str
    type: str
    status: str
    uploadDate: str
    expiryDate: str

class CustomerCRM(BaseModel):
    name: str
    contactPerson: str
    email: str
    phone: str
    location: Optional[str] = None
    website: Optional[str] = None
    companyType: Optional[str] = None
    passportNumber: Optional[str] = None
    passportExpiry: Optional[str] = None
    emiratesId: Optional[str] = None
    tradeLicense: Optional[str] = None
    licenseExpiry: Optional[str] = None
    vatNumber: Optional[str] = None
    creditLimit: Optional[float] = 0
    outstandingAmount: Optional[float] = 0

class DocumentUpload(BaseModel):
    customerId: str
    documentName: str
    documentType: str
    expiryDate: str

class FeedbackSubmit(BaseModel):
    customerId: str
    pipelineId: str
    score: int
    comments: Optional[str] = None

# Leads models
class Lead(BaseModel):
    salutation: str = "Mr"
    firstName: str
    lastName: Optional[str] = None
    email: str
    mobile: Optional[str] = None
    organization: Optional[str] = None
    website: Optional[str] = None
    jobTitle: Optional[str] = None
    industry: Optional[str] = None
    source: Optional[str] = None
    status: str = "New"
    gender: Optional[str] = "Male"
    noOfEmployees: Optional[str] = None
    annualRevenue: Optional[float] = 0
    territory: Optional[str] = None
    leadOwner: str = "Shariq Ansari"

class Email(BaseModel):
    leadId: str
    to: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    subject: str
    body: str

class Call(BaseModel):
    leadId: str
    duration: int
    type: str = "Outbound Call"

class Task(BaseModel):
    leadId: str
    title: str
    description: Optional[str] = None
    status: str = "Backlog"
    assignedTo: str
    dueDate: Optional[str] = None
    priority: str = "Low"

class Note(BaseModel):
    leadId: str
    title: str
    content: str

class ConvertToDeal(BaseModel):
    leadId: str
    useExistingOrg: bool = True
    organizationId: Optional[str] = None
    useExistingContact: bool = False
    contactId: Optional[str] = None

@router.get("/customers")
async def get_crm_customers(current_user: dict = Depends(get_current_user)):
    """Get all customers with CRM data including documents and pipeline info"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access CRM data")
        
        db = get_database()
        
        # Fetch all customers with their details
        customers_cursor = db.customers.find({})
        customers_raw = await customers_cursor.to_list(length=None)
        
        customers = []
        for customer in customers_raw:
            customer_copy = customer.copy()
            customer_id = str(customer_copy.pop("_id"))
            customer_copy["id"] = customer_id
            
            # Get contract statistics
            active_contracts = await db.contracts.count_documents({
                "customer_id": customer_id,
                "status": "active"
            })
            
            completed_projects = await db.contracts.count_documents({
                "customer_id": customer_id,
                "status": "completed"
            })
            
            # Calculate total value from all contracts
            contracts_cursor = db.contracts.find({"customer_id": customer_id})
            contracts = await contracts_cursor.to_list(length=None)
            total_value = sum(c.get("totalAmount", 0) for c in contracts)
            
            # Get average satisfaction score from feedback
            feedback_cursor = db.feedback.find({"customer_id": customer_id})
            feedback_list = await feedback_cursor.to_list(length=None)
            avg_satisfaction = 0
            if feedback_list:
                avg_satisfaction = sum(f.get("score", 0) for f in feedback_list) / len(feedback_list)
            
            # Calculate outstanding amount
            invoices_cursor = db.invoices.find({
                "customer_id": customer_id,
                "status": {"$in": ["pending", "overdue"]}
            })
            invoices = await invoices_cursor.to_list(length=None)
            outstanding_amount = sum(inv.get("totalAmount", 0) for inv in invoices)
            
            # Add computed fields
            customer_copy.update({
                "activeContracts": active_contracts,
                "completedProjects": completed_projects,
                "totalValue": total_value,
                "satisfactionScore": round(avg_satisfaction, 1) if avg_satisfaction else 5.0,
                "outstandingAmount": outstanding_amount,
                "status": "active" if active_contracts > 0 else "inactive"
            })
            
            customers.append(customer_copy)
        
        return customers
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching CRM customers: {str(e)}")

@router.get("/customers/{customer_id}")
async def get_customer_details(customer_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed information for a specific customer"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access CRM data")
        
        db = get_database()
        
        # Find customer
        customer = await db.customers.find_one({"_id": customer_id})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        customer_copy = customer.copy()
        customer_copy["id"] = str(customer_copy.pop("_id"))
        
        # Get documents
        documents_cursor = db.customer_documents.find({"customer_id": customer_id})
        documents = await documents_cursor.to_list(length=None)
        customer_copy["documents"] = [
            {
                "name": doc.get("name"),
                "type": doc.get("type"),
                "status": doc.get("status"),
                "uploadDate": doc.get("uploadDate"),
                "expiryDate": doc.get("expiryDate")
            }
            for doc in documents
        ]
        
        return customer_copy
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer details: {str(e)}")

@router.get("/pipeline")
async def get_sales_pipeline(current_user: dict = Depends(get_current_user)):
    """Get complete sales pipeline data (enquiry → quotation → contract → feedback)"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access pipeline data")
        
        db = get_database()
        
        # Get all enquiries and build pipeline
        enquiries_cursor = db.enquiries.find({})
        enquiries = await enquiries_cursor.to_list(length=None)
        
        pipeline = []
        for enquiry in enquiries:
            enquiry_id = enquiry.get("enquiry_id") or enquiry.get("id")
            customer_id = enquiry.get("customer_id")
            
            # Get customer name
            customer = await db.customers.find_one({"_id": customer_id})
            customer_name = customer.get("name", "Unknown") if customer else "Unknown"
            
            # Find related quotation
            quotation = await db.quotations.find_one({"enquiry_id": enquiry_id})
            
            # Find related contract
            contract = None
            if quotation:
                quotation_id = quotation.get("quotation_id") or quotation.get("id")
                contract = await db.contracts.find_one({"quotation_id": quotation_id})
            
            # Find feedback
            feedback = None
            if contract:
                contract_id = contract.get("contract_id") or contract.get("id")
                feedback = await db.feedback.find_one({"contract_id": contract_id})
            
            # Determine stage
            stage = "enquiry"
            if feedback:
                stage = "feedback"
            elif contract:
                stage = "contract"
            elif quotation:
                stage = "quotation"
            
            pipeline_item = {
                "id": f"PIPE-{str(enquiry.get('_id'))[-6:]}",
                "customerId": customer_id,
                "customerName": customer_name,
                "enquiryId": enquiry_id,
                "enquiryDate": enquiry.get("created_at"),
                "enquiryStatus": enquiry.get("status"),
                "quotationId": quotation.get("quotation_id") if quotation else None,
                "quotationDate": quotation.get("created_at") if quotation else None,
                "quotationValue": quotation.get("totalAmount") if quotation else None,
                "quotationStatus": quotation.get("status") if quotation else None,
                "contractId": contract.get("contract_id") if contract else None,
                "contractDate": contract.get("created_at") if contract else None,
                "contractValue": contract.get("totalAmount") if contract else None,
                "contractStatus": contract.get("status") if contract else None,
                "feedbackScore": feedback.get("score") if feedback else None,
                "feedbackDate": feedback.get("created_at") if feedback else None,
                "stage": stage,
                "notes": enquiry.get("notes", "")
            }
            
            pipeline.append(pipeline_item)
        
        return pipeline
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pipeline data: {str(e)}")

@router.get("/documents/expiring")
async def get_expiring_documents(current_user: dict = Depends(get_current_user)):
    """Get all documents expiring within the next 60 days"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access document data")
        
        db = get_database()
        
        # Calculate date 60 days from now
        sixty_days_from_now = (datetime.now() + timedelta(days=60)).isoformat()
        
        # Find expiring documents
        documents_cursor = db.customer_documents.find({
            "expiryDate": {"$lte": sixty_days_from_now},
            "status": {"$ne": "expired"}
        })
        documents = await documents_cursor.to_list(length=None)
        
        expiring_docs = []
        for doc in documents:
            customer_id = doc.get("customer_id")
            customer = await db.customers.find_one({"_id": customer_id})
            
            expiring_docs.append({
                "customerId": customer_id,
                "customerName": customer.get("name", "Unknown") if customer else "Unknown",
                "documentName": doc.get("name"),
                "documentType": doc.get("type"),
                "expiryDate": doc.get("expiryDate"),
                "status": "expiring"
            })
        
        return expiring_docs
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching expiring documents: {str(e)}")

@router.post("/documents/upload")
async def upload_customer_document(
    document_data: DocumentUpload,
    current_user: dict = Depends(get_current_user)
):
    """Upload or update a customer document"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can upload documents")
        
        db = get_database()
        
        # Verify customer exists
        customer = await db.customers.find_one({"_id": document_data.customerId})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Check if document already exists
        existing_doc = await db.customer_documents.find_one({
            "customer_id": document_data.customerId,
            "type": document_data.documentType
        })
        
        document = {
            "customer_id": document_data.customerId,
            "name": document_data.documentName,
            "type": document_data.documentType,
            "status": "pending",
            "uploadDate": datetime.now().isoformat(),
            "expiryDate": document_data.expiryDate,
            "uploadedBy": current_user["id"]
        }
        
        if existing_doc:
            # Update existing document
            await db.customer_documents.update_one(
                {"_id": existing_doc["_id"]},
                {"$set": document}
            )
            return {"message": "Document updated successfully"}
        else:
            # Insert new document
            await db.customer_documents.insert_one(document)
            return {"message": "Document uploaded successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.put("/documents/{document_id}/verify")
async def verify_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a document as verified"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can verify documents")
        
        db = get_database()
        
        result = await db.customer_documents.update_one(
            {"_id": document_id},
            {"$set": {
                "status": "verified",
                "verifiedBy": current_user["id"],
                "verifiedAt": datetime.now().isoformat()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document verified successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying document: {str(e)}")

@router.get("/performance/metrics")
async def get_sales_performance(current_user: dict = Depends(get_current_user)):
    """Get sales performance metrics for the last 6 months"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access performance data")
        
        db = get_database()
        
        performance_data = []
        
        # Calculate metrics for last 6 months
        for i in range(6):
            month_start = datetime.now() - timedelta(days=30 * (i + 1))
            month_end = datetime.now() - timedelta(days=30 * i)
            
            # Count enquiries
            enquiries_count = await db.enquiries.count_documents({
                "created_at": {
                    "$gte": month_start.isoformat(),
                    "$lte": month_end.isoformat()
                }
            })
            
            # Count quotations
            quotations_count = await db.quotations.count_documents({
                "created_at": {
                    "$gte": month_start.isoformat(),
                    "$lte": month_end.isoformat()
                }
            })
            
            # Count contracts
            contracts_count = await db.contracts.count_documents({
                "created_at": {
                    "$gte": month_start.isoformat(),
                    "$lte": month_end.isoformat()
                }
            })
            
            # Calculate revenue
            contracts_cursor = db.contracts.find({
                "created_at": {
                    "$gte": month_start.isoformat(),
                    "$lte": month_end.isoformat()
                }
            })
            contracts = await contracts_cursor.to_list(length=None)
            revenue = sum(c.get("totalAmount", 0) for c in contracts)
            
            # Calculate conversion rate
            conversion_rate = (contracts_count / enquiries_count * 100) if enquiries_count > 0 else 0
            
            performance_data.append({
                "month": month_end.strftime("%b %Y"),
                "enquiries": enquiries_count,
                "quotations": quotations_count,
                "contracts": contracts_count,
                "revenue": revenue,
                "conversionRate": round(conversion_rate, 1)
            })
        
        return list(reversed(performance_data))
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching performance metrics: {str(e)}")

@router.post("/feedback")
async def submit_customer_feedback(
    feedback_data: FeedbackSubmit,
    current_user: dict = Depends(get_current_user)
):
    """Submit customer feedback for a completed contract"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can submit feedback")
        
        db = get_database()
        
        feedback = {
            "customer_id": feedback_data.customerId,
            "pipeline_id": feedback_data.pipelineId,
            "score": feedback_data.score,
            "comments": feedback_data.comments,
            "created_at": datetime.now().isoformat(),
            "created_by": current_user["id"]
        }
        
        await db.feedback.insert_one(feedback)
        
        return {"message": "Feedback submitted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting feedback: {str(e)}")

@router.get("/statistics")
async def get_crm_statistics(current_user: dict = Depends(get_current_user)):
    """Get overall CRM statistics"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access CRM statistics")
        
        db = get_database()
        
        # Total customers
        total_customers = await db.customers.count_documents({})
        
        # Active customers (with active contracts)
        active_customers = await db.customers.count_documents({
            "_id": {"$in": [
                c["customer_id"] for c in await db.contracts.find({"status": "active"}).to_list(length=None)
            ]}
        })
        
        # Total revenue
        contracts = await db.contracts.find({}).to_list(length=None)
        total_revenue = sum(c.get("totalAmount", 0) for c in contracts)
        
        # Average satisfaction
        feedback_list = await db.feedback.find({}).to_list(length=None)
        avg_satisfaction = 0
        if feedback_list:
            avg_satisfaction = sum(f.get("score", 0) for f in feedback_list) / len(feedback_list)
        
        # Expiring documents count
        sixty_days_from_now = (datetime.now() + timedelta(days=60)).isoformat()
        expiring_docs_count = await db.customer_documents.count_documents({
            "expiryDate": {"$lte": sixty_days_from_now},
            "status": {"$ne": "expired"}
        })
        
        return {
            "totalCustomers": total_customers,
            "activeCustomers": active_customers,
            "totalRevenue": total_revenue,
            "averageSatisfaction": round(avg_satisfaction, 1) if avg_satisfaction else 0,
            "expiringDocuments": expiring_docs_count
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching CRM statistics: {str(e)}")

@router.put("/customers/{customer_id}")
async def update_customer_crm(
    customer_id: str,
    customer_data: CustomerCRM,
    current_user: dict = Depends(get_current_user)
):
    """Update customer CRM information"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can update customer data")
        
        db = get_database()
        
        update_data = customer_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now().isoformat()
        update_data["updated_by"] = current_user["id"]
        
        result = await db.customers.update_one(
            {"_id": customer_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found or no changes made")
        
        return {"message": "Customer updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating customer: {str(e)}")

# ============= LEADS MANAGEMENT =============

@router.get("/leads")
async def get_leads(current_user: dict = Depends(get_current_user)):
    """Get all leads"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access leads")
        
        db = get_database()
        
        leads_cursor = db.leads.find({})
        leads_raw = await leads_cursor.to_list(length=None)
        
        leads = []
        for lead in leads_raw:
            lead_copy = lead.copy()
            lead_copy["id"] = str(lead_copy.pop("_id"))
            
            # Get activities count
            activities_count = len(lead_copy.get("activities", []))
            lead_copy["activitiesCount"] = activities_count
            
            leads.append(lead_copy)
        
        return leads
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leads: {str(e)}")

@router.get("/leads/{lead_id}")
async def get_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific lead with all details"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access leads")
        
        db = get_database()
        
        lead = await db.leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        lead_copy = lead.copy()
        lead_copy["id"] = str(lead_copy.pop("_id"))
        
        return lead_copy
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lead: {str(e)}")

@router.post("/leads")
async def create_lead(lead_data: Lead, current_user: dict = Depends(get_current_user)):
    """Create a new lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can create leads")
        
        db = get_database()
        
        # Generate lead ID
        lead_count = await db.leads.count_documents({})
        lead_id = f"LEAD-{str(lead_count + 1).zfill(3)}"
        
        lead = {
            "lead_id": lead_id,
            **lead_data.dict(),
            "createdAt": datetime.now().isoformat(),
            "createdBy": current_user["id"],
            "updatedAt": datetime.now().isoformat(),
            "activities": [
                {
                    "type": "created",
                    "description": "Lead created",
                    "by": current_user.get("name", lead_data.leadOwner),
                    "timestamp": datetime.now().isoformat()
                }
            ]
        }
        
        result = await db.leads.insert_one(lead)
        
        return {
            "message": "Lead created successfully",
            "lead_id": lead_id,
            "id": str(result.inserted_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating lead: {str(e)}")

@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, lead_data: Lead, current_user: dict = Depends(get_current_user)):
    """Update a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can update leads")
        
        db = get_database()
        
        update_data = lead_data.dict(exclude_unset=True)
        update_data["updatedAt"] = datetime.now().isoformat()
        
        result = await db.leads.update_one(
            {"lead_id": lead_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found or no changes made")
        
        return {"message": "Lead updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating lead: {str(e)}")

@router.put("/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, status: str, current_user: dict = Depends(get_current_user)):
    """Update lead status"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can update lead status")
        
        db = get_database()
        
        # Create activity
        activity = {
            "type": "status_change",
            "description": f"Status updated to {status}",
            "by": current_user.get("name", "Admin"),
            "timestamp": datetime.now().isoformat()
        }
        
        result = await db.leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "status": status,
                    "updatedAt": datetime.now().isoformat()
                },
                "$push": {"activities": activity}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        return {"message": f"Lead status updated to {status}"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating lead status: {str(e)}")

@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can delete leads")
        
        db = get_database()
        
        result = await db.leads.delete_one({"lead_id": lead_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Also delete related emails, calls, tasks, notes
        await db.lead_emails.delete_many({"lead_id": lead_id})
        await db.lead_calls.delete_many({"lead_id": lead_id})
        await db.lead_tasks.delete_many({"lead_id": lead_id})
        await db.lead_notes.delete_many({"lead_id": lead_id})
        
        return {"message": "Lead and related data deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting lead: {str(e)}")

# ============= EMAILS =============

@router.get("/leads/{lead_id}/emails")
async def get_lead_emails(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Get all emails for a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access emails")
        
        db = get_database()
        
        emails_cursor = db.lead_emails.find({"lead_id": lead_id}).sort("timestamp", -1)
        emails = await emails_cursor.to_list(length=None)
        
        for email in emails:
            email["id"] = str(email.pop("_id"))
        
        return emails
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching emails: {str(e)}")

@router.post("/leads/{lead_id}/emails")
async def send_email(email_data: Email, current_user: dict = Depends(get_current_user)):
    """Send an email to a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can send emails")
        
        db = get_database()
        
        email = {
            "lead_id": email_data.leadId,
            "from": current_user.get("email", "admin@company.com"),
            "to": email_data.to,
            "cc": email_data.cc,
            "bcc": email_data.bcc,
            "subject": email_data.subject,
            "body": email_data.body,
            "timestamp": datetime.now().isoformat(),
            "status": "sent",
            "sentBy": current_user.get("name", "Admin")
        }
        
        result = await db.lead_emails.insert_one(email)
        
        # Add activity to lead
        activity = {
            "type": "email",
            "description": f"Email sent: {email_data.subject}",
            "by": current_user.get("name", "Admin"),
            "timestamp": datetime.now().isoformat()
        }
        
        await db.leads.update_one(
            {"lead_id": email_data.leadId},
            {
                "$push": {"activities": activity},
                "$set": {"updatedAt": datetime.now().isoformat()}
            }
        )
        
        return {
            "message": "Email sent successfully",
            "id": str(result.inserted_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")

# ============= CALLS =============

@router.get("/leads/{lead_id}/calls")
async def get_lead_calls(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Get all calls for a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access calls")
        
        db = get_database()
        
        calls_cursor = db.lead_calls.find({"lead_id": lead_id}).sort("timestamp", -1)
        calls = await calls_cursor.to_list(length=None)
        
        for call in calls:
            call["id"] = str(call.pop("_id"))
        
        return calls
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching calls: {str(e)}")

@router.post("/leads/{lead_id}/calls")
async def log_call(call_data: Call, current_user: dict = Depends(get_current_user)):
    """Log a call with a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can log calls")
        
        db = get_database()
        
        # Get lead details
        lead = await db.leads.find_one({"lead_id": call_data.leadId})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        call = {
            "lead_id": call_data.leadId,
            "type": call_data.type,
            "duration": call_data.duration,
            "from": current_user.get("name", "Admin"),
            "to": f"{lead.get('firstName', '')} {lead.get('lastName', '')}".strip(),
            "phone": lead.get("mobile", ""),
            "timestamp": datetime.now().isoformat(),
            "status": "completed",
            "loggedBy": current_user.get("name", "Admin")
        }
        
        result = await db.lead_calls.insert_one(call)
        
        # Add activity to lead
        mins = call_data.duration // 60
        secs = call_data.duration % 60
        activity = {
            "type": "call",
            "description": f"Call with {lead.get('firstName', '')} {lead.get('lastName', '')} - Duration: {mins}m {secs}s",
            "by": current_user.get("name", "Admin"),
            "timestamp": datetime.now().isoformat()
        }
        
        await db.leads.update_one(
            {"lead_id": call_data.leadId},
            {
                "$push": {"activities": activity},
                "$set": {"updatedAt": datetime.now().isoformat()}
            }
        )
        
        return {
            "message": "Call logged successfully",
            "id": str(result.inserted_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging call: {str(e)}")

# ============= TASKS =============

@router.get("/leads/{lead_id}/tasks")
async def get_lead_tasks(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Get all tasks for a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access tasks")
        
        db = get_database()
        
        tasks_cursor = db.lead_tasks.find({"lead_id": lead_id}).sort("createdAt", -1)
        tasks = await tasks_cursor.to_list(length=None)
        
        for task in tasks:
            task["id"] = str(task.pop("_id"))
        
        return tasks
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tasks: {str(e)}")

@router.post("/leads/{lead_id}/tasks")
async def create_task(task_data: Task, current_user: dict = Depends(get_current_user)):
    """Create a task for a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can create tasks")
        
        db = get_database()
        
        task = {
            "lead_id": task_data.leadId,
            "title": task_data.title,
            "description": task_data.description,
            "status": task_data.status,
            "assignedTo": task_data.assignedTo,
            "dueDate": task_data.dueDate,
            "priority": task_data.priority,
            "createdAt": datetime.now().isoformat(),
            "createdBy": current_user.get("name", "Admin")
        }
        
        result = await db.lead_tasks.insert_one(task)
        
        # Add activity to lead
        activity = {
            "type": "task",
            "description": f"Task created: {task_data.title}",
            "by": current_user.get("name", "Admin"),
            "timestamp": datetime.now().isoformat()
        }
        
        await db.leads.update_one(
            {"lead_id": task_data.leadId},
            {
                "$push": {"activities": activity},
                "$set": {"updatedAt": datetime.now().isoformat()}
            }
        )
        
        return {
            "message": "Task created successfully",
            "id": str(result.inserted_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating task: {str(e)}")

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, task_data: Task, current_user: dict = Depends(get_current_user)):
    """Update a task"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can update tasks")
        
        db = get_database()
        
        update_data = task_data.dict(exclude_unset=True, exclude={"leadId"})
        update_data["updatedAt"] = datetime.now().isoformat()
        
        result = await db.lead_tasks.update_one(
            {"_id": task_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"message": "Task updated successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating task: {str(e)}")

# ============= NOTES =============

@router.get("/leads/{lead_id}/notes")
async def get_lead_notes(lead_id: str, current_user: dict = Depends(get_current_user)):
    """Get all notes for a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access notes")
        
        db = get_database()
        
        notes_cursor = db.lead_notes.find({"lead_id": lead_id}).sort("createdAt", -1)
        notes = await notes_cursor.to_list(length=None)
        
        for note in notes:
            note["id"] = str(note.pop("_id"))
        
        return notes
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notes: {str(e)}")

@router.post("/leads/{lead_id}/notes")
async def create_note(note_data: Note, current_user: dict = Depends(get_current_user)):
    """Create a note for a lead"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can create notes")
        
        db = get_database()
        
        note = {
            "lead_id": note_data.leadId,
            "title": note_data.title,
            "content": note_data.content,
            "createdAt": datetime.now().isoformat(),
            "createdBy": current_user.get("name", "Admin")
        }
        
        result = await db.lead_notes.insert_one(note)
        
        # Add activity to lead
        activity = {
            "type": "note",
            "description": f"Note added: {note_data.title}",
            "by": current_user.get("name", "Admin"),
            "timestamp": datetime.now().isoformat()
        }
        
        await db.leads.update_one(
            {"lead_id": note_data.leadId},
            {
                "$push": {"activities": activity},
                "$set": {"updatedAt": datetime.now().isoformat()}
            }
        )
        
        return {
            "message": "Note created successfully",
            "id": str(result.inserted_id)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating note: {str(e)}")

# ============= CONVERT TO DEAL =============

@router.post("/leads/{lead_id}/convert-to-deal")
async def convert_to_deal(convert_data: ConvertToDeal, current_user: dict = Depends(get_current_user)):
    """Convert a lead to a deal"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can convert leads to deals")
        
        db = get_database()
        
        # Get lead
        lead = await db.leads.find_one({"lead_id": convert_data.leadId})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Update lead status to Qualified
        await db.leads.update_one(
            {"lead_id": convert_data.leadId},
            {
                "$set": {
                    "status": "Qualified",
                    "convertedToDeal": True,
                    "convertedAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                },
                "$push": {
                    "activities": {
                        "type": "conversion",
                        "description": "Converted to deal",
                        "by": current_user.get("name", "Admin"),
                        "timestamp": datetime.now().isoformat()
                    }
                }
            }
        )
        
        # TODO: Create actual deal record in deals collection
        # This would involve creating organization and contact if needed
        
        return {
            "message": "Lead converted to deal successfully",
            "lead_id": convert_data.leadId
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting lead to deal: {str(e)}")

