export type UserRole = 'Placement Officer' | 'Faculty Coordinator' | 'Corporate Recruiter' | 'Super Admin' | 'Student Coordinator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  picture?: string;
  regNumber?: string;
  phone?: string;
  campus?: string;
  batchYear?: string;
  designation?: string;
  isInstitutionalVerified: boolean;
  isProfileComplete?: boolean;
  lastLoginAt: string;
}

export type CandidateStatus = 
  | 'Applied'
  | 'Eligible'
  | 'AI Screened'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Interviewed'
  | 'Selected'
  | 'Rejected';

export type MatchTier = 'Strong Match' | 'Needs Review' | 'Low Match' | 'Ineligible';

export interface AcademicEligibility {
  allowed_degrees: string[]; // e.g. ['B.Tech', 'B.E.', 'MCA', 'M.Tech', 'BCA']
  allowed_departments: string[]; // e.g. ['CSE', 'IT', 'AI & DS', 'ECE', 'Software Eng', 'Data Science']
  min_cgpa: number; // e.g. 7.5
  max_active_backlogs: number; // e.g. 0
  graduation_year: number; // e.g. 2027
}

export interface SkillRequirement {
  name: string;
  category?: 'Language' | 'Framework' | 'Database' | 'Cloud/DevOps' | 'Core CS' | 'Tool';
  weight?: number; // 1-5
}

export interface JobRequirement {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  job_type: 'Full-time' | 'Internship' | 'Full-time + Internship';
  location: string;
  ctc_lpa: string; // e.g. "12.5 - 18.0 LPA"
  application_deadline: string;
  open_vacancies: number;
  status: 'Active' | 'Under Review' | 'Closed';
  academic_eligibility: AcademicEligibility;
  required_skills: string[];
  preferred_skills: string[];
  min_experience_years: number;
  freshers_accepted: boolean;
  internship_preferred: boolean;
  job_description: string;
  total_applicants_count?: number;
  processed_count?: number;
  shortlisted_count?: number;
  created_at: string;
}

export interface EducationRecord {
  degree: string;
  department: string;
  college: string;
  cgpa: number;
  graduation_year: number;
  active_backlogs: number;
}

export interface ExperienceRecord {
  company: string;
  position: string;
  duration_months: number;
  duration_text: string;
  is_internship: boolean;
  responsibilities: string[];
}

export interface ProjectRecord {
  name: string;
  technologies: string[];
  description: string;
  role?: string;
  github_link?: string;
}

export interface CandidateProfile {
  id: string;
  reg_number: string; // SRM Register Number e.g. RA2311003010452
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  avatar?: string;
  ats_score?: number;
  status?: CandidateStatus;
  education: EducationRecord;
  skills: string[];
  experience: ExperienceRecord[];
  projects: ProjectRecord[];
  certifications: string[];
  resume_url?: string;
  raw_resume_text?: string;
}

export interface EligibilityResult {
  is_eligible: boolean;
  checks: {
    cgpa_met: boolean;
    department_met: boolean;
    degree_met: boolean;
    graduation_year_met: boolean;
    backlogs_met: boolean;
  };
  failure_reasons: string[];
}

export interface ScoreBreakdown {
  skills: number; // 0-100
  experience: number; // 0-100
  education: number; // 0-100
  projects: number; // 0-100
  certifications: number; // 0-100
  overall_match: number; // 0-100
}

export interface SkillEvidence {
  skill: string;
  candidate_evidence: string;
  match_status: 'matched' | 'partial' | 'missing' | 'additional';
  is_required: boolean;
}

export interface ExplainableAI {
  verdict: MatchTier;
  summary: string;
  positive_factors: string[];
  penalty_factors: string[];
  missing_skills: string[];
  skill_evidence: SkillEvidence[];
}

export interface ScreeningResult {
  id: string;
  candidate_id: string;
  job_id: string;
  candidate: CandidateProfile;
  eligibility: EligibilityResult;
  score: ScoreBreakdown;
  explainable: ExplainableAI;
  rank: number;
  status: CandidateStatus;
  notes?: string;
  screened_at: string;
}

export type InterviewRound = 'Technical Round 1' | 'Technical Round 2' | 'HR Round' | 'Managerial Round' | 'Final Placement Offer';

export interface Interview {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_reg_no: string;
  candidate_email: string;
  candidate_dept: string;
  job_id: string;
  job_title: string;
  company: string;
  round: InterviewRound;
  date: string;
  time: string;
  interviewer: string;
  venue: string; // e.g. "Placement Cell Block - Room 304" or "Google Meet Link"
  status: 'Scheduled' | 'Completed' | 'Cleared' | 'Rejected' | 'Rescheduled';
  score?: number;
  feedback?: string;
  created_at: string;
}

export interface AISettings {
  weights: {
    skills: number; // default 0.40
    experience: number; // default 0.25
    education: number; // default 0.20
    projects: number; // default 0.10
    certifications: number; // default 0.05
  };
  thresholds: {
    strong_match: number; // default 85
    needs_review: number; // default 65
  };
}

export interface UploadBatchItem {
  id: string;
  fileName: string;
  fileSize: string;
  candidateName?: string;
  status: 'Uploading' | 'Parsing' | 'AI Screening' | 'Completed' | 'Failed';
  progress: number;
  error?: string;
  result?: ScreeningResult;
}
