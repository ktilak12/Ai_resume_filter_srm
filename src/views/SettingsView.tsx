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
  Lock
} from 'lucide-react';
import { AISettings } from '../types';
import { DEFAULT_AI_SETTINGS } from '../services/aiScreeningEngine';

interface SettingsViewProps {
  settings: AISettings;
  onSaveSettings: (settings: AISettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings
}) => {
  const [skillsWeight, setSkillsWeight] = useState(Math.round(settings.weights.skills * 100));
  const [expWeight, setExpWeight] = useState(Math.round(settings.weights.experience * 100));
  const [eduWeight, setEduWeight] = useState(Math.round(settings.weights.education * 100));
  const [projWeight, setProjWeight] = useState(Math.round(settings.weights.projects * 100));
  const [certWeight, setCertWeight] = useState(Math.round(settings.weights.certifications * 100));

  const [strongThreshold, setStrongThreshold] = useState(settings.thresholds.strong_match);
  const [reviewThreshold, setReviewThreshold] = useState(settings.thresholds.needs_review);

  const [savedSuccess, setSavedSuccess] = useState(false);

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
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-srm-500/20 text-srm-300 border border-srm-500/30 flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              Engine Configuration
            </span>
            <span className="text-xs text-slate-400">
              • AI Scoring Weights & Thresholds
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            AI Algorithm & Placement Settings
          </h1>
          <p className="text-xs text-slate-300">
            Customize weight distributions for technical skills, practical experience, CGPA standing, and classification tiers
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Scoring Weights Panel */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-srm-400" />
                Multi-Factor AI Scoring Formula Weights
              </h2>
              <p className="text-xs text-slate-400">
                Formula: (Skills × W₁) + (Experience × W₂) + (Education × W₃) + (Projects × W₄) + (Certifications × W₅)
              </p>
            </div>

            <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              totalWeight === 100 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
              Total: {totalWeight}% / 100%
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Skills */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">1. Core Technical Skills Weight</span>
                <span className="text-srm-400 font-bold">{skillsWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                value={skillsWeight}
                onChange={(e) => setSkillsWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-srm-500"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">2. Work Experience & Internships Weight</span>
                <span className="text-amber-400 font-bold">{expWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={expWeight}
                onChange={(e) => setExpWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Education */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">3. Academic Standing (CGPA) Weight</span>
                <span className="text-emerald-400 font-bold">{eduWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={eduWeight}
                onChange={(e) => setEduWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Projects */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">4. Applied Projects Portfolio Weight</span>
                <span className="text-purple-400 font-bold">{projWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={projWeight}
                onChange={(e) => setProjWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Certifications */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">5. Certifications & Badges Weight</span>
                <span className="text-cyan-400 font-bold">{certWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={certWeight}
                onChange={(e) => setCertWeight(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

          </div>
        </div>

        {/* Match Tier Thresholds */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Candidate Classification Match Thresholds
            </h2>
            <p className="text-xs text-slate-400">
              Configure cutoffs for candidate ranking tiers displayed across screening tables
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">🟢 Strong Match Cutoff (≥)</span>
                <span className="text-white">{strongThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={strongThreshold}
                onChange={(e) => setStrongThreshold(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Candidates scoring ≥ {strongThreshold}% are highlighted for immediate placement shortlisting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-400">🟡 Needs Review Cutoff (≥)</span>
                <span className="text-white">{reviewThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="80"
                value={reviewThreshold}
                onChange={(e) => setReviewThreshold(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-400">
                Candidates scoring {reviewThreshold}% – {strongThreshold - 1}% require manual recruiter inspection.
              </p>
            </div>
          </div>
        </div>

        {/* Responsible AI & Institutional Privacy Safeguards */}
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Responsible AI & Fairness Safeguards
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-srm-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Demographic Blind Evaluation:</strong> Scoring strictly ignores gender, photograph, religion, and non-job demographic parameters.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Human Decision Authority:</strong> AI acts solely as an explainable decision-support assistant. Final interview calls remain with human officers.
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white text-xs font-bold shadow-glow-srm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Apply & Save AI Weights</span>
          </button>
        </div>

      </form>

    </div>
  );
};
