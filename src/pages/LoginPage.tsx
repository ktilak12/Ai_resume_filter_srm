import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  LogIn,
  Check,
  Lock,
  Briefcase,
  Building2,
  Users,
  Shield
} from 'lucide-react';
import { loadGoogleScript } from '../services/googleAuth';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../config/authConfig';
import { UserRole } from '../types';

interface RoleOption {
  role: UserRole;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}

const AVAILABLE_ROLES: RoleOption[] = [
  {
    role: 'Placement Officer',
    title: 'Placement Officer',
    tagline: 'Manage drives, candidate screening, shortlists & corporate invitations',
    icon: Briefcase,
    badge: 'Operations'
  },
  {
    role: 'Student Coordinator',
    title: 'Student Coordinator',
    tagline: 'Candidate portal, AI resume builder & scoring, drive applications',
    icon: GraduationCap,
    badge: 'Candidate'
  },
  {
    role: 'Corporate Recruiter',
    title: 'Corporate Recruiter',
    tagline: 'Review candidates, evaluate match scores & schedule interview rounds',
    icon: Building2,
    badge: 'Hiring'
  },
  {
    role: 'Faculty Coordinator',
    title: 'Faculty Coordinator',
    tagline: 'Department student rosters, academic verification & placement stats',
    icon: Users,
    badge: 'Academic'
  },
  {
    role: 'Super Admin',
    title: 'Super Administrator',
    tagline: 'Full platform administration, AI weight tuning & bias governance',
    icon: Shield,
    badge: 'Governance'
  }
];

