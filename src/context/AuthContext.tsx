import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { parseJwt, isJwtExpired, isSRMISTEmail, parseSRMEmailDetails } from '../services/googleAuth';
import { GOOGLE_CLIENT_ID } from '../config/authConfig';

export interface AuthError {
  type: 'UNAUTHORIZED_DOMAIN' | 'INVALID_TOKEN' | 'CONFIG_ERROR' | 'UNKNOWN';
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

const STORAGE_USER_KEY = 'srm_auth_user';

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

  // Load existing session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed && parsed.email && VALID_ROLES.includes(parsed.role)) {
          setCurrentUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_USER_KEY);
        }
      }
    } catch (err) {
      console.error('[AuthProvider] Failed to recover session:', err);
      localStorage.removeItem(STORAGE_USER_KEY);
    } finally {
      setIsLoading(false);
    }
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

      // Check if user already had a completed profile saved previously
      const existingStored = localStorage.getItem(STORAGE_USER_KEY);
      let existingProfileComplete = false;
      if (existingStored) {
        try {
          const parsedExisting = JSON.parse(existingStored);
          if (parsedExisting.email === email && parsedExisting.isProfileComplete) {
            existingProfileComplete = true;
          }
        } catch (_) {}
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
        isProfileComplete: existingProfileComplete,
        lastLoginAt: new Date().toISOString()
      };

      setCurrentUser(newUser);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
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

  const loginDirect = (userData: Partial<AuthUser>) => {
    const email = userData.email || 'placement.director@srmist.edu.in';
    const isSRM = isSRMISTEmail(email);
    
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: userData.name || 'SRM Placement Officer',
      email: email,
      role: userData.role || 'Placement Officer',
      department: userData.department || 'Directorate of Career Centre',
      campus: userData.campus || 'Kattankulathur (Main Campus)',
      regNumber: userData.regNumber || 'SRM-EMP-8941',
      phone: userData.phone || '+91 98401 22334',
      isInstitutionalVerified: isSRM,
      isProfileComplete: userData.isProfileComplete ?? false,
      lastLoginAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
  };

  const updateProfile = (profile: Partial<AuthUser>) => {
    if (!currentUser) return;
    const updated: AuthUser = {
      ...currentUser,
      ...profile,
      isProfileComplete: true
    };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthError(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    if (window.google?.accounts?.id?.disableAutoSelect) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser || !VALID_ROLES.includes(role)) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
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
