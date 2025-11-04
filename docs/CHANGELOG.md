# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Security
- 

---

## [2.0.0] - 2025-11-04

### Added
- ✨ New authentication system with magic links
- 👥 Multi-tenant family tree management
- 🔐 Role-based access control (Super Admin, Family Admin, Co-Admin, Family User)
- 📧 Email-based user management with Supabase Auth
- 🌳 Family tree visualization and relationship management
- 👤 Family member profiles with custom fields
- 🔒 Row-Level Security (RLS) for data privacy
- 📦 Bulk import functionality for family data
- 🐳 Docker containerization for easy deployment
- 🚀 Render deployment support
- 📚 Comprehensive API documentation (Swagger/ReDoc)
- 🧪 Unit and integration tests
- ⚙️ CI/CD workflows with GitHub Actions

### Changed
- Complete backend rewrite using FastAPI
- Migrated from custom auth to Supabase Auth
- Updated frontend to use Next.js 14
- Improved security with JWT tokens and RLS policies
- Enhanced database schema for better relationships
- Optimized Docker images with multi-stage builds

### Security
- Implemented Row-Level Security policies in Supabase
- Added JWT token validation
- Enabled CORS security headers
- Password hashing with bcrypt
- Environment variable management for secrets

---

## [1.0.0] - 2025-01-01

### Added
- Initial release of Apna-Parivar
- Basic family tree functionality
- User authentication
- Frontend UI with React

---

## Types of Changes

### Added
New features or additions to the project

### Changed
Changes to existing functionality

### Deprecated
Features that will be removed in a future version

### Removed
Features that were removed

### Fixed
Bug fixes

### Security
Security fixes or improvements

---

## Guidelines for Changelog Entries

- Use clear, user-facing language
- Group changes by type (Added, Changed, etc.)
- Link to related issues/PRs: `(#123)`
- Include breaking changes prominently
- Keep entries concise but descriptive

### Example Entry

```markdown
## [1.5.0] - 2025-06-15

### Added
- Family tree export to PDF format (#456)
- Real-time notifications for family updates (#457)

### Fixed
- Email verification timeout issue (#458)
- Relationship display bug in family tree (#459)

### Changed
- Improved performance of family member search (#460)

### Security
- Updated dependencies to patch security vulnerabilities
```

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (1.X.0): New features (backwards compatible)
- **PATCH** (1.0.X): Bug fixes (backwards compatible)

---

## How to Update the Changelog

When making a release:

1. Create a new section with the version and date
2. Move items from [Unreleased] to the new version
3. Update the link at the bottom
4. Commit as: `chore(release): version X.Y.Z`

### Template for Releases

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- [List new features]

### Changed
- [List changes]

### Fixed
- [List bug fixes]

### Security
- [List security updates]
```

---

**Latest Release**: [2.0.0]
**Current Development**: [Unreleased]

See [GitHub Releases](../../releases) for detailed release information.
