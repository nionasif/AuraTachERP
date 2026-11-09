"""
Attendance - REAL records only.

Nothing here invents data. A day has a record only when:
  * the employee pressed Check-in / Check-out themselves, or
  * HR / Super Admin recorded it manually.

Days without a record are reported as NOT_JOINED (before joining date),
WEEKEND (Friday/Saturday), UPCOMING (future) or NO_RECORD (a past working day nobody recorded).
"""
import calendar
import re
from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import get_current_user, require_hr_or_admin, log_audit

router = APIRouter(prefix="/attendance", tags=["Attendance"])

# Office start 09:00, grace until 09:15 -> after that "LATE"
LATE_AFTER = "09:15"
WEEKEND_DAYS = (4, 5)  # Friday, Saturday (Python weekday(): Mon=0 ... Fri=4, Sat=5)
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _now_hm() -> str:
    return datetime.now().strftime("%H:%M")


def _today() -> str:
    return date.today().strftime("%Y-%m-%d")


def _find_employee(db: Session, ref: str) -> Optional[models.Employee]:
    emp = db.query(models.Employee).filter(models.Employee.employee_id == ref).first()
    if not emp and str(ref).isdigit():
        emp = db.query(models.Employee).filter(models.Employee.id == int(ref)).first()
    return emp


def _my_employee(db: Session, user: models.User) -> models.Employee:
    if not user.employee:
        raise HTTPException(
            status_code=400,
            detail="Your login is not linked to an employee profile, so attendance cannot be recorded.",
        )
    return user.employee


def _parse_date(value: str) -> date:
    try:
        return datetime.strptime(str(value)[:10], "%Y-%m-%d").date()
    except Exception:
        return date.today()


# --------------------------------------------------------------------------
# Self service
# --------------------------------------------------------------------------
@router.get("/me/today")
def my_today(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    emp = _my_employee(db, current_user)
    rec = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == emp.employee_id, models.Attendance.date == _today())
        .first()
    )
    return {"date": _today(), "employee_id": emp.employee_id, "record": rec.to_dict() if rec else None}


@router.post("/check-in")
def check_in(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    emp = _my_employee(db, current_user)
    today = _today()
    joined = _parse_date(emp.joining_date)
    if date.today() < joined:
        raise HTTPException(status_code=400, detail=f"Your joining date is {joined}. You can check in from that day.")

    rec = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == emp.employee_id, models.Attendance.date == today)
        .first()
    )
    if rec and rec.check_in:
        raise HTTPException(status_code=400, detail=f"You already checked in today at {rec.check_in}.")

    now = _now_hm()
    status_value = "LATE" if now > LATE_AFTER else "PRESENT"
    if rec:  # HR created a row for today without a time (e.g. ON_LEAVE) - respect HR's decision
        if rec.status in ("ON_LEAVE", "ABSENT"):
            raise HTTPException(status_code=400, detail=f"HR has marked you as {rec.status} for today.")
        rec.check_in = now
        rec.status = status_value
    else:
        rec = models.Attendance(
            employee_id=emp.employee_id, date=today, status=status_value, check_in=now, source="SELF", note=""
        )
        db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec.to_dict()


@router.post("/check-out")
def check_out(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    emp = _my_employee(db, current_user)
    rec = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == emp.employee_id, models.Attendance.date == _today())
        .first()
    )
    if not rec or not rec.check_in:
        raise HTTPException(status_code=400, detail="You have not checked in today.")
    if rec.check_out:
        raise HTTPException(status_code=400, detail=f"You already checked out today at {rec.check_out}.")
    rec.check_out = _now_hm()
    db.commit()
    db.refresh(rec)
    return rec.to_dict()


# --------------------------------------------------------------------------
# HR / Admin
# --------------------------------------------------------------------------
@router.post("/mark")
def mark_attendance(
    payload: schemas.AttendanceMarkRequest,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    emp = _find_employee(db, payload.employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{payload.employee_id}' not found.")

    status_value = payload.status.strip().upper()
    if status_value not in schemas.ATTENDANCE_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {', '.join(schemas.ATTENDANCE_STATUSES)}.")

    try:
        day = datetime.strptime(payload.date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="Date must be YYYY-MM-DD.")
    if day > date.today():
        raise HTTPException(status_code=400, detail="You cannot record attendance for a future date.")
    if day < _parse_date(emp.joining_date):
        raise HTTPException(status_code=400, detail="This date is before the employee's joining date.")

    for label, value in (("Check-in", payload.check_in), ("Check-out", payload.check_out)):
        if value and not TIME_RE.match(value):
            raise HTTPException(status_code=400, detail=f"{label} must look like HH:MM (24h).")
    if payload.check_in and payload.check_out and payload.check_out < payload.check_in:
        raise HTTPException(status_code=400, detail="Check-out cannot be earlier than check-in.")

    in_time = payload.check_in if status_value in ("PRESENT", "LATE") else None
    out_time = payload.check_out if status_value in ("PRESENT", "LATE") else None

    rec = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == emp.employee_id, models.Attendance.date == payload.date)
        .first()
    )
    if rec:
        rec.status, rec.check_in, rec.check_out = status_value, in_time, out_time
        rec.note = (payload.note or "").strip()
        rec.source, rec.marked_by = "HR", current_user.username
    else:
        rec = models.Attendance(
            employee_id=emp.employee_id,
            date=payload.date,
            status=status_value,
            check_in=in_time,
            check_out=out_time,
            note=(payload.note or "").strip(),
            source="HR",
            marked_by=current_user.username,
        )
        db.add(rec)
    db.commit()
    db.refresh(rec)

    log_audit(
        db=db,
        action="ATTENDANCE_MARKED",
        performed_by=current_user.username,
        target_type="EMPLOYEE",
        target_id=emp.employee_id,
        details=f"{emp.full_name} marked {status_value} for {payload.date}.",
    )
    return rec.to_dict()


