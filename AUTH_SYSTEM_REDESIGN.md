# ApnaParivar - New Auth System Implementation Guide

## System Overview

The redesigned authentication system implements a **three-tier hierarchy** with distinct flows for each user type:

1. **SuperAdmin** - Platform owner with hardcoded credentials
2. **Family Admin** - Family owners who self-register and wait for approval
3. **Family Member** - Read-only members who log in with family credentials

---

## Architecture

### Database Schema Changes

```
TABLES ADDED:
- admin_onboarding_requests: Stores pending admin registration requests

TABLES MODIFIED:
- families: Added family_password_encrypted, admin_user_id
- users: Added approval_status, full_name, password_hash

FIELDS ADDED:
- users.approval_status: pending | approved | rejected
- users.password_hash: PBKDF2 hashed password
- users.full_name: Admin's full name
- families.family_password_encrypted: Encrypted with admin password
- families.admin_user_id: Reference to the admin user
```

### Encryption Strategy

**Family Password Encryption:**
- Uses admin password as key derivation source
- PBKDF2 for key derivation (480,000 iterations, SHA-256)
- AES-256-GCM for symmetric encryption
- Nonce + Salt + Ciphertext stored together

**Password Hashing:**
- PBKDF2 with random salt for admin/member passwords
- 32-byte keys, SHA-256, 480,000 iterations
- Salt + Hash stored together in base64

---

## Authentication Flows

### 1. SuperAdmin Login Flow

**Endpoint:** `POST /api/auth/superadmin/login`

```
Request:
{
  "username": "superadmin",
  "password": "SuperAdmin@123"
}

Response:
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "user_id": "superadmin",
    "email": "admin@apnaparivar.com",
    "role": "super_admin",
    "family_id": null
  }
}
```

**Frontend:**
1. Navigate to `/superadmin-login`
2. Enter hardcoded credentials
3. Store token + user in localStorage
4. Redirect to `/admin` dashboard

---

### 2. Family Admin Registration & Approval Flow

**Step 1: Admin Self-Registration**

**Endpoint:** `POST /api/auth/admin/register`

```
Request:
{
  "email": "admin@family.com",
  "full_name": "Admin Name",
  "family_name": "unique_family_name",
  "password": "SecurePassword123",
  "confirm_password": "SecurePassword123"
}

Response:
{
  "request_id": "uuid-1234",
  "status": "pending",
  "message": "Registration request submitted. Awaiting SuperAdmin approval.",
  "family_password": "f3a8b2k9"  // Save this!
}
```

**Frontend:**
1. Navigate to `/admin-signup`
2. Fill form: email, full_name, family_name, password
3. Submit registration
4. Show confirmation with "Save your family password" message
5. Provide request_id for status tracking
6. Redirect to "Waiting for Approval" page

**Step 2: SuperAdmin Approves Request**

**Endpoint:** `POST /api/auth/admin/request/approve`

```
Request:
{
  "request_id": "uuid-1234",
  "action": "approve",
  "admin_password": "SecurePassword123"  // Admin password used as encryption key
}

Response:
{
  "message": "Admin request approved successfully",
  "status": "approved",
  "user_id": "uuid-user",
  "family_id": "uuid-family",
  "email": "admin@family.com",
  "family_name": "unique_family_name"
}
```

**Frontend (SuperAdmin):**
1. In `/admin` dashboard, show pending requests
2. Click "Approve" button
3. Prompt for reason (optional)
4. Send to backend with approval
5. Refresh list and show success

**Step 3: Admin Can Now Login**

**Endpoint:** `POST /api/auth/admin/login`

```
Request:
{
  "email": "admin@family.com",
  "password": "SecurePassword123"
}

Response:
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "admin@family.com",
    "role": "family_admin",
    "family_id": "uuid-family",
    "approval_status": "approved"
  }
}
```

**Frontend:**
1. Navigate to `/admin-login`
2. Enter email + password
3. If `approval_status` = "pending": Show "Waiting for approval" message
4. If `approval_status` = "approved": Login successful, redirect to dashboard
5. If `approval_status` = "rejected": Show rejection message

---

### 3. Family Member Login Flow

**Endpoint:** `POST /api/auth/member/login`

```
Request:
{
  "email": "member@gmail.com",
  "family_name": "unique_family_name",
  "family_password": "f3a8b2k9"
}

Response:
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "member@gmail.com",
    "role": "family_user",
    "family_id": "uuid-family"
  }
}
```

**Frontend:**
1. Navigate to `/member-login`
2. Enter email + family_name + family_password
3. Store token + user in localStorage
4. Redirect to `/families/[id]` (view-only mode)
5. Show read-only warning

---

## Frontend Implementation

### Route Structure

```
/superadmin-login          → SuperAdmin credentials
/admin-signup              → Family admin registration
/admin-signup/status/:id   → Check approval status  
/admin-login               → Family admin login
/admin                     → SuperAdmin dashboard (pending requests)
/admin/dashboard           → Family admin dashboard (manage members)
/member-login              → Family member login
/families/[id]             → Family tree (read-only for members)
```

### Pages to Create

#### 1. `/superadmin-login`
- Form: username, password
- Button: Login
- Error: Invalid credentials
- Success: Redirect to `/admin`

#### 2. `/admin-signup`
- Form: email, full_name, family_name, password, confirm_password
- Validation: passwords match, min 8 chars
- Button: Register
- Success: Show confirmation with family_password and request_id
- Save request_id to localStorage for status tracking

