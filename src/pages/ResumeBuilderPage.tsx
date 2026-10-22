import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResumeBuilder } from '../components/student/ResumeBuilder';
import { INITIAL_JOBS } from '../data/srmDataset';
import { JobRequirement } from '../types';

export const ResumeBuilderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || undefined;

  const [jobs] = useState<JobRequirement[]>(() => {
    try {
      const saved = localStorage.getItem('srm_jobs_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_JOBS;
  });

  return (
    <div className="space-y-6">
      <ResumeBuilder 
        initialJobId={initialJobId}
        jobs={jobs}
      />
    </div>
  );
};
