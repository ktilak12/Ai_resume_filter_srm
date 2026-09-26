import { UserRole } from '../types';

export type AppPermission = 
  | 'CREATE_JOB'
  | 'EDIT_JOB'
  | 'DELETE_JOB'
  | 'UPLOAD_RESUMES'
  | 'VIEW_ATS_SCORES'
  | 'MODIFY_AI_SETTINGS'
  | 'SHORTLIST_CANDIDATES'
  | 'REJECT_CANDIDATES'
  | 'SEND_BATCH_EMAILS'
  | 'SCHEDULE_INTERVIEW'
  | 'UPDATE_INTERVIEW_STATUS'
  | 'VIEW_ANALYTICS'
  | 'EXPORT_DATA';

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  'Super Admin': [
    'CREATE_JOB',
    'EDIT_JOB',
    'DELETE_JOB',
    'UPLOAD_RESUMES',
    'VIEW_ATS_SCORES',
    'MODIFY_AI_SETTINGS',
    'SHORTLIST_CANDIDATES',
    'REJECT_CANDIDATES',
    'SEND_BATCH_EMAILS',
    'SCHEDULE_INTERVIEW',
    'UPDATE_INTERVIEW_STATUS',
    'VIEW_ANALYTICS',
    'EXPORT_DATA'
  ],
  'Placement Officer': [
    'CREATE_JOB',
    'EDIT_JOB',
    'UPLOAD_RESUMES',
    'VIEW_ATS_SCORES',
    'MODIFY_AI_SETTINGS',
    'SHORTLIST_CANDIDATES',
    'REJECT_CANDIDATES',
    'SEND_BATCH_EMAILS',
    'SCHEDULE_INTERVIEW',
    'UPDATE_INTERVIEW_STATUS',
    'VIEW_ANALYTICS',
    'EXPORT_DATA'
  ],
  'Corporate Recruiter': [
    'CREATE_JOB',
    'VIEW_ATS_SCORES',
    'SHORTLIST_CANDIDATES',
    'REJECT_CANDIDATES',
    'SEND_BATCH_EMAILS',
    'SCHEDULE_INTERVIEW',
    'UPDATE_INTERVIEW_STATUS',
    'VIEW_ANALYTICS',
    'EXPORT_DATA'
  ],
  'Faculty Coordinator': [
    'UPLOAD_RESUMES',
    'VIEW_ATS_SCORES',
    'SHORTLIST_CANDIDATES',
    'VIEW_ANALYTICS',
    'EXPORT_DATA'
  ],
  'Student Coordinator': [
    'UPLOAD_RESUMES',
    'VIEW_ATS_SCORES',
    'EXPORT_DATA'
  ]
};

export const ROLE_DETAILS: Record<UserRole, { 
  title: string; 
  description: string; 
  badgeColor: string; 
  restrictedNotice: string;
  allowedSummary: string[];
  restrictedSummary: string[];
}> = {
  'Super Admin': {
    title: 'Super Administrator',
    description: 'Unrestricted institutional authority across SRM placement drives, AI scoring calibrations, and system settings.',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    restrictedNotice: 'Full system authorization granted.',
    allowedSummary: [
      'Publish & Delete Placement Drives',
      'Full ATS Resume Analysis & Upload',
      'Shortlist & Reject Candidates',
      'Dispatch Resend Batch Emails',
      'Schedule & Manage Interview Panels',
      'Calibrate AI Scoring Weights & Thresholds'
    ],
    restrictedSummary: []
  },
  'Placement Officer': {
    title: 'SRM Placement Directorate',
    description: 'Authorized to conduct institutional placement drives, screen candidates, issue shortlist letters, and adjust AI models.',
    badgeColor: 'bg-srm-500/20 text-srm-300 border-srm-500/30',
    restrictedNotice: 'Comprehensive placement operations authorization.',
    allowedSummary: [
      'Publish & Manage Placement Drives',
      'Upload & Parse Resumes with ATS Score',
      'Shortlist & Reject Candidates',
      'Send Real-time Email Notifications',
      'Schedule Multi-round Interviews',
      'Adjust AI Weights & Cutoffs'
    ],
    restrictedSummary: [
      'Cannot delete system logs'
    ]
  },
  'Corporate Recruiter': {
    title: 'Corporate Partner Recruiter',
    description: 'Authorized to evaluate candidate profiles, shortlist for company drives, and coordinate technical/HR interviews.',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    restrictedNotice: 'Restricted: Cannot calibrate institutional AI scoring weights or alter university eligibility cutoffs.',
    allowedSummary: [
      'View AI Matched Candidate Profiles',
      'Create Company Placement Requirements',
      'Shortlist Applicants & Issue Invitations',
      'Schedule Company Interview Panels',
      'Record Interview Feedback & Decisions'
    ],
    restrictedSummary: [
      'Cannot modify SRM AI Weights & Thresholds',
      'Cannot alter university academic eligibility rules'
    ]
  },
  'Faculty Coordinator': {
    title: 'Department Placement Faculty In-Charge',
    description: 'Authorized to upload student batches, review department scores, and track placement statistics.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
    restrictedNotice: 'Restricted: Cannot dispatch rejection emails, create company drives, or modify global AI weights.',
    allowedSummary: [
      'Upload Department Resumes for ATS Scoring',
      'Monitor Department Student Rankings',
      'Review Department Placement Analytics',
      'Export Filtered Candidate CSVs'
    ],
    restrictedSummary: [
      'Cannot publish new company placement drives',
      'Cannot dispatch final rejection emails',
      'Cannot modify global AI scoring weights'
    ]
  },
  'Student Coordinator': {
    title: 'Placement Student Representative',
    description: 'Authorized to assist with resume collection, run ATS resume checks, and inspect job criteria.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    restrictedNotice: 'Restricted: Read-only candidate review. Cannot send emails, reject applicants, or schedule interviews.',
    allowedSummary: [
      'Submit & Calculate Resume ATS Scores',
      'View Active Placement Drive Requirements',
      'Export Anonymized Statistics'
    ],
    restrictedSummary: [
      'Cannot shortlist or reject applicants',
      'Cannot send batch email notifications',
      'Cannot schedule interview rounds',
      'Cannot modify platform AI scoring weights',
      'Cannot create placement drives'
    ]
  }
};

export function checkPermission(role: UserRole | undefined, permission: AppPermission): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}