@router.delete("/{employee_id}/{day}")
def delete_attendance(
    employee_id: str,
    day: str,
    current_user: models.User = Depends(require_hr_or_admin),
    db: Session = Depends(get_db),
):
    rec = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == employee_id, models.Attendance.date == day)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="No attendance record for that day.")
    db.delete(rec)
    db.commit()
    return {"message": "Attendance record removed."}


# --------------------------------------------------------------------------
# Read: team board for a day, and one person's month
# --------------------------------------------------------------------------
@router.get("/board")
def team_board(
    day: Optional[str] = Query(None, description="YYYY-MM-DD, default today"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Everyone's status for one day + counts. Only people who have joined by that day are listed."""
    day = day or _today()
    target = _parse_date(day)
    employees = (
        db.query(models.Employee)
        .filter(models.Employee.employment_status.ilike("active"))
        .order_by(models.Employee.full_name)
        .all()
    )
    recs = {r.employee_id: r for r in db.query(models.Attendance).filter(models.Attendance.date == day).all()}

    rows, counts = [], {"PRESENT": 0, "LATE": 0, "ON_LEAVE": 0, "ABSENT": 0, "NOT_MARKED": 0}
    for e in employees:
        if _parse_date(e.joining_date) > target:
            continue
        r = recs.get(e.employee_id)
        status_value = r.status if r else "NOT_MARKED"
        counts[status_value] = counts.get(status_value, 0) + 1
        rows.append(
            {
                "employee_id": e.employee_id,
                "full_name": e.full_name,
                "department": e.department,
                "designation": e.designation,
                "status": status_value,
                "check_in": r.check_in if r else None,
                "check_out": r.check_out if r else None,
                "note": r.note if r else "",
            }
        )
    return {"date": day, "total": len(rows), "counts": counts, "rows": rows}


@router.get("/employee/{employee_id}")
def employee_month(
    employee_id: str,
    month: Optional[str] = Query(None, description="YYYY-MM, default current month"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    emp = _find_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found.")

    # Normal staff can see their own attendance; HR/Admin can see anyone's.
    is_manager = current_user.role in ("Super Admin", "HR Manager")
    my_badge = current_user.employee.employee_id if current_user.employee else None
    if not is_manager and my_badge != emp.employee_id:
        raise HTTPException(status_code=403, detail="You can only view your own attendance.")

    today = date.today()
    if month and re.match(r"^\d{4}-\d{2}$", month):
        year, mon = int(month[:4]), int(month[5:7])
    else:
        year, mon = today.year, today.month
    if not 1 <= mon <= 12:
        raise HTTPException(status_code=400, detail="Month must be between 01 and 12.")

    days_in_month = calendar.monthrange(year, mon)[1]
    prefix = f"{year:04d}-{mon:02d}-"
    recs = {
        r.date: r
        for r in db.query(models.Attendance)
        .filter(models.Attendance.employee_id == emp.employee_id, models.Attendance.date.like(prefix + "%"))
        .all()
    }
    joined = _parse_date(emp.joining_date)

    days = []
    counts = {"PRESENT": 0, "LATE": 0, "ON_LEAVE": 0, "ABSENT": 0}
    for n in range(1, days_in_month + 1):
        d = date(year, mon, n)
        key = d.strftime("%Y-%m-%d")
        r = recs.get(key)
        if r:
            status_value = r.status
            counts[status_value] = counts.get(status_value, 0) + 1
        elif d < joined:
            status_value = "NOT_JOINED"
        elif d.weekday() in WEEKEND_DAYS:
            status_value = "WEEKEND"
        elif d > today:
            status_value = "UPCOMING"
        else:
            status_value = "NO_RECORD"
        days.append(
            {
                "date": key,
                "day": d.strftime("%a"),
                "status": status_value,
                "check_in": r.check_in if r else None,
                "check_out": r.check_out if r else None,
                "note": r.note if r else "",
                "source": r.source if r else None,
            }
        )

    recorded = sum(counts.values())
    return {
        "employee": {
            "employee_id": emp.employee_id,
            "full_name": emp.full_name,
            "department": emp.department,
            "designation": emp.designation,
            "joining_date": emp.joining_date,
        },
        "month": f"{year:04d}-{mon:02d}",
        "month_label": date(year, mon, 1).strftime("%B %Y"),
        "summary": {**counts, "recorded_days": recorded},
        "days": days,
    }
