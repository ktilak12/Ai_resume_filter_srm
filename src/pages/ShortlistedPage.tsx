import React, { useState, useEffect } from 'react';
import { ShortlistedView } from '../views/ShortlistedView';
import { screenCandidate, rankScreeningResults } from '../services/aiScreeningEngine';
import { ScreeningResult, JobRequirement, CandidateProfile } from '../types';
import { useNavigate } from 'react-router-dom';

const DEFAULT_FALLBACK_JOB: JobRequirement = {
  id: 'job-general',
  title: 'Campus Placement Candidate Pool',
  company: 'SRM Placements',
  job_type: 'Full-time',
  location: 'Chennai / Hybrid',
  ctc_lpa: '8.0 - 15.0 LPA',
  application_deadline: '2026-12-31',
  open_vacancies: 5,
  status: 'Active',
  academic_eligibility: {
    allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
    allowed_departments: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
    min_cgpa: 6.0,
    max_active_backlogs: 2,
    graduation_year: 2026
  },
  required_skills: ['Programming', 'Problem Solving', 'Data Structures'],
  preferred_skills: ['Communication', 'Project Work'],
  min_experience_years: 0,
  freshers_accepted: true,
  internship_preferred: false,
  job_description: 'General campus placement candidate pool assessment.',
  created_at: new Date().toISOString()
};

export const ShortlistedPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRequirement[]>([]);
  const [shortlistedList, setShortlistedList] = useState<ScreeningResult[]>([]);

  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('srm_jobs_list');
      const loadedJobs: JobRequirement[] = savedJobs ? JSON.parse(savedJobs) : [];
      setJobs(loadedJobs);

      const savedCands = localStorage.getItem('srm_candidates_list');
      const loadedCands: CandidateProfile[] = savedCands ? JSON.parse(savedCands) : [];

      if (loadedCands.length > 0) {
        const referenceJob = loadedJobs[0] || DEFAULT_FALLBACK_JOB;
        const screened = loadedCands.map(c => screenCandidate(c, referenceJob));
        const ranked = rankScreeningResults(screened);
        const shortlisted = ranked.filter(r => r.explainable.verdict === 'Strong Match' || r.status === 'Shortlisted' || r.score.overall_match >= 75);
        setShortlistedList(shortlisted);
      } else {
        setShortlistedList([]);
      }
    } catch (e) {
      console.error(e);
      setShortlistedList([]);
    }
  }, []);

  const handleOpenCandidateDetail = (result: ScreeningResult) => {
    navigate(`/candidates/${result.candidate.id}`);
  };

  const handleScheduleInterview = (result: ScreeningResult) => {
    navigate('/interviews', { state: { candidate: result.candidate, jobId: result.job_id } });
  };

  const handleRemoveFromShortlist = (resultId: string) => {
    setShortlistedList(prev => prev.filter(r => r.id !== resultId));
  };

  return (
    <ShortlistedView
      shortlistedResults={shortlistedList}
      jobs={jobs.length > 0 ? jobs : [DEFAULT_FALLBACK_JOB]}
      onOpenCandidateDetail={handleOpenCandidateDetail}
      onScheduleInterview={handleScheduleInterview}
      onRemoveFromShortlist={handleRemoveFromShortlist}
    />
  );
};
