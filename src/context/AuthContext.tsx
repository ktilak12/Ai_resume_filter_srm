import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { parseJwt, isJwtExpired, isSRMISTEmail, parseSRMEmailDetails } from '../services/googleAuth';
import { GOOGLE_CLIENT_ID } from '../config/authConfig';
import { 
  loadSecureSession, 
  saveSecureSession, 
  clearSecureSession, 
  isRoleElevationAllowed 
} from '../services/sessionSecurity';

export interface AuthError {
  type: 'UNAUTHORIZED_DOMAIN' | 'INVALID_TOKEN' | 'CONFIG_ERROR' | 'UNAUTHORIZED_ROLE' | 'UNKNOWN';
  message: string;
  attemptedEmail?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: AuthError | null;
  clientId: string;
  loginWithGoogleCredential: (credentialJwt: string) => Promise<boolean>;
  loginDirect: (user: Partial<AuthUser>) => void;
  updateProfile: (profile: Partial<AuthUser>) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_ROLES: UserRole[] = [
  'Placement Officer',
  'Faculty Coordinator',
  'Corporate Recruiter',
  'Super Admin',
  'Student Coordinator'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  // Client ID loaded from in-code config or .env
  const clientId = GOOGLE_CLIENT_ID;

  // Load existing session with cryptographic tamper verification
  useEffect(() => {
    let isMounted = true;
    loadSecureSession()
      .then((validatedUser) => {
        if (!isMounted) return;
        if (validatedUser && VALID_ROLES.includes(validatedUser.role)) {
          setCurrentUser(validatedUser);
        } else {
          setCurrentUser(null);
        }
      })
      .catch((err) => {
        console.error('[AuthProvider] Failed to recover secure session:', err);
        clearSecureSession();
        if (isMounted) setCurrentUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithGoogleCredential = async (credentialJwt: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const payload = parseJwt(credentialJwt);

      if (!payload || !payload.email) {
        setAuthError({
          type: 'INVALID_TOKEN',
          message: 'Unable to parse Google authentication token. Please try again.'
        });
        setIsLoading(false);
        return false;
      }

      if (isJwtExpired(payload)) {
        setAuthError({
          type: 'INVALID_TOKEN',
          message: 'Google authentication token has expired. Please sign in again.'
        });
        setIsLoading(false);
        return false;
      }

      const email = payload.email.trim().toLowerCase();
      const isSRM = isSRMISTEmail(email);

      // Detect role and department based on verified domain and email structure
      const srmDetails = parseSRMEmailDetails(email);
      let detectedRole: UserRole = 'Corporate Recruiter';

      if (isSRM) {
        if (srmDetails.isStudent) {
          detectedRole = 'Student Coordinator';
        } else if (email.includes('director') || email.includes('admin')) {
          detectedRole = 'Super Admin';
        } else if (email.includes('faculty') || email.includes('prof') || email.includes('hod')) {
          detectedRole = 'Faculty Coordinator';
        } else {
          detectedRole = 'Placement Officer';
        }
      } else {
        detectedRole = 'Corporate Recruiter';
      }

      const newUser: AuthUser = {
        id: payload.sub,
        name: payload.name || email.split('@')[0],
        email: email,
        role: detectedRole,
        department: isSRM ? srmDetails.department : 'Computer Science & Engineering',
        campus: isSRM ? 'Kattankulathur (Main Campus)' : 'Corporate Partner Office',
        regNumber: isSRM ? srmDetails.regNumber : undefined,
        picture: payload.picture,
        isInstitutionalVerified: isSRM,
        isProfileComplete: true,
        lastLoginAt: new Date().toISOString()
      };

      setCurrentUser(newUser);
      await saveSecureSession(newUser);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('[AuthProvider] Login error:', err);
      setAuthError({
        type: 'UNKNOWN',
        message: 'An unexpected error occurred during Google authentication.'
      });
      setIsLoading(false);
      return false;
    }
  };

  const loginDirect = async (userData: Partial<AuthUser>) => {
    const email = userData.email || 'placement.director@srmist.edu.in';
    const isSRM = isSRMISTEmail(email);

    // Defense-in-depth: In production, direct login can NEVER self-elevate to Super Admin
    let requestedRole = userData.role || 'Placement Officer';
    if (!import.meta.env.DEV && requestedRole === 'Super Admin') {
      requestedRole = 'Placement Officer';
    }
    
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'SRM Placement Officer',
      email: email,
      role: requestedRole,
      department: userData.department || 'Directorate of Career Centre',
      campus: userData.campus || 'Kattankulathur (Main Campus)',
      regNumber: userData.regNumber || 'SRM-EMP-8941',
      phone: userData.phone || '+91 98401 22334',
      isInstitutionalVerified: isSRM,
      isProfileComplete: true,
      lastLoginAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    await saveSecureSession(newUser);
  };

  const updateProfile = async (profile: Partial<AuthUser>) => {
    if (!currentUser) return;
    const updated: AuthUser = {
      ...currentUser,
      ...profile,
      isProfileComplete: true
    };
    setCurrentUser(updated);
    await saveSecureSession(updated);
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthError(null);
    clearSecureSession();
    try {
      if ((window as any).google?.accounts?.id?.disableAutoSelect) {
        (window as any).google.accounts.id.disableAutoSelect();
      }
    } catch (e) {
      console.error('[AuthProvider] Logout cleanup error:', e);
    }
  };

  const switchRole = async (role: UserRole) => {
    if (!VALID_ROLES.includes(role)) return;

    // Strict Role-Based Elevation Prevention
    if (!isRoleElevationAllowed(currentUser, role)) {
      console.warn(`[RBAC Security] Unauthorized role switch to "${role}" blocked for:`, currentUser?.email);
      setAuthError({
        type: 'UNAUTHORIZED_ROLE',
        message: `Privilege escalation blocked: Account "${currentUser?.email || 'Unknown'}" lacks authorization for "${role}".`
      });
      return;
    }

    const updated: AuthUser = currentUser ? {
      ...currentUser,
      role
    } : {
      id: `usr-${Date.now()}`,
      name: 'SRM User',
      email: 'placement@srmist.edu.in',
      role,
      department: 'Directorate of Career Centre',
      campus: 'Kattankulathur (Main Campus)',
      regNumber: 'SRM-EMP-8941',
      isInstitutionalVerified: true,
      isProfileComplete: true,
      lastLoginAt: new Date().toISOString()
    };
    setCurrentUser(updated);
    await saveSecureSession(updated);
  };

  const clearError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        authError,
        clientId,
        loginWithGoogleCredential,
        loginDirect,
        updateProfile,
        logout,
        switchRole,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
