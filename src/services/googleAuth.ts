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
 * Safely parse a Google ID Token (JWT) on the client side
 */
export function parseJwt(token: string): GoogleJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[GoogleAuth] Failed to parse JWT credential:', error);
    return null;
  }
}

/**
 * Strict verification that an email address belongs to SRMIST (@srmist.edu.in)
 */
export function isSRMISTEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(`@${SRMIST_DOMAIN}`) || normalized.endsWith(`.${SRMIST_DOMAIN}`);
}

/**
 * Extract department or registration details from SRMIST email
 */
export function parseSRMEmailDetails(email: string): {
  regNumber?: string;
  isStudent: boolean;
  department?: string;
} {
  const localPart = email.split('@')[0].toLowerCase();
  
  // Student registration numbers commonly follow RAxxxxxxxxxxxxx (e.g. RA2111003010123)
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
      console.warn('[GoogleAuth] Failed to load Google Identity script. Check network connection.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return googleScriptLoadingPromise;
}
