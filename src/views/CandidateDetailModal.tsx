import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Award, 
  FileText, 
  UserCheck, 
  Calendar, 
  Mail, 
  Phone, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { ScreeningResult, JobRequirement } from '../types';
import { useAuth } from '../context/AuthContext';
import { canAccessUnmaskedPII, maskRegNumber } from '../services/privacyGuard';

interface CandidateDetailModalProps {
  result: ScreeningResult | null;
  job: JobRequirement | undefined;
  onClose: () => void;
  onShortlist: (resultId: string) => void;
  onScheduleInterview: (result: ScreeningResult) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  result,
  job,
  onClose,
  onShortlist,
  onScheduleInterview
}) => {
  const { currentUser } = useAuth();
  if (!result) return null;

  const { candidate, eligibility, score, explainable, rank } = result;
  const [activeTab, setActiveTab] = useState<'explainable' | 'skills' | 'experience' | 'projects' | 'raw'>('explainable');

  const isShortlisted = result.status === 'Shortlisted' || result.status === 'Interview Scheduled' || result.status === 'Interviewed' || result.status === 'Selected';
  const canViewPII = canAccessUnmaskedPII(currentUser?.role, isShortlisted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-zinc-850 bg-black">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
              <span className="text-lg font-bold font-mono text-white">
                {candidate.name.charAt(0)}
              </span>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-black border border-zinc-800 text-zinc-300">
                #{rank}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {candidate.name}
                </h2>
                <span className="text-xs text-zinc-400 font-mono">
                  ({canViewPII ? candidate.reg_number : maskRegNumber(candidate.reg_number)})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-white">
                  {explainable.verdict}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono mt-1">
                <span>{candidate.education.degree} in {candidate.education.department}</span>
                <span>•</span>
                <span className="text-white font-bold">
                  CGPA: {candidate.education.cgpa.toFixed(2)} / 10
                </span>
                <span>•</span>
                <span>Batch {candidate.education.graduation_year}</span>
              </div>
            </div>
          </div>

          {/* Right: Match Score Ring Badge & Close */}
          <div className="flex items-center gap-4 self-end sm:self-auto font-mono">
            {eligibility.is_eligible ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-right">
                <div>
                  <div className="text-[10px] uppercase text-zinc-500 font-medium">Match Score</div>
                  <div className="text-xl font-bold text-white">
                    {score.overall_match}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-zinc-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-zinc-400" />
                <span>Eligibility Failed</span>
              </div>
            )}

            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-zinc-850 bg-black px-6 pt-2 overflow-x-auto">
          {[
            { id: 'explainable', label: 'AI Rationale', icon: Sparkles },
            { id: 'skills', label: 'Skill Matrix', icon: Code },
            { id: 'experience', label: 'Experience & Education', icon: Briefcase },
            { id: 'projects', label: 'Projects & Certs', icon: Award },
            { id: 'raw', label: 'Raw Extracted Resume', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: Explainable AI & Score Breakdown */}
          {activeTab === 'explainable' && (
            <div className="space-y-6">
              
              {/* AI Summary Box */}
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>SCREENING VERDICT &amp; SUMMARY</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {explainable.summary}
                </p>
              </div>

              {/* Multi-Dimensional Score Breakdown Progress Bars */}
              <div className="space-y-3 font-mono">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Multi-Factor Score Breakdown
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Technical Keywords (40%)', val: score.keyword_score ?? score.skills },
                    { label: 'Requirement Alignment (35%)', val: score.requirement_score ?? score.education },
                    { label: 'ATS Layout Health (25%)', val: score.formatting_score ?? 85 },
                    { label: 'Experience & Internships', val: score.experience },
                    { label: 'Applied Projects', val: score.projects },
                    { label: 'Verified Certifications', val: score.certifications },
                  ].map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-black border border-zinc-850 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">{f.label}</span>
                        <span className="font-bold text-white">{f.val}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-white h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(5, f.val))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positives & Negative Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Key Positive Signals</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {explainable.positive_factors.map((pos, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white">•</span>
                        <span>{pos}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
                  <div className="text-xs font-bold text-zinc-400 font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-zinc-400" />
                    <span>Areas for Review</span>
                  </div>
                  {explainable.penalty_factors.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No red flags identified.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {explainable.penalty_factors.map((pen, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-zinc-500">•</span>
                          <span>{pen}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Skill Evidence Matrix */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-400">
                Extracted skills and evidence detected in resume:
              </div>

              <div className="space-y-2.5">
                {explainable.skill_evidence.map((evidence, idx) => {
                  const isMatched = evidence.match_status === 'matched';
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-black border border-zinc-850 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{evidence.skill}</span>
                          {evidence.is_required && (
                            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {evidence.candidate_evidence}
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border shrink-0 ${
                        isMatched
                          ? 'bg-zinc-900 text-white border-zinc-700'
                          : 'bg-black text-zinc-500 border-zinc-850'
                      }`}>
                        {isMatched ? '✓ Verified' : '✕ Missing'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Experience & Education */}
          {activeTab === 'experience' && (
            <div className="space-y-6 text-xs font-mono">
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-white" /> Work Experience &amp; Internships
                </div>
                {candidate.experience.length === 0 ? (
                  <p className="text-zinc-500 italic">No formal internship or experience extracted.</p>
                ) : (
                  <div className="space-y-2.5">
                    {candidate.experience.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-black border border-zinc-850 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{exp.position}</span>
                          <span className="text-[11px] text-zinc-500">{exp.duration_text}</span>
                        </div>
                        <div className="text-xs text-zinc-300 font-semibold">{exp.company}</div>
                        <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                          {exp.description || (exp.responsibilities && exp.responsibilities.join(' • '))}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-850">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-white" /> Academic Profile
                </div>
                <div className="p-4 rounded-xl bg-black border border-zinc-850 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-500 block">Degree &amp; Branch</span>
                    <strong className="text-white text-xs">{candidate.education.degree} in {candidate.education.department}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Institution</span>
                    <span className="text-zinc-300 text-xs">{candidate.education.college}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Cumulative GPA</span>
                    <strong className="text-white text-xs">{candidate.education.cgpa.toFixed(2)} / 10</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Active Backlogs</span>
                    <span className="text-zinc-300 text-xs">{candidate.education.active_backlogs} Backlogs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Projects & Certifications */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="space-y-3 font-mono">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-white" /> Applied Projects
                </div>
                {candidate.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black border border-zinc-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-white">{proj.name}</div>
                      {proj.github_link && (
                        <span className="text-[11px] text-zinc-400 font-mono">{proj.github_link}</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="space-y-3 font-mono">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-white" /> Certifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {candidate.certifications.map((cert, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black border border-zinc-850 text-xs text-zinc-300 flex items-center gap-2">
                      <Award className="w-4 h-4 text-white shrink-0" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Raw Extracted Resume */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400 font-mono">
                Extracted resume text:
              </div>
              <pre className="p-4 rounded-xl bg-black border border-zinc-850 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {candidate.raw_resume_text || 'No raw text stored.'}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 border-t border-zinc-850 bg-black font-mono">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              {candidate.email}
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              {candidate.phone}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isShortlisted ? (
              <span className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-bold">
                <Check className="w-4 h-4" /> Candidate Shortlisted
              </span>
            ) : (
              <button
                onClick={() => onShortlist(result.id)}
                disabled={!eligibility.is_eligible}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  eligibility.is_eligible
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Shortlist for Drive</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onScheduleInterview(result);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 text-xs font-bold transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Interview</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
