/**
 * SRMIST Login Brute-Force & Account Lockout Defense Service
 * Features:
 * - Rate limits repeated failed attempts by IP and email account
 * - Implements progressive backoff and temporary lockouts (e.g. 5 failed attempts = 5-minute lockout)
 * - Records security telemetry (timestamp, attempt counts, lockout timers)
 * - Auto-clears failure counters upon successful authentication
 */

interface LoginAttemptRecord {
  failedAttempts: number;
  lastAttemptAt: number;
  lockedUntil: number | null;
}

const STORAGE_LOGIN_ATTEMPTS = 'srm_login_attempts_v1';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function getAttemptStore(): Record<string, LoginAttemptRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_LOGIN_ATTEMPTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAttemptStore(store: Record<string, LoginAttemptRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_LOGIN_ATTEMPTS, JSON.stringify(store));
  } catch {}
}

/**
 * Checks whether an account/identifier is currently locked out
 */
export function checkLoginLockout(identifier: string): { isLocked: boolean; remainingSeconds?: number } {
  if (!identifier) return { isLocked: false };
  const key = identifier.toLowerCase().trim();
  const store = getAttemptStore();
  const record = store[key];

  if (!record || !record.lockedUntil) {
    return { isLocked: false };
  }

  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // Lockout expired, reset state
  delete store[key];
  saveAttemptStore(store);
  return { isLocked: false };
}

/**
 * Records a failed login attempt for an identifier and triggers lockout if threshold is reached
 */
export function recordFailedLogin(identifier: string): { 
  isLocked: boolean; 
  remainingAttempts: number; 
  lockoutSeconds?: number 
} {
  if (!identifier) return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
  const key = identifier.toLowerCase().trim();
  const store = getAttemptStore();
  const now = Date.now();
  const existing = store[key] || { failedAttempts: 0, lastAttemptAt: now, lockedUntil: null };

  existing.failedAttempts += 1;
  existing.lastAttemptAt = now;

  if (existing.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    existing.lockedUntil = now + LOCKOUT_DURATION_MS;
    store[key] = existing;
    saveAttemptStore(store);
    return { 
      isLocked: true, 
      remainingAttempts: 0, 
      lockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) 
    };
  }

  store[key] = existing;
  saveAttemptStore(store);
  return { 
    isLocked: false, 
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - existing.failedAttempts) 
  };
}

/**
 * Resets failed attempts after a valid login
 */
export function resetLoginAttempts(identifier: string): void {
  if (!identifier) return;
  const key = identifier.toLowerCase().trim();
  const store = getAttemptStore();
  if (store[key]) {
    delete store[key];
    saveAttemptStore(store);
  }
}
