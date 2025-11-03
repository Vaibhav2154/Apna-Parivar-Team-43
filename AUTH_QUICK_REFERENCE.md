# Authentication Quick Reference

## 6 Authentication Endpoints

### 1️⃣ Sign Up
```
POST /api/auth/signup?email=user@example.com&password=pass123&role=family_user
```

### 2️⃣ Login
```
POST /api/auth/login
Body: {"email": "user@example.com", "password": "pass123"}
```

### 3️⃣ Verify Token
```
POST /api/auth/verify?token=YOUR_TOKEN
```

### 4️⃣ Get Current User
```
GET /api/auth/me?token=YOUR_TOKEN
```

### 5️⃣ Logout
```
POST /api/auth/logout?token=YOUR_TOKEN
```

### 6️⃣ Refresh Token
```
POST /api/auth/refresh-token
Body: {"refresh_token": "YOUR_REFRESH_TOKEN"}
```

---

## Quick Test (cURL)

### Sign Up
```bash
curl -X POST "http://localhost:8000/api/auth/signup?email=test@example.com&password=Test123!&role=family_user"
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Verify Token (replace TOKEN with actual token)
```bash
curl -X POST "http://localhost:8000/api/auth/verify?token=TOKEN"
```

### Get User Info
```bash
curl -X GET "http://localhost:8000/api/auth/me?token=TOKEN"
```

---

## Response Examples

### Login Response ✅
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiI...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "family_id": null,
    "role": "family_user",
    "created_at": "2025-11-03T10:00:00",
    "updated_at": "2025-11-03T10:00:00"
  }
}
```

### Verify Success ✅
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "family_id": null,
  "role": "family_user",
  "created_at": "2025-11-03T10:00:00",
  "updated_at": "2025-11-03T10:00:00"
}
```

### Error Response ❌
```json
{
  "detail": "Invalid email or password"
}
```

---

## In Swagger UI

1. Start backend: `python main.py`
2. Open: http://localhost:8000/docs
3. Scroll down to **"authentication"** section
4. Click "Try it out" on any endpoint
5. Fill in parameters
6. Click "Execute"

---

## Frontend Example (JavaScript)

```javascript
// 1. Sign Up
const signupRes = await fetch('http://localhost:8000/api/auth/signup?email=user@test.com&password=pass&role=family_user', {
  method: 'POST'
});

// 2. Login
const loginRes = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@test.com',
    password: 'pass'
  })
});

const { access_token } = await loginRes.json();

// 3. Verify Token
const verifyRes = await fetch(`http://localhost:8000/api/auth/verify?token=${access_token}`, {
  method: 'POST'
});

// 4. Get User Info
const meRes = await fetch(`http://localhost:8000/api/auth/me?token=${access_token}`);

// 5. Logout
const logoutRes = await fetch(`http://localhost:8000/api/auth/logout?token=${access_token}`, {
  method: 'POST'
});
```

---

**Status: ✅ Authentication Ready**

All authentication endpoints are live and ready to use!