export const LoginPage: React.FC = () => {
  const { 
    currentUser, 
    loginWithGoogleCredential, 
    loginDirect,
    authError, 
    clearError 
  } = useAuth();

  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [isRenderingGoogle, setIsRenderingGoogle] = useState(false);

  // Selected RBAC Role at Login
  const [selectedRole, setSelectedRole] = useState<UserRole>('Placement Officer');
  const selectedRoleRef = useRef<UserRole>(selectedRole);

  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  // Quick institutional sign-in form state
  const [directName, setDirectName] = useState('');
  const [directEmail, setDirectEmail] = useState('');

  const clientId = GOOGLE_CLIENT_ID;

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // Load and verify Google Identity Services script
  useEffect(() => {
    let isMounted = true;
    loadGoogleScript().then(loaded => {
      if (isMounted && loaded) {
        setGoogleScriptReady(true);
      }
    });

    const checkExisting = () => {
      if ((window as any).google?.accounts?.id && isMounted) {
        setGoogleScriptReady(true);
        return true;
      }
      return false;
    };

    if (checkExisting()) return;

    const interval = setInterval(() => {
      if (checkExisting()) {
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Initialize and Render Official Google Sign-In Button
  useEffect(() => {
    if (!googleScriptReady || !clientId || !googleButtonRef.current) {
      return;
    }

    try {
      setIsRenderingGoogle(true);
      const googleObj = (window as any).google;
      if (googleObj?.accounts?.id) {
        googleObj.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response?.credential) {
              // Lock session with the chosen role from the RBAC selector
              const success = await loginWithGoogleCredential(response.credential, selectedRoleRef.current);
              if (success) {
                navigate('/dashboard');
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        googleButtonRef.current.innerHTML = '';

        googleObj.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 320
        });
      }
      setIsRenderingGoogle(false);
    } catch (err) {
      console.error('[LoginPage] Failed to render Google button:', err);
      setIsRenderingGoogle(false);
    }
  }, [googleScriptReady, clientId, navigate, loginWithGoogleCredential]);

  const handleManualGoogleClick = () => {
    const googleObj = (window as any).google;
    if (clientId && googleObj?.accounts?.id) {
      googleObj.accounts.id.prompt();
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between p-4 sm:p-6 font-sans relative">
      
      {/* Top back navigation */}
      <div className="max-w-xl w-full mx-auto relative z-10 mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl w-full mx-auto bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* SRM University Emblem & Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-850 flex items-center justify-center mx-auto text-white shadow-inner">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            SRM Institute of Science and Technology
          </h1>
          <p className="text-xs text-zinc-400">
            Directorate of Career Centre • Institutional Placement Portal
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 text-left space-y-1 text-xs text-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Authentication Notice</span>
              </div>
              <button 
                onClick={clearError}
                className="text-[11px] text-zinc-400 hover:text-white underline"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              {authError.message}
            </p>
          </div>
        )}

        {/* STEP 1: What is your role? (Mandatory RBAC Selection) */}
        <div className="space-y-3 pt-2 border-t border-zinc-850">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>What is your role? (RBAC Access Level)</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Select your assigned role before authenticating into the portal.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-emerald-400 border border-zinc-800 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Locked on Login
            </span>
          </div>

          {/* Interactive Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_ROLES.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.role;

              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setSelectedRole(opt.role)}
                  className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-zinc-900 border-white text-white shadow-md'
                      : 'bg-zinc-950 hover:bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${
                        isSelected 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-white">
                        {opt.title}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-500 border border-zinc-850">
                        {opt.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] leading-tight text-zinc-400 line-clamp-2">
                    {opt.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Locked Role Security Notice */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center gap-2 text-[11px] text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Your session will be strictly locked as <strong className="text-white">{selectedRole}</strong>. 
              Role changing post-login is restricted for institutional data integrity.
            </span>
          </div>
        </div>

        {/* STEP 2: Authenticate */}
        <div className="space-y-4 pt-2 border-t border-zinc-850">
          <div className="text-center space-y-0.5">
            <h3 className="text-xs font-semibold text-white">Sign In to Continue</h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              Role: <span className="text-zinc-300 font-bold">{selectedRole}</span>
            </p>
          </div>

          {/* Google Sign-In Container */}
          <div className="flex flex-col items-center justify-center py-1 space-y-3">
            {clientId ? (
              <div className="w-full flex flex-col items-center">
                <div ref={googleButtonRef} className="flex justify-center w-full min-h-[44px]"></div>
                {isRenderingGoogle && (
                  <p className="text-xs text-zinc-500 animate-pulse mt-2">Loading Google Sign-In...</p>
                )}
              </div>
            ) : (
              <button
                onClick={handleManualGoogleClick}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold border border-zinc-850 hover:border-zinc-700 transition-all"
              >
                <span>Sign in with Google Account</span>
              </button>
            )}

            {/* Direct Sign-In (Dev Only) */}
            {import.meta.env.DEV && (
              <>
                <div className="relative w-full py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-850"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-zinc-950 px-3 text-amber-500 uppercase font-mono text-[10px] tracking-wider">
                      Dev Fast Track · As {selectedRole}
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loginDirect({
                      name: directName.trim() || `SRM ${selectedRole}`,
                      email: directEmail.trim() || `${selectedRole.toLowerCase().replace(/\s+/g, '.')}@srmist.edu.in`,
                      role: selectedRole,
                      isProfileComplete: true
                    });
                    navigate('/dashboard');
                  }}
                  className="w-full space-y-2.5 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name (e.g. Tilak K)"
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                    <input
                      type="email"
                      placeholder="Email (e.g. user@srmist.edu.in)"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Sign in as {selectedRole}</span>
                    <LogIn className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Domain Badge & DPDP Notice */}
        <div className="pt-4 border-t border-zinc-850 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Role-Based Access Control (RBAC) Enforced</span>
          </div>
          <p className="text-[10px] text-zinc-500 max-w-sm mx-auto">
            Governed under DPDP Act 2023. Authenticated sessions are tamper-proof and cryptographically signed.
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="max-w-xl w-full mx-auto text-center text-xs text-zinc-600 relative z-10 py-2">
        <p>© 2026 SRM Institute of Science and Technology. All rights reserved.</p>
      </div>

    </div>
  );
};
