# Security Policy — SRM Resume AI (Hardened Institutional Edition)

## Reporting a Vulnerability

The SRM Resume AI project takes institutional data security, student privacy, and credential management seriously.

If you discover a potential vulnerability within the authentication flow, ATS parser, or rate-limiting gateway, please report it responsibly:
- **Placement Security Team**: `careers@srmist.edu.in`
- **Lead Maintainer**: `tilakabhi0212@gmail.com`

---

## Institutional Security Architecture

### 1. Cryptographic Session Integrity & Anti-Tampering (New)
- **SHA-256 Cryptographic Digests**: User session envelopes persisted in web storage are signed with a SHA-256 hash over user ID, verified email, assigned role, institutional status, and issuance timestamps (`sessionSecurity.ts`).
- **Tampering Invalidation**: Any client-side manipulation of `localStorage` or `sessionStorage` (e.g. attempting to forge an admin role) triggers immediate hash validation failure, session purge, and forced logout.
- **Strict Session TTL**: Sessions are bound to a strict 8-hour maximum lifetime (`SESSION_TTL_MS`). Expired sessions are automatically rejected and cleared.

### 2. Privilege Escalation Prevention & RBAC Enforcement (New)
- **Anti-Elevation Controls**: Role transitions via `switchRole()` and `loginDirect()` enforce strict role eligibility:
  - Verified students (`@srmist.edu.in` with student registration patterns) can **never** assume administrative roles (`Placement Officer`, `Faculty Coordinator`, `Super Admin`).
  - External corporate recruiters are strictly quarantined to the `Corporate Recruiter` role.
  - `Super Admin` privileges are restricted to verified administrative personnel (`admin`, `director`, `dean`).
- **Dev-Gated Direct Sign-In**: Quick sign-in bypasses are strictly gated behind `import.meta.env.DEV` and stripped entirely from production client bundles.

### 3. Multi-Layer File Upload & Memory Exhaustion Defense (New)
- **MIME & Extension Whitelisting**: Both single-resume (`ResumeUpload.tsx`) and batch upload (`ResumeUploadView.tsx`) pipelines enforce strict extension allowlists (`.pdf`, `.docx`, `.doc`, `.txt`) and validated MIME types.
- **Individual & Batch Limits**: Hard 5MB per-file ceiling and 50-file batch maximums prevent browser thread lockups and denial-of-service attempts.
- **ReDoS Protection**: Pasted resume text inputs are clamped to 250,000 characters to eliminate regular expression catastrophic backtracking risks.

### 4. Authentication & Token Integrity
- **Google OAuth 2.0 Verification**: JWT ID tokens are verified for cryptographic structure, signature parsing, and unexpired timestamps (`exp`).
- **Domain Verification**: Enforces SRMIST institutional tenancy checks (`@srmist.edu.in` and official subdomains).

### 5. Server-Side API Isolation & Origin Defense
- **Zero Client Credential Leakage**: Resend API keys are isolated exclusively in backend server environments (`server.js` and Vite middleware) and never exposed to client bundles.
- **CORS Origin Whitelisting**: Strict origin matching blocks unauthorized cross-origin requests to administrative email endpoints.
- **Anti-Spoofing Rate Limiting**: Client IP extraction defaults to direct socket addresses unless explicit `TRUST_PROXY=true` is declared. Outgoing emails are capped at 25 requests/minute with periodic garbage collection.
- **Payload Size Enforcement**: Requests exceeding 200KB are terminated with `413 Payload Too Large`.

### 6. Email Header & CRLF Injection Prevention
- All email subjects, recipient addresses, and sender configurations are sanitized to strip newline characters (`\r`, `\n`) and control characters, mitigating SMTP header injection and open-relay abuse.

### 7. HTTP Defense-in-Depth & Content Security Policy (CSP)
- **Strict Transport Security (HSTS)**: `max-age=31536000; includeSubDomains; preload` enforces end-to-end TLS encryption.
- **Hardened HTTP Headers**: Responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, and `Cross-Origin-Resource-Policy: same-origin`.
- **Content Security Policy (CSP)**: Restricts script execution to same-origin and Google OAuth GSI (`https://accounts.google.com`), disallows framing (`frame-ancestors 'none'`), disallows plugin objects (`object-src 'none'`), and mandates `base-uri 'self'` with `form-action 'self'`.
- **Path Traversal Guards**: Production static file resolution blocks directory traversal and dotfile inspection.

### 8. Universal CSV Formula Injection Sanitization (CWE-1236)
- Dynamic table exports across all ranking, shortlisting, and screening views (`ScreeningView.tsx`, `CandidateRanking.tsx`, `ShortlistedView.tsx`) sanitize cells starting with formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) by prepending escape markers.

### 9. Dependency Security Posture
- Production dependencies (`npm audit --omit=dev`) contain **0 vulnerabilities**.
- Dev-time build dependencies (e.g., Tailwind CSS compiler) are overridden and isolated strictly to build time with zero client runtime exposure.
