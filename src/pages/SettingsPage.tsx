import React, { useState } from 'react';
import { SettingsView } from '../views/SettingsView';
import { AISettings } from '../types';
import { DEFAULT_AI_SETTINGS } from '../services/aiScreeningEngine';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('srm_ai_settings');
    return saved ? JSON.parse(saved) : DEFAULT_AI_SETTINGS;
  });

  const handleSaveSettings = (newSettings: AISettings) => {
    setSettings(newSettings);
    localStorage.setItem('srm_ai_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="space-y-8">
      <SEO
        title="Institutional Settings & AI Governance | SRM ResumeAI"
        description="Configure SRM placement screening weights, tier thresholds, and algorithmic fairness parameters."
        canonical="/settings"
        noIndex={true}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            Institutional Settings & AI Governance
          </h1>
          <p className="text-zinc-400 mt-1">
            Configure SRM placement screening weights, tier thresholds, and institutional bias safeguards.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span className="text-zinc-400">Authorized Domain:</span>
          <span className="font-mono text-white font-semibold">@srmist.edu.in</span>
        </div>
      </div>

      {/* Institutional AI Scoring & Weights Settings */}
      <SettingsView
        settings={settings}
        onSaveSettings={handleSaveSettings}
        userRole={currentUser?.role}
      />
    </div>
  );
};
