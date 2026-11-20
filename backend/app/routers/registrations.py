from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import CurrentUser, DbSession, commit_or_400
from app.models import StudentRegistration, User
from app.responses import success
from app.schemas import RegistrationIn, RegistrationOut
from app.security import decrypt_field, encrypt_field

router = APIRouter(prefix="/api/v1/registrations", tags=["registrations"])


def _to_out(reg: StudentRegistration) -> dict:
    return RegistrationOut(
        id=reg.id,
        user_id=reg.user_id,
        full_name=reg.full_name,
        roll_number=reg.roll_number,
        department=reg.department,
        semester=reg.semester,
        phone=decrypt_field(reg.phone_encrypted),
        created_at=reg.created_at,
    ).model_dump(mode="json")


def _load_or_404(db, reg_id: int) -> StudentRegistration:
    reg = db.get(StudentRegistration, reg_id)
    if reg is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Registration not found")
    return reg


def _ensure_access(user: User, reg: StudentRegistration) -> None:
    if user.role != "admin" and reg.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only access your own registration")


def _roll_taken(db, roll_number: str, exclude_id: int | None = None) -> bool:
    stmt = select(StudentRegistration.id).where(StudentRegistration.roll_number == roll_number)
    if exclude_id is not None:
        stmt = stmt.where(StudentRegistration.id != exclude_id)
    return db.scalar(stmt) is not None


@router.post("", status_code=status.HTTP_201_CREATED)
def create_registration(payload: RegistrationIn, user: CurrentUser, db: DbSession):
    already = db.scalar(select(StudentRegistration.id).where(StudentRegistration.user_id == user.id))
    if already is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You already have a registration. Update it instead.")
    if _roll_taken(db, payload.roll_number):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This roll number is already registered")

    reg = StudentRegistration(
        user_id=user.id,
        full_name=payload.full_name,
        roll_number=payload.roll_number,
        department=payload.department,
        semester=payload.semester,
        phone_encrypted=encrypt_field(payload.phone),
    )
    db.add(reg)
    commit_or_400(db, "This roll number is already registered")
    db.refresh(reg)
    return success(_to_out(reg), "Registration created")


@router.get("")
def list_registrations(user: CurrentUser, db: DbSession):
    stmt = select(StudentRegistration).order_by(StudentRegistration.id)
    if user.role != "admin":
        stmt = stmt.where(StudentRegistration.user_id == user.id)
    regs = db.scalars(stmt).all()
    return success([_to_out(r) for r in regs], "Registrations retrieved")


@router.get("/{reg_id}")
def get_registration(reg_id: int, user: CurrentUser, db: DbSession):
    reg = _load_or_404(db, reg_id)
    _ensure_access(user, reg)
    return success(_to_out(reg))


@router.put("/{reg_id}")
def update_registration(reg_id: int, payload: RegistrationIn, user: CurrentUser, db: DbSession):
    reg = _load_or_404(db, reg_id)
    _ensure_access(user, reg)
    if _roll_taken(db, payload.roll_number, exclude_id=reg.id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This roll number is already registered")

    reg.full_name = payload.full_name
    reg.roll_number = payload.roll_number
    reg.department = payload.department
    reg.semester = payload.semester
    reg.phone_encrypted = encrypt_field(payload.phone)
    commit_or_400(db, "This roll number is already registered")
    db.refresh(reg)
    return success(_to_out(reg), "Registration updated")


@router.delete("/{reg_id}")
def delete_registration(reg_id: int, user: CurrentUser, db: DbSession):
    reg = _load_or_404(db, reg_id)
    _ensure_access(user, reg)
    db.delete(reg)
    db.commit()
    return success(None, "Registration deleted")