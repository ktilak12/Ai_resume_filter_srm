import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowLeft, 
  AlertCircle, 
  LogIn,
  UserPlus,
  Users,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Mail,
  User,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { loadGoogleScript } from '../services/googleAuth';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../config/authConfig';
import { UserRole } from '../types';
import { SEO } from '../components/common/SEO';

interface RoleTab {
  role: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultEmail: string;
  defaultName: string;
  defaultPass: string;
  hint: string;
}

const ROLES: RoleTab[] = [
  {
    role: 'Faculty Coordinator',
    label: 'Faculty',
    icon: Users,
    defaultEmail: 'faculty.coordinator@srmist.edu.in',
    defaultName: 'Dr. S. K. Narayanan',
    defaultPass: 'faculty123',
    hint: 'Drive management, candidate shortlisting, and department rosters'
  },
  {
    role: 'Student Coordinator',
    label: 'Student',
    icon: GraduationCap,
    defaultEmail: 'student.placement@srmist.edu.in',
    defaultName: 'Aarav Sharma',
    defaultPass: 'student123',
    hint: 'Student portal, ATS resume screening, and drive applications'
  },
  {
    role: 'Super Admin',
    label: 'Admin',
    icon: Shield,
    defaultEmail: 'placement.director@srmist.edu.in',
    defaultName: 'Placement Director',
    defaultPass: 'admin123',
    hint: 'Platform administration, AI weight tuning, and bias governance'
  }
];

