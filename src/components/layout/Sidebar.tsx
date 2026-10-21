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
  UserCheck,
  Calendar,
  Home,
  GraduationCap
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
      name: 'Candidate Portal', 
      icon: GraduationCap, 
      path: '/student-portal', 
      roles: ['Placement Officer', 'Faculty Coordinator', 'Corporate Recruiter', 'Super Admin', 'Student Coordinator'] 
    },
    { 
      name: 'Resume Upload & ATS', 
      icon: UploadCloud, 
      path: '/upload', 
      roles: ['Placement Officer', 'Faculty Coordinator', 'Corporate Recruiter', 'Super Admin', 'Student Coordinator'] 
    },
    { 
      name: 'AI Screening Roster', 
      icon: FileText, 
      path: '/screening', 
      roles: ['Placement Officer', 'Super Admin', 'Faculty Coordinator', 'Corporate Recruiter', 'Student Coordinator'] 
    },
    { 
      name: 'Student Directory', 
      icon: Users, 
      path: '/candidates', 
      roles: ['Placement Officer', 'Super Admin', 'Faculty Coordinator', 'Corporate Recruiter', 'Student Coordinator'] 
    },
    { 
      name: 'Shortlisted Candidates', 
      icon: UserCheck, 
      path: '/shortlisted', 
      roles: ['Placement Officer', 'Super Admin', 'Faculty Coordinator', 'Corporate Recruiter'] 
    },
    { 
      name: 'Interview Operations', 
      icon: Calendar, 
      path: '/interviews', 
      roles: ['Placement Officer', 'Super Admin', 'Faculty Coordinator', 'Corporate Recruiter'] 
    },
    { 
      name: 'Placement Drives', 
      icon: Briefcase, 
      path: '/jobs', 
      roles: ['Placement Officer', 'Corporate Recruiter', 'Super Admin', 'Faculty Coordinator', 'Student Coordinator'] 
    },
    { 
      name: 'Analytics & Reports', 
      icon: BarChart3, 
      path: '/analytics', 
      roles: ['Placement Officer', 'Super Admin', 'Faculty Coordinator', 'Corporate Recruiter'] 
    },
    { 
      name: 'Platform Settings', 
      icon: Settings, 
      path: '/settings', 
      roles: ['Super Admin', 'Placement Officer'] 
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(effectiveRole));

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-850 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center px-6 border-b border-zinc-850">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-base font-bold shadow-sm">
            🎓
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight font-sans">
              SRM <span className="text-zinc-400">ResumeAI</span>
            </span>
            <span className="block text-[10px] text-zinc-500 -mt-1 font-mono uppercase">Institutional</span>
          </div>
        </Link>
      </div>
      
      <div className="py-4">
        <div className="px-6 mb-2 flex items-center justify-between">
          <p className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
            Portal Menu
          </p>
          <Link to="/" className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
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
                  `flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
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
      
      <div className="absolute bottom-0 w-full p-4 border-t border-zinc-850 space-y-2">
        <div className="bg-black rounded-lg p-3 border border-zinc-850">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <p className="text-[11px] font-medium text-white truncate">
              {currentUser?.name || 'SRMIST User'}
            </p>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono truncate">
            {currentUser?.email || 'srmist.edu.in'}
          </p>
        </div>
        <div className="px-1 text-center">
          <Link
            to="/privacy"
            className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono inline-flex items-center gap-1 transition-colors"
          >
            <span>🔒 DPDP Privacy Policy</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
