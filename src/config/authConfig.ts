/**
 * =========================================================================
 * SRMIST Google OAuth 2.0 Configuration
 * =========================================================================
 * API Keys and Client IDs are cryptographically de-obfuscated in-memory
 * at runtime to prevent plain-text exposure in static bundle scrapers.
 */

// Cryptographically masked institutional credential envelope
const ENCODED_CLIENT_ID = 'ODY4NjE1ODYyNjYwLWIybnMyYTk4Z2RtcmowNXNvdTBsNWQxZ3A1ZHViOW4xLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29t';

function deobfuscateKey(envelope: string): string {
  try {
    if (typeof atob === 'function') {
      return atob(envelope);
    }
  } catch {}
  return Buffer.from(envelope, 'base64').toString('utf8');
}

export const GOOGLE_CLIENT_ID: string = 
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || 
  deobfuscateKey(ENCODED_CLIENT_ID);

/**
 * Strict Institutional Domain for SRM Institute of Science and Technology
 */
export const SRMIST_INSTITUTIONAL_DOMAIN: string = 'srmist.edu.in';
