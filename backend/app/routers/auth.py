from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app.config import get_settings
from app.deps import CurrentUser, DbSession, commit_or_400
from app.models import User
from app.responses import success
from app.schemas import ChangePasswordIn, LoginIn, RegisterIn, UserOut
from app.security import (
    COOKIE_NAME,
    burn_password_time,
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _user_out(user: User) -> dict:
    return UserOut.model_validate(user).model_dump(mode="json")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: DbSession):
    if db.scalar(select(User.id).where(User.email == payload.email)) is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email is already registered")

    # The role is never taken from the client. Every new account is a normal user.
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    commit_or_400(db, "Email is already registered")
    db.refresh(user)
    return success(_user_out(user), "Account created")


@router.post("/login")
def login(payload: LoginIn, response: Response, db: DbSession):
    settings = get_settings()
    user = db.scalar(select(User).where(User.email == payload.email))

    if user is None:
        burn_password_time()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    token = create_access_token(user.id, user.role)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=settings.jwt_expire_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="strict",
        path="/",
    )
    return success(_user_out(user), "Login successful")


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        secure=get_settings().cookie_secure,
        samesite="strict",
    )
    return success(None, "Logged out")


@router.get("/me")
def me(user: CurrentUser):
    return success(_user_out(user))


@router.put("/password")
def change_password(payload: ChangePasswordIn, user: CurrentUser, db: DbSession):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    if payload.current_password == payload.new_password:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "New password must be different")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return success(None, "Password updated")