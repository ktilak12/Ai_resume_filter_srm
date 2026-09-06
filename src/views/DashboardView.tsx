import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Briefcase, 
  Sparkles, 
  Award,
  ChevronRight,
  Filter,
  Layers,
  CheckCircle
} from 'lucide-react';
import { JobRequirement, ScreeningResult, Interview } from '../types';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  jobs: JobRequirement[];
  candidatesCount: number;
  screeningResults: ScreeningResult[];
  interviews: Interview[];
  onNavigate: (tab: NavTab, selectedJobId?: string) => void;
  onOpenNewJob: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  candidatesCount,
  screeningResults,
  interviews,
  onNavigate,
  onOpenNewJob
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'season'>('30d');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Calculate dynamic dashboard stats
  const totalApplications = 1248 + candidatesCount;
  const processedCount = 1102 + screeningResults.length;
  const shortlistedCount = screeningResults.filter(r => r.status === 'Shortlisted' || r.status === 'Interview Scheduled' || r.status === 'Interviewed' || r.status === 'Selected').length + 186;
  const interviewsCount = interviews.length + 74;
  const selectedCount = screeningResults.filter(r => r.status === 'Selected').length + 32;

  // Processing chart mock data points
  const chartData = {
    '7d': [120, 145, 190, 210, 260, 280, 310],
    '30d': [45, 95, 160, 240, 320, 480, 620, 780, 950, 1102],
    'season': [150, 320, 580, 890, 1102, 1248]
  };

  const chartLabels = {
    '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '30d': ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10'],
    'season': ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  const currentPoints = chartData[timeframe];
  const currentLabels = chartLabels[timeframe];
  const maxPoint = Math.max(...currentPoints, 1200);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome Banner with SRM Institutional Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-srm-950 via-slate-900 to-slate-950 border border-srm-500/20 p-6 md:p-8 shadow-glass-dark">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-srm-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-20 -top-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-srm-500/20 border border-srm-500/30 text-srm-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Placement Season 2026–2027 • SRM IST</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Institutional Recruitment & Screening Command Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated first-level eligibility verification, explainable NLP resume scoring, and candidate ranking for SRM campus recruitment drives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-semibold border border-slate-700 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-srm-400" />
              <span>Upload Resumes</span>
            </button>
            <button
              onClick={() => onNavigate('screening')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white text-xs sm:text-sm font-semibold shadow-glow-srm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Run AI Screening</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Applications */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Applications</span>
            <div className="w-10 h-10 rounded-xl bg-srm-500/10 border border-srm-500/20 flex items-center justify-center text-srm-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-white">{totalApplications.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.2%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Across 4 Active Drives</span>
            <span className="text-slate-300 font-medium">950 Eligible (76%)</span>
          </div>
        </div>

        {/* Card 2: Resumes Processed */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resumes Processed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-white">{processedCount.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400">/ {totalApplications}</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <div className="w-full bg-slate-800 rounded-full h-1.5 mr-2">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${Math.round((processedCount / totalApplications) * 100)}%` }}
              ></div>
            </div>
            <span className="text-emerald-400 font-bold shrink-0">{Math.round((processedCount / totalApplications) * 100)}%</span>
          </div>
        </div>

        {/* Card 3: Shortlisted */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shortlisted Candidates</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-amber-300">{shortlistedCount}</span>
            <span className="text-xs font-semibold text-amber-400/80">Strong Matches</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Avg Match Score</span>
            <span className="text-amber-300 font-bold">89.4%</span>
          </div>
        </div>

        {/* Card 4: Interviews Scheduled */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interviews Active</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-white">{interviewsCount}</span>
            <span className="text-xs font-semibold text-purple-400">32 Offers</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Next Round Today</span>
            <span className="text-purple-300 font-semibold">10:30 AM (Suite 302)</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Processing Trends & Funnel Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Resume Processing Overview Line Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-srm-400" />
                Resume Processing & AI Extraction Volume
              </h2>
              <p className="text-xs text-slate-400">
                Number of resumes parsed and evaluated over time
              </p>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
              {(['7d', '30d', 'season'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    timeframe === tf 
                      ? 'bg-srm-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : 'Full Season'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line & Area Chart */}
          <div className="h-64 w-full relative pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c87eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0c87eb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0c87eb" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 50, 100, 150].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Area Path */}
              {(() => {
                const step = 600 / (currentPoints.length - 1);
                const pointsSvg = currentPoints.map((val, i) => {
                  const x = i * step;
                  const y = 180 - (val / maxPoint) * 160;
                  return `${x},${y}`;
                });
                const dArea = `M 0,180 L ${pointsSvg.join(' L ')} L 600,180 Z`;
                const dLine = `M ${pointsSvg.join(' L ')}`;

                return (
                  <>
                    <path d={dArea} fill="url(#areaGradient)" />
                    <path d={dLine} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {currentPoints.map((val, i) => {
                      const x = i * step;
                      const y = 180 - (val / maxPoint) * 160;
                      return (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={x} cy={y} r="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                          <circle cx={x} cy={y} r="8" fill="#38bdf8" opacity="0" className="group-hover:opacity-30 transition-opacity" />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[11px] text-slate-400 mt-2 px-1">
              {currentLabels.map((lbl, i) => (
                <span key={i}>{lbl}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-srm-500"></span>
                Processed Resumes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                AI Screened & Ranked
              </span>
            </div>
            <span className="text-slate-300 font-medium">Avg throughput: 42 resumes/min</span>
          </div>
        </div>

        {/* Right Col: SRM Candidate Pipeline Funnel */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Recruitment Funnel
            </h2>
            <p className="text-xs text-slate-400">Institutional conversion pipeline</p>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: '1. Total Applications', count: totalApplications, pct: 100, color: 'bg-slate-700', text: 'text-slate-200' },
              { label: '2. Academic Eligible', count: 950, pct: 76, color: 'bg-srm-600', text: 'text-srm-300' },
              { label: '3. AI Screened & Ranked', count: 950, pct: 76, color: 'bg-srm-500', text: 'text-srm-400' },
              { label: '4. Strong Matches (≥85%)', count: 240, pct: 19, color: 'bg-amber-500', text: 'text-amber-300' },
              { label: '5. Shortlisted by Recruiter', count: shortlistedCount, pct: 15, color: 'bg-emerald-500', text: 'text-emerald-300' },
              { label: '6. Interview Scheduled', count: interviewsCount, pct: 6, color: 'bg-purple-500', text: 'text-purple-300' },
              { label: '7. Final Offers / Placed', count: selectedCount, pct: 3, color: 'bg-emerald-400', text: 'text-emerald-400' },
            ].map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${stage.text}`}>{stage.count}</span>
                    <span className="text-[10px] text-slate-400">({stage.pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${stage.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(6, stage.pct)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Ineligible Excluded: <strong>298 (24%)</strong></span>
            <span className="text-srm-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('screening')}>
              Review Breakdown →
            </span>
          </div>
        </div>

      </div>

      {/* Active SRM Placement Drives Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-srm-400" />
              Active SRM Recruitment Opportunities
            </h2>
            <p className="text-xs text-slate-400">
              Click any drive to launch the AI Screening, eligibility analysis and shortlisting dashboard
            </p>
          </div>
          <button
            onClick={onOpenNewJob}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <span>+ New Recruitment Drive</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Opportunity & Company</th>
                <th className="py-3 px-3">Target Branches</th>
                <th className="py-3 px-3">Min CGPA</th>
                <th className="py-3 px-3">Required Core Skills</th>
                <th className="py-3 px-3 text-center">Applicants</th>
                <th className="py-3 px-3 text-center">Shortlisted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {jobs.map((job) => (
                <tr 
                  key={job.id} 
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onNavigate('screening', job.id)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-srm-400 text-sm">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-srm-400 transition-colors">
                          {job.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {job.company} • <span className="text-amber-400 font-medium">{job.ctc_lpa}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {job.academic_eligibility.allowed_departments.slice(0, 3).map((dept, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                          {dept}
                        </span>
                      ))}
                      {job.academic_eligibility.allowed_departments.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{job.academic_eligibility.allowed_departments.length - 3}</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-emerald-400">
                    ≥ {job.academic_eligibility.min_cgpa.toFixed(1)}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-srm-950/80 border border-srm-500/30 text-[10px] text-srm-300 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-white">{job.total_applicants_count || 320}</span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {job.shortlisted_count || 42}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('screening', job.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-srm-600/30 hover:bg-srm-600 text-srm-300 hover:text-white border border-srm-500/30 text-xs font-semibold transition-all"
                    >
                      <span>Screen Resumes</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
