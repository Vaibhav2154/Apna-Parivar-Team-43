# Project Setup Guide

Complete guide to setting up and running Apna-Parivar locally and in production.

## Quick Setup (5 minutes)

### 1. Prerequisites Check

```bash
# Check Python version (need 3.12+)
python --version

# Check Node version (need 18+)
node --version

# Check npm version (need 8+)
npm --version
```

### 2. Clone Repository

```bash
git clone https://github.com/Samcode2006/Apna-Parivar-Team-43.git
cd Apna-Parivar-Team-43
```

### 3. Backend Setup (Terminal 1)

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
# cp .env.example .env   # macOS/Linux

# Edit .env with your Supabase credentials
# SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET, DATABASE_URL

# Start server
python main.py
```

Visit: http://localhost:8000/docs

### 4. Frontend Setup (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

---

## Detailed Setup

### Prerequisites

#### System Requirements
- **OS**: Windows, macOS, or Linux
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Disk**: 2GB free space
- **Internet**: For Supabase connection

#### Required Software
1. **Python 3.12+**
   - Download: https://www.python.org/downloads/
   - Verify: `python --version`

2. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

3. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **Docker** (for containerized setup)
   - Download: https://www.docker.com/products/docker-desktop/
   - Verify: `docker --version`

#### External Services
- **Supabase Account** (https://supabase.com)
  - Free tier available
  - Create a project
  - Get credentials (URL, Key, JWT Secret)

---

### Backend Setup (Detailed)

#### 1. Create Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (choose based on OS):
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# Windows Command Prompt:
.venv\Scripts\activate.bat

# macOS/Linux:
source .venv/bin/activate
```

#### 2. Install Dependencies

```bash
# Upgrade pip first
pip install --upgrade pip

# Install from requirements
pip install -r requirements.txt

# Install development dependencies (optional)
pip install -e ".[dev]"
```

#### 3. Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Edit .env file with your values:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-anon-key
# SUPABASE_JWT_SECRET=your-jwt-secret
# DATABASE_URL=postgresql://user:pass@host:5432/db
# DEBUG=False
# ENV=development
```

#### 4. Initialize Database

```bash
# Go to Supabase Dashboard
# SQL Editor section
# Run backend/sql/schema.sql (create tables)
# Run backend/sql/rls_policies.sql (security policies)
```

#### 5. Run Backend

```bash
# Development mode (with auto-reload)
python main.py

# Or use uvicorn directly
uvicorn app:app --reload

# Or production mode
uvicorn app:app --host 0.0.0.0 --port 8000
```

Access API: http://localhost:8000/docs (Swagger UI)

---

### Frontend Setup (Detailed)

#### 1. Install Dependencies

```bash
cd frontend

# Install npm packages
npm install

# Verify installation
npm list
```

#### 2. Environment Configuration

```bash
# Copy environment file (if needed)
copy .env.example .env.local  # Windows
# cp .env.example .env.local   # macOS/Linux

# Add your configuration
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Run Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

Access UI: http://localhost:3000

---

## Docker Setup

### Build Docker Image

```bash
# From repository root
docker build -f backend/Dockerfile -t apnaparivar:latest .

# Or with custom tag
docker build -f backend/Dockerfile -t apnaparivar:1.0.0 .
```

### Run Docker Container

```bash
# Set environment variables
$env:SUPABASE_URL = "your-url"
$env:SUPABASE_KEY = "your-key"
$env:SUPABASE_JWT_SECRET = "your-secret"
$env:DATABASE_URL = "postgresql://..."

# Run container
docker run -p 8000:8000 `
  -e SUPABASE_URL=$env:SUPABASE_URL `
  -e SUPABASE_KEY=$env:SUPABASE_KEY `
  -e SUPABASE_JWT_SECRET=$env:SUPABASE_JWT_SECRET `
  -e DATABASE_URL=$env:DATABASE_URL `
  -e ENV=production `
  apnaparivar:latest
```

### Docker Compose (Both Services)

