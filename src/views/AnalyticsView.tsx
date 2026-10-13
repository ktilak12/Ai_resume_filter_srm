import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Download, 
  Printer, 
  Sparkles, 
  Layers, 
  FileText,
  Building2,
  GraduationCap,
  Code
} from 'lucide-react';
import { SRM_DEPARTMENT_STATS, SRM_SKILL_DEMAND_STATS } from '../data/srmDataset';
import { JobRequirement, ScreeningResult } from '../types';

interface AnalyticsViewProps {
  jobs: JobRequirement[];
  screeningResults: ScreeningResult[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ jobs, screeningResults }) => {
  const [selectedReportDept, setSelectedReportDept] = useState<string>('All');
  const [showPrintModal, setShowPrintModal] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-white" />
              Institutional Analytics
            </span>
            <span className="text-xs text-zinc-400">
              • Placement Season 2026–2027 Intelligence Report
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            Recruitment Funnel & Department Performance
          </h1>
          <p className="text-xs text-zinc-400">
            Comprehensive quantitative analysis of applications, eligibility ratios, AI match distributions, and skill demand gaps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all"
          >
            <FileText className="w-4 h-4 text-black" />
            <span>Executive Summary</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Funnel & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recruitment Funnel Visual */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-white" />
              Institutional Recruitment Funnel
            </h2>
            <p className="text-xs text-zinc-400">Conversion across screening checkpoints</p>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { stage: '1. Applications Received', count: 72, rate: '100%', fill: 'bg-zinc-600' },
              { stage: '2. Academic Eligible', count: 56, rate: '77.8%', fill: 'bg-zinc-400' },
              { stage: '3. AI Shortlisted', count: 19, rate: '26.4%', fill: 'bg-zinc-200' },
              { stage: '4. Final Offers Released', count: 5, rate: '6.9%', fill: 'bg-white' }
            ].map((f, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{f.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{f.count}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({f.rate})</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-900 rounded-lg h-2.5 overflow-hidden border border-zinc-800">
                  <div 
                    className={`${f.fill} h-full rounded-lg transition-all duration-700`}
                    style={{ width: f.rate }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Analytics Bar Comparison */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-white" />
                Department-Wise Placement Performance
              </h2>
              <p className="text-xs text-zinc-400">
                Average academic CGPA, average AI match score, and selection conversion
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Applications</th>
                  <th className="py-2.5 px-3 text-center">Avg CGPA</th>
                  <th className="py-2.5 px-3 text-center">Avg AI Match</th>
                  <th className="py-2.5 px-3 text-center">Shortlisted</th>
                  <th className="py-2.5 px-3 text-center">Selected</th>
                  <th className="py-2.5 px-3 text-right">Selection %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {SRM_DEPARTMENT_STATS.map((dept, i) => (
                  <tr key={i} className="hover:bg-zinc-900/50">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      {dept.department}
                    </td>
                    <td className="py-3 px-3 text-center text-zinc-300 font-semibold">{dept.applications}</td>
                    <td className="py-3 px-3 text-center font-bold text-white">{dept.avg_cgpa.toFixed(2)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-white font-bold">
                        {dept.avg_ai_score}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-zinc-300 font-semibold">{dept.shortlisted}</td>
                    <td className="py-3 px-3 text-center text-white font-bold">{dept.selected}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {((dept.selected / dept.applications) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Skill Demand vs Candidate Competency Gap Analysis */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="pb-3 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-white" />
              Institutional Skill Demand vs Student Competency Gap
            </h2>
            <p className="text-xs text-zinc-400">
              Comparing industry recruiter skill requirements with verified candidate resume skills across 2027 batch
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-400">
            Based on 1,200+ parsed student profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SRM_SKILL_DEMAND_STATS.map((sk, idx) => {
            const gap = sk.demandCount - sk.candidateProficiency;
            const isSurplus = gap < 0;
            return (
              <div key={idx} className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-white">{sk.skill}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {sk.category}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Recruiter Demand:</span>
                    <span className="font-bold text-white">{sk.demandCount} jobs</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Student Talent Pool:</span>
                    <span className="font-bold text-zinc-300">{sk.candidateProficiency} students</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-[10px] flex items-center justify-between">
                  <span className="text-zinc-400">Curriculum Readiness:</span>
                  <span className="text-white font-semibold">
                    {isSurplus ? 'Talent Surplus (+)' : `Deficit Gap (${gap})`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Executive Summary Printable Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-zinc-950 rounded-2xl border border-zinc-800 p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold">
                  SRM
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">SRM Directorate of Career Centre</h3>
                  <p className="text-xs text-zinc-400">Official AI Recruitment & Screening Report (2026–27)</p>
                </div>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="p-1 text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <p>
                <strong>Executive Placement Brief:</strong> Across Google SDE, Microsoft Cloud & AI, and Amazon AWS recruitment drives, a total of <strong>72 candidate applications</strong> were evaluated through SRM ResumeAI.
              </p>
              <div className="p-4 rounded-xl bg-black border border-zinc-800 grid grid-cols-2 gap-3 text-xs">
                <div>• Total Screened Resumes: <strong className="text-white">72</strong></div>
                <div>• Academic Eligible Rate: <strong className="text-white">72.2%</strong></div>
                <div>• Strong AI Matches (≥85%): <strong className="text-white">18</strong></div>
                <div>• Confirmed Placement Offers: <strong className="text-white">4 Offers</strong></div>
              </div>
              <p>
                <strong>AI System Integrity Declaration:</strong> All screening scores were generated as decision-support metrics utilizing rule-based academic eligibility verification combined with explainable NLP semantic vector matching. Final hiring shortlists were authorized exclusively by appointed SRM faculty coordinators and placement officers.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold"
              >
                <Printer className="w-4 h-4 text-black" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
