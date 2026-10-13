import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Save, 
  Check, 
  Building2, 
  Scale, 
  Lock,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { AISettings, UserRole } from '../types';
import { DEFAULT_AI_SETTINGS } from '../services/aiScreeningEngine';
import { checkPermission, ROLE_DETAILS } from '../services/rbac';
import { 
  getResendFromEmail, 
  setResendFromEmail, 
  testResendConnection 
} from '../services/emailService';

interface SettingsViewProps {
  settings: AISettings;
  onSaveSettings: (settings: AISettings) => void;
  userRole?: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  userRole = 'Placement Officer'
}) => {
  const canModify = checkPermission(userRole, 'MODIFY_AI_SETTINGS');
  const roleInfo = ROLE_DETAILS[userRole];
  const [skillsWeight, setSkillsWeight] = useState(Math.round(settings.weights.skills * 100));
  const [expWeight, setExpWeight] = useState(Math.round(settings.weights.experience * 100));
  const [eduWeight, setEduWeight] = useState(Math.round(settings.weights.education * 100));
  const [projWeight, setProjWeight] = useState(Math.round(settings.weights.projects * 100));
  const [certWeight, setCertWeight] = useState(Math.round(settings.weights.certifications * 100));

  const [strongThreshold, setStrongThreshold] = useState(settings.thresholds.strong_match);
  const [reviewThreshold, setReviewThreshold] = useState(settings.thresholds.needs_review);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Resend Email Gateway State (Key secured strictly on backend server)
  const [resendFromEmailInput, setResendFromEmailInput] = useState(() => getResendFromEmail());
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [resendTestResult, setResendTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const totalWeight = skillsWeight + expWeight + eduWeight + projWeight + certWeight;

  const handleReset = () => {
    setSkillsWeight(40);
    setExpWeight(25);
    setEduWeight(20);
    setProjWeight(10);
    setCertWeight(5);
    setStrongThreshold(85);
    setReviewThreshold(65);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      alert(`Total weights must equal 100% (currently ${totalWeight}%). Please adjust sliders.`);
      return;
    }

    const updated: AISettings = {
      weights: {
        skills: skillsWeight / 100,
        experience: expWeight / 100,
        education: eduWeight / 100,
        projects: projWeight / 100,
        certifications: certWeight / 100,
      },
      thresholds: {
        strong_match: strongThreshold,
        needs_review: reviewThreshold,
      }
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      
      {/* RBAC Notice Banner */}
      {!canModify ? (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-300">
          <Lock className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-white">
              Governance View-Only Mode ({userRole})
            </span>
            <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
              Institutional AI scoring formula weights and tier classifications can only be recalibrated by <strong>Placement Officers</strong> or <strong>Super Administrators</strong>.
            </p>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-white" />
              Engine Configuration
            </span>
            <span className="text-xs text-zinc-400">
              • AI Scoring Weights & Thresholds
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            AI Algorithm & Placement Settings
          </h1>
          <p className="text-xs text-zinc-400">
            Customize weight distributions for technical skills, practical experience, CGPA standing, and classification tiers
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={!canModify}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-all self-start sm:self-auto disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Scoring Weights Panel */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-white" />
                Multi-Factor AI Scoring Formula Weights
              </h2>
              <p className="text-xs text-zinc-400">
                Formula: (Skills × W₁) + (Experience × W₂) + (Education × W₃) + (Projects × W₄) + (Certifications × W₅)
              </p>
            </div>

            <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
              totalWeight === 100 
                ? 'bg-zinc-900 text-white border-zinc-700' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              Total: {totalWeight}% / 100%
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Skills */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">1. Core Technical Skills Weight</span>
                <span className="text-white font-mono font-bold">{skillsWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={skillsWeight}
                onChange={(e) => setSkillsWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">2. Work Experience & Internships Weight</span>
                <span className="text-white font-mono font-bold">{expWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={expWeight}
                onChange={(e) => setExpWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Education */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">3. Academic Standing (CGPA) Weight</span>
                <span className="text-white font-mono font-bold">{eduWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={eduWeight}
                onChange={(e) => setEduWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Projects */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">4. Applied Projects Portfolio Weight</span>
                <span className="text-white font-mono font-bold">{projWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={projWeight}
                onChange={(e) => setProjWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Certifications */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">5. Certifications & Badges Weight</span>
                <span className="text-white font-mono font-bold">{certWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={certWeight}
                onChange={(e) => setCertWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

          </div>
        </div>

        {/* Match Tier Thresholds */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              Candidate Classification Match Thresholds
            </h2>
            <p className="text-xs text-zinc-400">
              Configure cutoffs for candidate ranking tiers displayed across screening tables
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Strong Match Cutoff (≥)</span>
                <span className="text-white font-mono">{strongThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={strongThreshold}
                onChange={(e) => setStrongThreshold(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <p className="text-[11px] text-zinc-400">
                Candidates scoring ≥ {strongThreshold}% are highlighted for immediate placement shortlisting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Needs Review Cutoff (≥)</span>
                <span className="text-white font-mono">{reviewThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="80"
                value={reviewThreshold}
                onChange={(e) => setReviewThreshold(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <p className="text-[11px] text-zinc-400">
                Candidates scoring {reviewThreshold}% – {strongThreshold - 1}% require manual recruiter inspection.
              </p>
            </div>
          </div>
        </div>

        {/* Resend Email Gateway Integration Panel (Server-Side Proxy) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
          <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-white" />
                Resend Email Gateway (Server-Side Secured)
              </h2>
              <p className="text-xs text-zinc-400">
                Email dispatch runs through a secure backend proxy. Your Resend API key is never exposed to client browsers.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-white" />
              Backend Encrypted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                <Lock className="w-4 h-4 text-white" />
                <span>API Key Security Protocol</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your secret key is loaded securely via server environment (<code className="text-white font-mono">RESEND_API_KEY</code> in <code className="text-zinc-300">.env</code>) and handled strictly by the Node.js backend.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-white"></span>
                <span className="text-[11px] text-zinc-300 font-medium">No API key leakage in browser JS bundle</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Default Sender Address (From)
              </label>
              <input
                type="text"
                value={resendFromEmailInput}
                onChange={(e) => {
                  setResendFromEmailInput(e.target.value);
                  setResendFromEmail(e.target.value);
                }}
                placeholder="SRM Placement <onboarding@resend.dev>"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-white transition-colors"
              />
              <p className="text-[11px] text-zinc-500">
                Default: <code className="text-white font-mono">onboarding@resend.dev</code> (or verified domain).
              </p>
            </div>
          </div>

          {/* Test Resend Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-zinc-800/80">
            <div className="text-xs">
              {resendTestResult && (
                <div className={`flex items-center gap-1.5 font-medium ${
                  resendTestResult.success ? 'text-white' : 'text-zinc-400'
                }`}>
                  {resendTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0 text-zinc-400" />
                  )}
                  <span>{resendTestResult.message}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isTestingResend}
              onClick={async () => {
                setIsTestingResend(true);
                setResendTestResult(null);
                const res = await testResendConnection();
                setIsTestingResend(false);
                if (res.success) {
                  setResendTestResult({
                    success: true,
                    message: `Backend Resend gateway verified! Dispatch ID: ${res.messageId}`
                  });
                } else {
                  setResendTestResult({
                    success: false,
                    message: res.error || 'Connection failed. Check RESEND_API_KEY in .env.'
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all disabled:opacity-40"
            >
              {isTestingResend ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing Backend Gateway...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Verify Server Gateway</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Institutional Demo Data Controls */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-white" /> Demo Dataset Configuration
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Minimal Baseline (3 Drives, 3 Candidates)</span>
          </div>
          <p className="text-xs text-zinc-400">
            Reset any cached browser test data back to the clean, uncluttered baseline dataset.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset demo data to clean baseline (3 recruitment drives & 3 candidates)?')) {
                  localStorage.removeItem('srm_data_version');
                  localStorage.removeItem('srm_jobs_list');
                  localStorage.removeItem('srm_candidates_list');
                  localStorage.removeItem('srm_interviews_list');
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 hover:text-white font-mono flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Reset Clean Demo Data</span>
            </button>
          </div>
        </div>

        {/* Responsible AI & Institutional Privacy Safeguards */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white" /> Responsible AI & Fairness Safeguards
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-black border border-zinc-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Demographic Blind Evaluation:</strong> Scoring strictly ignores gender, photograph, religion, and non-job demographic parameters.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black border border-zinc-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Human Decision Authority:</strong> AI acts solely as an explainable decision-support assistant. Final interview calls remain with human officers.
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-white flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
          {!canModify && (
            <span className="text-xs text-zinc-500 font-medium">
              🔒 Changes disabled for {userRole}
            </span>
          )}
          <button
            type="submit"
            disabled={!canModify}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{canModify ? 'Apply & Save AI Weights' : 'Save Restricted'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