export const LoginPage: React.FC = () => {
  const { 
    currentUser, 
    loginWithGoogleCredential, 
    loginWithPassword,
    registerWithPassword,
    authError, 
    clearError 
  } = useAuth();

  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [isRenderingGoogle, setIsRenderingGoogle] = useState(false);

  // Authentication Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Active Role Selection
  const [selectedRole, setSelectedRole] = useState<UserRole>('Faculty Coordinator');
  const selectedRoleRef = useRef<UserRole>(selectedRole);

  const activeRoleConfig = ROLES.find(r => r.role === selectedRole) || ROLES[0];

  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientId = GOOGLE_CLIENT_ID;

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  // When switching modes or roles, clear custom errors
  useEffect(() => {
    setFormError(null);
    clearError();
  }, [authMode, selectedRole]);

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
          text: authMode === 'login' ? 'signin_with' : 'signup_with',
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
  }, [googleScriptReady, clientId, navigate, loginWithGoogleCredential, authMode]);

  const handleManualGoogleClick = () => {
    const googleObj = (window as any).google;
    if (clientId && googleObj?.accounts?.id) {
      googleObj.accounts.id.prompt();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const targetEmail = email.trim();
    const targetPassword = password.trim();

    if (authMode === 'login') {
      if (!targetEmail) {
        setFormError('Please enter your institutional email or ID.');
        return;
      }
      if (!targetPassword) {
        setFormError('Please enter your password.');
        return;
      }

      setIsSubmitting(true);
      const res = await loginWithPassword(targetEmail, targetPassword, selectedRole);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/dashboard');
      } else if (res.error) {
        setFormError(res.error);
      }
    } else {
      // Register Mode
      const targetName = name.trim();
      if (!targetName) {
        setFormError('Please enter your full name.');
        return;
      }
      if (!targetEmail || !targetEmail.includes('@')) {
        setFormError('Please enter a valid institutional email address.');
        return;
      }
      if (!targetPassword || targetPassword.length < 6) {
        setFormError('Password must be at least 6 characters long.');
        return;
      }
      if (targetPassword !== confirmPassword.trim()) {
        setFormError('Passwords do not match. Please verify.');
        return;
      }

      setIsSubmitting(true);
      const res = await registerWithPassword(targetName, targetEmail, targetPassword, selectedRole);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/dashboard');
      } else if (res.error) {
        setFormError(res.error);
      }
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail(activeRoleConfig.defaultEmail);
    setPassword(activeRoleConfig.defaultPass);
    setName(activeRoleConfig.defaultName);
    setConfirmPassword(activeRoleConfig.defaultPass);
    setFormError(null);
  };

  const activeError = formError || authError?.message;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <SEO
        title={authMode === 'login' ? 'Sign In | SRM Placement Portal' : 'Register Account | SRM Placement Portal'}
        description="Official SRMIST student and faculty portal for campus recruitment drives, ATS screening tools, and placement analytics."
        canonical="/login"
      />
      
      {/* Top back navigation */}
      <div className="max-w-md w-full mx-auto mb-2">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Login / Register Card */}
      <div className="max-w-md w-full mx-auto bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-white shadow-inner">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-xs text-zinc-400">
            {authMode === 'login' 
              ? 'Sign in with your ID & password or Google' 
              : 'Register your SRM institutional account'}
          </p>
        </div>

        {/* Clear Tab Difference: Sign In vs Register */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setFormError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              authMode === 'login'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setFormError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              authMode === 'register'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Role Segmented Pill */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
            <span>{authMode === 'login' ? 'Account Role' : 'Registering as'}</span>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors underline"
            >
              Fill demo {activeRoleConfig.label}
            </button>
          </div>

          <div className="p-1 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-3 gap-1">
            {ROLES.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedRole === tab.role;
              return (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(tab.role);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected 
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10.5px] text-zinc-500 text-center">
            {activeRoleConfig.hint}
          </p>
        </div>

        {/* Error Alert Banner */}
        {activeError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-left space-y-1 text-xs text-red-200 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Notice</span>
              </div>
              <button 
                onClick={() => {
                  setFormError(null);
                  clearError();
                }}
                className="text-[11px] text-zinc-400 hover:text-white underline"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[11px] text-zinc-300">{activeError}</p>
          </div>
        )}

        {/* Form: ID & Password */}
        <form onSubmit={handleFormSubmit} className="space-y-3 pt-1">
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300 block">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Dr. S. K. Narayanan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white text-xs transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300 block">
              Email or Institutional ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder={activeRoleConfig.defaultEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white text-xs transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-zinc-300">
                Password
              </label>
              {authMode === 'login' && (
                <span className="text-[10px] text-zinc-500">
                  Default: <code className="text-zinc-400">{activeRoleConfig.defaultPass}</code>
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-10 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white text-xs transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300 block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white text-xs transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : authMode === 'login' ? (
              <>
                <span>Sign In as {activeRoleConfig.label}</span>
                <LogIn className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Create Account & Sign In</span>
                <UserPlus className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-850"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-zinc-950 px-3 text-zinc-500 text-[11px]">
              or direct with Google
            </span>
          </div>
        </div>

        {/* Direct with Google Button */}
        <div className="flex flex-col items-center justify-center">
          {clientId ? (
            <div className="w-full flex flex-col items-center">
              <div ref={googleButtonRef} className="flex justify-center w-full min-h-[44px]"></div>
              {isRenderingGoogle && (
                <p className="text-xs text-zinc-500 animate-pulse mt-1">Loading Google Sign-In...</p>
              )}
            </div>
          ) : (
            <button
              onClick={handleManualGoogleClick}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold border border-zinc-850 hover:border-zinc-700 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Continue with Google Account</span>
            </button>
          )}
        </div>

        {/* Bottom Switch Link */}
        <div className="text-center text-xs text-zinc-400 pt-1">
          {authMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-white hover:underline font-semibold"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-white hover:underline font-semibold"
              >
                Sign In here
              </button>
            </p>
          )}
        </div>

        {/* Subtle Security & DPDP Notice */}
        <div className="pt-2 border-t border-zinc-850/80 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
          <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
          <span>Institutional SSO & Password Auth • DPDP Compliant</span>
        </div>

      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-zinc-600 py-2">
        <p>© 2026 SRM Institute of Science and Technology</p>
      </div>

    </div>
  );
};
