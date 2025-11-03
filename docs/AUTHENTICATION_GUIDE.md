# ApnaParivar Authentication Guide - Gmail Only

## 🔐 Gmail-Based Authentication

ApnaParivar uses **Google OAuth** for authentication. Users login with their Gmail account - **no passwords required!**

---

## � Authentication Endpoints

### 1. **Get Google Login URL**
```
GET /api/auth/login/google
```

**Response:**
```json
{
  "login_url": "https://accounts.google.com/o/oauth2/auth?...",
  "message": "Redirect user to this URL for Google login"
}
```

---

### 2. **Google OAuth Callback**
```
POST /api/auth/callback/google?code=CODE&session=SESSION
```

**Parameters:**
- `code` (query): Authorization code from Google
- `session` (query): Session data from Google

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiI...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "family_id": null,
    "role": "family_user",
    "created_at": "2025-11-03T...",
    "updated_at": "2025-11-03T..."
  },
  "message": "Google login successful"
}
```

---

### 3. **Verify Token**
```
POST /api/auth/verify?token=YOUR_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "family_id": "family-uuid",
  "role": "family_user",
  "created_at": "2025-11-03T...",
  "updated_at": "2025-11-03T..."
}
```

---

### 4. **Get Current User**
```
GET /api/auth/me?token=YOUR_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "family_id": "family-uuid",
  "role": "family_user",
  "created_at": "2025-11-03T...",
  "updated_at": "2025-11-03T..."
}
```

---

### 5. **Logout**
```
POST /api/auth/logout?token=YOUR_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "message": "Logout successful",
  "status": "success"
}
```

---

### 6. **Refresh Token**
```
POST /api/auth/refresh-token
```

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "token_type": "bearer"
}
```

---

## 📋 Complete Authentication Flow

### Step 1: User Clicks "Login with Google"
Frontend redirects to:
```
GET /api/auth/login/google
```

### Step 2: User Authorizes with Google
User sees Google login screen and grants permission

### Step 3: Google Redirects to Callback
Google redirects to your frontend callback URL with `code` and `session`

### Step 4: Frontend Calls Backend Callback
```bash
POST /api/auth/callback/google?code=AUTH_CODE&session=SESSION_DATA
```

### Step 5: Backend Creates/Updates User Profile
- If user is new: Creates profile in `users` table
- If user exists: Returns existing profile
- Generates access token

### Step 6: Store Token and Authenticate
Frontend stores token and uses it for all API requests

---

## 🧪 Test in Swagger UI

1. Start backend: `python main.py`
2. Open: http://localhost:8000/docs
3. Scroll to **"authentication"** section
4. Click **"GET /api/auth/login/google"** → "Try it out"
5. Get the login URL and paste in browser
6. Authorize with your Gmail account
7. Copy the `code` and `session` from redirect
8. Call callback endpoint with those values
9. Get `access_token` in response

---

## 🛠️ Frontend Implementation

### Step 1: Add Google Login Button
```html
<button onclick="loginWithGoogle()">
  Login with Google
</button>
```

### Step 2: Get Login URL and Redirect
```javascript
async function loginWithGoogle() {
  // Get Google login URL from backend
  const response = await fetch('http://localhost:8000/api/auth/login/google');
  const { login_url } = await response.json();
  
  // Redirect user to Google
  window.location.href = login_url;
}
```

### Step 3: Handle Callback (in /auth/callback page)
```javascript
// Extract code and session from URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const session = urlParams.get('session');

// Send to backend callback
const response = await fetch(
  `http://localhost:8000/api/auth/callback/google?code=${code}&session=${session}`,
  { method: 'POST' }
);

const { access_token, user } = await response.json();

// Store token
localStorage.setItem('token', access_token);
localStorage.setItem('user', JSON.stringify(user));

// Redirect to dashboard
window.location.href = '/dashboard';
```

### Step 4: Use Token in Requests
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:8000/api/families', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Step 5: Logout
```javascript
async function logout() {
  const token = localStorage.getItem('token');
  
  await fetch(`http://localhost:8000/api/auth/logout?token=${token}`, {
    method: 'POST'
  });
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to login
  window.location.href = '/login';
}
```

---

## � Supabase Setup Required

You need to configure Google OAuth in Supabase:

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication > Providers**
3. Enable **Google**
4. Add your Google OAuth credentials:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
5. Set redirect URL to: `http://localhost:3000/auth/callback`

---

## ✨ Features

✅ Gmail-only authentication
✅ No passwords to manage
✅ Automatic user creation on first login
✅ Token-based sessions
✅ Email verification via Google
✅ Verified user accounts
✅ Easy logout
✅ Token refresh support
✅ Role-based access after login

---

## 🔑 How It Works

1. **User Initiates Login** → Clicks "Login with Google" button
2. **Backend Provides Google URL** → Redirects to Google's authentication
3. **User Authorizes** → Grants permission for email access
4. **Google Redirects Back** → Calls your frontend callback with auth code
5. **Frontend Calls Backend** → Exchanges code for access token
6. **Backend Checks User** → Creates profile if first time login
7. **Returns Token & User** → Frontend stores and uses token
8. **Authenticated Requests** → Pass token in Authorization header

---

## � Security Features

✅ OAuth 2.0 standard
✅ Gmail verification
✅ No passwords stored
✅ Secure token exchange
✅ Token expiration
✅ Refresh token support
✅ HTTPS recommended
✅ Database RLS enforced

---

## 🔄 User Lifecycle

```
New User First Login
        ↓
Google OAuth Authorization
        ↓
Backend Creates User Profile (role: family_user, family_id: null)
        ↓
Returns Access Token
        ↓
Frontend Stores Token
        ↓
User Can Access Family Data
        ↓
SuperAdmin Can Assign to Family
        ↓
Role & Permissions Updated
```

---

## � Default User Profile

When a user logs in with Google for the first time:

```json
{
  "id": "<google_user_id>",
  "email": "<gmail@gmail.com>",
  "role": "family_user",
  "family_id": null,
  "created_at": "2025-11-03T...",
  "updated_at": "2025-11-03T..."
}
```

SuperAdmin can later assign them to a family and update their role.

---

## ⚠️ Important Notes

1. **No Manual Registration** - Users create accounts automatically via Google
2. **Email Verified** - Google guarantees email verification
3. **First Login Only** - User profile created only on first login
4. **Role Management** - SuperAdmin assigns roles and families
5. **HTTPS Required** - Use HTTPS in production (not HTTP)

---

## 📚 Related Documentation

- `AUTH_QUICK_REFERENCE.md` - Quick commands
- `AUTHENTICATION_ADDED.md` - What's new summary
- `backend/README.md` - Complete backend documentation

---

**Status: Gmail-Only Authentication ✅ READY**

All users authenticate with their Gmail account!

