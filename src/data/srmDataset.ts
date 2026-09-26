import { JobRequirement, CandidateProfile, Interview } from '../types';

// Default system data initialized cleanly with 0 dummy records
export const INITIAL_JOBS: JobRequirement[] = [];

export const INITIAL_CANDIDATES: CandidateProfile[] = [];

export const INITIAL_INTERVIEWS: Interview[] = [];

export const SRM_DEPARTMENT_STATS: any[] = [];

export const SRM_SKILL_DEMAND_STATS: any[] = [];

// Optional sample presets available for testing via Settings if desired
export const SAMPLE_JOBS_PRESET: JobRequirement[] = [
  {
    id: 'job-sample-1',
    title: 'Software Development Engineer (SDE-1)',
    company: 'SRM Partner Enterprise',
    job_type: 'Full-time',
    location: 'Chennai / Hybrid',
    ctc_lpa: '12.0 - 18.0 LPA',
    application_deadline: '2026-11-30',
    open_vacancies: 10,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
      allowed_departments: ['CSE', 'IT', 'AI & DS', 'ECE'],
      min_cgpa: 7.5,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['Python', 'SQL', 'React', 'Data Structures'],
    preferred_skills: ['AWS', 'Docker', 'Git'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'We are seeking passionate engineers with strong foundation in core CS, web technologies, and database design.',
    total_applicants_count: 0,
    processed_count: 0,
    shortlisted_count: 0,
    created_at: new Date().toISOString()
  }
];

export const SAMPLE_CANDIDATES_PRESET: CandidateProfile[] = [
  {
    id: 'cand-sample-1',
    reg_number: 'RA2311003010142',
    name: 'Sample Candidate',
    email: 'student@srmist.edu.in',
    phone: '+91 98401 22334',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/student-srm',
    github: 'github.com/student-dev',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.85,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['Python', 'SQL', 'React', 'Data Structures', 'Git', 'FastAPI'],
    experience: [],
    projects: [
      {
        name: 'AI Resume Screening System',
        technologies: ['React', 'Python', 'SQL'],
        description: 'Automated candidate matching and ATS scoring platform.'
      }
    ],
    certifications: ['AWS Cloud Practitioner'],
    raw_resume_text: 'Sample Candidate | B.Tech CSE SRMIST | CGPA 8.85 | Skills: Python, SQL, React, Data Structures'
  }
];
