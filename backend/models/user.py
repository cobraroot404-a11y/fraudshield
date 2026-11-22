from pydantic import BaseModel, EmailStr
from typing import Literal

UserRole = Literal["admin", "analyst", "viewer", "auditor"]

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class AdminUserCreate(UserCreate):
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    role: str
