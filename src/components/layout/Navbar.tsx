import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  LogIn,
  Check
} from 'lucide-react';
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
  const navigate = useNavigate();
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [navSearchQuery, setNavSearchQuery] = useState('');

  const handleNavSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && navSearchQuery.trim()) {
      navigate('/screening', { state: { searchTerm: navSearchQuery.trim() } });
    }
  };

  const roles: UserRole[] = [
    'Placement Officer', 
    'Faculty Coordinator', 
    'Corporate Recruiter', 
    'Super Admin', 
    'Student Coordinator'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    switchRole(role);
    setIsRoleDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
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

  const activeRoleDisplay = currentUser?.role || userRole;

  return (
    <>
      <nav className="bg-zinc-950 border-b border-zinc-850 sticky top-0 z-40 h-16 w-full flex items-center px-4 sm:px-6 shadow-sm">
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1 flex items-center justify-start">
          <div className="max-w-md w-full relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              className="block w-full pl-9 pr-3 py-1.5 border border-zinc-800 rounded-lg leading-5 bg-black text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-xs transition-colors"
              placeholder="Search candidates, drives, or departments... (Press Enter)"
              type="search"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              onKeyDown={handleNavSearch}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {isAuthenticated && (
            /* Controlled Role Selector Dropdown */
            <div className="relative" ref={roleMenuRef}>
              <button 
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-2 text-xs font-mono text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 transition-all focus:outline-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="font-semibold">{activeRoleDisplay}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>
              
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-zinc-950 rounded-xl shadow-2xl border border-zinc-800 py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3.5 py-2 border-b border-zinc-850 mb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        Role Access
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">RBAC</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Switch active role profile
                    </p>
                  </div>

                  <div className="space-y-1 px-1.5">
                    {roles.map(role => {
                      const isSelected = activeRoleDisplay === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleSelect(role)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex flex-col gap-0.5 ${
                            isSelected 
                              ? 'bg-white text-black font-semibold' 
                              : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                              <span>{role}</span>
                            </span>
                            {isSelected && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/10 text-black font-semibold">
                                Active
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] line-clamp-1 font-normal ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
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
              )}
            </div>
          )}

          {/* Notifications Center */}
          <NotificationCenter />

          {isAuthenticated ? (
            /* Controlled Profile Dropdown */
            <div className="relative flex items-center" ref={profileMenuRef}>
              <button 
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 text-sm rounded-full focus:outline-none transition-all"
              >
                {currentUser?.picture ? (
                  <img 
                    src={currentUser.picture} 
                    alt={currentUser.name} 
                    className="h-8 w-8 rounded-full object-cover border border-zinc-700" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-mono font-bold text-xs">
                    {initials}
                  </div>
                )}
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-10 mt-1 w-64 bg-zinc-950 rounded-xl shadow-2xl border border-zinc-800 py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-3 border-b border-zinc-850">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">
                        {currentUser?.name || 'SRMIST User'}
                      </p>
                      {currentUser?.isInstitutionalVerified && (
                        <span title="Institutional SRM Account Verified">
                          <ShieldCheck className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">
                      {currentUser?.email || 'user@srmist.edu.in'}
                    </p>
                    {currentUser?.department && (
                      <p className="text-[11px] text-zinc-500 truncate mt-1">
                        {currentUser.department}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <div className="px-4 py-1.5 text-[11px] text-zinc-400 flex items-center justify-between">
                      <span>Active Role:</span>
                      <span className="font-semibold text-white">{activeRoleDisplay}</span>
                    </div>
                    {currentUser?.campus && (
                      <div className="px-4 py-1 text-[10px] text-zinc-500">
                        {currentUser.campus}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-zinc-850 my-1"></div>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex w-full items-center px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                  >
                    <User className="mr-3 h-3.5 w-3.5 text-zinc-400" /> Edit Profile &amp; Role Details
                  </button>

                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2.5 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors font-medium"
                  >
                    <LogOut className="mr-3 h-3.5 w-3.5" /> Sign out of SRMIST Portal
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Sign In Button for unauthenticated visitor */
            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
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
