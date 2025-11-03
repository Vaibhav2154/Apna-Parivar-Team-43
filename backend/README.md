# ApnaParivar Backend

## Overview
This is the backend service for ApnaParivar - A secure, multi-tenant family tree platform built with FastAPI and Supabase.

## Prerequisites
- Python 3.12+
- Supabase account and project
- PostgreSQL (via Supabase)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -e .
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env` with:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon public key
- `SUPABASE_JWT_SECRET`: Your Supabase JWT secret

### 3. Create Database Tables
Run the SQL scripts on your Supabase database:

1. First, create the schema:
   - Go to Supabase Dashboard > SQL Editor
   - Copy contents of `sql/schema.sql`
   - Execute it

2. Then, create Row-Level Security policies:
   - Copy contents of `sql/rls_policies.sql`
   - Execute it

### 4. Run the Backend
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure
```
backend/
├── app.py                      # Main FastAPI application
├── main.py                     # Entry point for running the server
├── pyproject.toml              # Project dependencies
├── core/
│   ├── config.py              # Configuration settings
│   ├── database.py            # Supabase client initialization
│   └── security.py            # JWT token utilities
├── schemas/
│   └── user.py                # Pydantic models for request/response
├── services/
│   ├── user_service.py        # User management logic
│   ├── family_service.py      # Family management logic
│   └── family_member_service.py # Family member management logic
├── routers/
│   ├── user_router.py         # User endpoints
│   ├── family_router.py       # Family endpoints
│   ├── family_member_router.py # Family member endpoints
│   └── health_router.py       # Health check endpoint
└── sql/
    ├── schema.sql             # Database table creation
    └── rls_policies.sql       # Row-Level Security policies
```

## API Endpoints

### Health Check
- `GET /health` - Health status of the backend

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users?family_id={id}` - Get all users in a family
- `PUT /api/users/{user_id}` - Update user
- `DELETE /api/users/{user_id}` - Delete user

### Families
- `POST /api/families` - Create a new family
- `GET /api/families/{family_id}` - Get family by ID
- `GET /api/families` - Get all families
- `PUT /api/families/{family_id}` - Update family
- `DELETE /api/families/{family_id}` - Delete family

### Family Members
- `POST /api/family-members?family_id={id}` - Create a family member
- `GET /api/family-members/{member_id}` - Get member by ID
- `GET /api/family-members/family/{family_id}` - Get all members in a family
- `GET /api/family-members/search?family_id={id}&query={q}` - Search members
- `PUT /api/family-members/{member_id}` - Update member
- `DELETE /api/family-members/{member_id}` - Delete member

## Database Schema

### families
- `id` (UUID, PK): Unique family identifier
- `family_name` (TEXT): Name of the family
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### users
- `id` (UUID, PK, FK to auth.users): User authentication ID
- `email` (TEXT): User's Gmail address
- `family_id` (UUID, FK): Associated family (NULL for SuperAdmin)
- `role` (TEXT): User role (super_admin, family_admin, family_co_admin, family_user)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### family_members
- `id` (UUID, PK): Unique member identifier
- `family_id` (UUID, FK): Associated family
- `name` (TEXT): Member's name
- `photo_url` (TEXT): URL to member's photo
- `relationships` (JSONB): Relationship links (parent_1, parent_2, spouse)
- `custom_fields` (JSONB): Custom user-defined fields (up to 10)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

## Row-Level Security (RLS)

The backend implements strict Row-Level Security policies:

1. **Families**: Users can only see families they belong to (SuperAdmin can see all)
2. **Users**: Users can only see other users in their family
3. **Family Members**: 
   - SuperAdmin cannot see any family member data
   - Users can only see members from their family
   - Only Family Admins and Co-Admins can create/edit/delete members

## Development

### Running Tests
```bash
pytest
```

### Code Quality
```bash
pylint backend/
black backend/
```

## License
See LICENSE file in the project root.
