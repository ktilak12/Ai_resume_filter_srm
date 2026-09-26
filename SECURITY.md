# Security Policy — SRM Resume AI

## Reporting a Vulnerability

The SRM Resume AI project takes institutional data security, student privacy, and credential management seriously.

If you discover a potential vulnerability within the authentication flow, ATS parser, or rate-limiting gateway, please report it responsibly:
- **Placement Security Team**: `careers@srmist.edu.in`
- **Lead Maintainer**: `tilakabhi0212@gmail.com`

---

## Security Safeguards

1. **Authentication & Token Integrity**:
   - Google OAuth 2.0 JWTs are validated with timestamp expiration checks (`exp`).
   - Domain verification restricts access to authorized institutional and partner domains.

2. **In-Memory Rate Limiting**:
   - Outgoing email requests (`/api/send-email`) are rate-limited to 25 requests/minute per client IP to mitigate abuse.
   - Payloads exceeding 200KB are automatically blocked (`413 Payload Too Large`).

3. **CSV Export Sanitization**:
   - All dynamic student records exported to spreadsheet formats are stripped of executable formula prefixes (`=`, `+`, `-`, `@`).

4. **Institutional Data Isolation**:
   - Production instances initialize without synthetic dummy candidates to ensure real student records remain isolated and clean.
