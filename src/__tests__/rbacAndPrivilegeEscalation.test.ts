import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { isRoleElevationAllowed, saveSecureSession, loadSecureSession, clearSecureSession } from '../services/sessionSecurity';
import { registerAccount, authenticateWithPassword } from '../services/accountAuth';
import { maskEmail, maskPhone, maskRegNumber, canAccessUnmaskedPII, sanitizeCsvField } from '../services/privacyGuard';
import { checkPermission } from '../services/rbac';
import { AuthUser } from '../types';

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

const mockLocal = new MockStorage();
const mockSession = new MockStorage();

(globalThis as any).window = {
  crypto: {
    subtle: (crypto.webcrypto as any)?.subtle
  },
  localStorage: mockLocal,
  sessionStorage: mockSession
};
(globalThis as any).localStorage = mockLocal;
(globalThis as any).sessionStorage = mockSession;

describe('Phase 2 & Phase 4: RBAC, Privilege Escalation & PII Protection Suite', () => {

  beforeEach(() => {
    mockLocal.clear();
    mockSession.clear();
  });

  describe('Vertical Privilege Escalation Defenses', () => {
    it('blocks substring email bypasses from assuming Super Admin', () => {
      const badmintonUser: AuthUser = {
        id: 'u-1',
        name: 'Badminton Club',
        email: 'badminton@srmist.edu.in',
        role: 'Faculty Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      const sandeanUser: AuthUser = {
        id: 'u-2',
        name: 'Sandean',
        email: 'sandean@srmist.edu.in',
        role: 'Faculty Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      expect(isRoleElevationAllowed(badmintonUser, 'Super Admin')).toBe(false);
      expect(isRoleElevationAllowed(sandeanUser, 'Super Admin')).toBe(false);
    });

    it('permits genuine boundary-matched administrative emails to assume Super Admin', () => {
      const directorUser: AuthUser = {
        id: 'u-3',
        name: 'Placement Director',
        email: 'placement.director@srmist.edu.in',
        role: 'Faculty Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      const adminUser: AuthUser = {
        id: 'u-4',
        name: 'Admin Head',
        email: 'admin@srmist.edu.in',
        role: 'Faculty Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      expect(isRoleElevationAllowed(directorUser, 'Super Admin')).toBe(true);
      expect(isRoleElevationAllowed(adminUser, 'Super Admin')).toBe(true);
    });

    it('strictly forbids verified students from assuming administrative roles', () => {
      const studentUser: AuthUser = {
        id: 'u-5',
        name: 'Aarav Student',
        email: 'ra2311003010142@srmist.edu.in',
        role: 'Student Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      expect(isRoleElevationAllowed(studentUser, 'Super Admin')).toBe(false);
      expect(isRoleElevationAllowed(studentUser, 'Faculty Coordinator')).toBe(false);
      expect(isRoleElevationAllowed(studentUser, 'Student Coordinator')).toBe(true);
    });

    it('rejects attempts to register a student email with Super Admin role', async () => {
      const res = await registerAccount({
        name: 'Exploit Tester',
        email: 'ra2311003010999@srmist.edu.in',
        password: 'password123',
        role: 'Super Admin'
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Unauthorized role assignment');
    });

    it('rejects role override attempts in password authentication', async () => {
      // Register valid student
      const reg = await registerAccount({
        name: 'Legit Student',
        email: 'ra2311003010555@srmist.edu.in',
        password: 'password123',
        role: 'Student Coordinator'
      });
      expect(reg.success).toBe(true);

      // Attempt login with unauthorized role override
      const auth = await authenticateWithPassword({
        email: 'ra2311003010555@srmist.edu.in',
        password: 'password123',
        role: 'Super Admin'
      });

      expect(auth.success).toBe(true);
      // Role elevation must be rejected; user remains Student Coordinator
      expect(auth.user?.role).toBe('Student Coordinator');
    });
  });

  describe('Cryptographic Session Integrity & Anti-Tampering', () => {
    it('persists and validates genuine session envelope', async () => {
      const facultyUser: AuthUser = {
        id: 'fac-101',
        name: 'Dr. Narayanan',
        email: 'faculty.coordinator@srmist.edu.in',
        role: 'Faculty Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      await saveSecureSession(facultyUser);
      const loaded = await loadSecureSession();

      expect(loaded).not.toBeNull();
      expect(loaded?.email).toBe('faculty.coordinator@srmist.edu.in');
      expect(loaded?.role).toBe('Faculty Coordinator');
    });

    it('detects tampering in web storage and immediately purges session', async () => {
      const studentUser: AuthUser = {
        id: 'stu-202',
        name: 'Student Rep',
        email: 'student.rep@srmist.edu.in',
        role: 'Student Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      await saveSecureSession(studentUser);

      // Malicious client tampering: Modifying stored role in localStorage
      const raw = mockLocal.getItem('srm_secure_session_v1');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      parsed.user.role = 'Super Admin'; // Forge privilege
      mockLocal.setItem('srm_secure_session_v1', JSON.stringify(parsed));
      mockSession.setItem('srm_secure_session_v1', JSON.stringify(parsed));

      // Attempt to load tampered session
      const loaded = await loadSecureSession();

      // Signature verification must detect mismatch and purge session
      expect(loaded).toBeNull();
      expect(mockLocal.getItem('srm_secure_session_v1')).toBeNull();
      expect(mockSession.getItem('srm_secure_session_v1')).toBeNull();
    });

    it('rejects expired session envelope (> 8 hours TTL)', async () => {
      const facultyUser: AuthUser = {
        id: 'fac-102',
        name: 'Dr. Raman',
        email: 'raman@srmist.edu.in',
        role: 'Faculty Coordinator',
        isInstitutionalVerified: true,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      // Save session with negative TTL (already expired)
      await saveSecureSession(facultyUser, -1000);
      const loaded = await loadSecureSession();

      expect(loaded).toBeNull();
    });
  });

  describe('Candidate PII Protection & Data Minimization', () => {
    it('masks email address according to DPDP guidelines', () => {
      expect(maskEmail('aravind.swaminathan@srmist.edu.in')).toBe('ar****n@srmist.edu.in');
      expect(maskEmail('a@srmist.edu.in')).toBe('a*@srmist.edu.in');
      expect(maskEmail('')).toBe('******@srmist.edu.in');
    });

    it('masks phone number hiding intermediate digits', () => {
      const masked = maskPhone('+91 98401 22334');
      expect(masked).toBe('+91 98****334');
      expect(masked).not.toContain('401 22');
    });

    it('masks SRM registration number', () => {
      expect(maskRegNumber('RA2311003010142')).toBe('RA23*****0142');
      expect(maskRegNumber('RA2111003010001')).toBe('RA21*****0001');
    });

    it('authorizes unmasked PII view strictly for Faculty Coordinator and Super Admin', () => {
      expect(canAccessUnmaskedPII('Super Admin')).toBe(true);
      expect(canAccessUnmaskedPII('Faculty Coordinator')).toBe(true);
      expect(canAccessUnmaskedPII('Student Coordinator')).toBe(false);
      expect(canAccessUnmaskedPII(undefined)).toBe(false);
    });

    it('neutralizes CSV formula injection triggers (CWE-1236)', () => {
      expect(sanitizeCsvField('=cmd|"/c calc"!A0')).toBe("\"'=cmd|\"\"/c calc\"\"!A0\"");
      expect(sanitizeCsvField('+12345')).toBe("\"'+12345\"");
      expect(sanitizeCsvField('-500')).toBe("\"'-500\"");
      expect(sanitizeCsvField('@SUM(1,2)')).toBe("\"'@SUM(1,2)\"");
      expect(sanitizeCsvField('|malicious')).toBe("\"'|malicious\"");
      expect(sanitizeCsvField('%payload')).toBe("\"'%payload\"");
      expect(sanitizeCsvField('Normal Name')).toBe('"Normal Name"');
      expect(sanitizeCsvField('Student\0Name')).toBe('"StudentName"'); // strips null bytes
    });
  });

  describe('RBAC Permissions Matrix Consistency', () => {
    it('restricts delete job permission to Super Admin only', () => {
      expect(checkPermission('Super Admin', 'DELETE_JOB')).toBe(true);
      expect(checkPermission('Faculty Coordinator', 'DELETE_JOB')).toBe(false);
      expect(checkPermission('Student Coordinator', 'DELETE_JOB')).toBe(false);
    });

    it('restricts AI settings calibration to Faculty Coordinator and Super Admin', () => {
      expect(checkPermission('Super Admin', 'MODIFY_AI_SETTINGS')).toBe(true);
      expect(checkPermission('Faculty Coordinator', 'MODIFY_AI_SETTINGS')).toBe(true);
      expect(checkPermission('Student Coordinator', 'MODIFY_AI_SETTINGS')).toBe(false);
    });

    it('restricts batch email dispatch to Faculty Coordinator and Super Admin', () => {
      expect(checkPermission('Super Admin', 'SEND_BATCH_EMAILS')).toBe(true);
      expect(checkPermission('Faculty Coordinator', 'SEND_BATCH_EMAILS')).toBe(true);
      expect(checkPermission('Student Coordinator', 'SEND_BATCH_EMAILS')).toBe(false);
    });
  });
});
