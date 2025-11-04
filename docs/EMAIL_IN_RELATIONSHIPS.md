# Email Storage in Relationships Column - Implementation Guide

## Overview
Email addresses from bulk imports and CSV uploads are now stored in the **`relationships`** column instead of `custom_fields`. This enables email-based authentication for family members.

## Data Structure

### Before (Old Way)
```json
{
  "name": "John Doe",
  "relationships": {
    "father": "Michael Doe",
    "mother": "Jane Doe"
  },
  "custom_fields": {
    "Date of Birth": "1990-01-15",
    "Phone Number": "555-1234",
    "Email Address": "john@example.com"  // ❌ In custom_fields
  }
}
```

### After (New Way)
```json
{
  "name": "John Doe",
  "relationships": {
    "father": "Michael Doe",
    "mother": "Jane Doe",
    "email": "john@example.com"  // ✅ In relationships
  },
  "custom_fields": {
    "Date of Birth": "1990-01-15",
    "Phone Number": "555-1234"
  }
}
```

## CSV Format

### New CSV Template Format
The downloaded template now includes email as a relationship column:

```
Name,Photo URL,Relationship: father,Relationship: mother,Relationship: spouse,Relationship: email,Date of Birth,Phone Number,Occupation,Education,Blood Group,Address,City,Country,Notes
```

### Example CSV Data
```csv
Name,Photo URL,Relationship: father,Relationship: mother,Relationship: spouse,Relationship: email,Date of Birth,Phone Number,Occupation,Education,Blood Group,Address,City,Country,Notes
John Doe,https://example.com/john.jpg,Michael Doe,Jane Doe,,john@example.com,1990-01-15,555-1234,Engineer,B.Tech,O+,123 Main St,New York,USA,Family head
Jane Smith,https://example.com/jane.jpg,,Jane Smith,,jane@example.com,1992-03-20,555-5678,Doctor,M.D,B+,456 Oak Ave,Boston,USA,Medical professional
```

## UI Changes

### Bulk Import Form
The form now includes an **Email** column between Mother and Action:

| Name | Photo URL | Father | Mother | Email | Action |
|------|-----------|--------|--------|-------|--------|
| John | https://... | Michael | Jane | john@example.com | Remove |

## CSV Parsing
The `parseCSV` function now handles email with these logic:
- If CSV header is `"Relationship: email"` → stored in `relationships.email`
- If CSV header is `"Email Address"` or `"Email"` → converted to `relationships.email` for backward compatibility

## Predefined Custom Fields (Updated)
The 9 remaining predefined custom fields are:
1. Date of Birth
2. Phone Number
3. Occupation
4. Education
5. Blood Group
6. Address
7. City
8. Country
9. Notes

*Email Address was removed from this list*

## How to Use

### Via Form Entry
1. Go to Bulk Import page
2. Fill in member details
3. Enter email in the **Email** column
4. Click Add Members

### Via CSV Upload
1. Download the template
2. Fill in columns including `Relationship: email`
3. Upload or paste the CSV
4. Click Parse CSV
5. Click Add Members

### Via CSV Paste
1. Paste CSV content directly
2. Make sure headers include `Relationship: email`
3. Click Parse CSV
4. Verify data and submit

## API Request Format

```json
{
  "members": [
    {
      "name": "John Doe",
      "photo_url": "https://example.com/john.jpg",
      "relationships": {
        "father": "Michael Doe",
        "mother": "Jane Doe",
        "email": "john@example.com"
      },
      "custom_fields": {
        "Date of Birth": "1990-01-15",
        "Phone Number": "555-1234",
        "Occupation": "Engineer",
        "Education": "B.Tech",
        "Blood Group": "O+",
        "Address": "123 Main St",
        "City": "New York",
        "Country": "USA",
        "Notes": "Family head"
      }
    }
  ]
}
```

## Login Integration
Members can now login using their email stored in relationships:
- Email is retrieved from `relationships.email`
- Authentication system validates against this email
- No need to look in custom_fields

## Backward Compatibility
The CSV parser supports both formats:
- `Relationship: email` (new, recommended)
- `Email Address` (old, auto-converted to relationships.email)

## Migration Notes
- Existing family members with email in custom_fields will retain their old structure
- New bulk imports will use the relationships structure
- Manual member creation should also use the new relationships structure

## Summary of Changes
✅ Email now stored in `relationships` column
✅ Email removed from predefined custom fields
✅ CSV template updated with `Relationship: email` column
✅ Form UI includes Email input field
✅ Backward compatibility with old CSV format
✅ Ready for email-based authentication
