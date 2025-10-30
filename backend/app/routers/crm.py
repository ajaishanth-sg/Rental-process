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

