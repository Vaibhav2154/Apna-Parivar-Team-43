from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
from jose import jwt, JWTError

from core.database import get_supabase_client
from core.config import JWT_SECRET_KEY, JWT_ALGORITHM
from schemas.user import UserCreate, UserResponse, UserBase, CoAdminInviteRequest, CoAdminInviteResponse
from services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])

async def get_user_service():
    """Dependency to get user service"""
    supabase = get_supabase_client()
    return UserService(supabase)

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
        
        # Verify JWT token
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except JWTError as e:
            if "expired" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
        
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return user_id
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    """Get current authenticated user profile"""
    try:
        user = service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/create", response_model=UserResponse)
async def create_self_user(
    user_data: UserCreate,
    user_id: str = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    """Create authenticated user's own profile after magic link login"""
    try:
        # Check if user already exists
        existing_user = service.get_user_by_id(user_id)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User profile already exists"
            )
        
        # Create user record with the authenticated user's ID
        new_user = service.create_user(user_id, user_data.email, user_data.role or "family_user")
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile"
            )
        
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, service: UserService = Depends(get_user_service)):
    """Create a new user (SuperAdmin only)"""
    try:
        existing_user = service.get_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
        
        # This would normally be called after Google OAuth, so user_id comes from auth
        # For now, we generate a placeholder
        import uuid
        user_id = str(uuid.uuid4())
        
        new_user = service.create_user(user_id, user.email, user.role)
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
        user = service.get_user_by_id(user_id)
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
        users = service.get_family_users(family_id)
        return users
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, update_data: dict, service: UserService = Depends(get_user_service)):
    """Update user information"""
    try:
        updated_user = service.update_user(user_id, update_data)
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
        service.delete_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/invite-co-admin", response_model=CoAdminInviteResponse)
async def invite_co_admin(
    request: CoAdminInviteRequest,
    user_id: str = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    """Invite a co-admin to a family"""
    try:
        print(f"[DEBUG] Invite co-admin request: user_id={user_id}, family_id={request.family_id}, email={request.email}")
        
        # Verify that the current user is a family_admin
        current_user = service.get_user_by_id(user_id)
        print(f"[DEBUG] Current user: {current_user}")
        
        if not current_user or current_user.get("role") != "family_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only family admins can invite co-admins"
            )
        
        # Verify the family_id matches the user's family
        if current_user.get("family_id") != request.family_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only invite co-admins to your own family"
            )
        
        # Check if user already exists
        existing_user = service.get_user_by_email(request.email)
        print(f"[DEBUG] Existing user check: {existing_user}")
        
        if existing_user:
            # User exists, update their role if needed
            if existing_user.get("family_id") == request.family_id:
                # Update role to co-admin
                service.update_user(existing_user["id"], {"role": request.role})
                return CoAdminInviteResponse(
                    success=True,
                    message=f"User {request.email} is now a co-admin",
                    invitation_id=existing_user["id"]
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User already exists in another family"
                )
        
        # Create new user with co-admin role
        import uuid
        new_user_id = str(uuid.uuid4())
        print(f"[DEBUG] Creating new co-admin user: {new_user_id}")
        
        new_user = service.create_user(
            user_id=new_user_id,
            email=request.email,
            role=request.role,
            family_id=request.family_id
        )
        
        print(f"[DEBUG] New user created: {new_user}")
        
        if not new_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create co-admin user"
            )
        
        return CoAdminInviteResponse(
            success=True,
            message=f"Invitation sent to {request.email}",
            invitation_id=new_user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Co-admin invite error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
