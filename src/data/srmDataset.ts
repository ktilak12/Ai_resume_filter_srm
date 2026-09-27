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
    open_vacancies: 15,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech'],
      allowed_departments: ['CSE', 'IT', 'AI & DS'],
      min_cgpa: 8.5,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'Distributed Systems'],
    preferred_skills: ['Cloud Computing', 'System Design', 'Git', 'Kubernetes'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'Google Campus Recruitment Drive 2026 for Software Development Engineers across core search, cloud infrastructure, and AI engineering teams.',
    total_applicants_count: 342,
    processed_count: 342,
    shortlisted_count: 48,
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
    open_vacancies: 20,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
      allowed_departments: ['CSE', 'IT', 'AI & DS', 'ECE'],
      min_cgpa: 8.0,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['Python', 'Azure', 'Data Structures', 'C#', 'SQL', 'Git'],
    preferred_skills: ['Machine Learning', 'Docker', 'REST APIs', 'React'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: true,
    job_description: 'Microsoft Azure & AI Division campus drive for engineering graduates to build intelligent cloud scale solutions.',
    total_applicants_count: 280,
    processed_count: 280,
    shortlisted_count: 35,
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
    open_vacancies: 25,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
      allowed_departments: ['CSE', 'IT', 'ECE', 'AI & DS'],
      min_cgpa: 7.5,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['AWS', 'Python', 'Linux', 'Networking', 'SQL', 'Git'],
    preferred_skills: ['Terraform', 'Docker', 'Java', 'Data Structures'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: false,
    job_description: 'Amazon AWS Campus Hiring Program for Associate Solutions Architects designing cloud-native architectures.',
    total_applicants_count: 410,
    processed_count: 410,
    shortlisted_count: 52,
    created_at: new Date().toISOString()
  },
  {
    id: 'job-deloitte-consulting',
    title: 'Technology Consulting Analyst',
    company: 'Deloitte USI',
    job_type: 'Full-time',
    location: 'Bangalore / Hyderabad / Chennai',
    ctc_lpa: '10.5 - 14.0 LPA',
    application_deadline: '2027-01-10',
    open_vacancies: 50,
    status: 'Active',
    academic_eligibility: {
      allowed_degrees: ['B.Tech', 'M.Tech', 'MCA', 'MBA'],
      allowed_departments: ['CSE', 'IT', 'ECE', 'Mechanical', 'AI & DS', 'Management Studies (MBA)'],
      min_cgpa: 7.0,
      max_active_backlogs: 0,
      graduation_year: 2026
    },
    required_skills: ['SQL', 'Python', 'Data Analytics', 'Business Intelligence', 'Problem Solving'],
    preferred_skills: ['Tableau', 'Power BI', 'Excel', 'Agile'],
    min_experience_years: 0,
    freshers_accepted: true,
    internship_preferred: false,
    job_description: 'Deloitte campus placement drive for technology consultants delivering digital transformation and enterprise analytics solutions.',
    total_applicants_count: 520,
    processed_count: 520,
    shortlisted_count: 80,
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
    linkedin: 'linkedin.com/in/aravind-kumar-srm',
    github: 'github.com/aravind-dev',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 9.14,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'Distributed Systems', 'Git', 'SQL'],
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
      },
      {
        name: 'AI Resume Ranking Engine',
        technologies: ['Python', 'FastAPI', 'React', 'Transformers'],
        description: 'NLP-based resume entity parser and multi-factor similarity matching platform.'
      }
    ],
    certifications: ['AWS Certified Cloud Practitioner', 'Google Data Structures & Algorithms Specialization'],
    raw_resume_text: 'Aravind Kumar S | RA2311003010142 | B.Tech CSE SRMIST | CGPA 9.14 | Skills: C++, Java, Python, Data Structures, Algorithms, Distributed Systems, SQL, Git'
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
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.92,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['Python', 'Azure', 'Machine Learning', 'SQL', 'Data Structures', 'Git', 'Docker', 'REST APIs'],
    experience: [
      {
        company: 'Microsoft Tech Club SRM',
        position: 'AI & Cloud Lead',
        duration_months: 12,
        duration_text: 'Aug 2024 - Present',
        responsibilities: ['Organized workshops on Azure OpenAI Services', 'Mentored 200+ students in ML pipelines'],
        is_internship: false
      }
    ],
    projects: [
      {
        name: 'Intelligent Cloud Document Parser',
        technologies: ['Python', 'Azure Cognitive Services', 'FastAPI'],
        description: 'Multi-modal document analysis and automated entity extraction using vision LLMs.'
      }
    ],
    certifications: ['Microsoft Certified: Azure AI Fundamentals', 'TensorFlow Developer Certificate'],
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
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.45,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['AWS', 'Python', 'Linux', 'Networking', 'SQL', 'Docker', 'Git', 'Terraform'],
    experience: [
      {
        company: 'Cognizant',
        position: 'Cloud Infrastructure Intern',
        duration_months: 3,
        duration_text: 'May 2025 - Jul 2025',
        responsibilities: ['Provisioned AWS VPC, ECS clusters and CI/CD pipelines using Terraform'],
        is_internship: true
      }
    ],
    projects: [
      {
        name: 'Auto-Scaling Microservices Infrastructure',
        technologies: ['AWS ECS', 'Terraform', 'Docker', 'CloudWatch'],
        description: 'Production infrastructure template featuring automated zero-downtime rolling deployments.'
      }
    ],
    certifications: ['AWS Certified Solutions Architect – Associate'],
    raw_resume_text: 'Rohan Sundaram | RA2311003010355 | B.Tech IT SRMIST | CGPA 8.45 | Skills: AWS, Python, Linux, Networking, SQL, Docker, Git, Terraform'
  },
  {
    id: 'cand-srm-04',
    reg_number: 'RA2311003010488',
    name: 'Sneha Rangarajan',
    email: 'sneha.r@srmist.edu.in',
    phone: '+91 99620 11223',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/sneha-rangarajan',
    github: 'github.com/sneha-analytics',
    education: {
      degree: 'B.Tech',
      department: 'Computer Science & Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 7.82,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: ['SQL', 'Python', 'Data Analytics', 'Power BI', 'Tableau', 'Excel', 'Problem Solving'],
    experience: [],
    projects: [
      {
        name: 'Campus Placement Predictive Dashboard',
        technologies: ['Power BI', 'SQL', 'Python Pandas'],
        description: 'Interactive analytics dashboard displaying placement trends, branch-wise cutoffs, and CTC statistics.'
      }
    ],
    certifications: ['Microsoft Power BI Data Analyst Associate'],
    raw_resume_text: 'Sneha Rangarajan | RA2311003010488 | B.Tech CSE SRMIST | CGPA 7.82 | Skills: SQL, Python, Data Analytics, Power BI, Tableau, Excel'
  },
  {
    id: 'cand-srm-05',
    reg_number: 'RA2311003010567',
    name: 'Karthik Balaji',
    email: 'karthik.b@srmist.edu.in',
    phone: '+91 98840 99887',
    location: 'Chennai, Tamil Nadu',
    linkedin: 'linkedin.com/in/karthik-balaji',
    github: 'github.com/karthik-b',
    education: {
      degree: 'B.Tech',
      department: 'Electronics & Communication',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 6.85,
      graduation_year: 2026,
      active_backlogs: 1
    },
    skills: ['C', 'C++', 'Embedded Systems', 'Python', 'Linux', 'Git'],
    experience: [],
    projects: [
      {
        name: 'IoT Environmental Sensor Node',
        technologies: ['ESP32', 'C++', 'MQTT'],
        description: 'Low-power telemetry sensor logging air quality parameters to remote dashboard.'
      }
    ],
    certifications: [],
    raw_resume_text: 'Karthik Balaji | RA2311003010567 | B.Tech ECE SRMIST | CGPA 6.85 | Backlogs: 1 | Skills: C, C++, Embedded Systems, Python, Linux'
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
    venue: 'Placement Cell Block - Room 304 / Google Meet',
    status: 'Scheduled',
    feedback: 'Strong performance on data structures algorithm screening.',
    created_at: new Date().toISOString()
  }
];

export const SRM_DEPARTMENT_STATS: any[] = [
  { department: 'CSE', total: 420, placed: 312, avgLpa: 14.2 },
  { department: 'IT', total: 280, placed: 198, avgLpa: 12.8 },
  { department: 'AI & DS', total: 190, placed: 154, avgLpa: 15.6 },
  { department: 'ECE', total: 240, placed: 165, avgLpa: 9.8 },
  { department: 'Mechanical', total: 180, placed: 98, avgLpa: 7.2 }
];

export const SRM_SKILL_DEMAND_STATS: any[] = [
  { skill: 'Python', demandCount: 28, growth: '+24%' },
  { skill: 'Data Structures', demandCount: 35, growth: '+18%' },
  { skill: 'SQL', demandCount: 24, growth: '+15%' },
  { skill: 'AWS / Cloud', demandCount: 22, growth: '+42%' },
  { skill: 'React / Next.js', demandCount: 19, growth: '+30%' }
];

export const SAMPLE_JOBS_PRESET = INITIAL_JOBS;
export const SAMPLE_CANDIDATES_PRESET = INITIAL_CANDIDATES;
