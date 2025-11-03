# 🔴 FIX INFINITE RECURSION - DO THIS NOW

## The Error You're Getting
```
infinite recursion detected in policy for relation "users"
```

## Why It's Happening
Your RLS policies are querying the same table they're protecting, causing infinite loops during signup.

## ✅ QUICK FIX (3 Steps)

### Step 1: Open Supabase Dashboard
Go to: https://app.supabase.com → Select your project

### Step 2: Go to SQL Editor
Click **SQL Editor** on the left sidebar

### Step 3: Copy & Run This SQL

Copy the entire content from:
**`backend/sql/APPLY_THIS_FIX.sql`**

Paste it into the SQL Editor and click **Run**

---

## What This Does

1. ✅ Drops all problematic policies
2. ✅ Disables and re-enables RLS (clears recursion)
3. ✅ Creates new simplified policies (no recursion)
4. ✅ Allows user signup to work

---

## After Running the SQL

### Test Signup Again
1. Go to `http://localhost:3000/signup`
2. Enter a name and email
3. Click "Create Account"
4. Should work now! ✅

### What Works Now
- ✅ New user signup
- ✅ Magic link authentication
- ✅ User login
- ✅ User profile access

### What's Temporarily Disabled
- ❌ Family viewing policies (will add after signup works)
- ❌ Family member policies (will add after signup works)
- ℹ️  These tables are still RLS-enabled but have no restrictive policies

---

## If It Still Doesn't Work

### Option 1: Reset RLS Completely
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
```

Then test - if it works, the issue is definitely RLS policies.

### Option 2: Check Backend Logs
```bash
tail -f /tmp/backend.log
```

Look for any Supabase errors.

---

## Next Steps (After Signup Works)

1. Add family policies back with proper recursion prevention
2. Implement family creation flow
3. Add family member invitation system

---

**File to run:** `backend/sql/APPLY_THIS_FIX.sql`
