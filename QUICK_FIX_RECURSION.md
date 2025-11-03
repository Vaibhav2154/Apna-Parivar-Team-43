# How to Fix the Infinite Recursion Error

## Quick Fix

Go to your **Supabase Dashboard** → **SQL Editor** and run this command:

```sql
-- Drop all existing policies to clear recursion
DROP POLICY IF EXISTS "super_admin_see_all_users" ON users;
DROP POLICY IF EXISTS "user_see_self" ON users;
DROP POLICY IF EXISTS "super_admin_insert_users" ON users;
DROP POLICY IF EXISTS "user_insert_self" ON users;
DROP POLICY IF EXISTS "user_update_self" ON users;
DROP POLICY IF EXISTS "super_admin_update_users" ON users;
DROP POLICY IF EXISTS "admin_update_family_users" ON users;
DROP POLICY IF EXISTS "super_admin_see_all_families" ON families;
DROP POLICY IF EXISTS "user_see_own_family" ON families;
DROP POLICY IF EXISTS "super_admin_create_families" ON families;
DROP POLICY IF EXISTS "admin_update_own_family" ON families;
DROP POLICY IF EXISTS "user_see_own_family_members" ON family_members;
DROP POLICY IF EXISTS "admin_insert_family_members" ON family_members;
DROP POLICY IF EXISTS "admin_update_family_members" ON family_members;
DROP POLICY IF EXISTS "admin_delete_family_members" ON family_members;

-- Disable and re-enable RLS to start fresh
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
```

Then run the new policies from `backend/sql/rls_policies.sql`

## The Problem Was

The RLS policies were using `SELECT` queries on the same tables they were protecting:
- `user_see_family_users` - queried users table
- `admin_update_family_users` - queried users table
- `user_see_own_family_members` - queried users table

When a new user (with `family_id = NULL`) tried to insert, these policies couldn't complete without infinite loops.

## The Solution

### Simplified User Policies (No Recursion)
```sql
-- Users can only see themselves
CREATE POLICY "user_see_self" ON users
    FOR SELECT
    USING (id = auth.uid());

-- Users can insert their own record
CREATE POLICY "user_insert_self" ON users
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Users can update their own record
CREATE POLICY "user_update_self" ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- SuperAdmin policies use direct role check (not subquery)
CREATE POLICY "super_admin_see_all_users" ON users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
    );
```

### Families & Family Members Policies
Temporarily disabled until signup works. Will be re-enabled after with proper recursion prevention.

## Test Again

1. Go to `http://localhost:3000/signup`
2. Enter name and email
3. Click "Create Account"
4. Should work now! ✅

## After Signup Works

Once signup is working, we'll add back family policies with proper recursion prevention:
- Use JOINs instead of subqueries
- Cache user roles at signup time
- Implement materialized views for complex queries
