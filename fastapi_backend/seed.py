from datetime import datetime
from sqlalchemy.orm import Session
import models
from security import get_password_hash, log_audit

DEFAULT_ENTERPRISE_ACCOUNTS = [
    {
        "role": "Super Admin",
        "username": "admin",
        "email": "admin@auratech.it",
        "password": "password123",
        "employee_id": "EMP-001",
        "full_name": "System Administrator",
        "phone": "+880 1700-000001",
        "department": "Executive & Governance",
        "designation": "CEO / Managing Director",
        "joining_date": "2024-01-01",
        "salary": 250000.0,
        "address": "Silicon Tower, Gulshan-2, Dhaka",
    },
    {
        "role": "HR Manager",
        "username": "hr",
        "email": "hr@auratech.it",
        "password": "password123",
        "employee_id": "EMP-002",
        "full_name": "Fatima Rahman",
        "phone": "+880 1700-000002",
        "department": "People & Culture",
        "designation": "HR Manager",
        "joining_date": "2024-02-15",
        "salary": 150000.0,
        "address": "Banani DOHS, Dhaka",
    },
    {
        "role": "Sales Manager",
        "username": "sales",
        "email": "sales@auratech.it",
        "password": "password123",
        "employee_id": "EMP-003",
        "full_name": "Tanvir Ahmed",
        "phone": "+880 1700-000003",
        "department": "Client Accounts & Growth",
        "designation": "Sales Manager",
        "joining_date": "2024-03-01",
        "salary": 160000.0,
        "address": "Uttara Sector 4, Dhaka",
    },
    {
        "role": "Project Manager",
        "username": "pm",
        "email": "pm@auratech.it",
        "password": "password123",
        "employee_id": "EMP-004",
        "full_name": "Nusrat Jahan",
        "phone": "+880 1700-000004",
        "department": "Engineering Delivery",
        "designation": "Sr. Pro Manager",
        "joining_date": "2024-03-15",
        "salary": 155000.0,
        "address": "Mirpur DOHS, Dhaka",
    },
    {
        "role": "Finance Manager",
        "username": "finance",
        "email": "finance@auratech.it",
        "password": "password123",
        "employee_id": "EMP-005",
        "full_name": "Rafiqul Islam",
        "phone": "+880 1700-000005",
        "department": "Finance & Compliance",
        "designation": "Sr. Finance & Accountant",
        "joining_date": "2024-01-10",
        "salary": 175000.0,
        "address": "Dhanmondi Road 27, Dhaka",
    },
    {
        "role": "Procurement Manager",
        "username": "procurement",
        "email": "procurement@auratech.it",
        "password": "password123",
        "employee_id": "EMP-006",
        "full_name": "Kamal Hossain",
        "phone": "+880 1700-000006",
        "department": "Supply Chain & Assets",
        "designation": "Inventory Manager",
        "joining_date": "2024-04-01",
        "salary": 140000.0,
        "address": "Bashundhara R/A, Block C, Dhaka",
    },
    {
        "role": "Support Staff",
        "username": "support",
        "email": "support@auratech.it",
        "password": "password123",
        "employee_id": "EMP-007",
        "full_name": "Ayesha Siddiqua",
        "phone": "+880 1700-000007",
        "department": "Sales & Client Service",
        "designation": "Jr Sales Exe",
        "joining_date": "2024-05-01",
        "salary": 95000.0,
        "address": "Mohakhali Wireless, Dhaka",
    },
    {
        "role": "Employee",
        "username": "employee",
        "email": "employee@auratech.it",
        "password": "password123",
        "employee_id": "EMP-008",
        "full_name": "Mahmud Hasan",
        "phone": "+880 1700-000008",
        "department": "Supply Chain & Assets",
        "designation": "IT Asset Officer",
        "joining_date": "2024-06-01",
        "salary": 85000.0,
        "address": "Niketan, Gulshan-1, Dhaka",
    },
]


