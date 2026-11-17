import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { 
  checkLoginLockout, 
  recordFailedLogin, 
  resetLoginAttempts 
} from '../services/loginProtection';
import { deleteUserAccountAndData } from '../services/userErasureService';
import { registerAccount, authenticateWithPassword, getStoredAccounts } from '../services/accountAuth';
import { setSecureItem, getSecureItem } from '../services/encryptedStorage';
import { GOOGLE_CLIENT_ID } from '../config/authConfig';

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
    subtle: (crypto.webcrypto as any)?.subtle,
    getRandomValues: (arr: any) => crypto.randomFillSync(arr)
  },
  localStorage: mockLocal,
  sessionStorage: mockSession
};
(globalThis as any).localStorage = mockLocal;
(globalThis as any).sessionStorage = mockSession;

describe('Security Hardening: Database Protection, User Erasure & Login Defense', () => {

  beforeEach(() => {
    mockLocal.clear();
    mockSession.clear();
  });

  describe('1. Login Protection & Brute-Force Rate Limiting', () => {
    it('permits initial login attempts without lockout', () => {
      const status = checkLoginLockout('student@srmist.edu.in');
      expect(status.isLocked).toBe(false);
    });

    it('locks out account after 5 consecutive failed attempts', () => {
      const email = 'attacker@srmist.edu.in';
      for (let i = 1; i <= 4; i++) {
        const attempt = recordFailedLogin(email);
        expect(attempt.isLocked).toBe(false);
        expect(attempt.remainingAttempts).toBe(5 - i);
      }

      // 5th attempt triggers lockout
      const fifth = recordFailedLogin(email);
      expect(fifth.isLocked).toBe(true);
      expect(fifth.remainingAttempts).toBe(0);

      const check = checkLoginLockout(email);
      expect(check.isLocked).toBe(true);
      expect(check.remainingSeconds).toBeGreaterThan(0);
    });

    it('resets failed attempts counter upon successful login', () => {
      const email = 'student@srmist.edu.in';
      recordFailedLogin(email);
      recordFailedLogin(email);

      resetLoginAttempts(email);
      const check = checkLoginLockout(email);
      expect(check.isLocked).toBe(false);
    });
  });

  describe('2. User & Database Erasure (Right to be Forgotten)', () => {
    it('completely removes user account and associated candidate & interview records', async () => {
      const email = 'erase.me@srmist.edu.in';
      
      // Register account
      await registerAccount({
        name: 'Temporary User',
        email,
        password: 'Password123',
        role: 'Student Coordinator'
      });

      // Seed candidate in encrypted database
      await setSecureItem('srm_candidates_list', [
        {
          id: 'cand-temp',
          name: 'Temporary User',
          email,
          reg_number: 'RA2311003019999',
          status: 'Applied',
          skills: ['Python'],
          education: { degree: 'B.Tech', department: 'CSE', cgpa: 8.5, graduation_year: 2026, active_backlogs: 0 },
          experience: [],
          projects: []
        }
      ]);

      // Seed interview
      await setSecureItem('srm_interviews_list', [
        {
          id: 'int-temp',
          candidate_id: 'cand-temp',
          candidate_name: 'Temporary User',
          candidate_email: email,
          company: 'Google',
          scheduled_date: '2026-12-01',
          round: 'Technical Round 1',
          status: 'Scheduled'
        }
      ]);

      // Verify records exist
      const accountsBefore = await getStoredAccounts();
      expect(accountsBefore.some(a => a.email === email)).toBe(true);

      // Perform user erasure
      const result = await deleteUserAccountAndData(email);
      expect(result.success).toBe(true);

      // Verify account deleted
      const accountsAfter = await getStoredAccounts();
      expect(accountsAfter.some(a => a.email === email)).toBe(false);

      // Verify candidate record deleted
      const candidatesAfter = await getSecureItem<any[]>('srm_candidates_list', []);
      expect(candidatesAfter.some(c => c.email === email)).toBe(false);

      // Verify interview record deleted
      const interviewsAfter = await getSecureItem<any[]>('srm_interviews_list', []);
      expect(interviewsAfter.some(i => i.candidate_email === email)).toBe(false);
    });
  });

  describe('3. API Key & Client Secret Obfuscation', () => {
    it('deobfuscates Google Client ID securely in memory at runtime', () => {
      expect(GOOGLE_CLIENT_ID).toBeDefined();
      expect(GOOGLE_CLIENT_ID).toContain('.apps.googleusercontent.com');
    });
  });
});
