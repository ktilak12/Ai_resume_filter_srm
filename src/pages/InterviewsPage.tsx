import React, { useState, useEffect } from 'react';
import { InterviewManagementView } from '../views/InterviewManagementView';
import { Interview, JobRequirement } from '../types';

export const InterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>(() => {
    const saved = localStorage.getItem('srm_interviews_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [jobs, setJobs] = useState<JobRequirement[]>(() => {
    const saved = localStorage.getItem('srm_jobs_list');
    return saved ? JSON.parse(saved) : [];
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
    />
  );
};
