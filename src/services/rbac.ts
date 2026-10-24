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
  'Faculty Coordinator': [
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
    badgeColor: 'bg-zinc-900 text-white border-zinc-700',
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
  'Faculty Coordinator': {
    title: 'Department Placement Faculty In-Charge',
    description: 'Authorized to conduct placement drives, screen candidates, coordinate interview panels, calibrate AI models, and access student rosters.',
    badgeColor: 'bg-zinc-900 text-white border-zinc-700',
    restrictedNotice: 'Comprehensive placement operations authorization.',
    allowedSummary: [
      'Publish & Manage Placement Drives',
      'Upload & Parse Resumes with ATS Score',
      'Shortlist & Reject Candidates',
      'Send Real-time Email Notifications',
      'Schedule Multi-round Interviews',
      'Adjust AI Weights & Cutoffs',
      'Monitor Department Student Rankings & Analytics',
      'Export Filtered Candidate CSVs'
    ],
    restrictedSummary: [
      'Cannot delete system logs'
    ]
  },
  'Student Coordinator': {
    title: 'Placement Student Representative',
    description: 'Authorized to assist with resume collection, run ATS resume checks, and inspect job criteria.',
    badgeColor: 'bg-zinc-900 text-zinc-400 border-zinc-800',
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
