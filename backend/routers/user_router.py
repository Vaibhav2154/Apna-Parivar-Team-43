from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from core.database import get_supabase_client
from schemas.user import UserCreate, UserResponse, UserBase
from services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])

async def get_user_service():
    """Dependency to get user service"""
    supabase = get_supabase_client()
    return UserService(supabase)

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, service: UserService = Depends(get_user_service)):
    """Create a new user (SuperAdmin only)"""
    try:
        existing_user = await service.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
        
        # This would normally be called after Google OAuth, so user_id comes from auth
        # For now, we generate a placeholder
        import uuid
        user_id = str(uuid.uuid4())
        
        new_user = await service.create_user(user_id, user.email, user.role)
        if not new_user:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create user")
        
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, service: UserService = Depends(get_user_service)):
    """Get user by ID"""
    try:
        user = await service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/", response_model=list)
async def get_family_users(family_id: str, service: UserService = Depends(get_user_service)):
    """Get all users in a family"""
    try:
        users = await service.get_family_users(family_id)
        return users
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, update_data: dict, service: UserService = Depends(get_user_service)):
    """Update user information"""
    try:
        updated_user = await service.update_user(user_id, update_data)
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, service: UserService = Depends(get_user_service)):
    """Delete a user"""
    try:
        await service.delete_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
