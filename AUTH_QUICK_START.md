# Quick Start - New Auth System

## For Developers

### Backend Setup

1. **Update Database:**
   ```bash
   # Execute the updated schema in Supabase SQL editor
   # File: backend/sql/schema.sql
   ```

2. **Install Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   # You'll need: cryptography, pyjwt
   ```

3. **Set Environment Variables:**
   ```bash
   # .env file
   SUPERADMIN_USERNAME=superadmin
   SUPERADMIN_PASSWORD=SuperAdmin@123
   JWT_SECRET_KEY=your-secret-key-here
   ```

4. **Run Backend:**
   ```bash
   python -m uvicorn app:app --reload
   ```

5. **Test Endpoints:**
   ```bash
   # SuperAdmin Login
   curl -X POST http://localhost:8000/api/auth/superadmin/login \
     -H "Content-Type: application/json" \
     -d '{"username": "superadmin", "password": "SuperAdmin@123"}'

   # Admin Register
   curl -X POST http://localhost:8000/api/auth/admin/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@family.com",
       "full_name": "Admin Name",
       "family_name": "test_family",
       "password": "TestPassword123",
       "confirm_password": "TestPassword123"
     }'
   ```

### Frontend Setup

1. **Update Layout:**
   ```tsx
   // app/layout.tsx
   import { AuthProvider } from '@/lib/auth-context-new'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider>
             {children}
           </AuthProvider>
         </body>
       </html>
     )
   }
   ```

2. **Environment Variables:**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Create Login Pages** (see next section)

---

## User Journey Examples

### SuperAdmin Journey

1. Navigate to `/superadmin-login`
2. Enter: `username: superadmin`, `password: SuperAdmin@123`
3. Redirects to `/admin`
4. View pending admin requests
5. Click "Approve" → Enter admin password
6. Refresh list to see updated status

### Family Admin Journey

1. Navigate to `/admin-signup`
2. Fill form:
   - Email: `admin@myFamily.com`
   - Full Name: `Family Admin`
   - Family Name: `myFamily` (must be unique)
   - Password: `SecurePass123`
3. Get confirmation:
   - Request ID: `abc-123-def`
   - Family Password: `f3a8b2k9`
4. **Save the family password!**
5. Navigate to `/admin-signup/status/abc-123-def` to check status
6. Once approved, go to `/admin-login`
7. Enter: `email: admin@myFamily.com`, `password: SecurePass123`
8. Redirects to `/admin/dashboard`
9. Add family members by email
10. Share family name + family password with members

### Family Member Journey

1. Receive from admin:
   - Family Name: `myFamily`
   - Family Password: `f3a8b2k9`
2. Navigate to `/member-login`
3. Enter: `email: member@gmail.com`, `family_name: myFamily`, `family_password: f3a8b2k9`
4. Redirects to `/families/[id]` with read-only access
5. View family tree
6. Cannot edit any data

---

## File Locations

### Backend Files

```
backend/
├── core/
│   ├── encryption.py          [NEW] Encryption service
│   ├── config.py              [UPDATED] SuperAdmin config
│   └── database.py
├── routers/
│   ├── auth_new_router.py     [NEW] New auth endpoints
│   └── auth_router.py         [OLD]
├── services/
│   ├── admin_onboarding_service.py [NEW] Admin request handling
│   └── user_service.py
├── schemas/
│   └── user.py                [UPDATED] New request/response types
├── sql/
│   └── schema.sql             [UPDATED] New tables
└── app.py                     [UPDATED] Include new router
```

### Frontend Files

```
frontend/
├── lib/
│   ├── auth-service-new.ts       [NEW] API calls
│   ├── auth-context-new.tsx      [NEW] Auth context
│   ├── auth-context.tsx          [OLD]
│   ├── auth-service.ts           [OLD]
│   └── types.ts                  [UPDATED] New types
├── app/
│   ├── superadmin-login/         [TODO] Create
│   ├── admin-signup/             [TODO] Create
│   ├── admin-login/              [TODO] Create
│   ├── admin/                    [TODO] Create
│   ├── member-login/             [TODO] Create
│   └── families/[id]/            [UPDATED] Add read-only mode
└── components/                   [TODO] Create reusable components
```

---

## Key Implementation Notes

### 1. Password Handling

**Admin Password:**
- Used during registration
- Hashed before storage (PBKDF2)
- Used as key for family password encryption during approval
- Never stored in plain text

**Family Password:**
- Generated automatically (short UUID)
- Encrypted with admin password as key
- Given to admin after registration
- Shared with family members
- Used for member login verification

**Storage:**
```
users.password_hash = PBKDF2(admin_password, random_salt)
families.family_password_encrypted = AES-256-GCM(family_password, 
                                     derived_key_from(admin_password))
