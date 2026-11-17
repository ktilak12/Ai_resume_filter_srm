/**
 * SRMIST User Erasure & Right to Be Forgotten Engine (DPDP Act & GDPR Compliance)
 * Completely purges:
 * 1. User Account authentication record
 * 2. Active session envelope & cryptographic keys
 * 3. Candidate profile & extracted resume data from candidate database
 * 4. Scheduled interviews & evaluation scorecards
 * 5. Notification history & local builder states
 */

import { getSecureItem, setSecureItem, getSecureItemSync } from './encryptedStorage';
import { clearSecureSession } from './sessionSecurity';
import { CandidateProfile, Interview } from '../types';
import { StoredAccount } from './accountAuth';
import { appCache } from './cacheService';

const STORAGE_ACCOUNTS_KEY = 'srm_registered_accounts';

/**
 * Permanently deletes a user and all corresponding data records across the entire platform
 */
export async function deleteUserAccountAndData(emailOrId: string): Promise<{ success: boolean; error?: string }> {
  if (!emailOrId) {
    return { success: false, error: 'Identifier is required for account erasure.' };
  }

  const target = emailOrId.toLowerCase().trim();

  try {
    // 1. Purge from Encrypted Accounts Registry
    const accounts = await getSecureItem<StoredAccount[]>(STORAGE_ACCOUNTS_KEY, []);
    const matchingAccount = accounts.find(a => a.id.toLowerCase() === target || a.email.toLowerCase() === target);
    const targetEmail = (matchingAccount?.email || target).toLowerCase();
    const targetId = matchingAccount?.id || target;

    const remainingAccounts = accounts.filter(a => a.id.toLowerCase() !== targetId && a.email.toLowerCase() !== targetEmail);
    await setSecureItem(STORAGE_ACCOUNTS_KEY, remainingAccounts);

    // 2. Purge from Encrypted Candidate Database & Resume Records
    const candidates = await getSecureItem<CandidateProfile[]>('srm_candidates_list', []);
    const remainingCandidates = candidates.filter(c => {
      const matchEmail = (c.email || '').toLowerCase() === targetEmail;
      const matchId = (c.id || '').toLowerCase() === targetId;
      return !matchEmail && !matchId;
    });
    await setSecureItem('srm_candidates_list', remainingCandidates);

    // 3. Purge from Encrypted Interview Records
    const interviews = await getSecureItem<Interview[]>('srm_interviews_list', []);
    const remainingInterviews = interviews.filter(i => {
      const matchEmail = (i.candidate_email || '').toLowerCase() === targetEmail;
      const matchId = (i.candidate_id || '').toLowerCase() === targetId;
      return !matchEmail && !matchId;
    });
    await setSecureItem('srm_interviews_list', remainingInterviews);

    // 4. Invalidate all associated client caches
    appCache.clear();

    // 5. Purge user-specific browser builder & notification history
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('srm_student_builder_profile');
        localStorage.removeItem('srm_student_builder_summary');
        localStorage.removeItem('srm_builder_imported_file');
        localStorage.removeItem('srm_notifications');
        localStorage.removeItem('srm_dispatched_notifications');
        localStorage.removeItem('srm_first_login_role');
        sessionStorage.removeItem('srm_first_login_role');
      } catch {}
    }

    // 6. Terminate and destroy cryptographic session
    clearSecureSession();

    // 7. Emit global erasure event
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('srm_user_deleted', { detail: { email: targetEmail } }));
      } catch {}
    }

    return { success: true };
  } catch (err: any) {
    console.error('[UserErasure] Error purging user data:', err);
    return { success: false, error: err?.message || 'Failed to complete user erasure.' };
  }
}
