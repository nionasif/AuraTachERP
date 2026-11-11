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


# 30-Person Curated Enterprise Hierarchy:
# CEO / Managing Director
#   ├── (1) HR Manager (No sub-branches)
#   ├── (2) Sr. Finance & Accountant (No sub-branches)
#   ├── (3) Inventory Manager
#   │     └── i. IT Asset Officer
#   │           ├── Mahmud Khan (IT Systems Specialist)
#   │           ├── Sharmin Haque (Asset Inventory Associate)
#   │           └── Shuvo Islam (Procurement Officer)
#   ├── (4) Sales Manager
#   │     ├── i. Jr Sales Exe
#   │     │     ├── Shuvo Haque (Sales Officer)
#   │     │     ├── Nusrat Uddin (Corporate Sales Associate)
#   │     │     └── Naeem Islam (Accounts Executive)
#   │     └── ii. CRM Exe
#   │           ├── Farhana Siddique (Customer Support Agent)
#   │           ├── Tasnim Das (Support Specialist)
#   │           └── Nabila Sarker (Client Service Agent)
#   └── (5) Sr. Pro Manager
#         ├── i. Jr Project Manager
#         │     ├── Mizan Roy (Project Delivery Lead)
#         │     └── Tahmina Hossain (Agile Coordinator)
#         ├── ii. Software Developer
#         │     ├── IMARAN (Senior Software Engineer)
#         │     ├── Sabbir Haque (Backend Systems Engineer)
#         │     ├── Rony Sarker (Frontend Engineer)
#         │     ├── Hasan Das (Fullstack Engineer)
#         │     ├── Mim Karim (UI/UX Frontend Designer)
#         │     └── Puja Ahmed (Web Application Developer)
#         └── iii. QA Eng
#               └── Farhana Talukder (Software QA Tester)
SAMPLE_HIERARCHY = {
    # Level 1 under CEO / Managing Director
    "EMP-002": "EMP-001",  # (1) HR Manager (No sub-branches)
    "EMP-005": "EMP-001",  # (2) Sr. Finance & Accountant (No sub-branches)
    "EMP-006": "EMP-001",  # (3) Inventory Manager
    "EMP-003": "EMP-001",  # (4) Sales Manager
    "EMP-004": "EMP-001",  # (5) Sr. Pro Manager

    # Level 2 under (3) Inventory Manager
    "EMP-008": "EMP-006",  # i. IT Asset Officer
    # Level 3 under IT Asset Officer
    "EMP013": "EMP-008",   # Procurement Officer
    "EMP005": "EMP-008",   # IT Systems Specialist
    "EMP006": "EMP-008",   # Asset Inventory Associate

    # Level 2 under (4) Sales Manager
    "EMP-007": "EMP-003",  # i. Jr Sales Exe
    # Level 3 under Jr Sales Exe
    "EMP010": "EMP-007",   # Sales Officer
    "EMP014": "EMP-007",   # Corporate Sales Associate
    "EMP025": "EMP-007",   # Accounts Executive

    "EMP-664": "EMP-003",  # ii. CRM Exe
    # Level 3 under CRM Exe
    "EMP003": "EMP-664",   # Customer Support Agent
    "EMP028": "EMP-664",   # Support Specialist
    "EMP029": "EMP-664",   # Client Service Agent

    # Level 2 under (5) Sr. Pro Manager
    "EMP017": "EMP-004",   # i. Jr Project Manager
    # Level 3 under Jr Project Manager
    "EMP024": "EMP017",    # Project Delivery Lead
    "EMP038": "EMP017",    # Agile Coordinator

    "EMP-658": "EMP-004",  # ii. Software Developer
    # Level 3 under Software Developer
    "EMP-513": "EMP-658",  # Senior Software Engineer
    "EMP001": "EMP-658",   # Backend Systems Engineer
    "EMP002": "EMP-658",   # Frontend Engineer
    "EMP004": "EMP-658",   # Fullstack Engineer
    "EMP008": "EMP-658",   # UI/UX Frontend Designer
    "EMP011": "EMP-658",   # Web Application Developer

    "EMP-663": "EMP-004",  # iii. QA Eng
    # Level 3 under QA Eng
    "EMP015": "EMP-663",   # Software QA Tester
}

DESIGNATION_MAPPINGS = {
    "EMP-001": ("CEO / Managing Director", "Executive & Governance"),
    "EMP-002": ("HR Manager", "People & Culture"),
    "EMP-005": ("Sr. Finance & Accountant", "Finance & Compliance"),
    "EMP-006": ("Inventory Manager", "Supply Chain & Assets"),
    "EMP-008": ("IT Asset Officer", "Supply Chain & Assets"),
    "EMP013": ("Procurement Officer", "Supply Chain & Assets"),
    "EMP005": ("IT Systems Specialist", "Supply Chain & Assets"),
    "EMP006": ("Asset Inventory Associate", "Supply Chain & Assets"),
    "EMP-003": ("Sales Manager", "Client Accounts & Growth"),
    "EMP-007": ("Jr Sales Exe", "Sales & Marketing"),
    "EMP010": ("Sales Officer", "Sales & Marketing"),
    "EMP014": ("Corporate Sales Associate", "Sales & Marketing"),
    "EMP025": ("Accounts Executive", "Sales & Marketing"),
    "EMP-664": ("CRM Exe", "Customer Support"),
    "EMP003": ("Customer Support Agent", "Customer Support"),
    "EMP028": ("Support Specialist", "Customer Support"),
    "EMP029": ("Client Service Agent", "Customer Support"),
    "EMP-004": ("Sr. Pro Manager", "Engineering Delivery"),
    "EMP017": ("Jr Project Manager", "Engineering Delivery"),
    "EMP024": ("Project Delivery Lead", "Engineering Delivery"),
    "EMP038": ("Agile Coordinator", "Engineering Delivery"),
    "EMP-658": ("Software Developer", "Engineering Delivery"),
    "EMP-513": ("Senior Software Engineer", "Engineering Delivery"),
    "EMP001": ("Backend Systems Engineer", "Engineering Delivery"),
    "EMP002": ("Frontend Engineer", "Engineering Delivery"),
    "EMP004": ("Fullstack Engineer", "Engineering Delivery"),
    "EMP008": ("UI/UX Frontend Designer", "Engineering Delivery"),
    "EMP011": ("Web Application Developer", "Engineering Delivery"),
    "EMP-663": ("QA Eng", "Engineering Delivery"),
    "EMP015": ("Software QA Tester", "Engineering Delivery"),
}


def seed_sample_hierarchy(db: Session):
    active_ids = set(DESIGNATION_MAPPINGS.keys())
    # Deactivate others cleanly
    for emp in db.query(models.Employee).all():
        if emp.employee_id not in active_ids:
            emp.employment_status = "Inactive"
            emp.reports_to = None
        else:
            emp.employment_status = "Active"
            desig, dept = DESIGNATION_MAPPINGS[emp.employee_id]
            emp.designation = desig
            emp.department = dept
            emp.reports_to = SAMPLE_HIERARCHY.get(emp.employee_id)
    db.commit()
