import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown, ShieldCheck, LogIn } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from '../NotificationCenter';
import { UserProfileModal } from '../UserProfileModal';

interface NavbarProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, setUserRole, toggleSidebar }) => {
  const { currentUser, isAuthenticated, logout, switchRole } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const roles: UserRole[] = [
    'Placement Officer', 
    'Faculty Coordinator', 
    'Corporate Recruiter', 
    'Super Admin', 
    'Student Coordinator'
  ];

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    switchRole(role);
  };

  // User initials
  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SRM';

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 h-16 w-full flex items-center px-4 sm:px-6 shadow-sm">
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-srm-500 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="flex-1 flex items-center justify-start">
          <div className="max-w-md w-full relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:ring-1 focus:ring-srm-500 focus:border-srm-500 sm:text-sm transition-colors duration-200"
              placeholder="Search candidates, jobs, or departments..."
              type="search"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {isAuthenticated && (
            /* Role Selector */
            <div className="relative group hidden sm:block">
              <button className="flex items-center space-x-2 text-xs font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700/80 transition-all shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold">{currentUser?.role || userRole}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 py-2 hidden group-hover:block transition-all z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-800 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-srm-400" />
                      Role-Based Access
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">RBAC v1.0</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select a persona to test actions &amp; access restrictions in real-time
                  </p>
                </div>

                <div className="space-y-1 px-1.5">
                  {roles.map(role => {
                    const isSelected = (currentUser?.role || userRole) === role;
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex flex-col gap-0.5 ${
                          isSelected 
                            ? 'bg-srm-950/80 border border-srm-500/40 text-srm-200 font-semibold' 
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{role}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-srm-500/20 text-srm-300 px-1.5 py-0.2 rounded-full border border-srm-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 line-clamp-1 font-normal">
                          {role === 'Super Admin' && 'Full system & AI settings control'}
                          {role === 'Placement Officer' && 'Drives, screening, shortlisting & emails'}
                          {role === 'Corporate Recruiter' && 'Screening & interviews (read-only AI weights)'}
                          {role === 'Faculty Coordinator' && 'Department batch upload & analytics'}
                          {role === 'Student Coordinator' && 'ATS resume scoring & drive exploration'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Center */}
          <NotificationCenter />

          {isAuthenticated ? (
            /* Profile Dropdown */
            <div className="relative group flex items-center">
              <button className="flex items-center gap-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-srm-500 transition-all">
                {currentUser?.picture ? (
                  <img 
                    src={currentUser.picture} 
                    alt={currentUser.name} 
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-srm-500/50" 
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-srm-600 to-srm-400 flex items-center justify-center text-white font-bold shadow-sm text-xs">
                    {initials}
                  </div>
                )}
              </button>
              
              <div className="absolute right-0 top-10 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 hidden group-hover:block transition-all z-50">
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {currentUser?.name || 'SRMIST User'}
                    </p>
                    {currentUser?.isInstitutionalVerified && (
                      <span title="Institutional SRM Account Verified">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-400 font-mono truncate mt-0.5">
                    {currentUser?.email || 'user@srmist.edu.in'}
                  </p>
                  {currentUser?.department && (
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {currentUser.department}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  <div className="px-4 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Active Role:</span>
                    <span className="font-semibold text-srm-400">{currentUser?.role || userRole}</span>
                  </div>
                  {currentUser?.campus && (
                    <div className="px-4 py-1 text-[10px] text-slate-500">
                      {currentUser.campus}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 my-1"></div>

                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex w-full items-center px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                >
                  <User className="mr-3 h-4 w-4 text-srm-400" /> Edit Profile &amp; Role Details
                </button>

                <button 
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2.5 text-xs text-red-400 hover:bg-slate-800/80 hover:text-red-300 transition-colors font-medium"
                >
                  <LogOut className="mr-3 h-4 w-4" /> Sign out of SRMIST Portal
                </button>
              </div>
            </div>
          ) : (
            /* Sign In Button for unauthenticated visitor */
            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In (@srmist.edu.in)</span>
            </Link>
          )}
          
        </div>
      </nav>

      {/* Manual Profile Editor Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        isMandatoryOnboarding={false}
      />
    </>
  );
};

export default Navbar;
