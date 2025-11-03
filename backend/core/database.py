from supabase import create_client, Client
from core.config import SUPABASE_URL, SUPABASE_KEY

_supabase_client: Client = None

def get_supabase_client() -> Client:
    """Get or create Supabase client"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client
