import React from 'react';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  PlusCircle, 
  Building2, 
  UserCheck, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewJobModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenNewJobModal,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-srm-700 via-srm-500 to-amber-500 p-0.5 shadow-glow-srm">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-srm-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display tracking-tight text-white flex items-center">
                SRM <span className="text-srm-400 ml-1">ResumeAI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-srm-950 border border-srm-500/30 text-srm-300">
                Institutional Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Directorate of Career Centre • SRMIST Kattankulathur
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate by name, reg no (RA...), skill, or job..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-srm-500 focus:ring-1 focus:ring-srm-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions & User Role */}
        <div className="flex items-center gap-3">
          
          {/* Season Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Season: <strong className="text-white">2026–27</strong></span>
          </div>

          {/* New Job Button */}
          <button
            onClick={onOpenNewJobModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white text-xs sm:text-sm font-semibold shadow-glow-srm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">+ New Job</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>
          </div>

          {/* Role Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 hover:border-slate-600 transition-all">
              <div className="w-6 h-6 rounded-lg bg-srm-600/30 border border-srm-500/40 flex items-center justify-center text-srm-400 font-bold text-[11px]">
                {currentRole.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 leading-none">Logged as</div>
                <div className="font-semibold text-slate-200 text-xs">{currentRole}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Dropdown */}
            <div className="absolute right-0 mt-2 w-52 glass-dropdown rounded-xl p-1.5 hidden group-hover:block group-focus-within:block shadow-xl z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Active Role
              </div>
              {(['Placement Officer', 'Faculty Coordinator', 'Corporate Recruiter', 'Super Admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    currentRole === role 
                      ? 'bg-srm-600/30 text-srm-300 font-medium' 
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{role}</span>
                  {currentRole === role && <UserCheck className="w-3.5 h-3.5 text-srm-400" />}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
