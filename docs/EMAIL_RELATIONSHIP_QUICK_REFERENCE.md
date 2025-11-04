# Email in Relationships - Quick Reference

## What Changed?
Email is now stored in the **`relationships`** column instead of **`custom_fields`**.

## Why?
This allows emails to be used for authentication/login without needing to search through custom fields.

## Data Format

```json
{
  "relationships": {
    "father": "Michael Doe",
    "mother": "Jane Doe",
    "email": "john@example.com"  // Email goes here now!
  }
}
```

## CSV Header Format

```
Name,Photo URL,Relationship: father,Relationship: mother,Relationship: spouse,Relationship: email,Date of Birth,Phone Number,...
```

## Form Fields in Bulk Import

| Column | Type | Example |
|--------|------|---------|
| Name | Text | John Doe |
| Photo URL | URL | https://example.com/photo.jpg |
| Father | Text | Michael Doe |
| Mother | Text | Jane Doe |
| **Email** | Email | john@example.com |
| ... custom fields ... | | |

## CSV Example

```csv
Name,Photo URL,Relationship: father,Relationship: mother,Relationship: spouse,Relationship: email,Date of Birth,Phone Number,Occupation,Education
John Doe,,Michael Doe,Jane Doe,,john@example.com,1990-01-15,555-1234,Engineer,B.Tech
Jane Smith,,David Smith,Mary Smith,Bob Smith,jane@example.com,1992-03-20,555-5678,Doctor,M.D
```

## Predefined Custom Fields (No longer includes Email)

1. Date of Birth
2. Phone Number
3. Occupation
4. Education
5. Blood Group
6. Address
7. City
8. Country
9. Notes

## For Authentication

Get email from: `family_member.relationships.email`

Not from: `family_member.custom_fields['Email Address']` ❌

## Backward Compatibility

Old CSV files with `Email Address` column will automatically be converted to `Relationship: email`
