# SQL Scripts - Ready to Execute in Supabase

## Instructions

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Create a new query
3. Copy and paste the SQL from **Step 1** below
4. Execute it
5. Create another new query
6. Copy and paste the SQL from **Step 2** below
7. Execute it

---

## STEP 1: Execute This First - Database Schema Creation

Copy the entire SQL block below and run it in Supabase SQL Editor:

```sql
-- Drop existing tables (optional, for fresh setup)
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Create families table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'family_user' CHECK (role IN ('super_admin', 'family_admin', 'family_co_admin', 'family_user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create family_members table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    photo_url TEXT,
    relationships JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_name ON family_members(name);

-- Add comments
COMMENT ON TABLE families IS 'Stores family information for multi-tenant setup';
COMMENT ON TABLE users IS 'Stores user information linked to Supabase auth.users';
COMMENT ON TABLE family_members IS 'Stores individual family member information';
COMMENT ON COLUMN users.role IS 'User role: super_admin, family_admin, family_co_admin, family_user';
COMMENT ON COLUMN family_members.relationships IS 'JSON object storing relationship links like parent_1, parent_2, spouse';
COMMENT ON COLUMN family_members.custom_fields IS 'JSON object storing custom user-defined fields (up to 10 fields per family)';
```

**Expected Result:** ✅ All tables created successfully with no errors

---

## STEP 2: Execute This Second - Row-Level Security Policies

Copy the entire SQL block below and run it in a NEW Supabase SQL Editor query:

```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- FAMILIES TABLE POLICIES
CREATE POLICY "super_admin_see_all_families" ON families
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "user_see_own_family" ON families
    FOR SELECT
    USING (
        id = (SELECT family_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "super_admin_create_families" ON families
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "admin_update_own_family" ON families
    FOR UPDATE
    USING (
        id = (SELECT family_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) IN ('family_admin', 'family_co_admin')
    )
    WITH CHECK (
        id = (SELECT family_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) IN ('family_admin', 'family_co_admin')
    );

-- USERS TABLE POLICIES
CREATE POLICY "super_admin_see_all_users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

CREATE POLICY "user_see_family_users" ON users
    FOR SELECT
    USING (
        family_id = (SELECT family_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "user_see_self" ON users
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "super_admin_insert_users" ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

CREATE POLICY "admin_invite_users" ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('family_admin', 'family_co_admin')
            AND u.family_id = (SELECT family_id FROM (SELECT family_id FROM users WHERE id = auth.uid()) AS u2)
        )
    );

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

CREATE POLICY "admin_update_family_users" ON users
    FOR UPDATE
    USING (
        family_id = (SELECT family_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) IN ('family_admin', 'family_co_admin')
    )
    WITH CHECK (
        family_id = (SELECT family_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) IN ('family_admin', 'family_co_admin')
    );

-- FAMILY_MEMBERS TABLE POLICIES
CREATE POLICY "user_see_own_family_members" ON family_members
    FOR SELECT
    USING (
        family_id = (SELECT family_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "admin_insert_family_members" ON family_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('family_admin', 'family_co_admin')
            AND u.family_id = family_id
        )
    );

CREATE POLICY "admin_update_family_members" ON family_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('family_admin', 'family_co_admin')
            AND u.family_id = family_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('family_admin', 'family_co_admin')
            AND u.family_id = family_id
        )
    );

CREATE POLICY "admin_delete_family_members" ON family_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('family_admin', 'family_co_admin')
            AND u.family_id = family_id
        )
    );
```

**Expected Result:** ✅ All RLS policies created successfully (15 policies total)

---

## Verification Queries

After executing both steps, run these queries to verify:

### 1. Check tables exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Check indexes exist
```sql
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'family_members', 'families')
ORDER BY indexname;
```

### 3. Check RLS is enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'family_members', 'families');
```

### 4. Check policies exist
```sql
SELECT policyname, tablename FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

---

## Expected Output After Verification

### Tables:
- families ✅
- family_members ✅
- users ✅

### Indexes (7 total):
- idx_family_members_family_id ✅
- idx_family_members_name ✅
- idx_users_family_id ✅
- idx_users_role ✅
- (+ 3 auto-created indexes for primary keys)

### RLS Status:
- families: rowsecurity = ON ✅
- family_members: rowsecurity = ON ✅
- users: rowsecurity = ON ✅

### RLS Policies (15 total):
**Families (4 policies):**
- super_admin_see_all_families ✅
- user_see_own_family ✅
- super_admin_create_families ✅
- admin_update_own_family ✅

**Users (8 policies):**
- super_admin_see_all_users ✅
- user_see_family_users ✅
- user_see_self ✅
- super_admin_insert_users ✅
- admin_invite_users ✅
- user_update_self ✅
- super_admin_update_users ✅
- admin_update_family_users ✅

**Family Members (3 policies):**
- user_see_own_family_members ✅
- admin_insert_family_members ✅
- admin_update_family_members ✅
- admin_delete_family_members ✅

---

## Sample Data for Testing (Optional)

After setup, you can insert test data to verify policies work:

### Create a family
```sql
INSERT INTO families (family_name) 
VALUES ('Ramesh Parivar') 
RETURNING id;
```

### Create sample users (adjust IDs to real auth.users)
```sql
-- This requires actual auth.users IDs from Supabase Auth
-- After users authenticate via Google, their IDs will appear in auth.users
INSERT INTO users (id, email, family_id, role) 
VALUES 
    ('user-id-1', 'admin@example.com', 'family-id-1', 'family_admin'),
    ('user-id-2', 'member@example.com', 'family-id-1', 'family_user');
```

### Create sample family members
```sql
INSERT INTO family_members (family_id, name, custom_fields)
VALUES 
    ('family-id-1', 'Ramesh', '{"Age": "55", "Occupation": "Engineer"}'),
    ('family-id-1', 'Krishnappa', '{"Age": "30", "Education": "B.Tech"}');
```

---

## Troubleshooting

**Error: "auth.users does not exist"**
- This is normal - Supabase creates auth.users automatically
- The foreign key will work once users authenticate

**Error: "relation already exists"**
- You have existing tables - either drop them first or skip the DROP statements

**Error: "Policy already exists"**
- Create a new query and run without the previous one
- Or drop policies first: `DROP POLICY IF EXISTS <policy_name> ON <table>`

**RLS not working**
- Ensure RLS is enabled: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY`
- Check policies exist: `SELECT * FROM pg_policies WHERE tablename='<table>'`

---

## Backend Setup After SQL Scripts

Once SQL is executed:

1. Copy `.env.example` to `.env` in backend folder
2. Update SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET
3. Install dependencies: `pip install -e .`
4. Run backend: `python main.py`
5. Access API: http://localhost:8000/docs

---

**Status: SQL Scripts Ready to Execute** ✅
