# Quick Start Guide - New Authentication System

## 🚀 Getting Started

### 1. SuperAdmin - Manage Admin Registrations
```
1. Go to: http://localhost:3000/superadmin-login
2. Username: SUPERADMIN_USERNAME (from .env)
3. Password: SUPERADMIN_PASSWORD (from .env)
4. Access: /admin dashboard to approve/reject admin requests
```

### 2. Family Admin - Register & Setup Family
```
1. Go to: http://localhost:3000/admin-signup
2. Fill form: email, full_name, family_name, password
3. Submit → Get request_id and family_password
4. Go to: /admin-signup/status/[request_id]
5. Wait for SuperAdmin approval (auto-refreshes every 5s)
6. Once approved, login at: /admin-login
7. Access dashboard at: /admin/dashboard to add members
8. Share family_name and family_password with members
```

### 3. Family Member - Login & View Family
```
1. Get credentials from Family Admin: family_name, family_password
2. Go to: http://localhost:3000/member-login
3. Enter: email, family_name, family_password
4. Access: /families for read-only family tree
```

## 📊 User Roles & Access

| Role | Pages | Capabilities |
|------|-------|--------------|
| **super_admin** | /superadmin-login, /admin | Approve/reject admin requests |
| **family_admin** | /admin-login, /admin/dashboard | Manage family, add members |
| **family_user** | /member-login, /families | View family tree (read-only) |

## 🔐 Security Features

- ✅ **Passwords**: PBKDF2 hashing (480k iterations, SHA-256)
- ✅ **Encryption**: AES-256-GCM for family passwords
- ✅ **Tokens**: JWT with 24-hour expiration
- ✅ **Storage**: localStorage with automatic recovery
- ✅ **Access**: Role-based redirects and guards

## 📱 Page Routes

```
Frontend Routes:
├── /superadmin-login          → SuperAdmin login
├── /admin                      → SuperAdmin dashboard (manage requests)
├── /admin-login                → Family Admin login
├── /admin-signup               → Family Admin registration
├── /admin-signup/status/[id]   → Check approval status
├── /admin/dashboard            → Family Admin dashboard
├── /member-login               → Family Member login
└── /families                   → Family tree (read-only for members)
```

## 🔄 Authentication Flow

```
SuperAdmin Flow:
  /superadmin-login → Auth (hardcoded credentials)
    → /admin (manage requests)
    → /admin → Approve/Reject → notify via status endpoint

Family Admin Flow:
  /admin-signup → Form → request_id + family_password
    → /admin-signup/status/[id] → Wait for approval (5s refresh)
    → Once approved → /admin-login → /admin/dashboard

Family Member Flow:
  Get credentials from admin (family_name, family_password)
    → /member-login → Form → /families (read-only)
```

## 🛠️ Backend Endpoints

```
POST   /api/auth/superadmin/login     → SuperAdmin authentication
POST   /api/auth/admin/register       → Register admin request
GET    /api/auth/admin/status/{id}    → Check request status
GET    /api/auth/admin/requests       → List pending requests (SuperAdmin)
POST   /api/auth/admin/approve        → Approve request (SuperAdmin)
POST   /api/auth/admin/reject         → Reject request (SuperAdmin)
POST   /api/auth/admin/login          → Family Admin login
POST   /api/auth/member/login         → Family Member login
```

## 💾 Data Persistence

- **localStorage keys**:
  - `auth_token` - JWT token
  - `user` - User profile JSON
  - `family_id` - Family identifier

- **Auto-recovery**: On page refresh, if token exists, user stays logged in

## 🎨 UI/UX Features

- **Color-coded gradients** per user type:
  - SuperAdmin: Blue/Indigo
  - Family Admin: Purple/Pink
  - Family Member: Green/Emerald

- **Status indicators**:
  - Pending: Yellow ⏳
  - Approved: Green ✅
  - Rejected: Red ❌

- **Copy buttons**: For easy credential sharing
- **Auto-refresh**: Status page updates every 5 seconds
- **Mobile responsive**: All pages work on mobile/tablet

## 📝 Form Validation

| Field | Rules |
|-------|-------|
| **Email** | Valid email format |
| **Password** | Min 8 characters |
| **Family Name** | Unique across database |
| **Confirm Password** | Must match password field |

## ⚠️ Error Handling

- Invalid credentials → Clear error message
- Pending approval → Status link provided
- Request not found → 404 with retry option
- Network error → Retry mechanism with helpful text
- Session expired → Redirect to appropriate login

## 🔍 Debugging Tips

1. **Check localStorage**: Open DevTools → Application → Local Storage
2. **Verify token**: Copy `auth_token` from localStorage
3. **Check user role**: Look at `user.role` in localStorage
4. **Network logs**: Verify API calls in Network tab
5. **Console errors**: Check for useAuth context errors

## 🚨 Common Issues

**Error: "useAuth must be used within an AuthProvider"**
- ✅ Fixed: Layout now properly wraps with AuthProvider using auth-context-new

**Error: Property 'name' does not exist on UserProfile**
- ✅ Fixed: Changed to use full_name (available in UserProfile)

**Admin page showing loading infinitely**
- Check localStorage for auth_token
- Verify token hasn't expired (24-hour limit)
- Clear cache and try again

**Status page not updating**
- Click checkbox to enable auto-refresh
- Manually refresh the page
- Check network tab for API errors

## 📦 Dependencies

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI, PostgreSQL (Supabase), JWT, cryptography
- **Authentication**: PBKDF2, AES-256-GCM, HS256 JWT

## 🎯 Next Steps

1. Update `/families/[id]` with read-only enforcement
2. Implement family member management APIs
3. Add database Row-Level Security (RLS) policies
4. Create E2E tests for all flows
5. Deploy to production

---

**Status**: ✅ 90% Complete - All frontend pages implemented, backend APIs ready
**Last Updated**: Nov 4, 2025
