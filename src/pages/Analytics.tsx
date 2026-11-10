import React, { useState, useEffect, useMemo } from 'react';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { CandidateProfile, JobRequirement, ScreeningResult } from '../types';
import { INITIAL_CANDIDATES, INITIAL_JOBS } from '../data/srmDataset';
import { screenCandidate, rankScreeningResults } from '../services/aiScreeningEngine';
import { getSecureItemSync } from '../services/encryptedStorage';
import { SEO } from '../components/common/SEO';

export const Analytics: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => {
    return getSecureItemSync<CandidateProfile[]>('srm_candidates_list', INITIAL_CANDIDATES);
  });

  const [jobs, setJobs] = useState<JobRequirement[]>(() => {
    return getSecureItemSync<JobRequirement[]>('srm_jobs_list', INITIAL_JOBS);
  });

  useEffect(() => {
    const c = getSecureItemSync<CandidateProfile[]>('srm_candidates_list', INITIAL_CANDIDATES);
    const j = getSecureItemSync<JobRequirement[]>('srm_jobs_list', INITIAL_JOBS);
    setCandidates(c);
    setJobs(j);
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
