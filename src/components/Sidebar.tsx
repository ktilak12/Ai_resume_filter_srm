import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Users, 
  Sparkles, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  BarChart3, 
  Sliders, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'upload' 
  | 'candidates' 
  | 'screening' 
  | 'shortlisted' 
  | 'interviews' 
  | 'jobs' 
  | 'analytics' 
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  shortlistedCount: number;
  interviewsCount: number;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  shortlistedCount,
  interviewsCount
}) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'RECRUITMENT',
      items: [
        { id: 'upload' as NavTab, label: 'Upload Resumes', icon: UploadCloud, badge: 'New' },
        { id: 'candidates' as NavTab, label: 'All Candidates', icon: Users },
        { id: 'screening' as NavTab, label: 'AI Screening Hub', icon: Sparkles, highlight: true },
        { id: 'shortlisted' as NavTab, label: 'Shortlisted', icon: UserCheck, count: shortlistedCount },
        { id: 'interviews' as NavTab, label: 'Interviews', icon: Calendar, count: interviewsCount }
      ]
    },
    {
      title: 'JOBS',
      items: [
        { id: 'jobs' as NavTab, label: 'Job Requirements', icon: Briefcase }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'analytics' as NavTab, label: 'Reports & Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings' as NavTab, label: 'AI Weights & Settings', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-srm-600/30 to-srm-500/10 text-srm-300 border border-srm-500/30 shadow-glow-srm'
                        : item.highlight
                        ? 'text-amber-300 hover:bg-slate-900 hover:text-amber-200'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive 
                          ? 'text-srm-400' 
                          : item.highlight 
                          ? 'text-amber-400' 
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-srm-500/20 text-srm-300 border border-srm-500/30">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.count}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-srm-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer SRM Placement Shield Card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-srm-950/60 border border-srm-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Institutional Safeguard</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            AI recommends and ranks candidates. Final shortlisting remains with human recruiters.
          </p>
        </div>
      </div>
    </aside>
  );
};
