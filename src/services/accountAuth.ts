import { AuthUser, UserRole } from '../types';
import { isSRMISTEmail, parseSRMEmailDetails } from './googleAuth';
import { isRoleElevationAllowed } from './sessionSecurity';
import { getSecureItem, setSecureItem } from './encryptedStorage';
import { checkLoginLockout, recordFailedLogin, resetLoginAttempts } from './loginProtection';

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  campus: string;
  regNumber?: string;
  createdAt: string;
}

const STORAGE_KEY = 'srm_registered_accounts';
const PASSWORD_SALT = 'SRM_PORTAL_AUTH_SALT_V1';

/**
 * Computes SHA-256 hash of password with institutional salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salted = `${PASSWORD_SALT}::${password.trim()}`;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(salted);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      console.warn('[accountAuth] crypto.subtle digest failed, using fallback', e);
    }
  }

  // Fallback hash for environments without Web Crypto
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

/**
 * Default seeded demo accounts for instant login
 */
const DEFAULT_ACCOUNTS: Array<{ name: string; email: string; pass: string; role: UserRole; dept: string }> = [
  {
    name: 'Dr. S. K. Narayanan (Faculty In-Charge)',
    email: 'faculty.coordinator@srmist.edu.in',
    pass: 'faculty123',
    role: 'Faculty Coordinator',
    dept: 'Computer Science & Engineering'
  },
  {
    name: 'Aarav Sharma (Student Representative)',
    email: 'student.placement@srmist.edu.in',
    pass: 'student123',
    role: 'Student Coordinator',
    dept: 'Computer Science & Engineering'
  },
  {
    name: 'Placement Director (Career Centre)',
    email: 'placement.director@srmist.edu.in',
    pass: 'admin123',
    role: 'Super Admin',
    dept: 'Directorate of Career Centre'
  }
];

/**
 * Loads stored accounts from encrypted storage, seeding defaults if empty
 */
export async function getStoredAccounts(): Promise<StoredAccount[]> {
  if (typeof window === 'undefined') return [];
  try {
    const loaded = await getSecureItem<StoredAccount[]>(STORAGE_KEY, []);
    if (Array.isArray(loaded) && loaded.length > 0) {
      return loaded;
    }

    // Seed defaults in encrypted storage
    const seeded: StoredAccount[] = [];
    for (const d of DEFAULT_ACCOUNTS) {
      seeded.push({
        id: `acc-${d.role.toLowerCase().replace(/\s+/g, '-')}`,
        name: d.name,
        email: d.email.toLowerCase(),
        passwordHash: await hashPassword(d.pass),
        role: d.role,
        department: d.dept,
        campus: 'Kattankulathur (Main Campus)',
        createdAt: new Date().toISOString()
      });
    }
    await setSecureItem(STORAGE_KEY, seeded);
    return seeded;
  } catch (err) {
    console.error('[accountAuth] Failed to load accounts:', err);
    return [];
  }
}

/**
 * Saves updated accounts list to encrypted storage
 */
async function saveStoredAccounts(accounts: StoredAccount[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await setSecureItem(STORAGE_KEY, accounts);
  } catch (err) {
    console.error('[accountAuth] Failed to save accounts:', err);
  }
}

/**
 * Registers a new account with email, password, name, and role
 */
export async function registerAccount(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  const role = params.role;

  if (!name) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please provide a valid institutional email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const accounts = await getStoredAccounts();
  const existing = accounts.find(a => a.email === email);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please switch to Sign In.'
    };
  }

  const isSRM = isSRMISTEmail(email);
  const srmDetails = parseSRMEmailDetails(email);

  // Validate requested role against institutional RBAC rules
  const tempUser: AuthUser = {
    id: 'tmp-check',
    name: name,
    email: email,
    role: 'Student Coordinator',
    isInstitutionalVerified: isSRM,
    isProfileComplete: true,
    lastLoginAt: new Date().toISOString()
  };
  if (!isRoleElevationAllowed(tempUser, role)) {
    return {
      success: false,
      error: `Unauthorized role assignment: Email ${email} is not authorized to register as '${role}'.`
    };
  }

  const passwordHash = await hashPassword(password);

  const newAccount: StoredAccount = {
    id: `acc-${Date.now()}`,
    name: name,
    email: email,
    passwordHash: passwordHash,
    role: role,
    department: (isSRM && srmDetails.department) ? srmDetails.department : 'Computer Science & Engineering',
    campus: 'Kattankulathur (Main Campus)',
    regNumber: isSRM ? srmDetails.regNumber : undefined,
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  await saveStoredAccounts(accounts);

  const authUser: AuthUser = {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    role: newAccount.role,
    department: newAccount.department,
    campus: newAccount.campus,
    regNumber: newAccount.regNumber,
    isInstitutionalVerified: isSRM,
    isProfileComplete: true,
    lastLoginAt: new Date().toISOString()
  };

  return { success: true, user: authUser };
}

/**
 * Authenticates user with email and password
 */
export async function authenticateWithPassword(params: {
  email: string;
  password: string;
  role?: UserRole;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const email = params.email.trim().toLowerCase();
  const password = params.password;

  if (!email) {
    return { success: false, error: 'Please enter your email or institutional ID.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Check brute-force lockout status
  const lockout = checkLoginLockout(email);
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Account temporarily locked due to excessive failed attempts. Please retry in ${lockout.remainingSeconds} seconds.`
    };
  }

  const accounts = await getStoredAccounts();
  const account = accounts.find(a => a.email === email);

  if (!account) {
    const failedStatus = recordFailedLogin(email);
    if (failedStatus.isLocked) {
      return {
        success: false,
        error: `Too many failed attempts. Account locked for ${failedStatus.lockoutSeconds} seconds.`
      };
    }
    return { 
      success: false, 
      error: `Account not found with this email. (${failedStatus.remainingAttempts} attempts remaining).` 
    };
  }

  const computedHash = await hashPassword(password);
  if (account.passwordHash !== computedHash) {
    const failedStatus = recordFailedLogin(email);
    if (failedStatus.isLocked) {
      return {
        success: false,
        error: `Account locked for ${failedStatus.lockoutSeconds} seconds due to 5 consecutive failed attempts.`
      };
    }
    return { 
      success: false, 
      error: `Incorrect password. Please verify credentials. (${failedStatus.remainingAttempts} attempts remaining)` 
    };
  }

  // Reset login attempts counter upon successful authentication
  resetLoginAttempts(email);

  const isSRM = isSRMISTEmail(account.email);
  let effectiveRole: UserRole = account.role;
  if (params.role) {
    const candidateUser: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      isInstitutionalVerified: isSRM,
      isProfileComplete: true,
      lastLoginAt: new Date().toISOString()
    };
    if (isRoleElevationAllowed(candidateUser, params.role)) {
      effectiveRole = params.role;
    } else {
      console.warn(`[accountAuth] Role override '${params.role}' unauthorized for ${account.email}. Reverting to registered role '${account.role}'.`);
      effectiveRole = account.role;
    }
  }

  const authUser: AuthUser = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: effectiveRole,
    department: account.department,
    campus: account.campus,
    regNumber: account.regNumber,
    isInstitutionalVerified: isSRM,
    isProfileComplete: true,
    lastLoginAt: new Date().toISOString()
  };

  return { success: true, user: authUser };
}
