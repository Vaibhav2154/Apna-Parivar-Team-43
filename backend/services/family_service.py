from typing import Optional
from supabase import Client

class FamilyService:
    """Service for family management"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def create_family(self, family_name: str) -> dict:
        """Create a new family"""
        try:
            data = {"family_name": family_name}
            response = self.supabase.table("families").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error creating family: {str(e)}")
    
    async def get_family_by_id(self, family_id: str) -> dict:
        """Get family by ID"""
        try:
            response = self.supabase.table("families").select("*").eq("id", family_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching family: {str(e)}")
    
    async def get_all_families(self) -> list:
        """Get all families (SuperAdmin only)"""
        try:
            response = self.supabase.table("families").select("*").execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Error fetching families: {str(e)}")
    
    async def update_family(self, family_id: str, update_data: dict) -> dict:
        """Update family information"""
        try:
            response = self.supabase.table("families").update(update_data).eq("id", family_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error updating family: {str(e)}")
    
    async def delete_family(self, family_id: str) -> bool:
        """Delete a family"""
        try:
            self.supabase.table("families").delete().eq("id", family_id).execute()
            return True
        except Exception as e:
            raise Exception(f"Error deleting family: {str(e)}")
