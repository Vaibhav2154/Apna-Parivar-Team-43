-- SQL Schema for ApnaParivar - Family Tree Platform
-- This script creates the base tables required for the application
-- Execute this on Supabase PostgreSQL Database

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
