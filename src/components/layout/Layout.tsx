import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

const Layout: React.FC = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(currentUser?.role || 'Placement Officer');

  useEffect(() => {
    if (currentUser?.role) {
      setUserRole(currentUser.role);
    }
  }, [currentUser?.role]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-100">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} userRole={userRole} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          userRole={userRole} 
          setUserRole={setUserRole} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet context={{ userRole }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
