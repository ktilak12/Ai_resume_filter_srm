import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Settings, 
  UploadCloud,
  FileText,
  Home
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, userRole }) => {
  const { currentUser } = useAuth();
  const effectiveRole = currentUser?.role || userRole;

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard', 
      roles: ['Placement Officer', 'Faculty Coordinator', 'Corporate Recruiter', 'Super Admin', 'Student Coordinator'] 
    },
    { 
      name: 'Job Requirements', 
      icon: Briefcase, 
      path: '/jobs', 
      roles: ['Placement Officer', 'Corporate Recruiter', 'Super Admin', 'Faculty Coordinator', 'Student Coordinator'] 
    },
    { 
      name: 'Resume Upload', 
      icon: UploadCloud, 
      path: '/upload', 
      roles: ['Placement Officer', 'Faculty Coordinator', 'Super Admin', 'Student Coordinator'] 
    },
    { 
      name: 'AI Screening', 
      icon: FileText, 
      path: '/screening', 
      roles: ['Placement Officer', 'Super Admin', 'Faculty Coordinator'] 
    },
    { 
      name: 'Candidates', 
      icon: Users, 
      path: '/candidates', 
      roles: ['Placement Officer', 'Faculty Coordinator', 'Corporate Recruiter', 'Super Admin', 'Student Coordinator'] 
    },
    { 
      name: 'Analytics', 
      icon: BarChart3, 
      path: '/analytics', 
      roles: ['Placement Officer', 'Super Admin', 'Faculty Coordinator'] 
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/settings', 
      roles: ['Super Admin', 'Placement Officer'] 
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(effectiveRole));

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-srm-600 flex items-center justify-center text-white text-lg shadow-sm">
            🎓
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight font-display">
              SRM<span className="text-srm-400">ResumeAI</span>
            </span>
            <span className="block text-[10px] text-slate-400 -mt-1 font-mono">Institutional Edition</span>
          </div>
        </Link>
      </div>
      
      <div className="py-4">
        <div className="px-6 mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Portal Menu
          </p>
          <Link to="/" className="text-[10px] text-srm-400 hover:underline flex items-center gap-1">
            <Home className="w-3 h-3" />
            <span>Landing</span>
          </Link>
        </div>
        <nav className="space-y-1 px-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all group ${
                    isActive
                      ? 'bg-srm-900/60 text-srm-300 font-semibold shadow-sm border border-srm-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800/80">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <p className="text-[11px] font-medium text-slate-300">
              {currentUser?.name || 'SRMIST User'}
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            {currentUser?.email || 'srmist.edu.in'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
