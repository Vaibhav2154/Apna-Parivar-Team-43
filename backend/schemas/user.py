from typing import Optional
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    role: str  # super_admin, family_admin, family_co_admin, family_user

class UserResponse(UserBase):
    id: str
    family_id: Optional[str]
    role: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Family Schemas
class FamilyBase(BaseModel):
    family_name: str

class FamilyCreate(FamilyBase):
    pass

class FamilyResponse(FamilyBase):
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Family Member Schemas
class FamilyMemberBase(BaseModel):
    name: str
    photo_url: Optional[str] = None
    relationships: dict = {}
    custom_fields: dict = {}

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    relationships: Optional[dict] = None
    custom_fields: Optional[dict] = None

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    family_id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