def seed_database(db: Session):
    """Populates the database with initial enterprise role accounts and employee records."""
    default_hash = get_password_hash("password123")

    for acc in DEFAULT_ENTERPRISE_ACCOUNTS:
        # 1. Ensure employee record exists
        emp = db.query(models.Employee).filter(
            (models.Employee.employee_id == acc["employee_id"]) | (models.Employee.email == acc["email"])
        ).first()

        if not emp:
            emp = models.Employee(
                employee_id=acc["employee_id"],
                full_name=acc["full_name"],
                email=acc["email"],
                phone=acc["phone"],
                department=acc["department"],
                designation=acc["designation"],
                joining_date=acc["joining_date"],
                employment_status="Active",
                salary=acc["salary"],
                address=acc["address"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(emp)
            db.flush()

        # 2. Ensure user account exists
        user = db.query(models.User).filter(
            (models.User.username == acc["username"]) | (models.User.email == acc["email"])
        ).first()

        if not user:
            user = models.User(
                username=acc["username"],
                email=acc["email"],
                hashed_password=default_hash,
                role=acc["role"],
                is_active=True,
                employee_id=emp.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(user)
            db.flush()

            log_audit(
                db=db,
                action="SYSTEM_INIT",
                performed_by="SYSTEM",
                target_type="USER",
                target_id=str(user.id),
                details=f"System role user '{user.username}' ({user.role}) initialized.",
            )
        else:
            # Update role and link employee if not linked
            if not user.employee_id:
                user.employee_id = emp.id
            if user.role != acc["role"]:
                user.role = acc["role"]
            user.is_active = True

    db.commit()
    seed_sample_hierarchy(db)
    print("==> Database verified and seeded with all 8 enterprise roles.")


# Hierarchy tree matching enterprise structure:
# CEO / Managing Director
#   ├── (1) HR Manager
#   ├── (2) Sr. Finance & Accountant
#   ├── (3) Inventory Manager
#   │     └── i. IT Asset Officer
#   ├── (4) Sales Manager
#   │     ├── i. Jr Sales Exe
#   │     └── ii. CRM Exe
#   └── (5) Sr. Pro Manager
#         ├── i. Jr Project Manager
#         ├── ii. Software Developer
#         └── iii. QA Eng
SAMPLE_HIERARCHY = {
    # Level 1 under CEO / Managing Director
    "EMP-002": "EMP-001",  # (1) HR Manager
    "EMP-005": "EMP-001",  # (2) Sr. Finance & Accountant
    "EMP-006": "EMP-001",  # (3) Inventory Manager
    "EMP-003": "EMP-001",  # (4) Sales Manager
    "EMP-004": "EMP-001",  # (5) Sr. Pro Manager

    # Level 2 under (3) Inventory Manager
    "EMP-008": "EMP-006",  # i. IT Asset Officer

    # Level 2 under (4) Sales Manager
    "EMP-007": "EMP-003",  # i. Jr Sales Exe
    "EMP-664": "EMP-003",  # ii. CRM Exe

    # Level 2 under (5) Sr. Pro Manager
    "EMP017": "EMP-004",   # i. Jr Project Manager
    "EMP-658": "EMP-004",  # ii. Software Developer
    "EMP-663": "EMP-004",  # iii. QA Eng
}

DESIGNATION_MAPPINGS = {
    "EMP-001": "CEO / Managing Director",
    "EMP-002": "HR Manager",
    "EMP-005": "Sr. Finance & Accountant",
    "EMP-006": "Inventory Manager",
    "EMP-003": "Sales Manager",
    "EMP-004": "Sr. Pro Manager",
    "EMP-008": "IT Asset Officer",
    "EMP-007": "Jr Sales Exe",
    "EMP-664": "CRM Exe",
    "EMP017": "Jr Project Manager",
    "EMP-658": "Software Developer",
    "EMP-663": "QA Eng",
}


def seed_sample_hierarchy(db: Session):
    for badge, desig in DESIGNATION_MAPPINGS.items():
        emp = db.query(models.Employee).filter(models.Employee.employee_id == badge).first()
        if emp:
            emp.designation = desig
    for badge, manager in SAMPLE_HIERARCHY.items():
        emp = db.query(models.Employee).filter(models.Employee.employee_id == badge).first()
        boss = db.query(models.Employee).filter(models.Employee.employee_id == manager).first()
        if emp and boss:
            emp.reports_to = manager
    db.commit()
