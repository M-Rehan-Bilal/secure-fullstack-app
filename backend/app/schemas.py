from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=50)]
Email = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True, to_lower=True, min_length=5, max_length=50, pattern=EMAIL_PATTERN
    ),
]
Password = Annotated[str, StringConstraints(min_length=8, max_length=128)]
RollNumber = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=3, max_length=30, pattern=r"^[A-Za-z0-9-]+$")
]
Department = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=50)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^\+?[0-9]{10,15}$")]


class RegisterIn(BaseModel):
    name: NameStr
    email: Email
    password: Password


class LoginIn(BaseModel):
    email: Email
    password: str = Field(min_length=1, max_length=128)


class ChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: Password


class RegistrationIn(BaseModel):
    full_name: NameStr
    roll_number: RollNumber
    department: Department
    semester: int = Field(ge=1, le=8)
    phone: Phone


class RoleIn(BaseModel):
    role: Literal["user", "admin"]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    created_at: datetime


class RegistrationOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    roll_number: str
    department: str
    semester: int
    phone: str
    created_at: datetime