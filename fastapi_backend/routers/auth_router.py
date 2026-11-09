from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    log_audit,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Central authentication endpoint for both Admins, Managers, and Employees.
    Verifies credentials, checks active account status, and verifies that the linked
    employee has not been marked Inactive or Terminated by HR.
    """
    identifier = request.username.strip()
    norm = identifier.lower().replace(" ", "").replace("-", "").replace("_", "")
    alias_map = {
        "hrmanager": "hr",
        "humanresources": "hr",
        "salesmanager": "sales",
        "projectmanager": "pm",
        "financemanager": "finance",
        "procurementmanager": "procurement",
        "supportstaff": "support",
        "superadmin": "admin",
        "administrator": "admin",
    }
    lookup_term = alias_map.get(norm, identifier)

    # Search user by username or email
    user = (
        db.query(models.User)
        .filter(
            (models.User.username.ilike(identifier))
            | (models.User.username.ilike(lookup_term))
            | (models.User.email.ilike(identifier))
            | (models.User.email.ilike(lookup_term))
        )
        .first()
    )

    if not user or not verify_password(request.password, user.hashed_password):
        log_audit(
            db=db,
            action="LOGIN_FAILED",
            performed_by=identifier,
            target_type="AUTH",
            target_id=identifier,
            details=f"Failed login attempt for identifier '{identifier}' (invalid credentials).",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Check account active status
    if not user.is_active:
        log_audit(
            db=db,
            action="LOGIN_FAILED",
            performed_by=user.username,
            target_type="AUTH",
            target_id=str(user.id),
            details=f"Login blocked for '{user.username}': Account is marked deactivated.",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been deactivated. Please contact your Super Admin or HR Manager.",
        )

    # 2. Check role restriction (Support Staff & Procurement Manager revoked)
    if user.role in ["Procurement Manager", "Support Staff"]:
        log_audit(
            db=db,
            action="LOGIN_BLOCKED",
            performed_by=user.username,
            target_type="AUTH",
            target_id=str(user.id),
            details=f"Login blocked for '{user.username}': Role '{user.role}' is restricted from login access.",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Login access for {user.role} has been revoked.",
        )

    # 3. Check linked Employee employment status
    # CRITICAL: "If HR changes the employee status to 'Inactive', the associated login account should no longer be allowed to log in."
    if user.employee and user.employee.employment_status.lower() != "active":
        log_audit(
            db=db,
            action="LOGIN_FAILED",
            performed_by=user.username,
            target_type="AUTH",
            target_id=str(user.employee.employee_id),
            details=f"Login blocked for '{user.username}': Linked employee status is '{user.employee.employment_status}'.",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: Your employee status is '{user.employee.employment_status}'. Login access has been disabled by HR.",
        )

    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Generate JWT
    token_payload = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
        "email": user.email,
        "employee_badge": user.employee.employee_id if user.employee else None,
    }
    access_token = create_access_token(data=token_payload)

    log_audit(
        db=db,
        action="LOGIN_SUCCESS",
        performed_by=user.username,
        target_type="AUTH",
        target_id=str(user.id),
        details=f"User '{user.username}' successfully authenticated with role '{user.role}'.",
    )

    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse(**user.to_dict()),
    )


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """
    Public self-registration.
    Creates a normal 'Employee' login and a matching employee record (no manager yet,
    HR can place the person in the org tree later). Elevated roles are NEVER granted here.
    """
    username = payload.username.strip()
    email = payload.email.strip().lower()

    if db.query(models.User).filter(models.User.username.ilike(username)).first():
        raise HTTPException(status_code=400, detail="This username is already taken.")
    if (
        db.query(models.User).filter(models.User.email == email).first()
        or db.query(models.Employee).filter(models.Employee.email == email).first()
    ):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Next free badge: EMP-<max numeric suffix + 1>
    max_no = 0
    for (badge,) in db.query(models.Employee.employee_id).all():
        digits = "".join(ch for ch in str(badge) if ch.isdigit())
        if digits:
            max_no = max(max_no, int(digits))
    badge_id = f"EMP-{max_no + 1:03d}"

    employee = models.Employee(
        employee_id=badge_id,
        full_name=payload.full_name.strip(),
        email=email,
        phone=(payload.phone or "").strip() or "-",
        department="Unassigned",
        designation="New Member",
        joining_date=datetime.utcnow().strftime("%Y-%m-%d"),
        employment_status="Active",
        salary=0.0,
        address="",
        reports_to=None,
    )
    db.add(employee)
    db.flush()

    user = models.User(
        username=username,
        email=email,
        hashed_password=get_password_hash(payload.password),
        role="Employee",
        is_active=True,
        employee_id=employee.id,
        last_login=datetime.utcnow(),
    )
    db.add(user)
    db.flush()

    log_audit(
        db=db,
        action="USER_REGISTERED",
        performed_by=username,
        target_type="USER",
        target_id=str(user.id),
        details=f"New member '{username}' self-registered as {badge_id} with role 'Employee'.",
    )
    db.commit()
    db.refresh(user)

    token = create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "role": user.role,
            "email": user.email,
            "employee_badge": employee.employee_id,
        }
    )
    return schemas.TokenResponse(access_token=token, token_type="bearer", user=schemas.UserResponse(**user.to_dict()))


@router.post("/logout")
def logout(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Logs a logout audit event."""
    log_audit(
        db=db,
        action="LOGOUT",
        performed_by=current_user.username,
        target_type="AUTH",
        target_id=str(current_user.id),
        details=f"User '{current_user.username}' logged out.",
    )
    return {"message": "Logged out successfully", "status": "OK"}


@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(
    current_user: models.User = Depends(get_current_user),
):
    """Returns profile and permission context for the authenticated user."""
    return schemas.UserResponse(**current_user.to_dict())


@router.post("/change-password")
def change_own_password(
    request: schemas.ChangePasswordRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows an employee or manager to change their own password securely."""
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long.",
        )

    current_user.hashed_password = get_password_hash(request.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()

    log_audit(
        db=db,
        action="PASSWORD_RESET",
        performed_by=current_user.username,
        target_type="USER",
        target_id=str(current_user.id),
        details=f"User '{current_user.username}' updated their own password.",
    )

    return {"message": "Password changed successfully", "status": "OK"}
