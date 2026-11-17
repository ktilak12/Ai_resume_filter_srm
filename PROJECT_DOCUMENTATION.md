# SRM ResumeAI — Master Project Documentation & Technical Specification

**SRM Institute of Science and Technology (SRMIST)**  
*Directorate of Career Centre & Campus Placement Services*  
*Kattankulathur, Chennai, Tamil Nadu, India*

---

## Table of Contents

1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [Architecture Overview & Data Flow](#3-architecture-overview--data-flow)
4. [Security & Privacy Engineering](#4-security--privacy-engineering)
   - [AES-GCM Database Encryption](#aes-gcm-database-encryption)
   - [Cryptographic Session Integrity & Anti-Tampering](#cryptographic-session-integrity--anti-tampering)
   - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
   - [Brute-Force & Account Lockout Defense](#brute-force--account-lockout-defense)
   - [User Erasure & Right to Be Forgotten](#user-erasure--right-to-be-forgotten)
   - [Input Sanitization & Injection Defense](#input-sanitization--injection-defense)
5. [ATS AI Screening & Evaluation Engine](#5-ats-ai-screening--evaluation-engine)
6. [Complete Directory & File Structure Reference](#6-complete-directory--file-structure-reference)
   - [Root Configuration Files](#root-configuration-files)
   - [Services (`src/services/`)](#services-srcservices)
   - [State, Context & Dataset (`src/context/`, `src/data/`, `src/config/`)](#state-context--dataset)
   - [Components (`src/components/`)](#components-srccomponents)
   - [Pages (`src/pages/`)](#pages-srcpages)
   - [Automated Test Suites (`src/__tests__/`)](#automated-test-suites-src__tests__)
7. [Installation, Development & Production Commands](#7-installation-development--production-commands)
8. [Automated Quality Assurance Verification Results](#8-automated-quality-assurance-verification-results)

---

## 1. Executive Summary & Purpose

**SRM ResumeAI** is an institutional recruitment automation and candidate evaluation platform developed for SRMIST's campus placement ecosystem. It addresses core challenges in university placements:

- **Automated ATS Resume Screening:** Scores student resumes against company job requirements deterministically across skills, experience, academic eligibility (CGPA, backlogs), projects, and certifications.
- **Candidate Dossiers & Gap Analysis:** Highlights missing keywords, course alignment, and formatting issues for every applicant.
- **Student AI Resume Builder:** Empowers students to build ATS-optimized resumes with real-time score feedback, keyword saturation metrics, and PDF exports.
- **Placement Drive Coordination:** Enables coordinators to track vacancies, schedule technical/HR rounds, download calendar `.ics` passes, and log interviewer scorecards.
- **Data Protection & Student Privacy:** Implements strict data minimization under the Digital Personal Data Protection (DPDP) Act 2023, masking student contact details and encrypting all data at rest.

---

## 2. Complete Technology Stack

| Layer | Technology | Version | Purpose in Application |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `18.3.1` | Declarative UI components, state management, and lifecycle hooks. |
| **Language & Typings** | **TypeScript** | `~5.7.3` | Static typing, interface definitions, and compile-time error checks. |
| **Routing** | **React Router DOM** | `^7.18.3` | Client-side routing, protected route guards, navigation history. |
| **Styling & Theme** | **Tailwind CSS** | `^3.4.17` | Utility-first styling with institutional dark theme (`#000000`, `#09090b`). |
| **CSS Processing** | **PostCSS** + **Autoprefixer** | `^8.5.3` / `^10.4.21` | Cross-browser CSS transformations and vendor prefixing. |
| **Class Merging** | **clsx** + **tailwind-merge** | `^2.1.1` / `^3.0.2` | Clean and collision-free conditional class concatenation. |
| **Iconography** | **Lucide React** | `^1.16.0` | Accessible, tree-shakeable SVG icons. |
| **Archive Ingestion** | **JSZip** | `^3.10.2` | Client-side ZIP decompression for batch resume parsing with Zip-Slip defense. |
| **Build & Bundler** | **Vite** | `^6.2.0` | Ultra-fast HMR dev server and Rollup-based production chunk bundling. |
| **Production Server** | **Node.js Native HTTP** | `v20+` | Zero-dependency backend serving static assets, security headers, and API proxies. |
| **Cryptography** | **Web Crypto API** | Native | SubtleCrypto 256-bit AES-GCM database encryption, PBKDF2 derivation, SHA-256 digests. |
| **Testing** | **Vitest** | `^5.0.5` | Fast unit and integration test runner executing 78 tests across 8 test suites. |

---

## 3. Architecture Overview & Data Flow

```
                           +--------------------------------------------+
                           |   Browser Client (React 18 + TypeScript)   |
                           +--------------------------------------------+
                                  |                             |
                       User Interactions               Client Cryptography
                                  |                             |
                                  v                             v
                       +--------------------+        +---------------------+
                       | React Router v7    |        | Web Crypto Subtle   |
                       | ProtectedRoute     |        | AES-GCM 256-bit     |
                       | Role Guards        |        | PBKDF2 Key Deriv    |
                       +--------------------+        +---------------------+
                                  |                             |
                                  v                             v
                       +--------------------+        +---------------------+
                       | In-Memory Cache    | <----> | Encrypted Database  |
                       | (LRU + TTL Store)  |        | (localStorage rest) |
                       +--------------------+        +---------------------+
                                  |
               +------------------+------------------+
               |                                     |
               v                                     v
+-------------------------------+   +---------------------------------+
| Node.js Production Server     |   | In-House Notification Engine    |
| - Security Headers (CSP, etc) |   | - Local notification logging    |
| - Rate Limiter (Token Bucket) |   | - Real-time custom event bus    |
| - Static Asset Max-Age Cache  |   | - Zero third-party dependency   |
+-------------------------------+   +---------------------------------+
```

---

## 4. Security & Privacy Engineering

### AES-GCM Database Encryption
- **File:** `src/services/encryptedStorage.ts`
- All sensitive datasets (`srm_candidates_list`, `srm_jobs_list`, `srm_interviews_list`, `srm_registered_accounts`) are encrypted before being written to storage.
- Uses **AES-GCM (256-bit)** with PBKDF2 key derivation (10,000 SHA-256 iterations) and cryptographically random 12-byte initialization vectors (`iv`).
- Envelope format: `srm_enc_v2::<ivHex>:<cipherHex>`.
- Automatically migrates legacy plaintext datasets without data loss.

### Cryptographic Session Integrity & Anti-Tampering
- **File:** `src/services/sessionSecurity.ts`
- Active sessions are stored inside a tamper-evident cryptographic envelope containing user identity, verification flags, timestamps, and a **SHA-256 digest signature**.
- Maximum session lifetime is enforced via **8-hour Time-To-Live (TTL)**.
- If storage inspection or tampering alters any session field, signature verification fails and the session is immediately purged, redirecting to login.

### Role-Based Access Control (RBAC) & Student Isolation
- **Files:** `src/services/rbac.ts`, `src/components/auth/ProtectedRoute.tsx`, `src/components/layout/Sidebar.tsx`
- Three strictly defined institutional roles:
  1. **Super Admin:** Full platform configuration, job creation/deletion, AI weight calibrations, full unmasked PII view.
  2. **Faculty Coordinator:** Placement drive management, candidate evaluation, interview scheduling, unmasked PII view.
  3. **Student Coordinator:** Student portal access, personal AI resume builder, drive eligibility checks. Strictly restricted from viewing peer candidate directories, screening rosters, applicant scores, or batch upload engines.
- **Student Role Switcher Lockout:** Once a user logs in as a student, role switching UI elements (dropdowns, role switch tabs on login, and elevation requests) are completely hidden and disabled at both UI and cryptographic session levels.
- **Vertical Privilege Escalation Prevention:** Rejects substring spoofing (e.g. `badminton@srmist.edu.in` cannot assume administrative roles) and enforces server/client role immutability.

### Brute-Force & Account Lockout Defense
- **File:** `src/services/loginProtection.ts`
- Monitors consecutive failed password attempts per account identifier.
- Enforces a **5-minute lockout** after 5 failed attempts.
- Automatically clears attempt counters upon valid credential verification.

### User Erasure & Right to Be Forgotten
- **File:** `src/services/userErasureService.ts`
- Implements complete compliance with privacy regulations (DPDP Act 2023):
  1. Deletes account credentials from the encrypted accounts registry.
  2. Scrubs applicant records, resume text, and scores from the candidate database.
  3. Removes scheduled interviews and scorecards.
  4. Purges local resume builder drafts and notification logs.
  5. Invalidates and destroys active session tokens.

### Input Sanitization & Injection Defense
- **File:** `src/services/sanitizer.ts`
- **SQL Injection:** Detects and neutralizes SQL patterns (`UNION SELECT`, stacked queries, inline comments `--`, `/* */`).
- **Cross-Site Scripting (XSS):** Filters `<script>`, `javascript:` protocols, and escapes HTML template outputs.
- **Spreadsheet / CSV Formula Injection (CWE-1236):** Neutralizes formula triggers (`=`, `+`, `-`, `@`, `|`, `%`, tab, CR) via single-quote prepending.

---

## 5. ATS AI Screening & Evaluation Engine

- **File:** `src/services/aiScreeningEngine.ts`
- Operates deterministically across five core evaluation pillars:

$$\text{Final ATS Score} = (S \times W_s) + (E \times W_e) + (A \times W_a) + (P \times W_p) + (C \times W_c) - D_{\text{format}}$$

| Pillar | Default Weight | Criteria Evaluated |
| :--- | :---: | :--- |
| **Skills Match ($S$)** | **40%** | Exact match + normalized synonym matching (e.g., PostgreSQL $\to$ SQL) against required and preferred skills. |
| **Experience ($E$)** | **25%** | Cumulative months of internship and professional experience evaluated against minimum requirements. |
| **Academic Eligibility ($A$)** | **20%** | Candidate CGPA vs cutoff, active backlog penalty, and allowed degree/department filters. |
| **Projects ($P$)** | **10%** | Technical complexity, technologies used in projects, and GitHub/deployment links. |
| **Certifications ($C$)** | **5%** | Accredited industry certifications (AWS, Google Cloud, Azure, Oracle, DeepLearning.AI). |

### Match Verdicts
- **Strong Match ($\ge 85\%$):** Candidate meets or exceeds all drive requirements; recommended for interview.
- **Needs Review ($65\% - 84\%$):** Partial alignment; requires manual recruiter inspection.
- **Low Match ($< 65\%$):** Candidate does not meet core drive cutoffs.

---

## 6. Complete Directory & File Structure Reference

### Root Configuration Files
- `package.json`: Dependencies, NPM lifecycle scripts, and overrides.
- `server.js`: Production Node.js server with HTTP caching, security headers, and static file streaming.
- `vite.config.ts`: Vite build configuration, rollup chunk splitting, and development API handlers.
- `tailwind.config.js`: Tailwind theme styling tokens and institutional palette.
- `postcss.config.js`: PostCSS plugin configuration.
- `tsconfig.json`: TypeScript configuration for application source code.
- `tsconfig.node.json`: TypeScript configuration for Vite and Node scripts.
- `index.html`: Single-page application root HTML document.
- `.env.example`: Environment configuration template for institutional OAuth and API keys.

---

### Services (`src/services/`)
- `accountAuth.ts`: Salted SHA-256 password hashing, user registration, and authentication verification.
- `aiScreeningEngine.ts`: Mathematical ATS screening formula, keyword normalization, and score generation.
- `cacheService.ts`: In-memory LRU cache with TTL eviction for high-throughput performance.
- `calendarService.ts`: RFC 5545 `.ics` calendar invitation generation with CRLF injection protection.
- `emailService.ts`: In-house notification engine for candidate shortlisting and rejection notices.
- `encryptedStorage.ts`: Web Crypto AES-GCM 256-bit database storage encryption and decryption.
- `googleAuth.ts`: Google Identity Services (GIS) token verification and institutional domain boundary checks.
- `loginProtection.ts`: Brute-force protection, failed attempt tracking, and account lockout management.
- `privacyGuard.ts`: Candidate PII masking (`maskEmail`, `maskPhone`, `maskRegNumber`) under DPDP rules.
- `rbac.ts`: Central permissions matrix mapping operations to institutional user roles.
- `resumeBuilderService.ts`: ATS resume builder templates, action verb suggestions, and keyword checkers.
- `resumeParser.ts`: Document parser extracting entities from PDF, text, and ZIP archives with path traversal checks.
- `sanitizer.ts`: Injection defense neutralizing SQL, XSS, and CSV formula injection payloads.
- `sessionSecurity.ts`: Cryptographic session envelope generation, SHA-256 digest signing, and 8-hour TTL enforcement.
- `userErasureService.ts`: Complete user account, candidate profile, and interview history deletion engine.
- `index.ts`: Central barrel exporting all core services.

---

### State, Context & Dataset
- `src/config/authConfig.ts`: Runtime de-obfuscation for Google Client ID and institutional domain settings.
- `src/context/AuthContext.tsx`: React Context managing authentication state, login, logout, and account erasure.
- `src/data/srmDataset.ts`: Seeded baseline data for placement drives, candidate profiles, and interview slots.
- `src/types/index.ts`: Central type definitions for profiles, jobs, evaluations, and user accounts.

---

### Components (`src/components/`)
- `auth/ProtectedRoute.tsx`: Route guard enforcing authentication and role authorization.
- `common/AppErrorBoundary.tsx`: React error boundary catching runtime exceptions.
- `common/SEO.tsx`: Dynamic meta tag manager for document titles and Open Graph metadata.
- `layout/Layout.tsx`: Shell component containing Navbar, Sidebar, and child outlet.
- `layout/Navbar.tsx`: Top header navigation with notifications, search shortcut, and profile modal trigger.
- `layout/Sidebar.tsx`: Role-filtered collapsible navigation sidebar.
- `layout/NotificationCenter.tsx`: Real-time notification drawer displaying shortlists and drive schedules.
- `candidates/AllCandidatesView.tsx`: Enrolled candidates directory with multi-column filtering.
- `candidates/ShortlistedView.tsx`: Shortlisted candidate list filtered by drive requirements.
- `analytics/AnalyticsView.tsx`: Visual placement statistics, selection rates, and department metrics.
- `interviews/InterviewManagementView.tsx`: Technical round scheduling, scorecard logging, and `.ics` pass downloads.
- `modals/JobCreationModal.tsx`: Modal for creating and editing company recruitment drives.
- `modals/UserProfileModal.tsx`: User profile management and permanent account deletion modal.
- `student/ResumeBuilder.tsx`: Interactive student resume builder with live ATS match scoring.

---

### Pages (`src/pages/`)
- `Dashboard.tsx`: Operational hub with drive summaries, quick actions, and recent activity.
- `CandidateRanking.tsx`: Candidate screening table with search, tier filters, and CSV export.
- `CandidateDetail.tsx`: Comprehensive candidate dossier with score breakdowns and interview scheduling.
- `JobListing.tsx`: Management portal for viewing, adding, editing, and deleting placement drives.
- `ResumeUpload.tsx`: Ingestion portal for single PDF resumes or batch `.zip` archives.
- `ResumeBuilderPage.tsx`: Dedicated page wrapper for the interactive AI Resume Builder.
- `InterviewsPage.tsx`: Placement interview scheduling and candidate scorecard management.
- `Analytics.tsx`: Placement intelligence dashboard with department hiring statistics.
- `ShortlistedPage.tsx`: Filtered view of shortlisted students for active placement drives.
- `StudentPortalPage.tsx`: Student view for checking drive eligibility, building resumes, and tracking interviews.
- `SettingsPage.tsx`: ATS weight and threshold calibration panel for coordinators.
- `LandingPage.tsx`: Public institutional homepage introducing SRM ResumeAI.
- `LoginPage.tsx`: Multi-role login portal supporting Google SSO and email/password authentication.
- `PrivacyPolicyPage.tsx`: DPDP Act 2023 compliance disclosure and data policy document.
- `NotFoundPage.tsx`: Institutional 404 error page with safe navigation recovery.

---

### Automated Test Suites (`src/__tests__/`)

| Test File | Test Cases | Scope Verified |
| :--- | :---: | :--- |
| `aiScreeningEngine.test.ts` | 5 | ATS mathematical formulas, category weights, match thresholds, and format deductions. |
| `apiSecurityAndRoutes.test.ts` | 11 | API-07 404 error responses, CORS preflight headers, and 401/403 authorization checks. |
| `calendarAndPrivacy.test.ts` | 10 | RFC 5545 `.ics` formatting, CRLF injection defense, and DPDP PII masking. |
| `productionServer.test.ts` | 9 | Live Node server requests, static file serving, security headers, and path traversal rejection. |
| `productionHardeningAndOptimization.test.ts` | 13 | LRU memory caching with TTL eviction, SQL/XSS/CSV injection sanitization, and AES-GCM database roundtrip. |
| `databaseSecurityAndUserErasure.test.ts` | 5 | Brute-force lockout timers, complete user erasure ("Right to be Forgotten"), and credential de-obfuscation. |
| `rbacAndPrivilegeEscalation.test.ts` | 18 | Vertical privilege escalation prevention, role overrides, student role lockdown, anti-tampering, and 8-hour session TTL. |
| `resumeParser.test.ts` | 9 | File size boundaries (10MB limit), magic byte validation (`%PDF`), and Zip-Slip traversal defense. |
| **Total Test Count** | **80** | **All 80 tests pass with 0 failures.** |

---

## 7. Installation, Development & Production Commands

### Prerequisites
- Node.js `v20.0.0` or higher
- NPM `v10.0.0` or higher

### Local Development Setup
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server (http://localhost:3000)
npm run dev
```

### Running Automated Test Suites
```bash
# Execute all 80 unit, integration, and security tests
npm test
```

### Static Type Checking
```bash
# Verify TypeScript compilation without emitting output
npx tsc --noEmit
```

### Production Build & Deployment
```bash
# 1. Build optimized production bundle into dist/
npm run build

# 2. Start the production Node.js server (http://localhost:3000)
npm start
```

---

## 8. Automated Quality Assurance Verification Results

```text
 ✓ src/__tests__/aiScreeningEngine.test.ts (5 tests)
 ✓ src/__tests__/calendarAndPrivacy.test.ts (10 tests)
 ✓ src/__tests__/productionServer.test.ts (9 tests)
 ✓ src/__tests__/productionHardeningAndOptimization.test.ts (13 tests)
 ✓ src/__tests__/rbacAndPrivilegeEscalation.test.ts (18 tests)
 ✓ src/__tests__/databaseSecurityAndUserErasure.test.ts (5 tests)
 ✓ src/__tests__/resumeParser.test.ts (9 tests)
 ✓ src/__tests__/apiSecurityAndRoutes.test.ts (11 tests)

 Test Files  8 passed (8)
      Tests  80 passed (80)
   Duration  1.44s

 TypeScript Check:  0 Errors (Clean status 0)
 Production Build:  Compiled successfully into dist/
 Security Audit:    0 Vulnerabilities (Clean npm audit)
```

---
*Documentation current as of November 2026. Directorate of Career Centre, SRM Institute of Science and Technology.*

