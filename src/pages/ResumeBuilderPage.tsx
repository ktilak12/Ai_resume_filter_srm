import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResumeBuilder } from '../components/student/ResumeBuilder';
import { INITIAL_JOBS } from '../data/srmDataset';
import { JobRequirement } from '../types';
import { SEO } from '../components/common/SEO';

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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'SRM ResumeAI ATS Resume Builder & Match Optimizer',
    'url': 'https://srm-resume-ai.srmist.edu.in/resume-builder',
    'applicationCategory': 'BusinessApplication, EducationalApplication',
    'operatingSystem': 'All modern web browsers',
    'description': 'Interactive resume builder with live ATS screening score, keyword saturation analysis, and SRM campus placement drive optimization.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'INR'
    }
  };

  return (
    <div className="space-y-6">
      <SEO
        title="AI Resume Builder & Real-Time ATS Score Optimizer | SRM ResumeAI"
        description="Build, format, and optimize your resume for campus placement drives with SRMIST's AI Resume Builder. Live ATS score, keyword saturation, and PDF export."
        keywords="AI Resume Builder, SRMIST Resume Builder, ATS Score Optimizer, Campus Placement Resume, Resume Templates, ATS Resume Format"
        canonical="/resume-builder"
        structuredData={structuredData}
      />
      <ResumeBuilder 
        initialJobId={initialJobId}
        jobs={jobs}
      />
    </div>
  );
};
