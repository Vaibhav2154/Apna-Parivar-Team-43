# Frontend Authentication Implementation - Complete Guide

## Project Overview

The Apna Parivar frontend has been fully integrated with a **role-based authentication system** that communicates with the FastAPI backend. The authentication follows a **magic link** (passwordless) flow.

## Architecture

### Role Structure
```
- super_admin: Platform owner, can manage all families and admins
- family_admin: Family owner, can manage family members and co-admins
- family_co_admin: Co-administrator, can manage family members
- family_user: Regular family member, read-only access
```

### Authentication Flow
```
1. User enters email on /login page
2. Frontend sends POST to /api/auth/send-magic-link
3. Backend sends magic link via Supabase email
4. User clicks link: /auth/callback?token=XXX
5. Frontend verifies token via /api/auth/verify-magic-link
6. Backend returns JWT access token
7. Frontend stores token in localStorage and redirects to /dashboard
```

## File Structure

### Core Authentication Files
```
frontend/
├── lib/
│   ├── auth-context.tsx          # React Context for auth state
│   ├── auth-service.ts            # API service for auth endpoints
│   ├── family-service.ts          # API service for family management
│   ├── protected-route.tsx        # Route protection wrapper
│   ├── types.ts                   # TypeScript types
│   └── api.ts                     # Axios instance with auth interceptor
├── app/
│   ├── layout.tsx                 # Root layout with AuthProvider
│   ├── login/page.tsx             # Login page
│   ├── auth/callback/page.tsx     # Magic link verification
│   ├── dashboard/page.tsx         # Main dashboard
│   ├── families/page.tsx          # Family list (SuperAdmin)
│   ├── families/[id]/page.tsx     # Family details
│   ├── families/[id]/members/page.tsx        # Members list
│   ├── families/[id]/members/new/page.tsx    # Add member form
│   ├── families/[id]/members/[memberId]/page.tsx     # Member details
│   ├── families/[id]/members/[memberId]/edit/page.tsx # Edit member
│   ├── families/[id]/admins/page.tsx # Co-admin management (FamilyAdmin)
│   ├── unauthorized/page.tsx      # 403 error page
│   └── components/layout/Navbar.tsx # Navigation with auth
```

## Core Components

### 1. AuthContext (`lib/auth-context.tsx`)
Provides global authentication state:
- `user`: Current user object
- `token`: JWT access token
- `isAuthenticated`: Boolean flag
- `isLoading`: Initial auth loading state
- Methods: `sendMagicLink()`, `verifyMagicLink()`, `logout()`, `refetchUser()`

**Usage:**
```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  // ...
}
```

### 2. ProtectedRoute (`lib/protected-route.tsx`)
Wrapper component for role-based route protection:
```tsx
<ProtectedRoute requiredRole={['family_admin', 'family_co_admin']}>
  <AdminOnlyContent />
</ProtectedRoute>
```

### 3. AuthService (`lib/auth-service.ts`)
Functions for communicating with backend:
- `sendMagicLink(email)` - Initiate passwordless login
- `verifyMagicLink(email, token)` - Verify and get JWT
- `getToken()` - Retrieve stored token
- `getUser()` - Retrieve stored user
- `storeAuth(token, refreshToken, user)` - Save auth data
- `clearAuth()` - Clear all auth data

### 4. FamilyService (`lib/family-service.ts`)
Functions for family management:
- `getAllFamilies()` - Get all families (SuperAdmin)
- `getFamily(familyId)` - Get specific family
- `createFamily(name)` - Create new family
- `updateFamily(id, data)` - Update family
- `deleteFamily(id)` - Delete family
- `getFamilyMembers(familyId)` - Get all members
- `getFamilyMember(familyId, memberId)` - Get specific member
- `createFamilyMember()` - Add family member
- `updateFamilyMember()` - Update family member
- `deleteFamilyMember()` - Delete family member

## Pages Overview

### Public Pages
- **`/`** - Landing page (visible to unauthenticated users)
- **`/login`** - Magic link login form

### Protected Pages

#### SuperAdmin Only
- **`/dashboard`** - Super admin dashboard with statistics
- **`/families`** - View and manage all families
- **`/families/[id]`** - Family details and members overview

#### FamilyAdmin & FamilyCoAdmin
- **`/dashboard`** - Role-specific dashboard
- **`/families/[id]`** - View family details
- **`/families/[id]/members`** - List all family members
- **`/families/[id]/members/new`** - Add new member form
- **`/families/[id]/members/[memberId]`** - Member details
- **`/families/[id]/members/[memberId]/edit`** - Edit member
- **`/families/[id]/admins`** - Manage co-administrators (FamilyAdmin only)

#### FamilyUser Only
- **`/dashboard`** - View-only dashboard
- **`/families/[id]`** - View family tree (read-only)

### Error Pages
- **`/unauthorized`** - 403 Access Denied (shown when user lacks required role)

## Authentication Flow - Step by Step

### 1. Login Process
```typescript
// User enters email and clicks "Send Magic Link"
const handleSubmit = async (email: string) => {
  await sendMagicLink(email);  // POST /api/auth/send-magic-link
  // Store email in sessionStorage for callback
  sessionStorage.setItem('login_email', email);
};
```

