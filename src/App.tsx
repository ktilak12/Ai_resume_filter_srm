import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  JobRequirement, 
  CandidateProfile, 
  ScreeningResult, 
  Interview, 
  AISettings, 
  UserRole 
} from './types';
import { INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_INTERVIEWS } from './data/srmDataset';
import { DEFAULT_AI_SETTINGS, screenCandidate, rankScreeningResults } from './services/aiScreeningEngine';

// Components & Views
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ResumeUploadView } from './views/ResumeUploadView';
import { ScreeningView } from './views/ScreeningView';
import { ShortlistedView } from './views/ShortlistedView';
import { InterviewManagementView } from './views/InterviewManagementView';
import { JobsManagementView } from './views/JobsManagementView';
import { AllCandidatesView } from './views/AllCandidatesView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

import { JobCreationModal } from './views/JobCreationModal';
import { CandidateDetailModal } from './views/CandidateDetailModal';

export function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Placement Officer');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Core Data State
  const [jobs, setJobs] = useState<JobRequirement[]>(INITIAL_JOBS);
  const [candidates, setCandidates] = useState<CandidateProfile[]>(INITIAL_CANDIDATES);
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [selectedJobId, setSelectedJobId] = useState<string>(INITIAL_JOBS[0].id);

  // Screening Results State
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);

  // Modals State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<ScreeningResult | null>(null);

  // Re-calculate screening results when candidates, jobs, or aiSettings change
  useEffect(() => {
    const allResults: ScreeningResult[] = [];

    jobs.forEach(job => {
      const jobResults = candidates.map(cand => screenCandidate(cand, job, aiSettings));
      const ranked = rankScreeningResults(jobResults);
      allResults.push(...ranked);
    });

    setScreeningResults(allResults);
  }, [jobs, candidates, aiSettings]);

  // Handler: Open Candidate Detail
  const handleOpenCandidateDetail = (result: ScreeningResult) => {
    setSelectedCandidateDetail(result);
  };

  // Handler: Shortlist Single Candidate
  const handleShortlistCandidate = (resultId: string) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });

    setScreeningResults(prev => prev.map(res => 
      res.id === resultId ? { ...res, status: 'Shortlisted' } : res
    ));

    // Update job shortlisted count
    const target = screeningResults.find(r => r.id === resultId);
    if (target) {
      setJobs(prev => prev.map(j => 
        j.id === target.job_id ? { ...j, shortlisted_count: (j.shortlisted_count || 0) + 1 } : j
      ));
    }
  };

  // Handler: Bulk Shortlist
  const handleBulkShortlist = (resultIds: string[]) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 }
    });

    setScreeningResults(prev => prev.map(res => 
      resultIds.includes(res.id) ? { ...res, status: 'Shortlisted' } : res
    ));
  };

  // Handler: Remove from shortlist
  const handleRemoveFromShortlist = (resultId: string) => {
    setScreeningResults(prev => prev.map(res => 
      res.id === resultId ? { ...res, status: 'AI Screened' } : res
    ));
  };

  // Handler: Schedule Interview from Screening / Shortlist
  const handleScheduleInterview = (result: ScreeningResult) => {
    const targetJob = jobs.find(j => j.id === result.job_id) || jobs[0];

    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      candidate_id: result.candidate.id,
      candidate_name: result.candidate.name,
      candidate_reg_no: result.candidate.reg_number,
      candidate_email: result.candidate.email,
      candidate_dept: result.candidate.education.department,
      job_id: targetJob.id,
      job_title: targetJob.title,
      company: targetJob.company,
      round: 'Technical Round 1',
      date: '2026-09-18',
      time: '11:30 AM',
      interviewer: 'SRM Placement Technical Panel',
      venue: 'SRM Placement Cell - Suite 304',
      status: 'Scheduled',
      created_at: new Date().toISOString()
    };

    setInterviews(prev => [newInterview, ...prev]);
    
    // Update candidate status
    setScreeningResults(prev => prev.map(res => 
      res.id === result.id ? { ...res, status: 'Interview Scheduled' } : res
    ));

    setActiveTab('interviews');
  };

  // Handler: Update Interview Status
  const handleUpdateInterviewStatus = (id: string, status: Interview['status']) => {
    setInterviews(prev => prev.map(int => 
      int.id === id ? { ...int, status } : int
    ));

    if (status === 'Cleared') {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  // Handler: Add Custom Uploaded Candidates
  const handleUploadComplete = (newCands: CandidateProfile[], newRes: ScreeningResult[]) => {
    setCandidates(prev => [...newCands, ...prev]);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // Handler: Add New Job
  const handleSaveJob = (newJob: JobRequirement) => {
    setJobs(prev => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const shortlistedList = screeningResults.filter(r => 
    r.status === 'Shortlisted' || r.status === 'Interview Scheduled' || r.status === 'Interviewed' || r.status === 'Selected'
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenNewJobModal={() => setIsJobModalOpen(true)}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Main Layout (Sidebar + Content View) */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          shortlistedCount={shortlistedList.length}
          interviewsCount={interviews.length}
        />

        {/* View Router */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              jobs={jobs}
              candidatesCount={candidates.length}
              screeningResults={screeningResults}
              interviews={interviews}
              onNavigate={(tab, jobId) => {
                if (jobId) setSelectedJobId(jobId);
                setActiveTab(tab);
              }}
              onOpenNewJob={() => setIsJobModalOpen(true)}
            />
          )}

          {activeTab === 'upload' && (
            <ResumeUploadView
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              aiSettings={aiSettings}
              onUploadComplete={handleUploadComplete}
              onNavigateToScreening={(jobId) => {
                setSelectedJobId(jobId);
                setActiveTab('screening');
              }}
            />
          )}

          {activeTab === 'screening' && (
            <ScreeningView
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
              screeningResults={screeningResults}
              onOpenCandidateDetail={handleOpenCandidateDetail}
              onShortlistCandidate={handleShortlistCandidate}
              onScheduleInterview={handleScheduleInterview}
              onBulkShortlist={handleBulkShortlist}
            />
          )}

          {activeTab === 'shortlisted' && (
            <ShortlistedView
              shortlistedResults={shortlistedList}
              jobs={jobs}
              onOpenCandidateDetail={handleOpenCandidateDetail}
              onScheduleInterview={handleScheduleInterview}
              onRemoveFromShortlist={handleRemoveFromShortlist}
            />
          )}

          {activeTab === 'interviews' && (
            <InterviewManagementView
              interviews={interviews}
              jobs={jobs}
              onUpdateInterviewStatus={handleUpdateInterviewStatus}
              onAddInterview={(newInt) => setInterviews(prev => [newInt, ...prev])}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsManagementView
              jobs={jobs}
              onOpenNewJob={() => setIsJobModalOpen(true)}
              onScreenJob={(jobId) => {
                setSelectedJobId(jobId);
                setActiveTab('screening');
              }}
            />
          )}

          {activeTab === 'candidates' && (
            <AllCandidatesView
              candidates={candidates}
              onSelectCandidate={(cand) => {
                const res = screeningResults.find(r => r.candidate.id === cand.id && r.job_id === selectedJobId) || 
                            screenCandidate(cand, jobs.find(j => j.id === selectedJobId) || jobs[0], aiSettings);
                setSelectedCandidateDetail(res);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              jobs={jobs}
              screeningResults={screeningResults}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={aiSettings}
              onSaveSettings={setAiSettings}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      <JobCreationModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSaveJob={handleSaveJob}
      />

      <CandidateDetailModal
        result={selectedCandidateDetail}
        job={jobs.find(j => j.id === (selectedCandidateDetail?.job_id || selectedJobId))}
        onClose={() => setSelectedCandidateDetail(null)}
        onShortlist={(resId) => {
          handleShortlistCandidate(resId);
          setSelectedCandidateDetail(prev => prev ? { ...prev, status: 'Shortlisted' } : null);
        }}
        onScheduleInterview={handleScheduleInterview}
      />

    </div>
  );
}