#### 3. `/admin-signup/status/[id]`
- Check request status via `/api/auth/admin/status/:request_id`
- States:
  - `pending`: Show "Waiting for SuperAdmin approval"
  - `approved`: Show "Approved! You can now login" → Link to `/admin-login`
  - `rejected`: Show "Request rejected: {rejection_reason}"

#### 4. `/admin-login`
- Form: email, password
- Checks: 
  - If user doesn't exist → "Invalid credentials"
  - If approval_status = "pending" → "Awaiting approval"
  - If approval_status = "rejected" → "Request was rejected"
- Success: Redirect to `/admin/dashboard`

#### 5. `/admin` (SuperAdmin Dashboard)
- Display: Pending admin requests list
- For each request:
  - Email, Full Name, Family Name, Requested Date
  - Two buttons: "Approve", "Reject"
- Approve flow:
  - Modal: Prompt for admin password (validation purpose)
  - Send approval
  - Show success message
  - Refresh list
- Reject flow:
  - Modal: Prompt for rejection reason
  - Send rejection
  - Show success message
  - Refresh list

#### 6. `/admin/dashboard` (Family Admin Dashboard)
- Show:
  - Family Name
  - Family Password (masked, with copy button)
  - Approval Status
  - List of family members
- Actions:
  - Add family member (email)
  - Remove family member
  - View/edit custom fields
- Note: If still pending → Show "Awaiting SuperAdmin approval"

#### 7. `/member-login`
- Form: email, family_name, family_password
- Error handling:
  - Invalid family name: "Family not found"
  - Invalid credentials: "Invalid email or family password"
- Success: Redirect to `/families/[id]`

#### 8. `/families/[id]` (Family Tree View)
- Modes:
  - Admin (family_admin): Full edit access
  - Member (family_user): Read-only view only
  - SuperAdmin: View all families (audit)
- Show: Family tree graph
- Actions (admin only):
  - Add member
  - Edit member info
  - Delete member
  - Manage custom fields

### Update Auth Context

Use `auth-context-new.tsx` and `auth-service-new.ts`:

```typescript
// useAuth hook provides:
- superAdminLogin(username, password)
- adminRegister(email, fullName, familyName, password, confirmPassword)
- adminLogin(email, password)
- checkAdminStatus(requestId)
- familyMemberLogin(email, familyName, familyPassword)
- getPendingRequests() [SuperAdmin]
- approveAdminRequest(requestId, adminPassword)
- rejectAdminRequest(requestId, rejectionReason)
- logout()
```

---

## Backend Endpoints Summary

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/superadmin/login` | None | SuperAdmin login |
| POST | `/api/auth/admin/register` | None | Admin self-registration |
| POST | `/api/auth/admin/login` | None | Admin login |
| POST | `/api/auth/member/login` | None | Family member login |
| GET | `/api/auth/admin/status/{request_id}` | None | Check registration status |
| POST | `/api/auth/verify-token` | Bearer | Verify JWT token |
| POST | `/api/auth/logout` | Bearer | Logout user |

### Admin Management (SuperAdmin only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/admin/requests/pending` | Bearer (SuperAdmin) | Get pending requests |
| POST | `/api/auth/admin/request/approve` | Bearer (SuperAdmin) | Approve request |
| POST | `/api/auth/admin/request/reject` | Bearer (SuperAdmin) | Reject request |

---

## Security Considerations

1. **SuperAdmin Credentials:**
   - Store in `.env` file (change in production!)
   - Never expose in frontend code
   - Consider 2FA in production

2. **Passwords:**
   - Minimum 8 characters
   - PBKDF2 hashing with 480k iterations
   - Salt generated randomly for each password

3. **Family Password Encryption:**
   - Encrypted with admin password as key
   - AES-256-GCM for authenticated encryption
   - Cannot be decrypted without admin password

4. **JWT Tokens:**
   - 24-hour expiration
   - Includes user_id, email, role, family_id
   - Sign with JWT_SECRET_KEY from environment

5. **Database:**
   - Use RLS policies to enforce family isolation
   - SuperAdmin should bypass RLS for audit purposes
   - Family members should only access their family's data

---

## Environment Variables

```env
# Backend
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=SuperAdmin@123
SUPERADMIN_EMAIL=admin@apnaparivar.com
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Migration from Old System

1. Keep old auth endpoints (`/api/auth/send-magic-link`, etc.) working
2. Add new auth endpoints alongside
3. Update frontend to use new auth context
4. Gradually migrate existing users:
   - Magic link users → Family members (need email + family_name + family_password)
   - Create admin requests for accounts to manage

---

## Testing Checklist

- [ ] SuperAdmin can login with hardcoded credentials
- [ ] Admin can register with valid data
- [ ] Admin registration status can be checked
- [ ] SuperAdmin can approve admin requests
- [ ] SuperAdmin can reject admin requests with reason
- [ ] Admin can login after approval
- [ ] Admin cannot login while pending
- [ ] Admin cannot login if rejected
- [ ] Family member can login with email + family_name + family_password
- [ ] Family member sees read-only interface
- [ ] Admin can add/remove family members
- [ ] Passwords are properly hashed and verified
- [ ] Family passwords are properly encrypted/decrypted
- [ ] JWT tokens are properly verified
- [ ] Sessions persist across page refreshes (localStorage)
- [ ] Logout clears all auth data

---

## Next Steps

1. ✅ Database schema updated
2. ✅ Backend auth endpoints implemented
3. ✅ Frontend types and services updated
4. ⏳ Frontend pages need to be created
5. ⏳ Update existing routes for read-only access
6. ⏳ Add RLS policies for data isolation
7. ⏳ Add email notifications for admin approval
8. ⏳ Deploy and test in production environment
