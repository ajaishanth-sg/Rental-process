from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone
import traceback
from ..utils.auth import get_current_user
from ..utils.database import get_database
from pydantic import BaseModel

router = APIRouter()

class EmployeeCreate(BaseModel):
    name: str
    email: str
    phone: str
    department: str
    designation: str
    join_date: str

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    join_date: Optional[str] = None
    status: Optional[str] = None

@router.get("/employees")
async def get_employees(current_user: dict = Depends(get_current_user)):
    """Get all employees for admin management"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can access this endpoint")

        db = get_database()

        # Fetch all employees
        employees_cursor = db.employees.find({})
        employees_raw = await employees_cursor.to_list(length=None)

        employees = []
        for employee in employees_raw:
            employee_copy = employee.copy()
            employee_copy["id"] = str(employee_copy.pop("_id"))
            employees.append(employee_copy)

        return employees

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employees: {str(e)}")

@router.post("/employees")
async def create_employee(employee_data: EmployeeCreate, current_user: dict = Depends(get_current_user)):
    """Create a new employee"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can create employees")

        db = get_database()

        # Check if employee with same email already exists
        existing = await db.employees.find_one({"email": employee_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Employee with this email already exists")

        # Get the maximum existing employee number
        all_employees = await db.employees.find({
            "employee_id": {"$regex": "^EMP-"}
        }).to_list(length=None)

        max_num = 0
        for emp in all_employees:
            emp_id = emp.get("employee_id", "")
            if emp_id.startswith("EMP-"):
                try:
                    parts = emp_id.split("-")
                    if len(parts) == 2:
                        num = int(parts[1])
                        max_num = max(max_num, num)
                except:
                    pass

        employee_id = f"EMP-{str(max_num + 1).zfill(4)}"

        employee = {
            "employee_id": employee_id,
            "name": employee_data.name,
            "email": employee_data.email,
            "phone": employee_data.phone,
            "department": employee_data.department,
            "designation": employee_data.designation,
            "join_date": employee_data.join_date,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user["id"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        result = await db.employees.insert_one(employee)

        return {
            "message": "Employee created successfully",
            "employee_id": employee_id,
            "id": str(result.inserted_id)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating employee: {str(e)}")

@router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, employee_data: EmployeeUpdate, current_user: dict = Depends(get_current_user)):
    """Update employee information"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can update employees")

        db = get_database()

        # Find employee
        employee = await db.employees.find_one({"employee_id": employee_id})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Prepare update data
        update_data = {}
        if employee_data.name is not None:
            update_data["name"] = employee_data.name
        if employee_data.email is not None:
            update_data["email"] = employee_data.email
        if employee_data.phone is not None:
            update_data["phone"] = employee_data.phone
        if employee_data.department is not None:
            update_data["department"] = employee_data.department
        if employee_data.designation is not None:
            update_data["designation"] = employee_data.designation
        if employee_data.join_date is not None:
            update_data["join_date"] = employee_data.join_date
        if employee_data.status is not None:
            update_data["status"] = employee_data.status

        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Update employee
        result = await db.employees.update_one(
            {"employee_id": employee_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes made")

        return {"message": "Employee updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating employee: {str(e)}")

@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an employee"""
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only admin can delete employees")

        db = get_database()

        # Find employee
        employee = await db.employees.find_one({"employee_id": employee_id})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Delete employee
        result = await db.employees.delete_one({"employee_id": employee_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")

        return {"message": "Employee deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting employee: {str(e)}")