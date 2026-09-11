import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loadGoogleScript } from '../../services/googleAuth';

export const LoginPage: React.FC = () => {
  const { 
    clientId, 
    loginWithGoogleCredential, 
    authError, 
    clearError,
    isAuthenticated
  } = useAuth();

  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [isRenderingGoogle, setIsRenderingGoogle] = useState(false);

  // If already authenticated, redirect to landing page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load Google Identity Services script
  useEffect(() => {
    loadGoogleScript().then((ready) => {
      setGoogleScriptReady(ready);
    });
  }, []);

  // Render Google Sign In button
  useEffect(() => {
    if (!googleScriptReady || !clientId || !googleButtonRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      setIsRenderingGoogle(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            loginWithGoogleCredential(response.credential).then((success) => {
              if (success) {
                navigate('/');
              }
            });
          }
        },
        hosted_domain: 'srmist.edu.in',
        auto_select: false,
        cancel_on_tap_outside: true
      });

      googleButtonRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320
      });
      setIsRenderingGoogle(false);
    } catch (err) {
      console.error('[LoginPage] Failed to render Google button:', err);
      setIsRenderingGoogle(false);
    }
  }, [googleScriptReady, clientId, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Top back button */}
      <div className="max-w-md w-full mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        
        {/* SRM Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-srm-600 text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            SRM Institute of Science and Technology
          </h1>
          <p className="text-xs text-slate-400">
            Career Centre &amp; Placement Portal
          </p>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-semibold text-slate-200">Sign in to your account</h2>
          <p className="text-xs text-slate-400 mt-1">
            Use your official <span className="text-amber-400 font-mono font-medium">@srmist.edu.in</span> email
          </p>
        </div>

        {/* Error Alert */}
        {authError && authError.type === 'UNAUTHORIZED_DOMAIN' && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-left">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-red-300">
                <p className="font-semibold text-red-200">Access Denied</p>
                <p>
                  <span className="font-mono text-white">{authError.attemptedEmail}</span> is not an SRMIST account. Only <span className="font-semibold text-amber-300">@srmist.edu.in</span> accounts are authorized.
                </p>
                <button
                  onClick={clearError}
                  className="text-xs text-amber-300 hover:underline pt-1 block"
                >
                  Try another account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="flex flex-col items-center justify-center py-2 space-y-4">
          {clientId ? (
            <div className="w-full flex flex-col items-center">
              <div ref={googleButtonRef} className="flex justify-center w-full min-h-[44px]"></div>
              {isRenderingGoogle && (
                <p className="text-xs text-slate-400 animate-pulse mt-2">Loading Google Sign-In...</p>
              )}
            </div>
          ) : (
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-1.5">
              <Lock className="w-4 h-4 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-300 font-medium">Google SSO Ready</p>
              <p className="text-[11px] text-slate-500">
                Awaiting client ID in configuration.
              </p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Institutional access restricted to SRMIST users</span>
          </p>
        </div>

      </div>

      {/* Basic Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-600">
        <p>© 2026 SRM Institute of Science and Technology. All rights reserved.</p>
      </div>

    </div>
  );
};
