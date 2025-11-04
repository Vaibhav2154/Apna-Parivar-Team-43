# Docker Deployment Guide for Apna Parivar

## Overview

This guide explains how to use Docker and Docker Compose to build and run the Apna Parivar application (Frontend + Backend + Database) in containerized environments.

## Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **.env file** with required environment variables

## Project Structure

```
.
├── Dockerfile.backend          # Backend container image
├── Dockerfile.frontend         # Frontend container image
├── docker-compose.yml          # Multi-container orchestration
├── .dockerignore               # Files to exclude from Docker builds
├── .env.example                # Example environment variables
└── DOCKER_DEPLOYMENT_GUIDE.md  # This file
```

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@postgres:5432/apna_parivar
JWT_SECRET_KEY=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
POSTGRES_USER=user
POSTGRES_PASSWORD=password
```

### 2. Build Images

Build all container images:

```bash
docker-compose build
```

Or build specific services:

```bash
docker-compose build backend
docker-compose build frontend
```

### 3. Start Services

Start all services in the background:

```bash
docker-compose up -d
```

Or run in foreground to see logs:

```bash
docker-compose up
```

### 4. Verify Services

Check if all services are running:

```bash
docker-compose ps
```

Expected output:
```
NAME                        STATUS
apna-parivar-backend        Up
apna-parivar-frontend       Up
apna-parivar-postgres       Up
```

### 5. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## Common Commands

### View Logs

View logs from all services:
```bash
docker-compose logs -f
```

View logs from specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

Stop all running services:
```bash
docker-compose down
```

Stop services but keep volumes:
```bash
docker-compose down --remove-orphans
```

Remove everything including volumes:
```bash
docker-compose down -v
```

### Restart Services

Restart all services:
```bash
docker-compose restart
```

Restart specific service:
```bash
docker-compose restart backend
```

### Execute Commands in Container

Run a command inside the backend container:
```bash
docker-compose exec backend python -c "print('Hello')"
```

Access backend shell:
```bash
docker-compose exec backend bash
```

Access frontend shell:
```bash
docker-compose exec frontend sh
```

### Rebuild and Restart

Rebuild images and restart services:
```bash
docker-compose up --build -d
```

## Database Management

### Initialize Database

If you need to run migrations or setup scripts:

```bash
docker-compose exec backend python -m alembic upgrade head
```

### Access PostgreSQL

Connect to PostgreSQL container:

```bash
docker-compose exec postgres psql -U user -d apna_parivar
```

### Backup Database

Backup the database:

```bash
docker-compose exec postgres pg_dump -U user apna_parivar > backup.sql
```

### Restore Database

Restore from backup:

```bash
docker-compose exec -T postgres psql -U user apna_parivar < backup.sql
```

## Production Deployment

### Security Considerations

1. **Environment Variables**: Use strong, unique values for production
   ```env
   JWT_SECRET_KEY=your-very-strong-secret-key-min-32-chars
   POSTGRES_PASSWORD=complex-password-with-special-chars
   ```

2. **CORS Configuration**: Update CORS origins in backend for specific domains
   ```python
   allow_origins=["https://yourdomain.com"]
   ```

3. **Database Connection**: Use managed database services in production
   ```env
   DATABASE_URL=postgresql://user:password@managed-db.example.com:5432/apna_parivar
   ```

4. **Running as Non-Root**: Both containers run as non-root users

5. **Health Checks**: All services include health checks

### Production docker-compose.yml Modifications

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  backend:
    # ... (existing config)
    restart: always
    environment:
      - ENVIRONMENT=production
      - DEBUG=false

  frontend:
    # ... (existing config)
    restart: always
    environment:
      - NODE_ENV=production

  postgres:
    # ... (existing config)
    restart: always
    # Consider using managed database instead
```

### Deploy Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker-compose logs backend
```

### Database Connection Failed

Verify database is ready:
```bash
docker-compose exec postgres pg_isready -U user
```

### Port Already in Use

Find and stop the conflicting container:
```bash
lsof -i :8000
lsof -i :3000
```

### Out of Memory

Increase Docker memory limit:
```bash
docker run -m 2g ...
```

### Permission Denied Errors

Ensure Docker daemon is running:
```bash
sudo systemctl start docker
```

## Docker Hub Deployment

### Build and Push Images

Tag images:
```bash
docker tag apna-parivar-backend:latest yourusername/apna-parivar-backend:latest
docker tag apna-parivar-frontend:latest yourusername/apna-parivar-frontend:latest
```

Push to Docker Hub:
```bash
docker push yourusername/apna-parivar-backend:latest
docker push yourusername/apna-parivar-frontend:latest
```

Update `docker-compose.yml` to use remote images:
```yaml
services:
  backend:
    image: yourusername/apna-parivar-backend:latest
  frontend:
    image: yourusername/apna-parivar-frontend:latest
```

## Kubernetes Deployment

For Kubernetes deployment, you can generate manifests from Docker Compose:

```bash
kompose convert -f docker-compose.yml -o k8s/
```

## Monitoring and Logging

### Docker Stats

Monitor resource usage:
```bash
docker stats
```

### Centralized Logging

Consider using ELK Stack or similar for production logging:
- Elasticsearch
- Logstash
- Kibana

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices for Docker](https://docs.docker.com/develop/dev-best-practices/)
- [FastAPI with Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [Next.js with Docker](https://nextjs.org/docs/deployment#docker-image)

## Support

For issues or questions, refer to:
- Backend documentation: `/docs/README_BACKEND.md`
- Frontend documentation: `/frontend/README.md`
- Docker logs: `docker-compose logs -f`
