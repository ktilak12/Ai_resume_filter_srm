import { describe, it, expect } from 'vitest';
import { 
  evaluateEligibility, 
  screenCandidate, 
  generateTailoringRecommendations,
  rankScreeningResults 
} from '../services/aiScreeningEngine';
import { CandidateProfile, JobRequirement } from '../types';

const mockJob: JobRequirement = {
  id: 'job-test-1',
  title: 'Full Stack AI Engineer',
  company: 'SRM Tech Labs',
  job_type: 'Full-time',
  location: 'Chennai, India',
  academic_eligibility: {
    allowed_degrees: ['B.Tech', 'B.E.'],
    allowed_departments: ['CSE', 'IT'],
    min_cgpa: 8.0,
    max_active_backlogs: 0,
    graduation_year: 2025
  },
  required_skills: ['React', 'TypeScript', 'Node.js', 'Python'],
  preferred_skills: ['Docker', 'AWS'],
  open_vacancies: 5,
  status: 'Active',
  application_deadline: '2026-12-31',
  ctc_lpa: '14 - 18 LPA',
  min_experience_years: 0,
  freshers_accepted: true,
  internship_preferred: true,
  job_description: 'Full stack AI engineer for SRM Tech Labs',
  created_at: new Date().toISOString()
};

const mockEligibleCandidate: CandidateProfile = {
  id: 'cand-test-1',
  reg_number: 'RA2311003010142',
  name: 'Aravind Swaminathan',
  email: 'aravind.s@srmist.edu.in',
  phone: '+91 98401 22334',
  location: 'Chennai, India',
  education: {
    college: 'SRM Institute of Science and Technology',
    degree: 'B.Tech',
    department: 'Computer Science and Engineering',
    graduation_year: 2025,
    cgpa: 8.85,
    active_backlogs: 0
  },
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'PostgreSQL'],
  experience: [
    {
      company: 'TechCorp',
      position: 'Software Engineering Intern',
      duration_months: 6,
      duration_text: '6 months',
      is_internship: true,
      responsibilities: [
        'Architected high-throughput microservice handling 4,000 QPS with 99.9% uptime',
        'worked on database queries and assisted with testing'
      ]
    }
  ],
  projects: [
    {
      name: 'Distributed ATS Platform',
      technologies: ['React', 'TypeScript', 'Node.js'],
      description: 'Engineered automated resume parser with 42% latency reduction'
    }
  ],
  certifications: ['AWS Certified Solutions Architect']
};

describe('SRM AI Screening Engine', () => {
  it('correctly evaluates academic eligibility', () => {
    const eligibility = evaluateEligibility(mockEligibleCandidate, mockJob);
    expect(eligibility.is_eligible).toBe(true);
    expect(eligibility.checks.cgpa_met).toBe(true);
    expect(eligibility.checks.backlogs_met).toBe(true);
    expect(eligibility.checks.department_met).toBe(true);
    expect(eligibility.failure_reasons).toHaveLength(0);
  });

  it('flags ineligibility when student CGPA is below cutoff', () => {
    const lowCgpaCandidate: CandidateProfile = {
      ...mockEligibleCandidate,
      education: {
        ...mockEligibleCandidate.education,
        cgpa: 7.2
      }
    };
    const eligibility = evaluateEligibility(lowCgpaCandidate, mockJob);
    expect(eligibility.is_eligible).toBe(false);
    expect(eligibility.checks.cgpa_met).toBe(false);
    expect(eligibility.failure_reasons.some(r => r.includes('CGPA'))).toBe(true);
  });

  it('scores eligible candidate and returns explainable evidence', () => {
    const result = screenCandidate(mockEligibleCandidate, mockJob);
    expect(result.eligibility.is_eligible).toBe(true);
    expect(result.score.overall_match).toBeGreaterThanOrEqual(70);
    expect(result.explainable.verdict).toBe('Strong Match');
    expect(result.explainable.skill_evidence.length).toBeGreaterThan(0);
    expect(result.explainable.tailoring_recommendations).toBeDefined();
  });

  it('generates actionable bullet-level tailoring feedback for weak openers', () => {
    const feedback = generateTailoringRecommendations(mockEligibleCandidate, mockJob);
    expect(feedback.length).toBeGreaterThan(0);
    const hasVerbOrMetricFeedback = feedback.some(
      f => f.category === 'action_verbs' || f.category === 'quantifiable_metrics'
    );
    expect(hasVerbOrMetricFeedback).toBe(true);
  });

  it('ranks multiple candidates accurately by match score and CGPA', () => {
    const cand1 = screenCandidate(mockEligibleCandidate, mockJob);
    const cand2Candidate: CandidateProfile = {
      ...mockEligibleCandidate,
      id: 'cand-test-2',
      education: { ...mockEligibleCandidate.education, cgpa: 9.5 },
      skills: ['React'] // lower technical match
    };
    const cand2 = screenCandidate(cand2Candidate, mockJob);

    const ranked = rankScreeningResults([cand2, cand1]);
    expect(ranked[0].id).toBe(cand1.id);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });
});
