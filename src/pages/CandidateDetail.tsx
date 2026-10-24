import React, { useMemo, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
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
  CheckCircle2,
  XCircle,
  Calendar,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  Loader2,
  Zap
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { checkPermission } from '../services/rbac';
import { canAccessUnmaskedPII, maskEmail, maskPhone, maskRegNumber } from '../services/privacyGuard';
import { SEO } from '../components/common/SEO';

export const CandidateDetail: React.FC = () => {
  const { currentUser } = useAuth();
  const activeRole = currentUser?.role || 'Faculty Coordinator';
  const location = useLocation();
  const navigate = useNavigate();
  const navJobId = (location.state as { jobId?: string } | null)?.jobId;

  const canReject = checkPermission(activeRole, 'REJECT_CANDIDATES');
  const canShortlist = checkPermission(activeRole, 'SHORTLIST_CANDIDATES');
  const canSchedule = checkPermission(activeRole, 'SCHEDULE_INTERVIEW');

  const { id } = useParams<{ id: string }>();

  // Retrieve candidate and jobs from persistent storage
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

  const canViewPII = canAccessUnmaskedPII(currentUser?.role, candidate.status === 'Shortlisted');

  const jobsList: JobRequirement[] = useMemo(() => {
    const savedJobs = localStorage.getItem('srm_jobs_list');
    return savedJobs ? JSON.parse(savedJobs) : INITIAL_JOBS;
  }, []);

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    if (navJobId && jobsList.some(j => j.id === navJobId)) return navJobId;
    return jobsList[0]?.id || 'job-google-sde';
  });

  const job: JobRequirement = useMemo(() => {
    return jobsList.find(j => j.id === selectedJobId) || jobsList[0];
  }, [jobsList, selectedJobId]);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dynamically screen the candidate against job requirements
  const screeningResult = useMemo(() => {
    return screenCandidate(candidate, job);
  }, [candidate, job]);

  const { score, explainable } = screeningResult;

  const verdictBadgeClass = 
    explainable.verdict === 'Strong Match'
      ? 'bg-zinc-900 text-white border-zinc-700 font-mono'
      : explainable.verdict === 'Needs Review'
      ? 'bg-zinc-950 text-zinc-300 border-zinc-800 font-mono'
      : 'bg-black text-zinc-500 border-zinc-850 font-mono';

  const updateCandidateStatus = (status: CandidateProfile['status']) => {
    try {
      const saved = localStorage.getItem('srm_candidates_list');
      const list: CandidateProfile[] = saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
      const updated = list.map(c => c.id === candidate.id ? { ...c, status } : c);
      localStorage.setItem('srm_candidates_list', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <SEO
        title="Candidate Assessment & Verification Dossier | SRM ResumeAI"
        description="Comprehensive candidate AI evaluation, ATS score breakdown, institutional verification details, and academic eligibility report."
        canonical="/candidates"
        noIndex={true}
      />
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link to="/candidates" className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors border border-zinc-800">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{candidate.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${verdictBadgeClass}`}>
                {explainable.verdict}
              </span>
            </h1>
            <p className="text-zinc-400 mt-0.5 text-xs font-mono flex items-center gap-1.5 flex-wrap">
              <span>{canViewPII ? candidate.reg_number : maskRegNumber(candidate.reg_number)}</span>
              {!canViewPII && (
                <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1 py-0.2 rounded" title="Student PII Protected (DPDP Act)">
                  Protected
                </span>
              )}
              <span>•</span>
              <span>{candidate.education.department}</span>
              <span>•</span>
              <span>CGPA {candidate.education.cgpa.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Drive Evaluator Selector */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500 hidden sm:inline">Role:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-transparent text-white font-mono font-semibold focus:outline-none cursor-pointer"
            >
              {jobsList.map(j => (
                <option key={j.id} value={j.id} className="bg-black text-white">
                  {j.company} — {j.title}
                </option>
              ))}
            </select>
          </div>

          {canSchedule && (
            <button
              onClick={() => navigate('/interviews', { state: { candidate, jobId: job.id } })}
              className="bg-zinc-900 hover:bg-zinc-850 text-white px-3.5 py-2 rounded-lg font-semibold border border-zinc-800 transition-all text-xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Interview</span>
            </button>
          )}

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
                updateCandidateStatus('Rejected');
                setEmailNotice({ type: 'success', message: `Rejection email sent to ${candidate.email} via Resend!` });
              } else {
                setEmailNotice({ type: 'error', message: res.error || 'Failed to send rejection email' });
              }
            }}
            className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 px-3.5 py-2 rounded-lg font-semibold border border-zinc-800 transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Reject</span>
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
                updateCandidateStatus('Shortlisted');
                setEmailNotice({ type: 'success', message: `Shortlist interview notification sent to ${candidate.email} via Resend!` });
              } else {
                setEmailNotice({ type: 'error', message: res.error || 'Failed to send shortlist email.' });
              }
            }}
            className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-bold transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSendingEmail ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-black" />
            )}
            <span>Shortlist &amp; Email</span>
          </button>
        </div>
      </div>

      {/* Resend Email Dispatch Banner Notification */}
      {emailNotice && (
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs font-semibold text-zinc-200">
          <div className="flex items-center gap-2">
            {emailNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span>{emailNotice.message}</span>
          </div>
          <button 
            onClick={() => setEmailNotice(null)}
            className="text-zinc-500 hover:text-white text-xs underline font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Explainability */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-zinc-850">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-white flex items-center">
                  <BrainCircuit className="mr-2 h-4 w-4 text-white" />
                  Screening Analysis
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-mono font-bold text-white">{score.overall_match}%</span>
                  <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${verdictBadgeClass}`}>
                    {explainable.verdict}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono text-center">
                <div className="bg-black rounded-lg p-3 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 mb-1">Keywords Score</div>
                  <div className="text-base font-bold text-white">{score.keyword_score ?? score.skills}%</div>
                </div>
                <div className="bg-black rounded-lg p-3 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 mb-1">Requirement Fit</div>
                  <div className="text-base font-bold text-white">{score.requirement_score ?? score.education}%</div>
                </div>
                <div className="bg-black rounded-lg p-3 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 mb-1">ATS Layout</div>
                  <div className="text-base font-bold text-white">{score.formatting_score ?? 85}%</div>
                </div>
                <div className="bg-black rounded-lg p-3 border border-zinc-850">
                  <div className="text-[10px] text-zinc-500 mb-1">CGPA Standing</div>
                  <div className="text-base font-bold text-white">{candidate.education.cgpa} / 10</div>
                </div>
              </div>

              <div className="space-y-4">
                {explainable.positive_factors.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center mb-2">
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-white" /> Strengths
                    </h3>
                    <ul className="space-y-1.5 text-xs">
                      {explainable.positive_factors.map((factor, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-white mr-2">•</span>
                          <span className="text-zinc-300">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {explainable.penalty_factors.length > 0 && (
                  <div className="pt-2 border-t border-zinc-850">
                    <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center mb-2">
                      <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-zinc-400" /> Missing Skills &amp; Gaps
                    </h3>
                    <ul className="space-y-1.5 text-xs">
                      {explainable.penalty_factors.map((penalty, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-zinc-500 mr-2">•</span>
                          <span className="text-zinc-300">{penalty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explainable.tailoring_recommendations && explainable.tailoring_recommendations.length > 0 && (
                  <div className="pt-3 border-t border-zinc-850">
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center mb-2.5">
                      <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-400" /> Actionable Resume Tailoring &amp; Coaching
                    </h3>
                    <div className="space-y-2">
                      {explainable.tailoring_recommendations.map((rec, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-black border border-zinc-850 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase font-bold text-amber-400">
                              {rec.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {rec.impact_level} Priority
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono italic">
                            "{rec.original_snippet}"
                          </div>
                          <p className="text-[11px] text-zinc-300">
                            <span className="text-white font-semibold">Advice: </span>
                            {rec.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skill Verification Evidence */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-850 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white flex items-center font-mono">
                Skill Evidence &amp; Verification
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {explainable.skill_evidence.map((evidence, idx) => {
                  const isMatched = evidence.match_status === 'matched';
                  const badgeClass = isMatched 
                    ? 'bg-zinc-900 text-white border-zinc-700' 
                    : 'bg-black text-zinc-500 border-zinc-850';

                  return (
                    <div key={idx} className="bg-black p-3.5 rounded-xl border border-zinc-850">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{evidence.skill}</span>
                          {evidence.is_required && (
                            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </span>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                          {isMatched ? 'Verified' : 'Missing'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
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
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-850">
              <h2 className="text-sm font-bold text-white font-mono">Candidate Profile</h2>
            </div>
            <div className="p-5 space-y-5 text-xs font-mono">
              <div className="pb-4 border-b border-zinc-850">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center">
                    <Mail className="mr-1.5 h-3.5 w-3.5 text-white" /> Contact Credentials
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                    canViewPII 
                      ? 'bg-zinc-900 text-emerald-400 border-zinc-800' 
                      : 'bg-black text-amber-400 border-amber-950/60'
                  }`}>
                    {canViewPII ? <ShieldCheck className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    {canViewPII ? 'Verified PII' : 'DPDP Masked'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[11px]">Email:</span>
                    <span className="text-white font-mono text-[11px]">
                      {canViewPII ? candidate.email : maskEmail(candidate.email)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[11px]">Phone:</span>
                    <span className="text-white font-mono text-[11px]">
                      {canViewPII ? candidate.phone : maskPhone(candidate.phone)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[11px]">Register No:</span>
                    <span className="text-white font-mono text-[11px]">
                      {canViewPII ? candidate.reg_number : maskRegNumber(candidate.reg_number)}
                    </span>
                  </div>
                </div>
                {!canViewPII && (
                  <p className="mt-2 text-[10px] text-zinc-500 italic border-t border-zinc-900 pt-1.5">
                    Protected under DPDP Act 2023. Unlocks upon Shortlist confirmation.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center">
                  <GraduationCap className="mr-1.5 h-3.5 w-3.5 text-white" /> Education
                </h3>
                <div className="mb-2">
                  <div className="font-semibold text-white">{candidate.education.degree} in {candidate.education.department}</div>
                  <div className="text-zinc-400 text-[11px]">{candidate.education.college}</div>
                  <div className="flex justify-between mt-1 text-[11px]">
                    <span className="text-zinc-500">Batch {candidate.education.graduation_year}</span>
                    <span className="font-bold text-white">CGPA: {candidate.education.cgpa.toFixed(2)} / 10</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-850">
                <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center">
                  <Briefcase className="mr-1.5 h-3.5 w-3.5 text-zinc-400" /> Experience
                </h3>
                {candidate.experience.length === 0 ? (
                  <p className="text-zinc-500 italic">No formal experience listed.</p>
                ) : (
                  candidate.experience.map((exp: ExperienceRecord, idx: number) => (
                    <div key={idx} className="mb-2 last:mb-0 bg-black p-2.5 rounded-lg border border-zinc-850">
                      <div className="font-semibold text-white">{exp.position}</div>
                      <div className="text-zinc-400 text-[11px]">{exp.company}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{exp.duration_text}</div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="pt-4 border-t border-zinc-850">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-zinc-850">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-white" />
                    <div>
                      <span className="text-xs font-semibold text-white block">Resume Document</span>
                      <span className="text-[10px] text-zinc-500 font-mono">PDF Standard</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
