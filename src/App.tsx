import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import { JobListing } from './pages/JobListing';
import { ResumeUpload } from './pages/ResumeUpload';
import { Analytics } from './pages/Analytics';
import { 
  CandidateRanking, 
  CandidateDetail, 
  Settings 
} from './pages/placeholders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<JobListing />} />
          <Route path="upload" element={<ResumeUpload />} />
          <Route path="screening" element={<CandidateRanking />} />
          <Route path="candidates" element={<CandidateRanking />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
