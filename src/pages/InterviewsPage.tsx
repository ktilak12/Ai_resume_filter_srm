import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { InterviewManagementView } from '../views/InterviewManagementView';
import { Interview, JobRequirement, CandidateProfile } from '../types';
import { INITIAL_INTERVIEWS, INITIAL_JOBS } from '../data/srmDataset';

export const InterviewsPage: React.FC = () => {
  const location = useLocation();
  const navState = (location.state as { candidate?: CandidateProfile; jobId?: string } | null) || null;

  const [interviews, setInterviews] = useState<Interview[]>(() => {
    const saved = localStorage.getItem('srm_interviews_list');
    return saved ? JSON.parse(saved) : INITIAL_INTERVIEWS;
  });

  const [jobs, setJobs] = useState<JobRequirement[]>(() => {
    const saved = localStorage.getItem('srm_jobs_list');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('srm_jobs_list');
      if (savedJobs) setJobs(JSON.parse(savedJobs));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleUpdateStatus = (id: string, status: Interview['status']) => {
    setInterviews(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, status } : i);
      localStorage.setItem('srm_interviews_list', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddInterview = (interview: Interview) => {
    setInterviews(prev => {
      const updated = [interview, ...prev];
      localStorage.setItem('srm_interviews_list', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <InterviewManagementView
      interviews={interviews}
      jobs={jobs}
      onUpdateInterviewStatus={handleUpdateStatus}
      onAddInterview={handleAddInterview}
      initialCandidate={navState?.candidate}
      initialJobId={navState?.jobId}
    />
  );
};
