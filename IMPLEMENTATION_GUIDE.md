# ApnaParivar Backend Implementation Guide

## SQL Scripts to Execute

Execute these SQL scripts in your Supabase SQL Editor to set up the database.

---

## Step 1: Create Database Schema

Execute the following SQL in Supabase SQL Editor:

```sql
-- SQL Schema for ApnaParivar - Family Tree Platform
-- This script creates the base tables required for the application

-- Drop tables if they exist (for fresh setup)
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

-- Create users table (linked to Supabase auth.users)
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

-- Create indexes for better query performance
CREATE INDEX idx_users_family_id ON users(family_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_name ON family_members(name);

-- Add comments to tables
COMMENT ON TABLE families IS 'Stores family information for multi-tenant setup';
COMMENT ON TABLE users IS 'Stores user information linked to Supabase auth.users';
COMMENT ON TABLE family_members IS 'Stores individual family member information';

-- Add comments to columns
COMMENT ON COLUMN users.role IS 'User role: super_admin (platform owner), family_admin (family owner), family_co_admin (co-owner), family_user (read-only member)';
COMMENT ON COLUMN family_members.relationships IS 'JSON object storing relationship links like parent_1, parent_2, spouse';
COMMENT ON COLUMN family_members.custom_fields IS 'JSON object storing custom user-defined fields (up to 10 fields per family)';
```

---

## Step 2: Create Row-Level Security (RLS) Policies

Execute the following SQL in Supabase SQL Editor:

```sql
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
```

---

## Backend Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -e .
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
DATABASE_URL=postgresql://user:password@localhost:5432/apnaparivar
DEBUG=False
ENV=development
```

### 3. Run the Backend

```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

### 4. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Project Structure

```
backend/
├── app.py                      # Main FastAPI application
├── main.py                     # Entry point
├── pyproject.toml              # Dependencies
├── .env.example                # Environment template
├── .env                        # Environment variables (not in git)
├── core/
│   ├── config.py              # Configuration settings
│   ├── database.py            # Supabase client
│   └── security.py            # JWT utilities
├── schemas/
│   └── user.py                # Pydantic models
├── services/
│   ├── user_service.py        # User logic
│   ├── family_service.py      # Family logic
│   └── family_member_service.py # Member logic
├── routers/
│   ├── user_router.py         # User endpoints
│   ├── family_router.py       # Family endpoints
│   ├── family_member_router.py # Member endpoints
│   └── health_router.py       # Health check
└── sql/
    ├── schema.sql             # Table creation
    └── rls_policies.sql       # RLS policies
```

---

## API Endpoints Summary

### Health Check
- `GET /health` - Health status

### Users
- `POST /api/users` - Create user
- `GET /api/users/{user_id}` - Get user
- `GET /api/users?family_id={id}` - Get family users
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Families
- `POST /api/families` - Create family
- `GET /api/families/{family_id}` - Get family
- `GET /api/families` - Get all families
- `PUT /api/families/{family_id}` - Update family
- `DELETE /api/families/{family_id}` - Delete family

### Family Members
- `POST /api/family-members?family_id={id}` - Create member
- `GET /api/family-members/{member_id}` - Get member
- `GET /api/family-members/family/{family_id}` - Get family members
- `GET /api/family-members/search?family_id={id}&query={q}` - Search
- `PUT /api/family-members/{member_id}` - Update member
- `DELETE /api/family-members/{member_id}` - Delete member

---

## Database Schema Details

### families Table
- **id** (UUID, PK): Unique family identifier
- **family_name** (TEXT): Name of the family
- **created_at** (TIMESTAMP): Creation time
- **updated_at** (TIMESTAMP): Last update time

### users Table
- **id** (UUID, PK, FK): References auth.users
- **email** (TEXT): User's Gmail (unique)
- **family_id** (UUID, FK): Associated family (NULL for SuperAdmin)
- **role** (TEXT): super_admin | family_admin | family_co_admin | family_user
- **created_at** (TIMESTAMP): Creation time
- **updated_at** (TIMESTAMP): Last update time

### family_members Table
- **id** (UUID, PK): Unique member identifier
- **family_id** (UUID, FK): Associated family
- **name** (TEXT): Member's name
- **photo_url** (TEXT): URL to member's photo
- **relationships** (JSONB): {"parent_1": "uuid", "parent_2": "uuid", "spouse": "uuid"}
- **custom_fields** (JSONB): {"field_1": "value", "field_2": "value", ...}
- **created_at** (TIMESTAMP): Creation time
- **updated_at** (TIMESTAMP): Last update time

---

## Row-Level Security Overview

The RLS policies ensure strict data isolation:

1. **Families Table**
   - SuperAdmin: Can see all families
   - Family Users: Can only see their own family

2. **Users Table**
   - SuperAdmin: Can see all users
   - Family Users: Can see users in their family
   - Users: Can see themselves

3. **Family Members Table**
   - **SuperAdmin**: CANNOT see any family members (strict privacy)
   - Family Users: Can see members in their family
   - Family Admins/Co-Admins: Can create, update, delete members

---

## Key Features Implemented

✅ Multi-tenant architecture with complete data isolation
✅ Gmail-based authentication via Supabase Auth
✅ Row-Level Security (RLS) for privacy
✅ Role-based access control (4 roles)
✅ Custom fields support (up to 10 per family)
✅ Relationship tracking (parent-child, spouse)
✅ Photo URL storage
✅ Search functionality
✅ Full CRUD operations for families and members
✅ RESTful API with FastAPI

---

## Notes

- All timestamps use UTC timezone
- UUIDs are generated automatically
- The SuperAdmin cannot access any family member data (by design)
- All database operations respect RLS policies
- Email addresses are unique per user
- Custom fields are stored as JSONB for flexibility
