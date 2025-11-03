# ApnaParivar - A Modern Family Tree Platform
### Hackathon Project Documentation

---

## 1. Executive Summary

**ApnaParivar** is a secure, multi-tenant web application designed to help families (like Ramesh's) build, manage, and visualize their family tree. Built in 30 hours, it addresses common privacy and data management issues by implementing a unique, multi-level administrative hierarchy and leveraging Supabase for Gmail-based authentication, database management, and row-level security. The platform ensures a strict separation of data, where a SuperAdmin manages platform access, but individual Family Admins retain complete control and privacy over their own family's data.

## 2. The Main Problem

In today's digital world, representing a complex family structure is a challenge. Existing solutions are often:
* **Too Public:** Lacking granular privacy controls, exposing sensitive family data.
* **Too Simplistic:** Unable to represent complex relationships like step-siblings, multi-generational links, and custom family details.
* **Insecure:** Poorly defined admin roles mean any user could potentially edit or delete critical information.
* **Not Multi-Tenant:** A single user (like a SuperAdmin) having access to *all* families' private data is a significant privacy violation.

Ramesh's family needs a "fool-proof" system. They need to trust that their family photos and personal details are only visible to their approved family members and that editing is restricted to designated, trusted admins within their family.

## 3. Our Solution: A Privacy-First, Role-Based Platform

ApnaParivar solves this by building a system based on **data segregation** and **clear role hierarchies**. The core of the solution is to separate *platform management* from *family data management*.

1.  **Multi-Tenancy:** The application is designed to host hundreds of distinct, separate families. Each family's data (members, photos, details) is logically isolated in the database, acting as its own private "tenant."

2.  **Gmail-Based Authentication:** We use Supabase Auth's built-in "Sign in with Google" (Gmail) provider. This is the foundation of our trust model. All users, from SuperAdmins to family members, must be invited and authenticated via their Gmail account, ensuring every user is verified and identifiable.

3.  **Row-Level Security (RLS):** This is the "fool-proof" mechanism. We use Supabase's powerful PostgreSQL Row-Level Security. RLS rules ensure that a user, once authenticated, can *only* see the data rows that they are explicitly allowed to.
    * A member of Family 'A' can **never** see data from Family 'B'.
    * The SuperAdmin can **never** see any family member data at all.

4.  **Flexible Data Entry:** Each family member's profile supports 10 customizable fields (stored as a JSON object). This allows the family admin (Ramesh) to decide what's important—whether it's "Education," "Astrological Sign," or "Favorite Memory."

## 4. User Roles & Permissions (The Core Logic)

This hierarchy is the key to solving the problem.

### Role 1: SuperAdmin
* **Who:** The platform owner/creator.
* **Authentication:** Logs in via their own Gmail.
* **Permissions:**
    * **CAN:** Invite, view, and manage **Family Admins** (e.g., "Ramesh") using their Gmail.
    * **CAN:** Manage platform-wide settings (e.g., subscription info).
    * **CANNOT:** View, search, or access *any* `family_members` data, photos, or details from any family. Their RLS rules strictly forbid it.

### Role 2: Family Admin (e.g., Ramesh - "Admin 1")
* **Who:** The designated owner of a single family tree.
* **Authentication:** Invited by the SuperAdmin via Gmail.
* **Permissions:**
    * **CAN:** Invite other "Co-Admins" (Admin 2, Admin 3) to help manage *their* family.
    * **CAN:** Add/Remove Co-Admins for *their* family.
    * **CAN:** Invite "Family Users" (e.g., Krishnappa, Ramya) via Gmail.
    * **CAN:** Add, edit, and delete all family members, photos, and details for *their* family.
    * **CAN:** Define the 10 custom fields for *their* family.
    * **CANNOT:** See any data from any other family on the platform.

### Role 3: Family Co-Admin (Admin 2, Admin 3)
* **Who:** Trusted family members designated by the Family Admin.
* **Authentication:** Invited by the Family Admin (Ramesh) via Gmail.
* **Permissions:**
    * Identical to the Family Admin (Ramesh). They have full rights to add, edit, delete, and invite members within *their own* family.

### Role 4: Family User (e.g., Krishnappa, Ramya)
* **Who:** Approved family members.
* **Authentication:** Invited by any Admin (1, 2, or 3) via Gmail.
* **Permissions:**
    * **CAN:** View the *entire* family tree, see all member details, and browse photos for *their* family.
    * **CAN:** Use the search function within *their* family.
    * **CANNOT:** Add, edit, or delete any members. This role is "read-only."

## 5. Technical Architecture & Stack

We will use a modern, fast, and scalable stack perfect for a 30-hour hackathon.



* **Frontend:** **React (Vite)** - For a fast, component-based user interface.
* **Styling:** **Tailwind CSS** - For rapidly building a clean, modern UI.
* **Backend-as-a-Service (BaaS):** **Supabase**
    * **Authentication:** Manages all "Sign in with Google" flows, user sessions, and JWTs.
    * **Database:** Supabase (PostgreSQL) to store all our data.
    * **Row-Level Security (RLS):** The core of our privacy model, implemented with SQL rules.
    * **Storage:** Supabase Storage to securely host all family member photographs.
* **Tree Visualization:** A simple JS library (e.g., D3.js or a dedicated tree library) to render the family connections.

## 6. Simplified Database Schema

This is how we'll structure the data in Supabase.

1.  **`families`** (Table)
    * `id` (uuid, Primary Key): Unique ID for the family.
    * `family_name` (text): e.g., "Ramesh's Parivar"

2.  **`users`** (This links to Supabase `auth.users`)
    * `id` (uuid, Primary Key, Foreign Key to `auth.users`): The user's auth ID.
    * `email` (text): The user's Gmail.
    * `family_id` (uuid, Foreign Key to `families`): Which family they belong to. (This is `NULL` for the SuperAdmin).
    * `role` (text): `super_admin`, `family_admin`, or `family_user`.

3.  **`family_members`** (Table)
    * `id` (uuid, Primary Key): Unique ID for the member.
    * `family_id` (uuid, Foreign Key to `families`): Which family this member belongs to.
    * `name` (text): e.g., "Krishnappa"
    * `photo_url` (text): Link to Supabase Storage.
    * `relationships` (jsonb): Stored as `{ "parent_1": "member_id_x", "parent_2": "member_id_y", "spouse": "member_id_z" }`
    * `custom_fields` (jsonb): Stored as `{ "field_1_name": "value", "field_2_name": "value" }`

**Key RLS Policy Example (in English):**
* **On `family_members` table:** "A user can only `SELECT` (read) rows from this table if the row's `family_id` matches their own `family_id` (from the `users` table)."
* **On `family_members` table:** "A user can only `INSERT` or `UPDATE` (write) rows if their `role` is `family_admin` AND the `family_id` matches."

## 7. Future Roadmap & Monetization

* **Year 1:** The platform will be free to attract early adopters and gather feedback.
* **Year 2+:** A subscription model at **Rs 500/year per family** will be introduced, managed by the SuperAdmin. This fee supports ongoing development, hosting, and storage costs.
* **Future Features:**
    * GEDCOM (standard family tree file) import/export.
    * Advanced search by keyword/custom fields.
    * Family event calendars.
```eof