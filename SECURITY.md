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

### 2. Privilege Escalation Prevention & RBAC Enforcement (Updated)
- **Consolidated 3-Tier Model**: Role access is strictly partitioned into `Faculty Coordinator`, `Student Coordinator`, and `Super Admin`.
- **Anti-Elevation Controls**: Role transitions via `switchRole()` and authentication flows enforce strict eligibility:
  - Verified students (`@srmist.edu.in` with student registration patterns) can **never** assume administrative roles (`Faculty Coordinator`, `Super Admin`) and are restricted to `Student Coordinator`.
  - `Super Admin` privileges require boundary-checked administrative email patterns (`/(?:^|[._-])(admin|director|dean|vc|placement\.head)(?:[._-]|$)/i`), preventing substring bypasses (e.g. `badminton@srmist.edu.in` or `sandean@srmist.edu.in`).
  - Standard institutional staff are allowed `Faculty Coordinator` and `Student Coordinator` roles.
- **Account Password Security**: Local institutional accounts are salted and hashed using Web Crypto PBKDF2 with 100,000 iterations and 16-byte random salts.

### 3. Multi-Layer File Upload & Memory Exhaustion Defense
- **MIME & Extension Whitelisting**: Both single-resume (`ResumeUpload.tsx`) and batch upload (`ResumeUploadView.tsx`) pipelines enforce strict extension allowlists (`.pdf`, `.docx`, `.doc`, `.txt`) and validated MIME types.
- **Magic Number File Verification**: PDF and ZIP uploads are validated against magic number signatures (`%PDF`, `PK\x03\x04`), neutralizing extension-spoofing attacks.
- **Zip-Bomb Decompression Guards**: ZIP extraction enforces an institutional 5 MB decompression threshold (`readStreamWithLimit`) and filters non-resume assets.
- **ReDoS Protection & Input Clamping**: `sanitizeTextContent` clamps raw input upfront (100,000 characters) and strips `<script>` and `<style>` blocks using linear non-backtracking patterns with unclosed trailing block neutralization.

### 4. iCalendar (RFC 5545) & External URL Defense (New)
- **CRLF & Property Injection Defenses**: `generateIcsContent` sanitizes all dynamic fields using `sanitizeIcsText`, `sanitizeIcsHeader`, and `sanitizeIcsEmail`, preventing injected `\r\n` CRLF properties or rogue attachments (`ATTACH`).
- **Filename Path Traversal Guard**: Downloaded `.ics` filenames enforce strict character allowlists (`[a-zA-Z0-9_-]`), defusing directory traversal attacks.
- **Safe External Link Execution**: Interview meeting links validate against safe protocols (`http:` and `https:`) via `isSafeHttpUrl`, defusing `javascript:` pseudo-protocol Stored XSS vectors, and enforce `rel="noopener noreferrer"`.

### 5. Authentication & Token Integrity
- **Google OAuth 2.0 Verification**: JWT ID tokens are verified for cryptographic structure, signature parsing, and unexpired timestamps (`exp`).
- **Domain Verification**: Enforces SRMIST institutional tenancy checks (`@srmist.edu.in` and official subdomains).

### 6. Server-Side API Isolation & Origin Defense
- **Zero Client Credential Leakage**: Resend API keys are isolated exclusively in backend server environments (`server.js` and Vite middleware) and never exposed to client bundles.
- **CORS Origin Whitelisting**: Strict origin matching blocks unauthorized cross-origin requests to administrative email endpoints.
- **Anti-Spoofing Rate Limiting**: Client IP extraction defaults to direct socket addresses unless explicit `TRUST_PROXY=true` is declared. Outgoing emails are capped at 25 requests/minute with periodic garbage collection.
- **Payload Size Enforcement**: Requests exceeding 200KB are terminated with `413 Payload Too Large`.

### 7. Email Header & CRLF Injection Prevention
- All email subjects, recipient addresses, and sender configurations are sanitized to strip newline characters (`\r`, `\n`) and control characters, mitigating SMTP header injection and open-relay abuse.

### 8. HTTP Defense-in-Depth & Content Security Policy (CSP)
- **Strict Transport Security (HSTS)**: `max-age=31536000; includeSubDomains; preload` enforces end-to-end TLS encryption.
- **Hardened HTTP Headers**: Responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, and `Cross-Origin-Resource-Policy: same-origin`.
- **Content Security Policy (CSP)**: Restricts script execution to same-origin and Google OAuth GSI (`https://accounts.google.com`), disallows framing (`frame-ancestors 'none'`), disallows plugin objects (`object-src 'none'`), and mandates `base-uri 'self'` with `form-action 'self'`.
- **Path Traversal Guards**: Production static file resolution blocks directory traversal and dotfile inspection.

### 9. Universal CSV Formula Injection Sanitization (CWE-1236)
- Dynamic table exports across all ranking, shortlisting, and screening views (`ScreeningView.tsx`, `CandidateRanking.tsx`, `ShortlistedView.tsx`) sanitize cells against formula triggers (`=`, `+`, `-`, `@`, `|`, `%`, `\t`, `\r`) and strip null bytes (`\0`) by prepending escape markers.

### 10. Dependency Security Posture
- Production dependencies (`npm audit`) contain **0 vulnerabilities**.
- Dev-time build dependencies (e.g., Tailwind CSS compiler) are overridden and isolated strictly to build time with zero client runtime exposure.
