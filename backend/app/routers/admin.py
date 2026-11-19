from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import AdminUser, DbSession
from app.models import User
from app.responses import success
from app.schemas import RoleIn, UserOut

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/users")
def list_users(admin: AdminUser, db: DbSession):
    users = db.scalars(select(User).order_by(User.id)).all()
    return success([UserOut.model_validate(u).model_dump(mode="json") for u in users], "Users retrieved")


@router.patch("/users/{user_id}/role")
def update_role(user_id: int, payload: RoleIn, admin: AdminUser, db: DbSession):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if user.id == admin.id and payload.role != "admin":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot remove your own admin role")

    user.role = payload.role
    db.commit()
    db.refresh(user)
    return success(UserOut.model_validate(user).model_dump(mode="json"), "Role updated")