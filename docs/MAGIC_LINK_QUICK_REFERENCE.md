# Auth Quick Reference - Magic Links

Quick reference guide for Supabase Magic Link authentication endpoints.

## Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/send-magic-link` | Send magic link to Gmail |
| POST | `/api/auth/verify-magic-link` | Verify OTP from magic link |
| POST | `/api/auth/verify` | Verify JWT token validity |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/refresh-token` | Get new access token |
| POST | `/api/auth/logout` | Logout user |

---

## 1. Send Magic Link

Send OTP link to user's Gmail inbox.

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com"}'
```

**Response:**
```json
{
  "message": "Magic link sent to your email",
  "email": "user@gmail.com",
  "status": "success",
  "note": "Check your email for the login link. Link expires in 24 hours."
}
```

---

## 2. Verify Magic Link

Verify OTP token from email and get access token.

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/verify-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@gmail.com",
    "token":"123456"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiI...",
  "refresh_token": "refresh_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "role": "family_user",
    "family_id": null,
    "created_at": "2025-11-03T...",
    "updated_at": "2025-11-03T..."
  },
  "message": "Magic link verified successfully"
}
```

---

## 3. Verify Token

Check if JWT token is valid.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/auth/verify?token=eyJhbGciOiJIUzI1NiI..."
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "role": "family_user",
  "family_id": null,
  "created_at": "2025-11-03T...",
  "updated_at": "2025-11-03T..."
}
```

---

## 4. Get Current User

Fetch authenticated user's profile.

**Request:**
```bash
curl -X GET "http://localhost:8000/api/auth/me?token=eyJhbGciOiJIUzI1NiI..."
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "role": "family_user",
  "family_id": null,
  "created_at": "2025-11-03T...",
  "updated_at": "2025-11-03T..."
}
```

---

## 5. Refresh Token

Get new access token using refresh token.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/auth/refresh-token?refresh_token=refresh_token_here"
```

**Response:**
```json
{
  "access_token": "new_eyJhbGciOiJIUzI1NiI...",
  "refresh_token": "new_refresh_token",
  "token_type": "bearer"
}
```

---

## 6. Logout

Logout current user.

**Request:**
```bash
curl -X POST "http://localhost:8000/api/auth/logout?token=eyJhbGciOiJIUzI1NiI..."
```

**Response:**
```json
{
  "message": "Logout successful",
  "status": "success"
}
```

---

## Using Access Token

Include token in Authorization header for authenticated requests:

```bash
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiI..."
```

---

## Frontend Usage

### React/TypeScript Example

```typescript
// 1. Send magic link
const sendMagicLink = async (email: string) => {
  const res = await fetch('/api/auth/send-magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

// 2. Verify magic link (in callback page)
const verifyMagicLink = async (email: string, token: string) => {
  const res = await fetch('/api/auth/verify-magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  });
  const data = await res.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
};

// 3. Make authenticated request
const fetchUserData = async () => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch('/api/users/me', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
};

// 4. Refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await res.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
};
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User enters Gmail and clicks "Sign In"                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ POST /send-magic-link       │
        │ {email: user@gmail.com}     │
        └─────────────────┬───────────┘
                          │
                          ▼
        ┌─────────────────────────────┐
        │ Supabase sends OTP to Gmail │
        │ Email arrives in inbox      │
        └─────────────────┬───────────┘
                          │
                          ▼
        ┌─────────────────────────────┐
        │ User clicks magic link      │
        │ Redirects to callback URL   │
        │ with OTP token in URL       │
        └─────────────────┬───────────┘
                          │
                          ▼
        ┌─────────────────────────────┐
        │ POST /verify-magic-link     │
        │ {email, token}              │
        └─────────────────┬───────────┘
                          │
                          ▼
        ┌─────────────────────────────┐
        │ Backend creates/updates     │
        │ user profile if needed      │
        └─────────────────┬───────────┘
                          │
                          ▼
        ┌─────────────────────────────┐
        │ Return JWT tokens & user    │
        │ Frontend stores access_token│
        └─────────────────┬───────────┘
                          │
                          ▼
        ┌─────────────────────────────┐
        │ User is authenticated ✓     │
        │ Can use API endpoints       │
        └─────────────────────────────┘
```

---

## Error Responses

All errors return standard HTTP status codes and error messages:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common errors:

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Invalid email format | Email address is not valid |
| 400 | Error sending magic link | Email service issue |
| 401 | Invalid or expired token | OTP expired or wrong |
| 401 | Invalid or expired token | JWT token not valid |
| 404 | User profile not found | Account doesn't exist |

---

## Notes

- Magic links expire after **24 hours**
- OTP tokens expire after **10 minutes** (typical)
- Access tokens typically expire after **1 hour**
- Refresh tokens typically expire after **7 days**
- No passwords stored or required
- Gmail/email-only authentication
- Row-Level Security protects family data
