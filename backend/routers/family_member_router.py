from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from core.database import get_supabase_client
from schemas.user import (
    FamilyMemberCreate, 
    FamilyMemberResponse, 
    FamilyMemberUpdate,
    BulkFamilyMemberCreate,
    BulkFamilyMemberResponse
)
from services.family_member_service import FamilyMemberService

router = APIRouter(prefix="/api/family-members", tags=["family-members"])

async def get_family_member_service():
    """Dependency to get family member service"""
    supabase = get_supabase_client()
    return FamilyMemberService(supabase)

@router.post("/bulk/create", response_model=BulkFamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def bulk_create_family_members(
    family_id: str,
    request: BulkFamilyMemberCreate,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Create multiple family members in bulk (optimized for batch operations)
    
    This endpoint allows creating 20-30+ family members quickly with custom fields.
    All members can be added in a single request for maximum efficiency.
    """
    try:
        if not request.members:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one member is required"
            )
        
        # Convert to dict for service
        members_data = [m.model_dump() for m in request.members]
        
        result = await service.create_bulk_family_members(family_id, members_data)
        
        return BulkFamilyMemberResponse(
            success=result.get("success", True),
            created_count=result.get("created_count", 0),
            failed_count=result.get("failed_count", 0),
            member_ids=result.get("member_ids", []),
            message=f"Successfully created {result.get('created_count', 0)} family members"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk creation failed: {str(e)}"
        )

@router.post("/", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    family_id: str,
    member: FamilyMemberCreate,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Create a new family member (Family Admin/Co-Admin only)"""
    try:
        new_member = await service.create_family_member(
            family_id=family_id,
            name=member.name,
            photo_url=member.photo_url,
            relationships=member.relationships,
            custom_fields=member.custom_fields
        )
        if not new_member:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create family member")
        return new_member
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{member_id}", response_model=FamilyMemberResponse)
async def get_family_member(member_id: str, service: FamilyMemberService = Depends(get_family_member_service)):
    """Get family member by ID"""
    try:
        member = await service.get_family_member_by_id(member_id)
        if not member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
        return member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/family/{family_id}", response_model=List[FamilyMemberResponse])
async def get_family_members(
    family_id: str,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get all members in a family"""
    try:
        members = await service.get_family_members(family_id)
        return members
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/search/", response_model=List[FamilyMemberResponse])
async def search_family_members(
    family_id: str = Query(...),
    query: str = Query(...),
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Search family members by name"""
    try:
        members = await service.search_family_members(family_id, query)
        return members
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{member_id}", response_model=FamilyMemberResponse)
async def update_family_member(
    member_id: str,
    update_data: FamilyMemberUpdate,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Update family member information (Family Admin/Co-Admin only)"""
    try:
        # Filter out None values
        data_dict = update_data.model_dump(exclude_unset=True)
        updated_member = await service.update_family_member(member_id, data_dict)
        if not updated_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
        return updated_member
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_member(
    member_id: str,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Delete a family member (Family Admin/Co-Admin only)"""
    try:
        await service.delete_family_member(member_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
