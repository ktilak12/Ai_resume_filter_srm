import React, { useState, useEffect, useMemo } from 'react';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { CandidateProfile, JobRequirement, ScreeningResult } from '../types';
import { INITIAL_CANDIDATES, INITIAL_JOBS } from '../data/srmDataset';
import { screenCandidate, rankScreeningResults } from '../services/aiScreeningEngine';
import { SEO } from '../components/common/SEO';

export const Analytics: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => {
    try {
      const saved = localStorage.getItem('srm_candidates_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CANDIDATES;
  });

  const [jobs, setJobs] = useState<JobRequirement[]>(() => {
    try {
      const saved = localStorage.getItem('srm_jobs_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_JOBS;
  });

  useEffect(() => {
    try {
      const savedCands = localStorage.getItem('srm_candidates_list');
      if (savedCands) setCandidates(JSON.parse(savedCands));

      const savedJobs = localStorage.getItem('srm_jobs_list');
      if (savedJobs) setJobs(JSON.parse(savedJobs));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const screeningResults: ScreeningResult[] = useMemo(() => {
    if (candidates.length === 0 || jobs.length === 0) return [];
    const refJob = jobs[0];
    const screened = candidates.map(c => screenCandidate(c, refJob));
    return rankScreeningResults(screened);
  }, [candidates, jobs]);

  return (
    <>
      <SEO
        title="Campus Placement Intelligence & Department Analytics | SRM ResumeAI"
        description="Aggregated placement statistics, department-wise selection rates, and hiring pipeline analytics for SRM Institute of Science and Technology."
        canonical="/analytics"
        noIndex={true}
      />
      <AnalyticsView 
        jobs={jobs} 
        screeningResults={screeningResults} 
      />
    </>
  );
};
