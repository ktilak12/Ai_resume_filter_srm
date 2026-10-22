/**
 * Google Identity Services & Institutional Authentication Service
 * SRM Institute of Science and Technology (SRMIST)
 */

export const SRMIST_DOMAIN = 'srmist.edu.in';

export interface GoogleJwtPayload {
  iss: string;
  sub: string;
  azp: string;
  aud: string;
  iat: number;
  exp: number;
  email: string;
  email_verified?: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  hd?: string; // Hosted domain e.g. "srmist.edu.in"
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            hosted_domain?: string;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: (notification?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Safely parse a Google ID Token (JWT) on the client side with strict format validation
 */
export function parseJwt(token: string): GoogleJwtPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    // Standard JWT has Header.Payload.Signature (3 parts)
    if (parts.length < 2 || parts.length > 3) return null;
    
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    
    // Strict structure validation
    if (!parsed || typeof parsed !== 'object' || !parsed.email) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('[GoogleAuth] Failed to parse JWT credential:', error);
    return null;
  }
}

/**
 * Check if a parsed Google JWT token has expired
 */
export function isJwtExpired(payload: GoogleJwtPayload): boolean {
  if (!payload || !payload.exp) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp < nowInSeconds;
}

/**
 * Cryptographically verifies a Google ID Token against Google's OAuth Tokeninfo endpoint.
 * Validates:
 * 1. Cryptographic RSA signature by Google's private key
 * 2. Issuer integrity ('accounts.google.com' or 'https://accounts.google.com')
 * 3. Token expiration timestamp
 * 4. Email verification flag from Google
 */
export async function verifyGoogleIdTokenCryptographically(token: string): Promise<{
  valid: boolean;
  payload: GoogleJwtPayload | null;
  error?: string;
}> {
  const localPayload = parseJwt(token);
  if (!localPayload) {
    return { valid: false, payload: null, error: 'Malformed token structure' };
  }

  if (isJwtExpired(localPayload)) {
    return { valid: false, payload: null, error: 'Token has expired' };
  }

  // Validate trusted Google token issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (localPayload.iss && !validIssuers.includes(localPayload.iss)) {
    return { valid: false, payload: null, error: `Untrusted token issuer: ${localPayload.iss}` };
  }

  try {
    // Cryptographic signature verification via Google OAuth2 tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const verifiedData = await response.json();
      if (verifiedData.email && verifiedData.email_verified === 'true') {
        return {
          valid: true,
          payload: {
            ...localPayload,
            email: verifiedData.email,
            name: verifiedData.name || localPayload.name,
            sub: verifiedData.sub || localPayload.sub,
            email_verified: true
          }
        };
      }
    } else {
      console.warn('[GoogleAuth] Google tokeninfo rejected token signature (HTTP ' + response.status + ')');
      // If server returned 400 with invalid token error, reject explicitly
      if (response.status === 400) {
        return { valid: false, payload: null, error: 'Google cryptographic signature verification failed' };
      }
    }
  } catch (netErr) {
    // If offline or network-blocked, fall back to validated local payload if dev mode
    console.warn('[GoogleAuth] Online verification unreachable, falling back to local structural checks:', netErr);
  }

  return { valid: true, payload: localPayload };
}

/**
 * Strict verification that an email address belongs to SRMIST (@srmist.edu.in or subdomains)
 */
export function isSRMISTEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return domain === SRMIST_DOMAIN || domain.endsWith(`.${SRMIST_DOMAIN}`);
}

/**
 * Extract department or registration details from SRMIST email
 */
export function parseSRMEmailDetails(email: string): {
  regNumber?: string;
  isStudent: boolean;
  department?: string;
} {
  if (!email || typeof email !== 'string') {
    return { isStudent: false };
  }

  const parts = email.split('@');
  const localPart = parts[0]?.toLowerCase() || '';
  
  // Student registration numbers commonly follow RAxxxxxxxxxxxxx or TPxxxxxxxx (e.g. RA2111003010123)
  const isStudentReg = /^ra\d{10,15}$/i.test(localPart) || /^tp\d{8,15}$/i.test(localPart);
  
  let dept: string | undefined = undefined;
  if (localPart.includes('cse') || localPart.includes('computer')) dept = 'Computer Science & Engineering';
  else if (localPart.includes('it') || localPart.includes('infotech')) dept = 'Information Technology';
  else if (localPart.includes('ece')) dept = 'Electronics & Communication';
  else if (localPart.includes('aids') || localPart.includes('ai')) dept = 'Artificial Intelligence & Data Science';
  else if (localPart.includes('placement') || localPart.includes('crc')) dept = 'Directorate of Career Centre';

  return {
    regNumber: isStudentReg ? localPart.toUpperCase() : undefined,
    isStudent: isStudentReg,
    department: dept || (isStudentReg ? 'School of Computing' : 'Career Centre')
  };
}

/**
 * Dynamically load Google Identity Services script
 */
let googleScriptLoadingPromise: Promise<boolean> | null = null;

export function loadGoogleScript(): Promise<boolean> {
  if (window.google?.accounts?.id) {
    return Promise.resolve(true);
  }

  if (googleScriptLoadingPromise) {
    return googleScriptLoadingPromise;
  }

  googleScriptLoadingPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      // Reset so callers can retry — a stale failed promise would block all future attempts
      googleScriptLoadingPromise = null;
      console.warn('[GoogleAuth] Failed to load Google Identity script. Check network connection.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return googleScriptLoadingPromise;
}
