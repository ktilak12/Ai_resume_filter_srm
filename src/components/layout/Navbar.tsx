import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown, ShieldCheck, LogIn } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, setUserRole, toggleSidebar }) => {
  const { currentUser, isAuthenticated, logout, switchRole } = useAuth();
  
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
              <button className="flex items-center space-x-2 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{currentUser?.role || userRole}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
              
              <div className="absolute right-0 mt-2 w-52 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-1.5 hidden group-hover:block transition-all z-50">
                <div className="px-3 py-1.5 border-b border-slate-700/80 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Switch Role Perspective
                  </span>
                </div>
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`block w-full text-left px-3.5 py-1.5 text-xs transition-colors ${
                      (currentUser?.role || userRole) === role 
                        ? 'bg-srm-900 text-srm-200 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-700/80 hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="p-2 text-slate-400 hover:text-slate-100 relative rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-srm-500">
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-amber-500 ring-2 ring-slate-900"></span>
            <Bell className="h-5 w-5" />
          </button>

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
                </div>

                <div className="border-t border-slate-800 my-1"></div>

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
    </>
  );
};

export default Navbar;
