import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  BarChart3, 
  Settings, 
  UploadCloud,
  FileText
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, userRole }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['Placement Officer', 'Faculty Coordinator', 'Super Admin'] },
    { name: 'Job Requirements', icon: Briefcase, path: '/jobs', roles: ['Placement Officer', 'Corporate Recruiter', 'Super Admin'] },
    { name: 'Resume Upload', icon: UploadCloud, path: '/upload', roles: ['Placement Officer', 'Faculty Coordinator'] },
    { name: 'AI Screening', icon: FileText, path: '/screening', roles: ['Placement Officer', 'Super Admin'] },
    { name: 'Candidates', icon: Users, path: '/candidates', roles: ['Placement Officer', 'Faculty Coordinator', 'Corporate Recruiter'] },
    { name: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['Placement Officer', 'Super Admin'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['Super Admin', 'Placement Officer'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎓</span>
          <span className="text-white font-bold text-xl tracking-tight">SRM<span className="text-srm-500">ResumeAI</span></span>
        </div>
      </div>
      
      <div className="py-4">
        <div className="px-6 mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </p>
        </div>
        <nav className="space-y-1 px-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-srm-900/50 text-srm-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-xs text-slate-400 text-center">
            SRM Institute of Science and Technology <br/>
            Placement Cell © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
