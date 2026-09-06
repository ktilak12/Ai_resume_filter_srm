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
  Globe,
  Check, 
  AlertCircle 
} from 'lucide-react';
import { ScreeningResult, JobRequirement } from '../types';

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
  if (!result) return null;

  const { candidate, eligibility, score, explainable, rank } = result;
  const [activeTab, setActiveTab] = useState<'explainable' | 'skills' | 'experience' | 'projects' | 'raw'>('explainable');

  const isShortlisted = result.status === 'Shortlisted' || result.status === 'Interview Scheduled' || result.status === 'Interviewed' || result.status === 'Selected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-dropdown rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-srm-600 via-srm-500 to-amber-500 p-0.5 shadow-glow-srm shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-extrabold text-white">
                {candidate.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">
                #{rank}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold font-display text-white">
                  {candidate.name}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  ({candidate.reg_number})
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  explainable.verdict === 'Strong Match'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : explainable.verdict === 'Needs Review'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : explainable.verdict === 'Ineligible'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {explainable.verdict}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{candidate.education.degree} in {candidate.education.department}</span>
                <span>•</span>
                <span className={`font-semibold ${candidate.education.cgpa >= (job?.academic_eligibility.min_cgpa || 7.5) ? 'text-emerald-400' : 'text-red-400'}`}>
                  CGPA: {candidate.education.cgpa.toFixed(2)} / 10
                </span>
                <span>•</span>
                <span>Batch {candidate.education.graduation_year}</span>
              </div>
            </div>
          </div>

          {/* Right: Match Score Ring Badge & Close */}
          <div className="flex items-center gap-4 self-end sm:self-auto">
            {eligibility.is_eligible ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Match Score</div>
                  <div className={`text-2xl font-extrabold ${
                    score.overall_match >= 85 ? 'text-emerald-400' : score.overall_match >= 65 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {score.overall_match}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Eligibility Failed</span>
              </div>
            )}

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2 overflow-x-auto">
          {[
            { id: 'explainable', label: 'Explainable AI & Score Rationale', icon: Sparkles },
            { id: 'skills', label: 'Skill Evidence Matrix', icon: Code },
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
                    ? 'border-srm-500 text-srm-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
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
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* AI Summary Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-srm-950/60 to-slate-900 border border-srm-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-srm-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI SCREENING VERDICT & SUMMARY</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {explainable.summary}
                </p>
              </div>

              {/* Multi-Dimensional Score Breakdown Progress Bars */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Multi-Factor Score Breakdown (Weighted Model)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Technical Skills Match (Weight 40%)', val: score.skills, color: 'bg-srm-500', text: 'text-srm-400' },
                    { label: 'Experience & Internships (Weight 25%)', val: score.experience, color: 'bg-amber-500', text: 'text-amber-400' },
                    { label: 'Academic & CGPA Standing (Weight 20%)', val: score.education, color: 'bg-emerald-500', text: 'text-emerald-400' },
                    { label: 'Applied Project Portfolio (Weight 10%)', val: score.projects, color: 'bg-purple-500', text: 'text-purple-400' },
                    { label: 'Verified Certifications (Weight 5%)', val: score.certifications, color: 'bg-cyan-500', text: 'text-cyan-400' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className={`font-bold ${item.text}`}>{item.val}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`${item.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${item.val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why [Score]%? Explainable AI Positive and Negative Rationales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Positive Factors */}
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-2.5">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Positive Alignment Factors ({explainable.positive_factors.length})</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {explainable.positive_factors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">+</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk / Penalty Factors */}
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 space-y-2.5">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Gap / Risk Analysis ({explainable.penalty_factors.length})</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {explainable.penalty_factors.length > 0 ? (
                      explainable.penalty_factors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0">-</span>
                          <span>{factor}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No significant penalties identified.</li>
                    )}
                  </ul>
                </div>

              </div>

              {/* Missing Skills Warning */}
              {explainable.missing_skills.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-amber-300">Missing Mandatory Technical Requirements: </span>
                    <span className="text-slate-300">
                      The candidate profile lacks verified evidence for: <strong className="text-white">{explainable.missing_skills.join(', ')}</strong>.
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Skill Evidence Matrix */}
          {activeTab === 'skills' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400">
                Detailed audit comparing each job requirement against candidate evidence extracted by the NLP parser:
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Requirement</th>
                      <th className="py-2.5 px-3">Importance</th>
                      <th className="py-2.5 px-4">Candidate Evidence in Resume</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {explainable.skill_evidence.map((ev, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-white">
                          {ev.skill}
                        </td>
                        <td className="py-3 px-3">
                          {ev.is_required ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ⭐ Required
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                              Preferred
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {ev.candidate_evidence}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {ev.match_status === 'matched' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <Check className="w-4 h-4" /> Matched
                            </span>
                          ) : ev.match_status === 'missing' ? (
                            <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                              <X className="w-4 h-4" /> Missing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                              Partial
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* All Candidate Verified Skills */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Complete Extracted Skill Set:</div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Experience & Education */}
          {activeTab === 'experience' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Academic Details */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-srm-400 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Academic Records (SRM IST)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400">Degree & Branch</div>
                    <div className="font-semibold text-white">{candidate.education.degree} ({candidate.education.department})</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Cumulative CGPA</div>
                    <div className="font-bold text-emerald-400">{candidate.education.cgpa.toFixed(2)} / 10</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Graduation Year</div>
                    <div className="font-semibold text-white">{candidate.education.graduation_year} Batch</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Active Backlogs</div>
                    <div className={`font-semibold ${candidate.education.active_backlogs === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {candidate.education.active_backlogs}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Experience / Internships */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Work Experience & Internships
                </div>

                {candidate.experience.length > 0 ? (
                  candidate.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-white">{exp.position}</div>
                        <span className="text-[11px] text-amber-400 font-medium">{exp.duration_text}</span>
                      </div>
                      <div className="text-xs font-semibold text-srm-400">{exp.company}</div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 pt-1">
                        {exp.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 italic">
                    No corporate experience listed (Fresher candidate profile).
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: Projects & Certifications */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="space-y-3">
                <div className="text-xs font-bold text-srm-400 uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4" /> Practical Projects
                </div>

                {candidate.projects.map((proj, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-white">{proj.name}</div>
                      {proj.github_link && (
                        <span className="text-[11px] text-srm-400 font-mono">{proj.github_link}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-srm-950 border border-srm-500/30 text-[10px] text-srm-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" /> Certifications & Badges
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {candidate.certifications.map((cert, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: Raw Extracted Resume */}
          {activeTab === 'raw' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400">
                Full normalized text extracted by the NLP pre-processing pipeline:
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {candidate.raw_resume_text || 'No raw text stored.'}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {candidate.email}
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {candidate.phone}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isShortlisted ? (
              <span className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Check className="w-4 h-4" /> Candidate Shortlisted
              </span>
            ) : (
              <button
                onClick={() => onShortlist(result.id)}
                disabled={!eligibility.is_eligible}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                  eligibility.is_eligible
                    ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold shadow-md transition-all"
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
