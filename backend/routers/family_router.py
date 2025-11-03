from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from core.database import get_supabase_client
from schemas.user import FamilyCreate, FamilyResponse
from services.family_service import FamilyService

router = APIRouter(prefix="/api/families", tags=["families"])

async def get_family_service():
    """Dependency to get family service"""
    supabase = get_supabase_client()
    return FamilyService(supabase)

@router.post("/", response_model=FamilyResponse, status_code=status.HTTP_201_CREATED)
async def create_family(family: FamilyCreate, service: FamilyService = Depends(get_family_service)):
    """Create a new family (SuperAdmin only)"""
    try:
        new_family = await service.create_family(family.family_name)
        if not new_family:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create family")
        return new_family
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{family_id}", response_model=FamilyResponse)
async def get_family(family_id: str, service: FamilyService = Depends(get_family_service)):
    """Get family by ID"""
    try:
        family = await service.get_family_by_id(family_id)
        if not family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
        return family
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/", response_model=List[FamilyResponse])
async def get_all_families(service: FamilyService = Depends(get_family_service)):
    """Get all families (SuperAdmin only)"""
    try:
        families = await service.get_all_families()
        return families
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{family_id}", response_model=FamilyResponse)
async def update_family(family_id: str, update_data: dict, service: FamilyService = Depends(get_family_service)):
    """Update family information (Family Admin only)"""
    try:
        updated_family = await service.update_family(family_id, update_data)
        if not updated_family:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
        return updated_family
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{family_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family(family_id: str, service: FamilyService = Depends(get_family_service)):
    """Delete a family (SuperAdmin only)"""
    try:
        await service.delete_family(family_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
