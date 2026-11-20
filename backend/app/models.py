from datetime import datetime

from sqlalchemy import TIMESTAMP, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.mysql import TINYINT
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(Enum("user", "admin", name="user_role"), default="user")
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())


class StudentRegistration(Base):
    __tablename__ = "student_registrations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name: Mapped[str] = mapped_column(String(50))
    roll_number: Mapped[str] = mapped_column(String(30), unique=True)
    department: Mapped[str] = mapped_column(String(50))
    semester: Mapped[int] = mapped_column(TINYINT(unsigned=True))
    phone_encrypted: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())