import React, { useState } from 'react';
import { SettingsView } from '../views/SettingsView';
import { AISettings } from '../types';
import { DEFAULT_AI_SETTINGS } from '../services/aiScreeningEngine';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            Institutional Settings & AI Governance
          </h1>
          <p className="text-slate-400 mt-1">
            Configure SRM placement screening weights, tier thresholds, and institutional bias safeguards.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Authorized Domain:</span>
          <span className="font-mono text-amber-400 font-semibold">@srmist.edu.in</span>
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
