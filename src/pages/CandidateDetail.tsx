import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_CANDIDATES, INITIAL_JOBS } from '../data/srmDataset';
import { CandidateProfile, JobRequirement, ExperienceRecord } from '../types';
import { screenCandidate } from '../services/aiScreeningEngine';
import { 
  sendShortlistNotification, 
  sendRejectionNotification 
} from '../services/emailService';
import { 
  ArrowLeft, 
  BrainCircuit, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  BarChart,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { checkPermission } from '../services/rbac';

export const CandidateDetail: React.FC = () => {
  const { currentUser } = useAuth();
  const activeRole = currentUser?.role || 'Placement Officer';

  const canReject = checkPermission(activeRole, 'REJECT_CANDIDATES');
  const canShortlist = checkPermission(activeRole, 'SHORTLIST_CANDIDATES');
  const canSendEmail = checkPermission(activeRole, 'SEND_BATCH_EMAILS');

  const { id } = useParams<{ id: string }>();

  // Retrieve candidate and job from persistent storage
  const candidate: CandidateProfile = useMemo(() => {
    const saved = localStorage.getItem('srm_candidates_list');
    const list: CandidateProfile[] = saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    return list.find(c => c.id === id) || {
      id: id || 'cand-new',
      reg_number: 'RA2311003010142',
      name: 'Screened Candidate',
      email: 'candidate@srmist.edu.in',
      phone: '+91 98401 22334',
      location: 'Chennai, Tamil Nadu',
      education: {
        degree: 'B.Tech',
        department: 'Computer Science & Engineering',
        college: 'SRM Institute of Science and Technology, Kattankulathur',
        cgpa: 8.5,
        graduation_year: 2026,
        active_backlogs: 0
      },
      skills: ['Python', 'SQL', 'Data Structures', 'Git'],
      experience: [],
      projects: [],
      certifications: [],
      raw_resume_text: ''
    };
  }, [id]);

  const job: JobRequirement = useMemo(() => {
    const savedJobs = localStorage.getItem('srm_jobs_list');
    const jobsList: JobRequirement[] = savedJobs ? JSON.parse(savedJobs) : INITIAL_JOBS;
    return jobsList[0] || {
      id: 'job-general',
      title: 'Software Development Engineer',
      company: 'SRM Recruitment Partner',
      job_type: 'Full-time',
      location: 'Chennai / Hybrid',
      ctc_lpa: '10.0 - 16.0 LPA',
      application_deadline: '2026-12-31',
      open_vacancies: 10,
      status: 'Active',
      academic_eligibility: {
        allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
        allowed_departments: ['CSE', 'IT', 'AI & DS', 'ECE'],
        min_cgpa: 7.0,
        max_active_backlogs: 0,
        graduation_year: 2026
      },
      required_skills: ['Python', 'SQL'],
      preferred_skills: ['React', 'Git'],
      min_experience_years: 0,
      freshers_accepted: true,
      internship_preferred: true,
      job_description: 'Recruitment drive for engineering graduates.',
      created_at: new Date().toISOString()
    };
  }, []);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dynamically screen the candidate against job requirements
  const screeningResult = useMemo(() => {
    return screenCandidate(candidate, job);
  }, [candidate, job]);

  const { score, explainable } = screeningResult;

  const verdictBadgeClass = 
    explainable.verdict === 'Strong Match'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : explainable.verdict === 'Needs Review'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/candidates" className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{candidate.name}</h1>
            <p className="text-slate-400 mt-1">{candidate.reg_number} • {candidate.education.department}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            disabled={isSendingEmail || !canReject}
            title={!canReject ? `Action restricted for ${activeRole}` : 'Reject candidate'}
            onClick={async () => {
              if (!canReject) return;
              setIsSendingEmail(true);
              setEmailNotice(null);
              const res = await sendRejectionNotification(candidate, job);
              setIsSendingEmail(false);
              if (res.success) {
                setEmailNotice({ type: 'success', message: `Rejection email sent to ${candidate.email} via Resend!` });
              } else {
                setEmailNotice({ type: 'error', message: res.error || 'Failed to send rejection email' });
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium border border-slate-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Reject</span>
            {!canReject && <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded ml-1">Restricted</span>}
          </button>

          <button 
            disabled={isSendingEmail || !canShortlist}
            title={!canShortlist ? `Shortlisting restricted for ${activeRole}` : 'Shortlist and notify candidate'}
            onClick={async () => {
              if (!canShortlist) return;
              setIsSendingEmail(true);
              setEmailNotice(null);
              const res = await sendShortlistNotification(candidate, job);
              setIsSendingEmail(false);
              if (res.success) {
                setEmailNotice({ type: 'success', message: `Shortlist interview notification sent to ${candidate.email} via Resend!` });
              } else {
                setEmailNotice({ type: 'error', message: res.error || 'Failed to send shortlist email. Configure Resend API key in Settings.' });
              }
            }}
            className="bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-glow-srm text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSendingEmail ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span>Shortlist &amp; Email Candidate</span>
            {!canShortlist && <span className="text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">Restricted</span>}
          </button>
        </div>
      </div>

      {/* Resend Email Dispatch Banner Notification */}
      {emailNotice && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          emailNotice.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {emailNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{emailNotice.message}</span>
          </div>
          <button 
            onClick={() => setEmailNotice(null)}
            className="text-slate-400 hover:text-white text-xs underline font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Explainability */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-srm-900/20 to-transparent">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-srm-400" />
                  AI Screening Analysis
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-white">{score.overall_match}%</span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${verdictBadgeClass}`}>
                    {explainable.verdict}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Academic Score</div>
                  <div className="text-xl font-semibold text-emerald-400">{score.education}%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Skills Score</div>
                  <div className="text-xl font-semibold text-srm-400">{score.skills}%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Experience Score</div>
                  <div className="text-xl font-semibold text-amber-400">{score.experience}%</div>
                </div>
              </div>

              <div className="space-y-4">
                {explainable.positive_factors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-emerald-400 flex items-center mb-2">
                      <CheckCircle className="mr-1.5 h-4 w-4" /> Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {explainable.positive_factors.map((factor, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-emerald-500 mr-2">•</span>
                          <span className="text-sm text-slate-300">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {explainable.penalty_factors.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-amber-400 flex items-center mb-2">
                      <AlertCircle className="mr-1.5 h-4 w-4" /> Areas of Concern & Missing Skills
                    </h3>
                    <ul className="space-y-2">
                      {explainable.penalty_factors.map((penalty, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span className="text-sm text-slate-300">{penalty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skill Verification Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-slate-400" />
                Skill Evidence &amp; Verification
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {explainable.skill_evidence.map((evidence, idx) => {
                  const isMatched = evidence.match_status === 'matched';
                  const badgeClass = isMatched 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                  return (
                    <div key={idx} className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{evidence.skill}</span>
                          {evidence.is_required && (
                            <span className="text-[10px] bg-srm-950 text-srm-300 border border-srm-500/30 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${badgeClass}`}>
                          {isMatched ? 'Verified' : 'Missing'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        {evidence.candidate_evidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Profile */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Candidate Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                  <GraduationCap className="mr-1.5 h-4 w-4 text-srm-400" /> Education
                </h3>
                <div className="mb-4 last:mb-0">
                  <div className="font-medium text-white text-sm">{candidate.education.degree} in {candidate.education.department}</div>
                  <div className="text-sm text-slate-400">{candidate.education.college}</div>
                  <div className="flex justify-between mt-1.5 text-xs">
                    <span className="text-slate-500">Batch {candidate.education.graduation_year}</span>
                    <span className="font-semibold text-emerald-400">CGPA: {candidate.education.cgpa.toFixed(2)} / 10</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                  <Briefcase className="mr-1.5 h-4 w-4 text-amber-400" /> Experience &amp; Internships
                </h3>
                {candidate.experience.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No formal work experience listed.</p>
                ) : (
                  candidate.experience.map((exp: ExperienceRecord, idx: number) => (
                    <div key={idx} className="mb-3 last:mb-0 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-medium text-white text-xs">{exp.position}</div>
                      <div className="text-xs text-slate-400">{exp.company}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{exp.duration_text}</div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-srm-400" />
                    <div>
                      <span className="text-xs font-semibold text-white block">Resume Document</span>
                      <span className="text-[10px] text-slate-400 font-mono">PDF / Institutional Standard</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
