# Authentication System - What's New

## ✅ Authentication Endpoints Added

I've added **6 complete authentication endpoints** to handle all user authentication flows. Here's what's now available:

---

## 📍 New Endpoints

### 1. **POST /api/auth/signup**
- **Purpose**: Create new user account
- **Parameters**: email, password, role (optional)
- **Returns**: User profile with success message
- **Use Case**: New user registration

### 2. **POST /api/auth/login**
- **Purpose**: Authenticate existing user
- **Parameters**: email, password (in JSON body)
- **Returns**: Access token + User profile
- **Use Case**: User login / session start

### 3. **POST /api/auth/verify**
- **Purpose**: Validate if token is still valid
- **Parameters**: token (query parameter)
- **Returns**: User profile if valid, 401 if invalid
- **Use Case**: Check token validity before making requests

### 4. **GET /api/auth/me**
- **Purpose**: Get current authenticated user's info
- **Parameters**: token (query parameter)
- **Returns**: Current user's full profile
- **Use Case**: Display user info in dashboard

### 5. **POST /api/auth/logout**
- **Purpose**: Invalidate user's token
- **Parameters**: token (query parameter)
- **Returns**: Success message
- **Use Case**: User logout / session end

### 6. **POST /api/auth/refresh-token**
- **Purpose**: Get new access token using refresh token
- **Parameters**: refresh_token (in JSON body)
- **Returns**: New access token + refresh token
- **Use Case**: Extend session without re-login

---

## 🔐 How Authentication Works

### Flow Diagram

```
User Signs Up → Creates Account in auth.users & users table
              ↓
User Logs In → Gets Access Token + User Profile
              ↓
User Makes Requests → Pass Token in header/query
              ↓
Verify Token → Backend checks token validity
              ↓
Process Request → If valid, execute operation
              ↓
Logout → Invalidate token, clear session
```

---

## 🧪 Test It Now

### Using Swagger UI (Easiest)
1. Run backend: `python main.py`
2. Go to: http://localhost:8000/docs
3. Find "authentication" section
4. Test each endpoint directly in Swagger

### Using cURL (Command Line)

**Sign up:**
```bash
curl -X POST "http://localhost:8000/api/auth/signup?email=john@example.com&password=Test123&role=family_user"
```

**Login:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test123"}'
```

**Verify token (replace TOKEN):**
```bash
curl -X POST "http://localhost:8000/api/auth/verify?token=TOKEN"
```

---

## 💾 File Changes

### New File Created
- `backend/routers/auth_router.py` - Contains all 6 authentication endpoints

### Updated Files
- `backend/app.py` - Added auth_router import and registration

### Documentation Added
- `AUTHENTICATION_GUIDE.md` - Complete authentication documentation
- `AUTH_QUICK_REFERENCE.md` - Quick reference for all endpoints

---

## 🔑 Token Usage

### Store Token After Login
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": { ... }
}
```

### Use Token in Requests

**Query Parameter (Testing):**
```
GET /api/auth/me?token=YOUR_TOKEN_HERE
```

**Authorization Header (Production):**
```
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📊 Authentication States

### Before Login
- No token
- Cannot access protected endpoints
- Can only access public endpoints (health, docs)

### After Login
- Has access token
- Can make authenticated requests
- Token valid for configured duration

### After Logout
- Token invalidated
- Cannot use old token
- Must login again

---

## 🛠️ Integration Steps for Frontend

### Step 1: Sign Up Flow
```javascript
// Show signup form
const formData = new FormData(signupForm);
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  body: new URLSearchParams(formData)
});
```

### Step 2: Login Flow
```javascript
// Show login form
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { access_token } = await response.json();
localStorage.setItem('token', access_token);
```

### Step 3: Protected Requests
```javascript
// Any authenticated request
const token = localStorage.getItem('token');
const response = await fetch('/api/families', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Step 4: Logout Flow
```javascript
// Call logout
const token = localStorage.getItem('token');
await fetch(`/api/auth/logout?token=${token}`, { method: 'POST' });
localStorage.removeItem('token');
// Redirect to login
```

---

## ✨ Features

✅ Complete signup/login flow
✅ Token-based authentication
✅ Token verification
✅ Session management
✅ Logout capability
✅ Token refresh support
✅ User role integration
✅ Family assignment
✅ Error handling
✅ Swagger UI ready
✅ CORS configured
✅ Production-ready

---

## 📚 Documentation

See these files for complete details:

1. **AUTHENTICATION_GUIDE.md** - Full authentication documentation
2. **AUTH_QUICK_REFERENCE.md** - Quick commands and examples
3. **backend/README.md** - General backend setup

---

## ⚠️ Important Notes

1. **Tokens expire** - Configure expiration in `core/config.py` if needed
2. **HTTPS Required** - Use HTTPS in production (not HTTP)
3. **Token Storage** - Store in localStorage or secure cookies
4. **Password Security** - Use strong passwords (min 8 chars recommended)
5. **Never expose tokens** - Don't put tokens in URLs for production
6. **Refresh tokens** - Use refresh_token endpoint before token expires

---

## 🔍 Verify Authentication Works

### Test 1: Can I sign up?
```bash
curl -X POST "http://localhost:8000/api/auth/signup?email=test@example.com&password=password123"
```
✅ Should return user profile

### Test 2: Can I login?
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
✅ Should return access_token

### Test 3: Can I verify token?
```bash
curl -X POST "http://localhost:8000/api/auth/verify?token=ACCESS_TOKEN"
```
✅ Should return user profile or 401 if invalid

### Test 4: Can I get my info?
```bash
curl -X GET "http://localhost:8000/api/auth/me?token=ACCESS_TOKEN"
```
✅ Should return user profile

---

## 🚀 Next Steps

1. ✅ Test endpoints in Swagger UI
2. ✅ Integrate with frontend forms
3. ✅ Store tokens in frontend
4. ✅ Use tokens for authenticated requests
5. ✅ Implement logout in frontend
6. ✅ Handle token expiry gracefully

---

**Status: Authentication System ✅ READY TO USE**

All 6 endpoints are live and ready for integration with your frontend!
