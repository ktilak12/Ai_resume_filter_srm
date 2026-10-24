import { AuthUser, UserRole } from '../types';
import { isSRMISTEmail, parseSRMEmailDetails } from './googleAuth';

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
 * Loads stored accounts from localStorage, seeding defaults if empty
 */
export async function getStoredAccounts(): Promise<StoredAccount[]> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Seed defaults
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (err) {
    console.error('[accountAuth] Failed to load accounts:', err);
    return [];
  }
}

/**
 * Saves updated accounts list to localStorage
 */
function saveStoredAccounts(accounts: StoredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
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
  saveStoredAccounts(accounts);

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

  const accounts = await getStoredAccounts();
  const account = accounts.find(a => a.email === email);

  if (!account) {
    return { 
      success: false, 
      error: 'Account not found with this email. Please switch to the Register tab to create an account.' 
    };
  }

  const computedHash = await hashPassword(password);
  if (account.passwordHash !== computedHash) {
    return { 
      success: false, 
      error: 'Incorrect password. Please verify your credentials and try again.' 
    };
  }

  const isSRM = isSRMISTEmail(account.email);
  const effectiveRole: UserRole = params.role || account.role;

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
