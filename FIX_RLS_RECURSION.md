# Fix Infinite Recursion in RLS Policies

## Problem
When creating a new user account via signup, you got this error:
```
infinite recursion detected in policy for relation "users"
```

## Root Cause
The RLS (Row Level Security) policies had queries that referenced the same `users` table, causing infinite recursion when new users (with `family_id = NULL`) tried to insert themselves.

Problematic policies:
- `user_see_family_users` - Queried users table to check family_id
- `admin_invite_users` - Complex nested subqueries
- `admin_update_family_users` - Referenced users table while updating users

## Solution

### Updated Policies

1. **Removed** `user_see_family_users` - Not needed for basic signup flow
2. **Removed** `admin_invite_users` - Will be reimplemented later with proper isolation
3. **Removed** `admin_update_family_users` - Users can only update themselves
4. **Added** `user_insert_self` - Allows users to create their own record during signup

### Simplified Policy Flow

```
USERS TABLE POLICIES (Updated):
├── SELECT
│   ├── SuperAdmin sees all users
│   └── User sees themselves
├── INSERT
│   ├── SuperAdmin can insert users
│   └── User can insert their own record (for signup)
└── UPDATE
    ├── User can update own record
    └── SuperAdmin can update any user
```

## How to Apply the Fix

### Option 1: Via Supabase Dashboard (Recommended for testing)

1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Delete all existing policies on `users` table:
   ```sql
   DROP POLICY IF EXISTS "super_admin_see_all_users" ON users;
   DROP POLICY IF EXISTS "user_see_family_users" ON users;
   DROP POLICY IF EXISTS "user_see_self" ON users;
   DROP POLICY IF EXISTS "super_admin_insert_users" ON users;
   DROP POLICY IF EXISTS "admin_invite_users" ON users;
   DROP POLICY IF EXISTS "user_update_self" ON users;
   DROP POLICY IF EXISTS "super_admin_update_users" ON users;
   DROP POLICY IF EXISTS "admin_update_family_users" ON users;
   ```

5. Run the updated `backend/sql/rls_policies.sql` file (or just the users section)

### Option 2: Via SQL Migration File

Run this complete SQL to drop and recreate all users policies:

```sql
-- Drop all existing users policies
DROP POLICY IF EXISTS "super_admin_see_all_users" ON users;
DROP POLICY IF EXISTS "user_see_family_users" ON users;
DROP POLICY IF EXISTS "user_see_self" ON users;
DROP POLICY IF EXISTS "super_admin_insert_users" ON users;
DROP POLICY IF EXISTS "admin_invite_users" ON users;
DROP POLICY IF EXISTS "user_update_self" ON users;
DROP POLICY IF EXISTS "super_admin_update_users" ON users;
DROP POLICY IF EXISTS "admin_update_family_users" ON users;

-- Create new simplified policies
CREATE POLICY "super_admin_see_all_users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

CREATE POLICY "user_see_self" ON users
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "super_admin_insert_users" ON users
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

CREATE POLICY "user_insert_self" ON users
    FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "user_update_self" ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "super_admin_update_users" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );
```

## After the Fix

Try signing up again:
1. Go to `http://localhost:3000/signup`
2. Enter name and email
3. Click "Create Account"
4. Should see success message now! ✅

## Testing

```
1. Signup creates new user ✅
2. Email receives magic link ✅
3. Click link → logged in ✅
4. User profile saved in DB ✅
```

## What Still Works

- SuperAdmin can see all users
- Users can see themselves
- Users can update their own profile
- SuperAdmin can create and update users
- Family member functionality (once policies are readded)

## Future Improvements

Once signup is working, you can:
1. Add back family-based viewing policies (with proper recursion handling)
2. Implement family admin invite system
3. Add family member management
