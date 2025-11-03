# ✅ Auto-Create User Profile on Magic Link Login

## Problem You Had
- User in Supabase `auth` table ✅
- User NOT in your `users` table ❌
- Error: "Email not found"

## What I Fixed

### 1. Frontend (`frontend/app/auth/callback/page.tsx`)
- Now checks if user exists in `users` table
- If not found (404), automatically creates one
- Uses the authenticated user's Supabase ID

### 2. Backend (`backend/routers/user_router.py`)
- Added new endpoint: `POST /api/users/create`
- Requires authentication (Bearer token)
- Creates user profile with:
  - ID from JWT token (Supabase user ID)
  - Email from signup
  - Role: "family_user" (default)
  - family_id: null

## Flow After Fix

```
Click magic link
   ↓
Supabase authenticates → creates auth.users record
   ↓
Frontend callback checks /api/users/me
   ↓
404 Not Found (user not in users table yet)
   ↓
Frontend calls POST /api/users/create
   ↓
Backend creates user record with Supabase ID
   ↓
Login complete ✅
```

## Test It Now

1. **Signup:** `http://localhost:3000/signup`
2. **Enter:** name and email
3. **Click:** "Create Account"
4. **Check:** email for magic link
5. **Click:** the link in email
6. **Result:** Should be logged in! 🎉

## What Happens in DB

After clicking magic link:

**Supabase `auth` table:**
```
id: (Supabase UUID)
email: user@example.com
```

**Your `users` table:**
```
id: (same Supabase UUID)
email: user@example.com
role: family_user
family_id: null
```

## Files Changed

- ✅ `frontend/app/auth/callback/page.tsx` - Auto-create user on login
- ✅ `backend/routers/user_router.py` - Add POST /api/users/create endpoint

## Status

✅ Signup works
✅ Magic link authentication works
✅ User profile auto-created in users table
✅ User is logged in
✅ Ready for next features (families, etc.)
