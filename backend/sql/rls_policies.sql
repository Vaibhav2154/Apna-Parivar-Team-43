-- Row-Level Security Policies for ApnaParivar
-- Execute this after schema.sql on Supabase PostgreSQL Database

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FAMILIES TABLE RLS POLICIES
-- ============================================

-- SuperAdmin can see all families
CREATE POLICY "super_admin_see_all_families" ON families
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Family members can see their own family
CREATE POLICY "user_see_own_family" ON families
    FOR SELECT
    USING (
        id = (SELECT family_id FROM users WHERE id = auth.uid())
    );

-- SuperAdmin can create families
CREATE POLICY "super_admin_create_families" ON families
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

-- Family admins can update their own family
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

-- ============================================
-- USERS TABLE RLS POLICIES
-- ============================================

-- SuperAdmin can see all users
CREATE POLICY "super_admin_see_all_users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

-- Users can see users in their family
CREATE POLICY "user_see_family_users" ON users
    FOR SELECT
    USING (
        family_id = (SELECT family_id FROM users WHERE id = auth.uid())
    );

-- Users can see themselves
CREATE POLICY "user_see_self" ON users
    FOR SELECT
    USING (id = auth.uid());

-- SuperAdmin can insert users
CREATE POLICY "super_admin_insert_users" ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'super_admin'
        )
    );

-- Family admins can invite family users and co-admins
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

-- Users can update their own record
CREATE POLICY "user_update_self" ON users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- SuperAdmin can update any user
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

-- Family admins can update users in their family
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

-- ============================================
-- FAMILY_MEMBERS TABLE RLS POLICIES
-- ============================================

-- SuperAdmin cannot see any family members (strict privacy)
-- (No SELECT policy for SuperAdmin on family_members)

-- Family members can see all members in their family
CREATE POLICY "user_see_own_family_members" ON family_members
    FOR SELECT
    USING (
        family_id = (SELECT family_id FROM users WHERE id = auth.uid())
    );

-- Family admins and co-admins can insert members
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

-- Family admins and co-admins can update members in their family
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

-- Family admins and co-admins can delete members in their family
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
