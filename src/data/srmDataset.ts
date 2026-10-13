import { JobRequirement, CandidateProfile, Interview } from '../types';

export const INITIAL_JOBS: JobRequirement[] = [
  {
    id: 'job-google-sde',
    title: 'Software Development Engineer',
    company: 'Google',
    job_type: 'Full-time',
    location: 'Bangalore / Hyderabad',
    ctc_lpa: '28.5 - 34.0 LPA',
    application_deadline: '2026-11-30',
    open_vacancies: 10,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech'],
      allowed_departments: ['CSE', 'IT', 'AI & DS'],
      min_cgpa: 8.5,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python'],
    preferred_skills: ['Cloud Computing', 'System Design', 'Git'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'Google campus recruitment drive for core software engineering teams.',
    total_applicants_count: 24,
    processed_count: 24,
    shortlisted_count: 6,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-microsoft-cloud',
    title: 'Cloud & AI Engineer',
    company: 'Microsoft',
    job_type: 'Full-time',
    location: 'Hyderabad / Bangalore',
    ctc_lpa: '22.0 - 26.0 LPA',
    application_deadline: '2026-12-15',
    open_vacancies: 8,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
      allowed_departments: ['CSE', 'IT', 'AI & DS', 'ECE'],
      min_cgpa: 8.0,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['Python', 'Azure', 'Data Structures', 'SQL', 'Git'],
    preferred_skills: ['Machine Learning', 'Docker', 'REST APIs'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'Microsoft Azure & AI division campus drive for engineering graduates.',
    total_applicants_count: 18,
    processed_count: 18,
    shortlisted_count: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-amazon-aws',
    title: 'AWS Solutions Architect',
    company: 'Amazon',
    job_type: 'Full-time',
    location: 'Chennai / Hyderabad',
    ctc_lpa: '18.0 - 22.5 LPA',
    application_deadline: '2026-12-20',
    open_vacancies: 12,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
      allowed_departments: ['CSE', 'IT', 'ECE', 'AI & DS'],
      min_cgpa: 7.5,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['AWS', 'Python', 'Linux', 'SQL', 'Git'],
    preferred_skills: ['Docker', 'Terraform', 'Networking'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: false,
    job_description: 'Amazon AWS recruitment program for Associate Solutions Architects.',
    total_applicants_count: 30,
    processed_count: 30,
    shortlisted_count: 8,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-srm-01',
    reg_number: 'RA2311003010142',
    name: 'Aravind Kumar S',
    email: 'aravind.s@srmist.edu.in',
    phone: '+91 98401 22334',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/aravind-kumar',
    github: 'github.com/aravind-dev',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology',
      cgpa: 9.14,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'SQL', 'Git'],
    experience: [
      {
        company: 'Zoho Corporation',
        position: 'Software Engineering Intern',
        duration_months: 6,
        duration_text: 'Jan 2025 - Jun 2025 (6 mos)',
        responsibilities: ['Built high-throughput indexing microservice', 'Optimized database queries reducing latency by 32%'],
        is_internship: true
      }
    ],
    projects: [
      {
        name: 'Distributed Key-Value Store',
        technologies: ['C++', 'gRPC', 'Raft Consensus'],
        description: 'Fault-tolerant distributed storage engine implementing the Raft consensus algorithm.'
      }
    ],
    certifications: ['AWS Certified Cloud Practitioner'],
    raw_resume_text: 'Aravind Kumar S | RA2311003010142 | B.Tech CSE SRMIST | CGPA 9.14 | Skills: C++, Java, Python, Data Structures, Algorithms, SQL, Git'
  },
  {
    id: 'cand-srm-02',
    reg_number: 'RA2311003010219',
    name: 'Pooja Venkatesh',
    email: 'pooja.v@srmist.edu.in',
    phone: '+91 97890 44556',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/pooja-venkatesh',
    github: 'github.com/poojadev',
    education: {
      degree: 'B.Tech',
      department: 'AI & Data Science',
      college: 'SRM Institute of Science and Technology',
      cgpa: 8.92,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['Python', 'Azure', 'Machine Learning', 'SQL', 'Data Structures', 'Git', 'Docker'],
    experience: [
      {
        company: 'Microsoft Tech Club SRM',
        position: 'AI & Cloud Lead',
        duration_months: 12,
        duration_text: 'Aug 2024 - Present',
        responsibilities: ['Organized workshops on Azure OpenAI', 'Mentored students in ML pipelines'],
        is_internship: false
      }
    ],
    projects: [
      {
        name: 'Document Analysis Pipeline',
        technologies: ['Python', 'FastAPI', 'Azure AI'],
        description: 'Multi-modal document analysis and automated entity extraction.'
      }
    ],
    certifications: ['Microsoft Certified: Azure AI Fundamentals'],
    raw_resume_text: 'Pooja Venkatesh | RA2311003010219 | B.Tech AI & DS SRMIST | CGPA 8.92 | Skills: Python, Azure, Machine Learning, SQL, Data Structures, Git'
  },
  {
    id: 'cand-srm-03',
    reg_number: 'RA2311003010355',
    name: 'Rohan Sundaram',
    email: 'rohan.s@srmist.edu.in',
    phone: '+91 94451 66778',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/rohan-sundaram',
    github: 'github.com/rohan-cloud',
    education: {
      degree: 'B.Tech',
      department: 'Information Technology',
      college: 'SRM Institute of Science and Technology',
      cgpa: 8.45,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['AWS', 'Python', 'Linux', 'SQL', 'Docker', 'Git'],
    experience: [
      {
        company: 'Cognizant',
        position: 'Cloud Infrastructure Intern',
        duration_months: 3,
        duration_text: 'May 2025 - Jul 2025',
        responsibilities: ['Provisioned AWS ECS clusters and CI/CD pipelines'],
        is_internship: true
      }
    ],
    projects: [
      {
        name: 'Auto-Scaling Infrastructure',
        technologies: ['AWS ECS', 'Docker', 'CloudWatch'],
        description: 'Cloud infrastructure template featuring automated rolling deployments.'
      }
    ],
    certifications: ['AWS Certified Solutions Architect – Associate'],
    raw_resume_text: 'Rohan Sundaram | RA2311003010355 | B.Tech IT SRMIST | CGPA 8.45 | Skills: AWS, Python, Linux, SQL, Docker, Git'
  }
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'int-001',
    candidate_id: 'cand-srm-01',
    candidate_name: 'Aravind Kumar S',
    candidate_reg_no: 'RA2311003010142',
    candidate_email: 'aravind.s@srmist.edu.in',
    candidate_dept: 'CSE',
    job_id: 'job-google-sde',
    job_title: 'Software Development Engineer',
    company: 'Google',
    round: 'Technical Round 1',
    date: '2026-10-15',
    time: '10:00 AM',
    interviewer: 'Google Tech Panel',
    venue: 'Room 304 / Google Meet',
    status: 'Scheduled',
    feedback: 'High proficiency on data structures and algorithms.',
    created_at: new Date().toISOString()
  }
];

export const SRM_DEPARTMENT_STATS: any[] = [
  { department: 'CSE', applications: 24, avg_cgpa: 8.85, avg_ai_score: 84, shortlisted: 6, selected: 2 },
  { department: 'AI & DS', applications: 18, avg_cgpa: 8.72, avg_ai_score: 82, shortlisted: 5, selected: 2 },
  { department: 'IT', applications: 20, avg_cgpa: 8.40, avg_ai_score: 79, shortlisted: 4, selected: 1 }
];

export const SRM_SKILL_DEMAND_STATS: any[] = [
  { skill: 'Python', category: 'Language', demandCount: 15, candidateProficiency: 18 },
  { skill: 'Data Structures', category: 'Core CS', demandCount: 12, candidateProficiency: 14 },
  { skill: 'AWS / Cloud', category: 'Cloud', demandCount: 10, candidateProficiency: 8 },
  { skill: 'SQL', category: 'Database', demandCount: 10, candidateProficiency: 15 }
];

export const SAMPLE_JOBS_PRESET = INITIAL_JOBS;
export const SAMPLE_CANDIDATES_PRESET = INITIAL_CANDIDATES;

export const DEMO_DATA_VERSION = 'v2_minimal_data';

export const ensureCleanDemoData = (force: boolean = false): boolean => {
  try {
    const currentVer = localStorage.getItem('srm_data_version');
    if (force || currentVer !== DEMO_DATA_VERSION) {
      localStorage.setItem('srm_data_version', DEMO_DATA_VERSION);
      localStorage.setItem('srm_jobs_list', JSON.stringify(INITIAL_JOBS));
      localStorage.setItem('srm_candidates_list', JSON.stringify(INITIAL_CANDIDATES));
      localStorage.setItem('srm_interviews_list', JSON.stringify(INITIAL_INTERVIEWS));
      return true;
    }
  } catch (e) {
    console.error('Failed to sync clean demo data:', e);
  }
  return false;
};

// Auto-run once to ensure user's browser updates from old bloated data
if (typeof window !== 'undefined') {
  ensureCleanDemoData(false);
}
