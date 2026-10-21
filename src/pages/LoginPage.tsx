import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  LogIn
} from 'lucide-react';
import { loadGoogleScript } from '../services/googleAuth';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../config/authConfig';
import { UserRole } from '../types';

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
  const [showConfigNotice, setShowConfigNotice] = useState(false);

  // Quick institutional sign-in form state
  const [directName, setDirectName] = useState('');
  const [directEmail, setDirectEmail] = useState('');
  const [directRole, setDirectRole] = useState<UserRole>('Placement Officer');

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
              const success = await loginWithGoogleCredential(response.credential);
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
    } else {
      setShowConfigNotice(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between p-4 sm:p-6 font-sans relative">
      
      {/* Top back navigation */}
      <div className="max-w-md w-full mx-auto relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-zinc-950 border border-zinc-850 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* SRM University Emblem & Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-white">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            SRM Institute of Science and Technology
          </h1>
          <p className="text-xs text-zinc-400">
            Directorate of Career Centre • Placement Portal
          </p>
        </div>

        {/* Portal Sign-In Header */}
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-sm font-semibold text-white">Sign in to your account</h2>
          <p className="text-xs text-zinc-400 font-mono">
            Official @srmist.edu.in Portal Access
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-6 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-left space-y-1 text-xs text-zinc-200">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Authentication Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              {authError.message}
            </p>
          </div>
        )}

        {/* Google Sign-In Container */}
        <div className="flex flex-col items-center justify-center py-2 space-y-3">
          
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
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <span>Sign in with Google Account</span>
            </button>
          )}


          {/* Divider + Direct Sign-In: DEV ONLY — stripped from production builds */}
          {import.meta.env.DEV && (
            <>
              <div className="relative w-full py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-850"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-zinc-950 px-3 text-amber-500 uppercase font-mono text-[10px] tracking-wider">
                    Dev Only · Direct Sign-In
                  </span>
                </div>
              </div>

              {/* Quick Direct Sign-In Form — removed in production */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  loginDirect({
                    name: directName.trim() || 'SRM Officer',
                    email: directEmail.trim() || 'placement@srmist.edu.in',
                    role: directRole,
                    isProfileComplete: false
                  });
                  navigate('/dashboard');
                }}
                className="w-full space-y-2.5 text-xs"
              >
                <div>
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Tilak K)"
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email (e.g. name@srmist.edu.in)"
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={directRole}
                    onChange={(e) => setDirectRole(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-2.5 py-2 text-white text-[11px] focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Placement Officer">Placement Officer</option>
                    <option value="Faculty Coordinator">Faculty Coordinator</option>
                    <option value="Corporate Recruiter">Corporate Recruiter</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Student Coordinator">Student Coordinator</option>
                  </select>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Enter Portal</span>
                    <LogIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          )}



        </div>{/* end Google sign-in flex container */}

        {/* Domain Badge & Notice */}
        <div className="mt-6 pt-4 border-t border-zinc-850 text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Role-Based Governance Active</span>
          </div>
          <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
            Authorized for SRMIST placement operations.
          </p>
        </div>

      </div>

      {/* Standard Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-zinc-600 relative z-10 space-y-1">
        <p>© 2026 SRM Institute of Science and Technology.</p>
        <p className="text-[10px] text-zinc-600">Directorate of Career Centre • Kattankulathur</p>
        <p className="text-[11px] pt-1">
          <Link to="/privacy" className="text-zinc-400 hover:text-white underline underline-offset-2">
            Privacy Policy & DPDP Act Compliance Notice
          </Link>
        </p>
      </div>

    </div>
  );
};
