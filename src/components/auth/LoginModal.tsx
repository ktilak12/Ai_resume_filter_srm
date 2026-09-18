import React, { useEffect, useRef, useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  AlertOctagon, 
  Lock,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loadGoogleScript } from '../../services/googleAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { 
    clientId, 
    loginWithGoogleCredential, 
    authError, 
    clearError,
    isAuthenticated 
  } = useAuth();

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [isRenderingGoogle, setIsRenderingGoogle] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  useEffect(() => {
    loadGoogleScript().then((ready) => {
      setGoogleScriptReady(ready);
    });
  }, []);

  useEffect(() => {
    if (!isOpen || !googleScriptReady || !clientId || !googleButtonRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      setIsRenderingGoogle(true);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            loginWithGoogleCredential(response.credential);
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
        shape: 'pill',
        logo_alignment: 'left',
        width: 320
      });
      setIsRenderingGoogle(false);
    } catch (err) {
      console.error('[LoginModal] Failed to render Google button:', err);
      setIsRenderingGoogle(false);
    }
  }, [isOpen, googleScriptReady, clientId, loginWithGoogleCredential]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl z-10 overflow-hidden text-center">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-srm-500 via-amber-400 to-srm-600"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-srm-500/10 border border-srm-500/20 text-srm-300">
            <ShieldCheck className="w-3.5 h-3.5 text-srm-400" />
            <span>SRM Institute of Science and Technology</span>
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            Institutional Sign-In
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Single sign-on restricted strictly to official{' '}
            <span className="text-amber-400 font-mono font-semibold">@srmist.edu.in</span> Google accounts.
          </p>
        </div>

        {/* Unauthorized Domain Error Alert */}
        {authError && authError.type === 'UNAUTHORIZED_DOMAIN' && (
          <div className="mb-5 bg-red-950/90 border border-red-500/60 rounded-2xl p-4 text-left shadow-lg">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-red-200">Access Denied: Non-SRM Domain</p>
                <p className="text-red-300/90 leading-relaxed">
                  <span className="font-mono text-white bg-red-900/50 px-1 rounded">{authError.attemptedEmail}</span> is not an authorized SRMIST account. Only accounts ending in <strong className="text-amber-300">@srmist.edu.in</strong> are permitted.
                </p>
                <button
                  onClick={clearError}
                  className="mt-1 text-xs text-amber-300 hover:underline font-medium"
                >
                  Try again with @srmist.edu.in account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Sign-In Container */}
        <div className="py-4 flex flex-col items-center justify-center space-y-4">
          {clientId ? (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="min-h-[44px] flex items-center justify-center w-full">
                <div ref={googleButtonRef} className="flex justify-center w-full"></div>
                {isRenderingGoogle && (
                  <p className="text-xs text-slate-400 animate-pulse">Loading Google SSO...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-5 text-center space-y-2">
              <div className="inline-flex p-2.5 rounded-full bg-srm-500/10 text-srm-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">Google SSO Initializing</h3>
              <p className="text-xs text-slate-400">
                Waiting for Google Client ID to be configured.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-left flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Directorate of Career Centre • SRMIST Kattankulathur</span>
        </div>

      </div>
    </div>
  );
};
