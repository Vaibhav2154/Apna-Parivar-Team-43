# Fix: User Not Found After Magic Link Authentication

## Problem

After clicking the magic link and being authenticated by Supabase:
- ✅ User exists in Supabase `auth` table
- ❌ User does NOT exist in your `users` table
- Error: "Email not found. Please try logging in again."

## Why This Happens

1. When user clicks magic link, Supabase creates an `auth.users` record
2. But Supabase doesn't automatically create records in your custom `users` table
3. Your `/api/users/me` endpoint looks for the user in your `users` table → 404

## Solution

### Frontend Changes (`frontend/app/auth/callback/page.tsx`)

Updated the callback handler to:
1. Try to fetch user from `/api/users/me` (GET)
2. If 404 (user doesn't exist), call `/api/users/create` (POST)
3. This creates the user profile in your `users` table
4. Then proceeds with login

**Key Code:**
```typescript
// Try to get existing user
let response = await fetch(`${API_BASE_URL}/api/users/me`, {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${accessToken}` },
});

// If 404, create the user
if (response.status === 404) {
  const createResponse = await fetch(`${API_BASE_URL}/api/users/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify({
      email: email,
      role: 'family_user',
    }),
  });
  user = await createResponse.json();
}
```

### Backend Changes (`backend/routers/user_router.py`)

Added new endpoint: **`POST /api/users/create`**

Features:
- Requires authentication (Bearer token)
- Extracts `user_id` from JWT token
- Creates user profile using authenticated user's ID
- Prevents duplicate user records
- Returns created user profile

```python
@router.post("/create", response_model=UserResponse)
async def create_self_user(
    user_data: UserCreate,
    user_id: str = Depends(get_current_user_id),
    service: UserService = Depends(get_user_service)
):
    """Create authenticated user's own profile after magic link login"""
```

## Complete Flow Now

```
1. User clicks magic link in email
   ↓
2. Supabase creates auth.users record
   ↓
3. Redirect to /auth/callback#access_token=...
   ↓
4. Frontend extracts access_token
   ↓
5. Frontend calls GET /api/users/me
   ↓
6. Response is 404 (user doesn't exist in users table)
   ↓
7. Frontend calls POST /api/users/create
   ↓
8. Backend creates record in users table:
   {
     "id": "supabase-user-id",
     "email": "user@example.com",
     "role": "family_user",
     "family_id": null
   }
   ↓
9. Frontend stores token & user in localStorage
   ↓
10. Redirect to /dashboard (logged in! ✅)
```

## Testing

1. Go to `http://localhost:3000/signup`
2. Enter name and email
3. Click "Create Account"
4. Check email for magic link
5. Click link → should be logged in now! ✅
6. Check Supabase dashboard:
   - `auth` table has the user ✅
   - `users` table has the user ✅

## What Was Fixed

- ✅ Auto-creates user profile on first login
- ✅ Handles 404 gracefully
- ✅ Uses authenticated user's Supabase ID
- ✅ Sets default role as "family_user"
- ✅ Prevents duplicate accounts

## User Schema Created

After successful login, your `users` table will have:

| Field | Value |
|-------|-------|
| id | Supabase auth user ID |
| email | User's email from magic link |
| role | "family_user" (default) |
| family_id | NULL (until they create/join family) |

## Error Handling

The callback now handles:
- ✅ User already exists → uses existing profile
- ✅ User doesn't exist → creates new profile
- ✅ Network errors → shows error message
- ✅ Invalid tokens → shows error message
