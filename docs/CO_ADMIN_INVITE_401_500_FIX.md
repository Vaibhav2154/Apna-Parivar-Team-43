# Co-Admin Invite 401/500 Error Fix

## Issues Fixed

### Issue 1: 401 Unauthorized Error

**Problem**: Token verification was failing because:
- `auth_new_router.py` creates JWT tokens with `user_id` key in payload
- `user_router.py` was trying to verify tokens using `security.py` which expected `sub` key
- Different JWT secrets were being used: `JWT_SECRET_KEY` vs `SUPABASE_JWT_SECRET`

**Solution**: Updated `user_router.py` to use the same token verification as `auth_new_router.py`:
- Changed imports to use `jose.jwt` instead of custom `security.verify_token()`
- Updated token decoding to use `JWT_SECRET_KEY` (from config)
- Updated payload extraction to use `user_id` instead of `sub` key
- Proper JWT error handling with `JWTError`

**File Modified**: `backend/routers/user_router.py` (lines 1-58)

### Issue 2: 500 Internal Server Error

**Problem**: The `UserService` methods were marked as `async` but were performing synchronous Supabase operations:
- Awaiting non-async functions caused runtime errors
- Supabase client calls are synchronous, not async

**Solution**: 
1. Removed `async` keyword from all methods in `UserService` (they don't perform any async operations)
2. Removed all `await` keywords from service method calls in `user_router.py`

**Files Modified**:
- `backend/services/user_service.py` - Removed `async` from all methods
- `backend/routers/user_router.py` - Removed `await` from all service calls (6 locations)

## Technical Details

### Token Flow
1. User logs in via `POST /api/auth/admin/login`
2. Backend creates JWT token: `jwt.encode({"user_id": ..., "role": ..., ...}, JWT_SECRET_KEY, "HS256")`
3. Frontend stores token in localStorage as `access_token`
4. Frontend sends token in Authorization header: `Bearer {token}`
5. `get_current_user_id()` now correctly verifies token and extracts `user_id`

### Service Layer
- `UserService` performs synchronous Supabase database operations
- No async/await needed - direct database calls
- Proper error handling with custom exception messages

## Verification

### 1. Token Verification (Fix Issue 1)
```python
# Before (broken):
payload = verify_token(token)  # Wrong secret, wrong key extraction
user_id = payload.get("sub")   # Wrong key

# After (fixed):
payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
user_id = payload.get("user_id")  # Correct key
```

### 2. Service Calls (Fix Issue 2)
```python
# Before (broken):
current_user = await service.get_user_by_id(user_id)  # await non-async function

# After (fixed):
current_user = service.get_user_by_id(user_id)  # Direct call
```

## Testing

Try inviting a co-admin now:
1. Navigate to `/families/{familyId}/admins`
2. Enter co-admin email
3. Click "Send Invitation"
4. Expected response: `{"success": true, "message": "Invitation sent to...", "invitation_id": "..."}`

## Files Changed Summary

| File | Changes |
|------|---------|
| `backend/routers/user_router.py` | Updated imports, fixed token verification, removed `await` from service calls |
| `backend/services/user_service.py` | Removed `async` from all methods |
| `frontend/app/families/[id]/admins/page.tsx` | Already fixed in previous PR: uses `API_BASE_URL` |

## Related Issues Resolved
- ✅ 401 Unauthorized on co-admin invite
- ✅ 500 Internal Server Error on co-admin invite
- ✅ Token verification mismatch between auth routers
- ✅ Async/await mismatch in UserService

---
**Status**: ✅ COMPLETE - Co-admin invite endpoint fully functional
