from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=False)
    joining_date = Column(String(30), nullable=False)  # YYYY-MM-DD
    employment_status = Column(String(30), default="Active", nullable=False)  # Active, Inactive, Terminated
    salary = Column(Float, default=0.0, nullable=False)
    address = Column(String(255), default="", nullable=False)

    # Reporting line: employee_id (badge) of the direct manager. NULL = top of the tree / not placed yet.
    reports_to = Column(String(50), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # 1-to-1 relationship with User account
    user = relationship("User", back_populates="employee", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "department": self.department,
            "designation": self.designation,
            "joining_date": self.joining_date,
            "employment_status": self.employment_status,
            "salary": self.salary,
            "address": self.address,
            "reports_to": self.reports_to,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "has_login_account": self.user is not None,
            "account_role": self.user.role if self.user else None,
            "account_active": self.user.is_active if self.user else False,
            "account_username": self.user.username if self.user else None,
        }


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Employee", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Foreign Key linking this account directly to an Employee record
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), unique=True, nullable=True)
    employee = relationship("Employee", back_populates="user")

    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "employee_id": self.employee.employee_id if self.employee else None,
            "employee_name": self.employee.full_name if self.employee else None,
            "department": self.employee.department if self.employee else "IT Administration",
            "employee_status": self.employee.employment_status if self.employee else "Active",
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    performed_by = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)  # EMPLOYEE, USER, AUTH
    target_id = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "performed_by": self.performed_by,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


class Attendance(Base):
    """
    One row per employee per day. Rows exist ONLY when someone really checked in
    (or HR recorded it manually). Nothing is ever auto-generated.
    """
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),)

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), nullable=False, index=True)  # badge id, e.g. EMP-001
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    status = Column(String(20), nullable=False, default="PRESENT")  # PRESENT | LATE | ON_LEAVE | ABSENT
    check_in = Column(String(5), nullable=True)  # HH:MM
    check_out = Column(String(5), nullable=True)  # HH:MM
    note = Column(String(255), default="", nullable=False)
    source = Column(String(20), default="SELF", nullable=False)  # SELF | HR
    marked_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "date": self.date,
            "status": self.status,
            "check_in": self.check_in,
            "check_out": self.check_out,
            "note": self.note or "",
            "source": self.source,
            "marked_by": self.marked_by,
        }
