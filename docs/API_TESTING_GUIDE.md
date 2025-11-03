# API Testing Guide - cURL Examples

Base URL: `http://localhost:8000`

## SuperAdmin Login

```bash
curl -X POST http://localhost:8000/api/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SuperAdmin@123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "user_id": "superadmin",
    "email": "admin@apnaparivar.com",
    "role": "super_admin",
    "family_id": null
  },
  "message": "SuperAdmin login successful"
}
```

---

## Admin Registration

```bash
curl -X POST http://localhost:8000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@family.com",
    "full_name": "Family Admin",
    "family_name": "my_family",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "pending",
  "message": "Admin onboarding request created. Awaiting SuperAdmin approval.",
  "family_password": "a7f2b1k8"
}
```

**⚠️ Important:** Save both `request_id` and `family_password`!

---

## Check Admin Status

```bash
curl -X GET http://localhost:8000/api/auth/admin/status/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Response (Pending):**
```json
{
  "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "pending",
  "email": "admin@family.com",
  "family_name": "my_family",
  "requested_at": "2025-11-04T10:30:00Z",
  "reviewed_at": null,
  "rejection_reason": null
}
```

---

## SuperAdmin: Get Pending Requests

```bash
curl -X GET http://localhost:8000/api/auth/admin/requests/pending \
  -H "Authorization: Bearer <SUPERADMIN_TOKEN>"
```

**Response:**
```json
{
  "total": 2,
  "requests": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "admin@family.com",
      "full_name": "Family Admin",
      "family_name": "my_family",
      "status": "pending",
      "requested_at": "2025-11-04T10:30:00Z"
    },
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "email": "another@family.com",
      "full_name": "Another Admin",
      "family_name": "other_family",
      "status": "pending",
      "requested_at": "2025-11-04T10:35:00Z"
    }
  ]
}
```

---

## SuperAdmin: Approve Admin Request

```bash
curl -X POST http://localhost:8000/api/auth/admin/request/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPERADMIN_TOKEN>" \
  -d '{
    "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "action": "approve",
    "admin_password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "message": "Admin request approved successfully",
  "status": "approved",
  "user_id": "uuid-user-123",
  "family_id": "uuid-family-123",
  "email": "admin@family.com",
  "family_name": "my_family"
}
```

---

## SuperAdmin: Reject Admin Request

```bash
curl -X POST http://localhost:8000/api/auth/admin/request/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPERADMIN_TOKEN>" \
  -d '{
    "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "action": "reject",
    "rejection_reason": "Email already associated with another family"
  }'
```

**Response:**
```json
{
  "message": "Admin request rejected",
  "status": "rejected",
  "rejection_reason": "Email already associated with another family"
}
```

---

## Admin Login (After Approval)

```bash
curl -X POST http://localhost:8000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@family.com",
    "password": "SecurePass123"
  }'
```

**Response (Success):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-user-123",
    "email": "admin@family.com",
    "role": "family_admin",
    "family_id": "uuid-family-123",
    "approval_status": "approved",
    "full_name": "Family Admin",
    "created_at": "2025-11-04T10:30:00Z",
    "updated_at": "2025-11-04T10:30:00Z"
  },
  "message": "Login successful"
}
```

**Response (Still Pending):**
```json
{
  "detail": "Admin request is still pending SuperAdmin approval. Please check back later."
}
```

---

## Family Member Login

```bash
curl -X POST http://localhost:8000/api/auth/member/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@gmail.com",
    "family_name": "my_family",
    "family_password": "a7f2b1k8"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-member-123",
    "email": "member@gmail.com",
    "role": "family_user",
    "family_id": "uuid-family-123",
    "approval_status": "approved",
    "created_at": "2025-11-04T10:35:00Z",
    "updated_at": "2025-11-04T10:35:00Z"
  },
  "message": "Login successful"
}
```

---

## Verify Token

```bash
curl -X POST http://localhost:8000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "user_id": "uuid-user-123",
  "email": "admin@family.com",
  "role": "family_admin",
  "family_id": "uuid-family-123"
}
```

---

## Logout

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**
```json
{
  "message": "Logout successful",
  "status": "success"
}
```

---

## Error Responses

### Invalid Credentials

```bash
curl -X POST http://localhost:8000/api/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "WrongPassword"
  }'
```

**Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

### Duplicate Family Name

```bash
curl -X POST http://localhost:8000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@family.com",
    "full_name": "Another Admin",
    "family_name": "my_family",
    "password": "SecurePass123",
    "confirm_password": "SecurePass123"
  }'
```

**Response (400):**
```json
{
  "detail": "Family name already exists"
}
```

### Passwords Don't Match

```bash
curl -X POST http://localhost:8000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@family.com",
    "full_name": "Family Admin",
    "family_name": "new_family",
    "password": "SecurePass123",
    "confirm_password": "DifferentPass456"
  }'
```

**Response (400):**
```json
{
  "detail": "Passwords do not match"
}
```

### Admin Still Pending

```bash
curl -X POST http://localhost:8000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@family.com",
    "password": "SecurePass123"
  }'
```

**Response (403):**
```json
{
  "detail": "Admin request is still pending SuperAdmin approval. Please check back later."
}
```

### Unauthorized Access

```bash
curl -X GET http://localhost:8000/api/auth/admin/requests/pending
```

**Response (401):**
```json
{
  "detail": "Authorization header required"
}
```

### Insufficient Permissions

```bash
curl -X GET http://localhost:8000/api/auth/admin/requests/pending \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Response (403):**
```json
{
  "detail": "Only SuperAdmin can access this endpoint"
}
```

---

## Testing Workflow

### Step 1: SuperAdmin Approves Setup (One Time)

1. SuperAdmin logs in
2. Gets pending requests
3. Approves one request
4. (Admin can now use platform)

### Step 2: Test Complete Admin Journey

1. Register as new admin
2. Check status
3. SuperAdmin approves
4. Admin logs in
5. Admin accesses dashboard

### Step 3: Test Family Member Journey

1. Admin creates family member
2. Shares family_name + family_password
3. Member logs in
4. Member views family tree (read-only)

---

## Postman Collection Template

```json
{
  "info": {
    "name": "ApnaParivar Auth System",
    "version": "2.0.0"
  },
  "item": [
    {
      "name": "SuperAdmin Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/superadmin/login",
        "body": {
          "mode": "raw",
          "raw": "{\"username\": \"superadmin\", \"password\": \"SuperAdmin@123\"}"
        }
      }
    },
    {
      "name": "Admin Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/admin/register",
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"admin@family.com\", \"full_name\": \"Admin\", \"family_name\": \"family\", \"password\": \"Pass123\", \"confirm_password\": \"Pass123\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000"
    },
    {
      "key": "superadmin_token",
      "value": ""
    },
    {
      "key": "admin_token",
      "value": ""
    }
  ]
}
```

---

## Common Issues & Solutions

### "Token expired"
- Token expires after 24 hours
- User needs to log in again
- Implement token refresh in production

### "Family name not found" on member login
- Check that family_name is spelled correctly (case-sensitive)
- Verify family was created (admin was approved)

### "Invalid credentials" on family member login
- Verify email is correct
- Verify family_password is correct (from admin)
- Check that member was added by admin

### "Can't decrypt family password"
- Admin password might be wrong
- Password hashing might have failed
- Check encryption logs

---

## Notes

- All timestamps are ISO 8601 format
- UUIDs are used for all IDs
- Base64 encoding used for encrypted passwords
- Tokens expire after 24 hours
- Requests require Content-Type: application/json
- Authorization header format: `Bearer <token>`
