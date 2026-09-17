import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_CANDIDATES, INITIAL_JOBS } from '../data/srmDataset';
import { screenCandidate } from '../services/aiScreeningEngine';
import { 
  ArrowLeft, 
  BrainCircuit, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  BarChart 
} from 'lucide-react';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const candidate = INITIAL_CANDIDATES.find(c => c.id === id) || INITIAL_CANDIDATES[0];
  const job = INITIAL_JOBS[0];

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
        <div className="flex space-x-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium border border-slate-700 transition-colors text-sm">
            Reject
          </button>
          <button className="bg-srm-600 hover:bg-srm-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm">
            Shortlist for Interview
          </button>
        </div>
      </div>

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
                  candidate.experience.map((exp, idx) => (
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