```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

---

## Render Deployment

### Prerequisites
- GitHub repository with code pushed
- Render account (https://render.com)
- Supabase credentials

### Deployment Steps

#### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Create Render Service

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect GitHub repository
4. Select **Docker** as environment
5. Name your service
6. Set build context to repository root

#### 3. Configure Environment Variables

In Render Dashboard → Environment:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key
SUPABASE_JWT_SECRET=your-secret
DATABASE_URL=postgresql://user:pass@host/db
ENV=production
```

#### 4. Deploy

Click **Create Web Service** and wait for deployment.

### Post-Deployment

- Visit your service URL
- Check `/docs` endpoint
- Monitor logs for errors
- Set up monitoring and alerts

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Update main
git fetch origin
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/my-feature
```

### 2. Make Changes

```bash
# Edit files
# Test changes locally
# Run tests
pytest
npm test

# Fix linting issues
black backend/
npm run lint
```

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### 4. Create Pull Request

- Go to GitHub
- Create PR with clear description
- Wait for review
- Address feedback
- Merge when approved

---

## Troubleshooting

### Python Issues

**`python: command not found`**
- Install Python from https://python.org
- Add to PATH during installation

**`No module named 'fastapi'`**
- Activate virtual environment
- Run: `pip install -r requirements.txt`

**`port 8000 already in use`**
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000

# Kill process (Windows):
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :8000
kill -9 <PID>
```

### Node/Frontend Issues

**`npm: command not found`**
- Install Node.js from https://nodejs.org
- Restart terminal after installation

**`Cannot find module`**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 already in use**
```bash
# Use different port
npm run dev -- -p 3001
```

### Database Issues

**`Database connection refused`**
- Check SUPABASE_URL in .env
- Check DATABASE_URL format
- Verify database is running
- Check network connectivity

**`Row-Level Security policy error`**
- Ensure RLS policies are loaded
- Run: `backend/sql/rls_policies.sql` in Supabase
- Check user roles and permissions

### Docker Issues

**`Docker daemon not running`**
- Start Docker Desktop
- Or use: `sudo systemctl start docker`

**`Permission denied while trying to connect`**
- Add user to docker group: `sudo usermod -aG docker $USER`

---

## Configuration Files Reference

### Backend Configuration

| File | Purpose |
|------|---------|
| `.env` | Environment variables (local) |
| `.env.example` | Template for environment variables |
| `pyproject.toml` | Python project metadata |
| `requirements.txt` | Python dependencies |
| `Dockerfile` | Container image definition |

### Frontend Configuration

| File | Purpose |
|------|---------|
| `package.json` | Node.js metadata and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `.eslintrc` | ESLint configuration |
| `postcss.config.mjs` | PostCSS configuration |

---

## Performance Optimization

### Backend
- Use connection pooling for database
- Enable caching where appropriate
- Optimize database queries
- Use async operations

### Frontend
- Code splitting and lazy loading
- Image optimization
- CSS/JS minification (done by Next.js)
- Use production build

### Deployment
- Use CDN for static assets
- Enable gzip compression
- Monitor performance metrics
- Set up caching headers

---

## Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] All secrets in environment variables (not code)
- [ ] CORS configured for specific origins
- [ ] Database RLS policies enabled
- [ ] JWT tokens validated
- [ ] HTTPS enabled (Render provides this)
- [ ] Input validation implemented
- [ ] Dependencies updated and audited

---

## Next Steps

1. **Explore Documentation**: Read `docs/` folder
2. **Review API**: Visit http://localhost:8000/docs
3. **Check Existing Issues**: GitHub Issues
4. **Make Changes**: Follow development workflow
5. **Deploy**: Push to main branch for Render auto-deploy

---

## Getting Help

- 📖 [README](../README.md)
- 📚 [Documentation](../docs/)
- 💬 [GitHub Discussions](../../discussions)
- 🐛 [Report Issues](../../issues)
- 📧 Contact maintainers

---

**Happy coding!** ✨
