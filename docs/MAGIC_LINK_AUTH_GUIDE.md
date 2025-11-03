# Magic Link Authentication Guide

This guide explains how the Apna Parivar backend implements passwordless authentication using Supabase Magic Links.

## Overview

The authentication system uses:
- **Supabase Auth** with Magic Links (passwordless email authentication)
- **Gmail/Email-only** authentication (no passwords, no OAuth)
- **JWT Tokens** for session management
- **Row-Level Security (RLS)** for data protection
- **One-Time Password (OTP)** via email for verification

## Authentication Flow

### Magic Link Authentication (Recommended)

Users authenticate using passwordless magic links sent to their Gmail:

```
User → Frontend → [Enter Gmail address]
         ↓
   Frontend calls /api/auth/send-magic-link
         ↓
   Backend sends OTP link to user's Gmail via Supabase
         ↓
   User checks email and clicks magic link
         ↓
   Magic link redirects to frontend callback with OTP token
         ↓
   Frontend extracts token and calls /api/auth/verify-magic-link
         ↓
   Backend verifies OTP token with Supabase
         ↓
   Backend creates user profile if new
         ↓
   Backend returns JWT + User Profile
         ↓
   Frontend stores JWT for authenticated requests
```

## API Endpoints

### 1. Send Magic Link to Email

**Endpoint:** `POST /api/auth/send-magic-link`

**Request Body:**
```json
{
  "email": "user@gmail.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Magic link sent to your email",
  "email": "user@gmail.com",
  "status": "success",
  "note": "Check your email for the login link. Link expires in 24 hours."
}
```

**Error Response (400):**
```json
{
  "detail": "Error sending magic link: {error_message}"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@gmail.com"
  }'
```

---

### 2. Verify Magic Link Token

**Endpoint:** `POST /api/auth/verify-magic-link`

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "token": "OTP_TOKEN_FROM_EMAIL"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@gmail.com",
    "role": "family_user",
    "family_id": null,
    "created_at": "2025-11-03T10:00:00.000000+00:00",
    "updated_at": "2025-11-03T10:00:00.000000+00:00"
  },
  "message": "Magic link verified successfully"
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid or expired magic link token"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/auth/verify-magic-link \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@gmail.com",
    "token": "123456"
  }'
```

---

### 3. Verify JWT Token

**Endpoint:** `POST /api/auth/verify`

**Query Parameters:**
- `token` (required): JWT access token to verify

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@gmail.com",
  "role": "family_user",
  "family_id": null,
  "created_at": "2025-11-03T10:00:00.000000+00:00",
  "updated_at": "2025-11-03T10:00:00.000000+00:00"
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid or expired token"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/auth/verify?token=eyJhbGciOiJIUzI1NiI...
```

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Query Parameters:**
- `token` (required): JWT access token

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@gmail.com",
  "role": "family_user",
  "family_id": null,
  "created_at": "2025-11-03T10:00:00.000000+00:00",
  "updated_at": "2025-11-03T10:00:00.000000+00:00"
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/auth/me?token=eyJhbGciOiJIUzI1NiI..."
```

---

### 5. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh-token`

**Query Parameters:**
- `refresh_token` (required): Refresh token received from login

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "new_refresh_token_here",
  "token_type": "bearer"
}
```

**Error Response (401):**
```json
{
  "detail": "Token refresh failed"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/auth/refresh-token?refresh_token=refresh_token_here
```

---

### 6. Logout

**Endpoint:** `POST /api/auth/logout`

**Query Parameters:**
- `token` (required): JWT access token

**Response (200 OK):**
```json
{
  "message": "Logout successful",
  "status": "success"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/auth/logout?token=eyJhbGciOiJIUzI1NiI..."
```

---

## Frontend Implementation Example (React/TypeScript)

### Step 1: Send Magic Link

```typescript
async function sendMagicLink(email: string) {
  const response = await fetch('/api/auth/send-magic-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to send magic link');
  }

  return response.json();
}
```

### Step 2: Handle Email Callback

When user clicks the magic link in their email, they're redirected to:
```
http://localhost:3000/auth/callback?code=OTP_TOKEN#=
```

**Frontend Callback Handler:**

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const verifyMagicLink = async () => {
      const { code } = router.query;
      
      if (!code) return;

      // Extract email from session storage (saved during send-magic-link)
      const email = sessionStorage.getItem('magicLinkEmail');
      
      if (!email) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            token: code,
          }),
        });

        if (!response.ok) {
          throw new Error('Magic link verification failed');
        }

        const data = await response.json();
        
        // Store tokens in localStorage or cookie
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Clear email from session storage
        sessionStorage.removeItem('magicLinkEmail');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Verification failed:', error);
        router.push('/login?error=verification_failed');
      }
    };

    verifyMagicLink();
  }, [router]);

  return <div>Verifying your email... Please wait.</div>;
}
```

### Step 3: Make Authenticated Requests

```typescript
async function fetchUserData(accessToken: string) {
  const response = await fetch('/api/users/family-members?family_id=...', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}
```

---

## Token Management

### Access Token
- **Purpose:** Authenticate API requests
- **Lifespan:** Short-lived (1 hour typical)
- **Storage:** In memory or secure HTTP-only cookie (recommended)
- **Usage:** Include in `Authorization: Bearer {token}` header

### Refresh Token
- **Purpose:** Obtain new access tokens without re-authenticating
- **Lifespan:** Long-lived (7 days typical)
- **Storage:** Secure HTTP-only cookie (recommended)
- **Usage:** Call `/api/auth/refresh-token` to get new access token

### Example: Auto-Refresh Token

```typescript
async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  // If token expired, refresh it
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const refreshResponse = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem('accessToken', data.access_token);
      accessToken = data.access_token;

      // Retry original request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } else {
      // Redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```

---

## Security Best Practices

1. **Store Tokens Securely:**
   - Use HTTP-only cookies for tokens (not localStorage)
   - Enable secure flag (HTTPS only)
   - Enable SameSite flag (prevent CSRF)

2. **Magic Link Expiration:**
   - Links expire in 24 hours by default
   - Users must verify within this timeframe
   - Resend link if expired

3. **OTP Security:**
   - OTPs are single-use only
   - Invalid after 10 minutes (typical)
   - Rate limiting prevents brute force attacks

4. **Token Validation:**
   - Always verify tokens before processing requests
   - Check token expiration time
   - Validate token signature with public key

5. **HTTPS Only:**
   - Magic links are only valid over HTTPS
   - Never send tokens over unencrypted connections

---

## Error Handling

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Invalid token | 401 | Token expired or malformed | Request new magic link or refresh token |
| Token not found | 401 | Missing Authorization header | Include valid token in request |
| User not found | 404 | User profile not in database | User account doesn't exist |
| Magic link expired | 401 | OTP expired (>10 min) | Request new magic link |
| Invalid email | 400 | Email format invalid | Use valid Gmail address |

---

## Summary

- **No passwords:** Secure, passwordless authentication
- **Magic links:** Send login links to Gmail inbox
- **One-time tokens:** OTPs prevent unauthorized access
- **JWT tokens:** Fast, stateless authentication
- **Multi-tenant:** RLS policies protect family data
- **Gmail-only:** Restricts to email-based users only

For more details, see:
- [Backend Implementation](BACKEND_IMPLEMENTATION.md)
- [API Quick Reference](AUTH_QUICK_REFERENCE.md)
- [SQL Scripts](SQL_SCRIPTS.md)
