import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking local session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center animate-pulse">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-white font-display">SRM ResumeAI</h2>
            <p className="text-xs text-zinc-500 font-mono">Verifying Institutional Session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Security Gate: If not authenticated with verified @srmist.edu.in account, redirect directly to /login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
