# Contributing to Apna-Parivar

Thank you for your interest in contributing to Apna-Parivar! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Git
- Python 3.12 or later
- Node.js 18 or later
- Supabase account
- GitHub account

### Fork & Clone

```bash
# Fork the repository on GitHub (click the "Fork" button)

# Clone your fork
git clone https://github.com/YOUR_USERNAME/Apna-Parivar-Team-43.git
cd Apna-Parivar-Team-43

# Add upstream remote
git remote add upstream https://github.com/Samcode2006/Apna-Parivar-Team-43.git
```

## How to Contribute

### 1. Find an Issue to Work On

- Check [existing issues](../../issues) for bugs or feature requests
- Look for issues labeled `good first issue` if you're new
- Comment on the issue to let others know you're working on it
- If you have a new idea, [open a discussion](../../discussions) first

### 2. Create a Feature Branch

```bash
# Update your main branch
git fetch upstream
git checkout main
git reset --hard upstream/main

# Create a descriptive branch name
git checkout -b feature/add-family-photo-gallery
# or for bug fixes:
git checkout -b fix/family-member-deletion-error
```

Branch naming conventions:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation
- `test/` for test improvements
- `refactor/` for code refactoring

### 3. Make Your Changes

- Keep changes focused and atomic
- Write meaningful code
- Update tests
- Update documentation

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add family photo gallery feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push and Create a Pull Request

```bash
# Push to your fork
git push origin feature/add-family-photo-gallery

# Create PR on GitHub (use the provided template)
```

## Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -e ".[dev]"  # Install dev dependencies

# Copy and configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
python main.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Database Setup

1. Create a Supabase project
2. Run SQL scripts:
   - Go to Supabase Dashboard > SQL Editor
   - Run `backend/sql/schema.sql`
   - Run `backend/sql/rls_policies.sql`

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files

### Examples

```bash
git commit -m "feat(family-tree): add photo upload support"
git commit -m "fix(auth): resolve email verification timeout"
git commit -m "docs: update API documentation for users endpoint"
git commit -m "test: add unit tests for family member service"
```

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure tests pass**:
   ```bash
   pytest                  # Backend tests
   npm test               # Frontend tests
   ```

3. **Run linters**:
   ```bash
   # Backend
   black backend/
   pylint backend/
   mypy backend/
   
   # Frontend
   npm run lint
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature --force-with-lease
   ```

5. **Create a Pull Request**:
   - Use a clear, descriptive title
   - Reference any related issues (#123)
   - Fill out the PR template completely
   - Add screenshots for UI changes
   - Explain what and why, not just what

### PR Title Format

```
[Type] Brief description

Examples:
[Feature] Add bulk family import functionality
[Fix] Resolve family member relationship display bug
[Docs] Update authentication setup guide
```

### PR Checklist

- [ ] I have read the [Code of Conduct](CODE_OF_CONDUCT.md)
- [ ] My branch is up to date with `main`
- [ ] I have performed a self-review of my code
- [ ] I have commented complex areas of code
- [ ] I have updated documentation as needed
- [ ] I have added tests for new functionality
- [ ] All tests pass locally
- [ ] I have run linters and fixed issues
- [ ] I have not made unnecessary changes

## Coding Standards

### Python (Backend)

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints where possible
- Maximum line length: 100 characters
- Use `black` for formatting
- Use `pylint` for linting
- Use `mypy` for type checking

```python
# Good
def get_family_by_id(family_id: str) -> Family | None:
    """Retrieve a family by its ID."""
    return db.query(Family).filter(Family.id == family_id).first()

# Avoid
def getFamilyById(id):
    return db.query(Family).filter(Family.id == id).first()
```

### TypeScript/JavaScript (Frontend)

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Maximum line length: 100 characters
- Use meaningful variable names

```typescript
// Good
interface FamilyMember {
  id: string;
  name: string;
  relationships: Relationship[];
}

const fetchFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
  // Implementation
};

// Avoid
const getFam = async (id) => {
  // Implementation
};
```

### Documentation

- Use clear, concise language
- Include code examples where helpful
- Update README if needed
- Document complex algorithms
- Add docstrings to functions

```python
def calculate_relationship(member_a_id: str, member_b_id: str) -> str:
    """
    Calculate the relationship between two family members.
    
    Args:
        member_a_id: ID of the first family member
        member_b_id: ID of the second family member
    
    Returns:
        A string describing the relationship (e.g., "parent", "sibling")
    
    Raises:
        ValueError: If either member ID is invalid
    """
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/test_user_service.py

# Run with coverage
pytest --cov=backend tests/

# Run with verbose output
pytest -v
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests

- Write tests for new features
- Write tests for bug fixes
- Aim for >80% code coverage
- Use descriptive test names
- Test both happy path and edge cases

```python
# Backend example
import pytest
from services.user_service import create_user

def test_create_user_with_valid_email():
    """Test creating a user with a valid email."""
    user = create_user("test@example.com", "Test User")
    assert user.email == "test@example.com"
    assert user.name == "Test User"

def test_create_user_with_invalid_email():
    """Test that creating a user with invalid email raises error."""
    with pytest.raises(ValueError):
        create_user("invalid-email", "Test User")
```

## Documentation

- Update `README.md` for major changes
- Update docstrings when changing functions
- Add comments for complex logic
- Keep `docs/` folder updated
- Update API docs if endpoints change

## Reporting Bugs

When reporting a bug, please include:

1. **Description**: What went wrong?
2. **Steps to reproduce**: How to replicate the issue?
3. **Expected behavior**: What should happen?
4. **Actual behavior**: What actually happened?
5. **Screenshots**: Visual evidence (if applicable)
6. **Environment**: OS, Python version, Node version, etc.
7. **Logs**: Any error messages or console output

### Bug Report Template

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [...]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- OS: [e.g., Windows 11, macOS, Ubuntu]
- Python: [e.g., 3.12.1]
- Node: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]

## Logs
```
[Error output here]
```
```

## Suggesting Enhancements

Have an idea for improvement? We'd love to hear it!

1. Use a clear, descriptive title
2. Provide a step-by-step description
3. Explain why this enhancement would be useful
4. List examples of similar features elsewhere

### Feature Request Template

```markdown
## Feature Description
[Clear description of the proposed feature]

## Use Case
[Why would this feature be useful?]

## Proposed Solution
[How should this work?]

## Alternatives Considered
[Any alternative approaches?]

## Additional Context
[Screenshots, links, etc.]
```

## Need Help?

- 📖 Check [docs/](../docs/) for guides
- 💬 Ask in [Discussions](../../discussions)
- 📧 Contact the maintainers
- 🐛 Search [existing issues](../../issues)

---

Thank you for contributing to Apna-Parivar! 🙏

**Happy coding!** ✨
