/**
 * SRMIST Cryptographic Session Security & Integrity Service
 * Enforces:
 * - SHA-256 Cryptographic Tamper-Proof Signatures over Stored Sessions
 * - Session Expiration TTL (Strict 8-Hour Maximum Lifetime)
 * - Anti-Tampering Storage Invalidation
 * - Principle of Least Privilege & Strict Role Elevation Controls
 */

import { AuthUser, UserRole } from '../types';
import { isSRMISTEmail, parseSRMEmailDetails } from './googleAuth';

const STORAGE_SESSION_KEY = 'srm_secure_session_v1';
const LEGACY_STORAGE_KEY = 'srm_auth_user';

// Institutional Application Nonce / Salt for Signature Computation
const INSTITUTIONAL_AUTH_SALT = 'SRMIST_PLACEMENTS_AUTH_INTEGRITY_2026_KTR';

// 8 hours maximum session lifetime before mandatory re-authentication
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface SecureSessionEnvelope {
  user: AuthUser;
  expiresAt: number;
  issuedAt: number;
  signature: string;
}

/**
 * Computes a SHA-256 cryptographic digest over the session credentials and metadata
 */
async function computeSessionDigest(user: AuthUser, expiresAt: number, issuedAt: number): Promise<string> {
  const canonicalString = [
    INSTITUTIONAL_AUTH_SALT,
    user.id || '',
    (user.email || '').toLowerCase().trim(),
    user.role || '',
    user.isInstitutionalVerified ? 'VERIFIED' : 'UNVERIFIED',
    String(expiresAt),
    String(issuedAt)
  ].join('::');

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(canonicalString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback lightweight hash for non-crypto environments (e.g. testing)
  let hash = 0;
  for (let i = 0; i < canonicalString.length; i++) {
    const char = canonicalString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `fallback_${Math.abs(hash).toString(16)}`;
}

/**
 * Persists an authenticated user session with a cryptographic integrity signature
 */
export async function saveSecureSession(user: AuthUser, ttlMs: number = SESSION_TTL_MS): Promise<void> {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const expiresAt = now + ttlMs;
  const issuedAt = now;

  const signature = await computeSessionDigest(user, expiresAt, issuedAt);

  const envelope: SecureSessionEnvelope = {
    user,
    expiresAt,
    issuedAt,
    signature
  };

  const serialized = JSON.stringify(envelope);

  try {
    sessionStorage.setItem(STORAGE_SESSION_KEY, serialized);
    localStorage.setItem(STORAGE_SESSION_KEY, serialized);
    // Remove legacy unhashed user key to prevent plain-text privilege attacks
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.warn('[SessionSecurity] Storage quota exceeded or blocked:', err);
  }
}

/**
 * Loads and cryptographically validates the persisted user session.
 * Rejects expired sessions and tampered storage immediately.
 */
export async function loadSecureSession(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') return null;

  try {
    // Check sessionStorage first (isolated per tab), then localStorage
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) {
      // Clear legacy storage if found
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }

    const envelope: SecureSessionEnvelope = JSON.parse(raw);

    if (!envelope || !envelope.user || !envelope.signature || !envelope.expiresAt) {
      console.warn('[SessionSecurity] Corrupted session structure detected. Purging.');
      clearSecureSession();
      return null;
    }

    // 1. Validate Session Expiry TTL
    const now = Date.now();
    if (now > envelope.expiresAt) {
      console.info('[SessionSecurity] Session expired. Requiring re-authentication.');
      clearSecureSession();
      return null;
    }

    // 2. Cryptographic Integrity Verification (Anti-Tampering)
    const expectedSignature = await computeSessionDigest(
      envelope.user,
      envelope.expiresAt,
      envelope.issuedAt
    );

    if (envelope.signature !== expectedSignature) {
      console.error('[SessionSecurity] CRITICAL: Session signature mismatch. Tampering detected! Purging session.');
      clearSecureSession();
      return null;
    }

    // 3. Email & Role Coherence Check
    const user = envelope.user;
    if (!user.email || !user.role) {
      clearSecureSession();
      return null;
    }

    return user;
  } catch (err) {
    console.error('[SessionSecurity] Failed to verify session envelope:', err);
    clearSecureSession();
    return null;
  }
}

/**
 * Completely wipes all authentication tokens and sessions from all web storage
 */
export function clearSecureSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (err) {
    console.error('[SessionSecurity] Failed to clear storage:', err);
  }
}

/**
 * Validates whether the active authenticated user is authorized to assume a specific role.
 * Prevents horizontal and vertical privilege escalation.
 */
export function isRoleElevationAllowed(currentUser: AuthUser | null, targetRole: UserRole): boolean {
  if (!currentUser) return false;

  // Development environment permits role switching for test coverage
  if (import.meta.env.DEV) {
    return true;
  }

  const email = (currentUser.email || '').toLowerCase().trim();
  const isInstitutional = isSRMISTEmail(email);
  const details = parseSRMEmailDetails(email);

  // 1. External Corporate Partners cannot assume institutional admin roles
  if (!isInstitutional) {
    return targetRole === 'Corporate Recruiter';
  }

  // 2. Verified Students can NEVER assume administrative placement roles
  if (details.isStudent) {
    return targetRole === 'Student Coordinator';
  }

  // 3. Super Admin role requires explicit administrative email verification
  if (targetRole === 'Super Admin') {
    return email.includes('admin') || email.includes('director') || email.includes('dean');
  }

  // 4. Institutional staff can assume Placement Officer or Faculty Coordinator
  return ['Placement Officer', 'Faculty Coordinator', 'Student Coordinator'].includes(targetRole);
}
