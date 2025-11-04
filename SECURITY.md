# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Apna-Parivar, please **do not** open a public issue. Instead, please email the security concern to the project maintainers directly.

### How to Report

1. **Do not** create a public issue describing the vulnerability
2. Send an email to: [security@apnaparivar.com] or open a private security advisory
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Your suggested fix (if any)

### What to Expect

- We will acknowledge receipt of your report within 24 hours
- We will investigate and determine the severity
- We will work on a fix and release a security update
- We will credit you in the release notes (unless you prefer anonymity)

### Timeline

- **Critical**: Patch released within 24-48 hours
- **High**: Patch released within 1 week
- **Medium**: Patch released within 2 weeks
- **Low**: Patch released with next regular release

---

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**: Regularly update your Python and Node.js packages
   ```bash
   pip install --upgrade -r requirements.txt
   npm update
   ```

2. **Environment Variables**: Never commit `.env` files. Use `.env.example` as a template.

3. **Supabase Credentials**: 
   - Use different API keys for different environments
   - Rotate keys regularly
   - Use Row-Level Security (RLS) policies

4. **Production Setup**:
   - Restrict CORS origins to your frontend domain only
   - Use HTTPS everywhere
   - Enable database backups
   - Monitor API access logs

5. **Access Control**:
   - Implement strong role-based access control
   - Audit user permissions regularly
   - Remove inactive users

### For Developers

1. **Input Validation**: 
   - Validate all user input
   - Use Pydantic models in FastAPI
   - Sanitize data before database operations

2. **Authentication & Authorization**:
   - Use JWT tokens properly
   - Implement proper session management
   - Verify user roles and permissions

3. **Database Security**:
   - Use parameterized queries (already done via SQLAlchemy)
   - Implement Row-Level Security (RLS)
   - Never expose database errors in API responses
   - Encrypt sensitive data at rest

4. **API Security**:
   - Implement rate limiting
   - Use CORS properly
   - Add API authentication headers
   - Log security events
   - Validate content types

5. **Dependencies**:
   - Use `pip` and `npm` audit tools
   - Pin dependency versions
   - Review dependency security advisories
   - Update regularly

6. **Code Review**:
   - All PRs must be reviewed
   - Security review for sensitive changes
   - Use GitHub's code scanning (if available)

### For Deployment

1. **Environment Variables**:
   ```bash
   # Required production variables
   SUPABASE_URL=<your-url>
   SUPABASE_KEY=<your-key>
   SUPABASE_JWT_SECRET=<your-secret>
   DATABASE_URL=postgresql://...
   ENV=production
   ```

2. **Docker Security**:
   - Use specific base image versions
   - Run as non-root user (already done in Dockerfile)
   - Don't include secrets in Docker images
   - Use `.dockerignore` to exclude sensitive files

3. **Render Configuration**:
   - Set environment variables in Render dashboard (not in code)
   - Enable auto-deploy only on `main` branch
   - Use branch protection rules
   - Monitor deployment logs

4. **Network Security**:
   - Use HTTPS/TLS for all connections
   - Restrict database access to app servers only
   - Use VPC/private networks if available
   - Implement DDoS protection

---

## Dependency Scanning

### Python
```bash
# Check for vulnerable packages
pip-audit

# Or use pip's built-in audit
pip install pip-audit
pip-audit
```

### Node.js
```bash
# Check for vulnerable packages
npm audit

# Fix automatically
npm audit fix

# For frontend
cd frontend
npm audit
npm audit fix
```

---

## Security Headers

The application includes security headers via CORS middleware. Ensure these are properly configured:

```
Strict-Transport-Security
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy
```

---

## Authentication & Authorization

### JWT Tokens
- Tokens are signed with SUPABASE_JWT_SECRET
- Tokens expire after a configured period
- Always validate tokens on protected endpoints
- Use Bearer token scheme in Authorization header

### Role-Based Access Control
- Super Admin: Full system access
- Family Admin: Manage their family
- Co-Admin: Help manage family (limited)
- Family User: View/access family data only

---

## Incident Response

If a security incident is discovered:

1. **Immediately** disable affected credentials
2. **Notify** affected users if their data was compromised
3. **Assess** the scope and impact
4. **Create** a security patch
5. **Release** an updated version
6. **Document** the incident and lessons learned

---

## Security Checklist for Contributors

- [ ] No hardcoded secrets or credentials
- [ ] Input validation implemented
- [ ] Authentication/authorization checks in place
- [ ] Sensitive data logged carefully
- [ ] Dependencies checked for vulnerabilities
- [ ] Error messages don't leak sensitive info
- [ ] CORS and security headers configured
- [ ] Tests include security scenarios

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Supabase Security](https://supabase.com/docs/security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

## Security Advisories

Security updates are released as soon as possible. Subscribe to:
- [GitHub Security Advisories](../../security/advisories)
- [Release Notifications](../../releases)

---

## Questions?

For security questions (non-vulnerability), feel free to:
- Open a discussion in [GitHub Discussions](../../discussions)
- Check the [documentation](docs/)
- Review security-related issues

---

**Thank you for helping keep Apna-Parivar secure!** 🔒
