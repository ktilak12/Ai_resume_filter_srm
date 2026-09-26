import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import { JobListing } from './pages/JobListing';
import { ResumeUpload } from './pages/ResumeUpload';
import { CandidateRanking } from './pages/CandidateRanking';
import { CandidateDetail } from './pages/CandidateDetail';
import { ShortlistedPage } from './pages/ShortlistedPage';
import { InterviewsPage } from './pages/InterviewsPage';
import { Analytics } from './pages/Analytics';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route 1: Always opens to the Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Route 2: Standard Portal Login Page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Portal Routes: No one can access without logging in */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobListing />} />
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/screening" element={<CandidateRanking />} />
            <Route path="/candidates" element={<CandidateRanking />} />
            <Route path="/shortlisted" element={<ShortlistedPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/candidates/:id" element={<CandidateDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all fallback: Return to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