### 2. Email Verification
Backend sends email with link:
```
https://yourapp.com/auth/callback?token=abc123def456
```

### 3. Token Verification
```typescript
// User clicks link, callback page extracts token
const token = searchParams.get('token');
const email = sessionStorage.getItem('login_email');

// Verify and get JWT
const response = await verifyMagicLink(email, token);
// Response includes: access_token, refresh_token, user object

// Store in localStorage
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('user', JSON.stringify(response.user));

// Redirect to dashboard
router.push('/dashboard');
```

### 4. Automatic Token Inclusion
All subsequent requests include token via axios interceptor:
```typescript
// lib/api.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## User Management

### SuperAdmin Capabilities
- Create and manage families
- Invite and manage family admins
- View all families and their members
- System-wide statistics and monitoring

### FamilyAdmin Capabilities
- Create and manage family members
- Invite and manage co-administrators
- Edit family information
- View all family members and relationships

### FamilyCoAdmin Capabilities
- Create and manage family members
- View all family members
- Cannot invite other co-admins

### FamilyUser Capabilities
- View family tree (read-only)
- View other family members
- Cannot edit or create

## Environment Variables

Create `.env.local` in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Supabase configuration (if needed for direct client access in future)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_KEY=your_supabase_key
```

## Testing the Authentication

### 1. Test Magic Link Flow
```bash
# Start frontend
cd frontend && npm run dev

# Go to http://localhost:3000/login
# Enter test email
# Check backend for OTP generation
# Verify callback with token works
```

### 2. Test Role-Based Access
```bash
# Login as super_admin -> Access /families page
# Login as family_admin -> Access /families/[id]/members page
# Login as family_user -> Access should be denied to /families/[id]/admins
```

### 3. Test Protected Routes
```bash
# Try accessing protected page without auth
# Should redirect to /login
# Try accessing page without required role
# Should redirect to /unauthorized
```

## Common Issues & Solutions

### Issue: Token Not Persisting
**Solution:** Check localStorage is available and not blocked. Verify `storeAuth()` is called in AuthContext.

### Issue: Infinite Redirect Loop
**Solution:** Ensure `isLoading` is false before checking `isAuthenticated` in ProtectedRoute.

### Issue: User Data Stale
**Solution:** Call `refetchUser()` after API calls that modify user data.

### Issue: CORS Errors
**Solution:** Ensure backend has proper CORS headers. Check `NEXT_PUBLIC_API_URL` matches backend URL.

## Adding New Protected Pages

### Example: Create Admin Page
```tsx
'use client';

import { ProtectedRoute } from '@/lib/protected-route';
import { useAuth } from '@/lib/auth-context';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole={['super_admin']}>
      <div>
        {/* Only visible to super_admin */}
        <h1>Admin Dashboard</h1>
        <p>User: {user?.email}</p>
      </div>
    </ProtectedRoute>
  );
}
```

## Integration with Backend

### Authentication Endpoints Used
```
POST   /api/auth/send-magic-link       - Send passwordless link
POST   /api/auth/verify-magic-link     - Verify token and get JWT
GET    /api/auth/verify?token=...      - Verify JWT validity
```

### Family Management Endpoints Used
```
GET    /api/families                   - Get all families (SuperAdmin)
POST   /api/families                   - Create family
GET    /api/families/[id]              - Get family details
PUT    /api/families/[id]              - Update family
DELETE /api/families/[id]              - Delete family

GET    /api/families/[id]/members      - Get family members
POST   /api/families/[id]/members      - Create member
GET    /api/families/[id]/members/[id] - Get member details
PUT    /api/families/[id]/members/[id] - Update member
DELETE /api/families/[id]/members/[id] - Delete member
```

## Security Features

1. **JWT-Based Authentication**: Tokens stored in localStorage
2. **Role-Based Access Control**: Enforced on frontend and backend
3. **Protected Routes**: ProtectedRoute wrapper checks authentication
4. **Auto Logout**: 401 responses redirect to login
5. **Secure Token Inclusion**: Automatic Bearer token in all requests

## Next Steps

1. ✅ Authentication system implemented
2. ✅ Role-based access control
3. ✅ Family and member management pages
4. ⏳ Add family tree visualization (optional)
5. ⏳ Add relationship mapping UI (optional)
6. ⏳ Add custom field builder (optional)
7. ⏳ Email notifications
8. ⏳ File upload for photos

## Support & Debugging

### Enable Debug Logging
```typescript
// In auth-service.ts
export async function sendMagicLink(email: string) {
  console.log('[Auth] Sending magic link to:', email);
  // ... rest of function
}
```

### Check LocalStorage
```javascript
// In browser console
localStorage.getItem('access_token')
localStorage.getItem('user')
```

### Verify Current Auth State
```typescript
// In component
const { user, token, isAuthenticated, isLoading } = useAuth();
console.log('Auth State:', { user, token, isAuthenticated, isLoading });
```

---

**Last Updated:** November 3, 2025
**Version:** 1.0 - Complete Frontend Authentication Implementation
