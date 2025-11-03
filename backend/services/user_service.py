from typing import Optional
from supabase import Client

class UserService:
    """Service for user management"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def create_user(self, user_id: str, email: str, role: str, family_id: Optional[str] = None) -> dict:
        """Create a new user"""
        try:
            data = {
                "id": user_id,
                "email": email,
                "role": role,
                "family_id": family_id
            }
            response = self.supabase.table("users").insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error creating user: {str(e)}")
    
    async def get_user_by_id(self, user_id: str) -> dict:
        """Get user by ID"""
        try:
            response = self.supabase.table("users").select("*").eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")
    
    async def get_user_by_email(self, email: str) -> dict:
        """Get user by email"""
        try:
            response = self.supabase.table("users").select("*").eq("email", email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")
    
    async def get_family_users(self, family_id: str) -> list:
        """Get all users in a family"""
        try:
            response = self.supabase.table("users").select("*").eq("family_id", family_id).execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Error fetching family users: {str(e)}")
    
    async def update_user(self, user_id: str, update_data: dict) -> dict:
        """Update user information"""
        try:
            response = self.supabase.table("users").update(update_data).eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise Exception(f"Error updating user: {str(e)}")
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete a user"""
        try:
            self.supabase.table("users").delete().eq("id", user_id).execute()
            return True
        except Exception as e:
            raise Exception(f"Error deleting user: {str(e)}")
