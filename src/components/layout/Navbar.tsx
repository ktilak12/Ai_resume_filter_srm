import React from 'react';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, setUserRole, toggleSidebar }) => {
  const roles: UserRole[] = ['Placement Officer', 'Faculty Coordinator', 'Corporate Recruiter', 'Super Admin'];

  return (
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
      <div className="flex items-center space-x-3 sm:space-x-5">
        
        {/* Role Selector (Demo purpose) */}
        <div className="relative group hidden sm:block">
          <button className="flex items-center space-x-1 text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-md border border-slate-700 bg-slate-800 transition-colors">
            <span>{userRole}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg border border-slate-700 py-1 hidden group-hover:block transition-all z-50">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setUserRole(role)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  userRole === role ? 'bg-srm-900 text-srm-200 font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-100 relative rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-srm-500">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900"></span>
          <Bell className="h-6 w-6" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative group flex items-center">
          <button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-srm-500 transition-all">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-srm-600 to-srm-400 flex items-center justify-center text-white font-bold shadow-sm">
              PO
            </div>
          </button>
          
          <div className="absolute right-0 top-10 mt-2 w-56 bg-slate-800 rounded-md shadow-lg border border-slate-700 py-1 hidden group-hover:block transition-all z-50">
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-white">Prof. Rajesh Kumar</p>
              <p className="text-xs text-slate-400 truncate">rajesh.k@srmist.edu.in</p>
            </div>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
              <User className="mr-3 h-4 w-4" /> Your Profile
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">
              <Settings className="mr-3 h-4 w-4" /> Settings
            </a>
            <div className="border-t border-slate-700 my-1"></div>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300">
              <LogOut className="mr-3 h-4 w-4" /> Sign out
            </a>
          </div>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
