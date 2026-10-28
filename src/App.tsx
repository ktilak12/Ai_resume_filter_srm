import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Lazy-loaded page components for route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudentPortalPage = lazy(() => import('./pages/StudentPortalPage').then(m => ({ default: m.StudentPortalPage })));
const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage').then(m => ({ default: m.ResumeBuilderPage })));
const JobListing = lazy(() => import('./pages/JobListing').then(m => ({ default: m.JobListing })));
const ResumeUpload = lazy(() => import('./pages/ResumeUpload').then(m => ({ default: m.ResumeUpload })));
const CandidateRanking = lazy(() => import('./pages/CandidateRanking').then(m => ({ default: m.CandidateRanking })));
const CandidateDetail = lazy(() => import('./pages/CandidateDetail').then(m => ({ default: m.CandidateDetail })));
const ShortlistedPage = lazy(() => import('./pages/ShortlistedPage').then(m => ({ default: m.ShortlistedPage })));
const InterviewsPage = lazy(() => import('./pages/InterviewsPage').then(m => ({ default: m.InterviewsPage })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-zinc-800 animate-pulse" />
      <div className="absolute inset-0 rounded-full border-2 border-t-white border-transparent animate-spin" />
    </div>
    <div className="text-zinc-500 font-mono text-xs tracking-wider uppercase">
      Loading SRM ResumeAI...
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Route 1: Always opens to the Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Route 2: Standard Portal Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Public Route 3: DPDP Compliant Privacy Policy */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* Protected Portal Routes: No one can access without logging in */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student-portal" element={<StudentPortalPage />} />
              <Route path="/resume-builder" element={<ResumeBuilderPage />} />
              <Route path="/jobs" element={<JobListing />} />
              <Route path="/upload" element={<ResumeUpload />} />
              <Route path="/screening" element={<CandidateRanking />} />
              <Route path="/candidates" element={<CandidateRanking />} />
              <Route path="/candidates/:id" element={<CandidateDetail />} />

              {/* Administrative Protected Routes: Restricted to Faculty Coordinator and Super Admin */}
              <Route path="/shortlisted" element={
                <ProtectedRoute allowedRoles={['Faculty Coordinator', 'Super Admin']}>
                  <ShortlistedPage />
                </ProtectedRoute>
              } />
              <Route path="/interviews" element={
                <ProtectedRoute allowedRoles={['Faculty Coordinator', 'Super Admin']}>
                  <InterviewsPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['Faculty Coordinator', 'Super Admin']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['Faculty Coordinator', 'Super Admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch-all fallback: Return to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