```

### 2. Approval Status Flow

```
Registration → pending → SuperAdmin Review → approved/rejected
              ↓                                ↓
          Can't login                    Can login
          Shows "Waiting"           Continue with platform
```

### 3. Token Structure

```
JWT Token contains:
{
  "user_id": "uuid",
  "email": "user@email.com",
  "role": "super_admin|family_admin|family_user",
  "family_id": "uuid|null",
  "exp": timestamp
}
```

### 4. Database Relationships

```
SuperAdmin
  ↓
admin_onboarding_requests (pending approvals)
  ↓
families (created on approval)
  ↓
users (family_admin role)
  ↓
family_members (add family members)
  ↓
users (family_user role - for each member)
```

---

## Testing Sequence

1. ✅ Start backend: `python -m uvicorn app:app --reload`
2. ✅ Test SuperAdmin login endpoint
3. ✅ Test admin register endpoint
4. ✅ Test admin approval endpoint
5. ✅ Test admin login endpoint
6. ✅ Test member login endpoint
7. Create frontend pages
8. Test complete flows end-to-end
9. Test data isolation (RLS policies)
10. Deploy to production

---

## Troubleshooting

### "Invalid admin_password" on approval

- Ensure admin password is exactly as user entered during registration
- Password is case-sensitive
- Check for extra spaces

### "Family name already exists"

- Family names must be unique
- Choose a different family_name
- Check for typos in existing family names

### "Awaiting SuperAdmin approval" on login

- Admin status is still pending
- Check status with `/api/auth/admin/status/{request_id}`
- SuperAdmin needs to approve first
- This is normal after registration

### Token expired errors

- JWT tokens expire in 24 hours
- Implement token refresh logic in frontend
- Or re-login when token expires

### Family member can't login

- Verify family_name is correct (case-sensitive)
- Verify family_password matches (given by admin)
- Check if member exists in family (admin added them)

---

## Next Implementation Steps

### Frontend Pages Priority

1. **High Priority:**
   - [ ] SuperAdmin Login (`/superadmin-login`)
   - [ ] SuperAdmin Dashboard (`/admin`)
   - [ ] Admin Signup (`/admin-signup`)
   - [ ] Admin Status Check (`/admin-signup/status/[id]`)
   - [ ] Admin Dashboard (`/admin/dashboard`)
   - [ ] Member Login (`/member-login`)

2. **Medium Priority:**
   - [ ] Admin Login (`/admin-login`)
   - [ ] Update Family Tree for read-only access

3. **Low Priority:**
   - [ ] Email notifications
   - [ ] Better error messages
   - [ ] Forgot password flow

### Database Setup

- Execute `/backend/sql/schema.sql` in Supabase
- Add RLS policies for data isolation

### Testing & Deployment

- Unit tests for encryption/hashing
- Integration tests for auth flows
- End-to-end tests with Cypress
- Load testing for production

---

## Support & Questions

For detailed implementation guide, see: `AUTH_SYSTEM_REDESIGN.md`

For Postman collection examples, see: Backend API documentation
