import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_CANDIDATES } from '../data/srmDataset';
import { ArrowLeft, BrainCircuit, GraduationCap, Briefcase, FileText, CheckCircle, XCircle, ChevronRight, BarChart } from 'lucide-react';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const candidate = INITIAL_CANDIDATES.find(c => c.id === id) || INITIAL_CANDIDATES[0];

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
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium border border-slate-700 transition-colors">
            Reject
          </button>
          <button className="bg-srm-600 hover:bg-srm-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
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
                  <span className="text-2xl font-bold text-white">85%</span>
                  <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Tier 1 Match
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-1">Academic Match</div>
                  <div className="text-xl font-semibold text-emerald-400">100%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-1">Skills Match</div>
                  <div className="text-xl font-semibold text-srm-400">82%</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-1">Experience Match</div>
                  <div className="text-xl font-semibold text-yellow-400">75%</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-emerald-400 flex items-center mb-2">
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Strong Points
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      <span className="text-sm text-slate-300">Exceptional CGPA (9.2) perfectly aligns with strict academic criteria.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      <span className="text-sm text-slate-300">Strong evidence of Python and Machine Learning skills through multiple projects.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium text-yellow-400 flex items-center mb-2">
                    <AlertCircle className="mr-1.5 h-4 w-4" /> Areas of Concern
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      <span className="text-sm text-slate-300">Missing explicit mention of 'TensorFlow', though 'PyTorch' is heavily utilized.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-slate-400" />
                Skill Verification
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">Python</span>
                    <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Verified in Projects</span>
                  </div>
                  <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    "...developed a recommendation engine using <strong className="text-srm-300">Python</strong> and scikit-learn..."
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">Machine Learning</span>
                    <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Verified in Internships</span>
                  </div>
                  <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    "...applied <strong className="text-srm-300">Machine Learning</strong> algorithms to predict customer churn..."
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">TensorFlow</span>
                    <span className="text-xs text-red-400 font-medium px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">Missing</span>
                  </div>
                  <div className="text-sm text-slate-500 italic px-3">
                    No direct mention found in resume text.
                  </div>
                </div>
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
                  <GraduationCap className="mr-1.5 h-4 w-4" /> Education
                </h3>
                <div className="mb-4 last:mb-0">
                  <div className="font-medium text-white text-sm">{candidate.education.degree} in {candidate.education.department}</div>
                  <div className="text-sm text-slate-400">{candidate.education.college}</div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-slate-500">{candidate.education.graduation_year - 4} - {candidate.education.graduation_year}</span>
                    <span className="font-medium text-srm-400">CGPA: {candidate.education.cgpa}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                  <Briefcase className="mr-1.5 h-4 w-4" /> Experience
                </h3>
                {candidate.experience.map((exp, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <div className="font-medium text-white text-sm">{exp.position}</div>
                    <div className="text-sm text-slate-400">{exp.company}</div>
                    <div className="text-xs text-slate-500 mt-1">{exp.duration_text}</div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <a href="#" className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-srm-400 transition-colors" />
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Original Resume PDF</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple mock icon for AlertCircle since I forgot to import it if it's missing, wait I imported it
import { AlertCircle } from 'lucide-react';
