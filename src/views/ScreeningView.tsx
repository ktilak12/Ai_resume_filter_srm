import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Calendar, 
  Eye, 
  Download, 
  SlidersHorizontal, 
  Award, 
  Check, 
  X, 
  ChevronDown,
  LayoutGrid,
  List,
  GraduationCap,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { JobRequirement, ScreeningResult, MatchTier } from '../types';

interface ScreeningViewProps {
  jobs: JobRequirement[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  screeningResults: ScreeningResult[];
  onOpenCandidateDetail: (result: ScreeningResult) => void;
  onShortlistCandidate: (resultId: string) => void;
  onScheduleInterview: (result: ScreeningResult) => void;
  onBulkShortlist: (resultIds: string[]) => void;
}

export const ScreeningView: React.FC<ScreeningViewProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  screeningResults,
  onOpenCandidateDetail,
  onShortlistCandidate,
  onScheduleInterview,
  onBulkShortlist
}) => {
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'cgpa' | 'experience' | 'name'>('score');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Filter screening results for the current job
  const jobResults = screeningResults.filter(r => r.job_id === selectedJobId);

  // Filter and sort candidates
  const filteredResults = jobResults.filter(res => {
    // Search query
    const matchSearch = 
      res.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.candidate.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.candidate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    // Tier filter
    if (tierFilter !== 'all') {
      if (tierFilter === 'ineligible' && res.eligibility.is_eligible) return false;
      if (tierFilter !== 'ineligible' && res.explainable.verdict !== tierFilter) return false;
    }

    // Eligibility filter
    if (eligibilityFilter === 'eligible' && !res.eligibility.is_eligible) return false;
    if (eligibilityFilter === 'ineligible' && res.eligibility.is_eligible) return false;

    // Department filter
    if (deptFilter !== 'all') {
      if (!res.candidate.education.department.toLowerCase().includes(deptFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Sort
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'score') {
      if (a.eligibility.is_eligible && !b.eligibility.is_eligible) return -1;
      if (!a.eligibility.is_eligible && b.eligibility.is_eligible) return 1;
      return b.score.overall_match - a.score.overall_match;
    }
    if (sortBy === 'cgpa') {
      return b.candidate.education.cgpa - a.candidate.education.cgpa;
    }
    if (sortBy === 'experience') {
      const expA = a.candidate.experience.reduce((acc, e) => acc + e.duration_months, 0);
      const expB = b.candidate.experience.reduce((acc, e) => acc + e.duration_months, 0);
      return expB - expA;
    }
    if (sortBy === 'name') {
      return a.candidate.name.localeCompare(b.candidate.name);
    }
    return 0;
  });

  // Counts for tier badges
  const strongMatchCount = jobResults.filter(r => r.eligibility.is_eligible && r.explainable.verdict === 'Strong Match').length;
  const reviewCount = jobResults.filter(r => r.eligibility.is_eligible && r.explainable.verdict === 'Needs Review').length;
  const lowMatchCount = jobResults.filter(r => r.eligibility.is_eligible && r.explainable.verdict === 'Low Match').length;
  const ineligibleCount = jobResults.filter(r => !r.eligibility.is_eligible).length;

  const toggleSelectAll = () => {
    if (selectedResultIds.length === sortedResults.length) {
      setSelectedResultIds([]);
    } else {
      setSelectedResultIds(sortedResults.map(r => r.id));
    }
  };

  const toggleSelectResult = (id: string) => {
    setSelectedResultIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const rows = [
      ['Rank', 'Name', 'Reg Number', 'Department', 'CGPA', 'Eligibility', 'Match Score', 'Verdict', 'Skills Matched', 'Status'],
      ...sortedResults.map(r => [
        r.rank,
        r.candidate.name,
        r.candidate.reg_number,
        r.candidate.education.department,
        r.candidate.education.cgpa,
        r.eligibility.is_eligible ? 'Eligible' : 'Ineligible',
        `${r.score.overall_match}%`,
        r.explainable.verdict,
        r.candidate.skills.slice(0, 5).join('; '),
        r.status
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SRM_Shortlist_${currentJob.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Screening Opportunity Selector & Header */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-srm-500/20 text-srm-300 border border-srm-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                AI Screening Hub
              </span>
              <span className="text-xs text-slate-400">
                • {jobResults.length} Candidate Profiles Evaluated
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
              {currentJob.title}
            </h1>
            <p className="text-xs text-slate-300">
              {currentJob.company} • {currentJob.location} • <span className="text-amber-400 font-semibold">{currentJob.ctc_lpa}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Job Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Recruitment Drive:</span>
              <select
                value={currentJob.id}
                onChange={(e) => onSelectJob(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-srm-300 focus:outline-none focus:border-srm-500"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.company})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <Download className="w-4 h-4 text-srm-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Match Tier Filter Cards (Clickable) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => setTierFilter(tierFilter === 'Strong Match' ? 'all' : 'Strong Match')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              tierFilter === 'Strong Match'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-glow-srm'
                : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Strong Match
              </span>
              <span className="text-lg font-extrabold text-white">{strongMatchCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Score: 85% – 100% Match</div>
          </button>

          <button
            onClick={() => setTierFilter(tierFilter === 'Needs Review' ? 'all' : 'Needs Review')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              tierFilter === 'Needs Review'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Needs Review
              </span>
              <span className="text-lg font-extrabold text-white">{reviewCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Score: 65% – 84% Match</div>
          </button>

          <button
            onClick={() => setTierFilter(tierFilter === 'Low Match' ? 'all' : 'Low Match')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              tierFilter === 'Low Match'
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Low Match
              </span>
              <span className="text-lg font-extrabold text-white">{lowMatchCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Score: &lt; 65% Match</div>
          </button>

          <button
            onClick={() => setTierFilter(tierFilter === 'ineligible' ? 'all' : 'ineligible')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              tierFilter === 'ineligible'
                ? 'bg-red-950/60 border-red-500 text-red-200'
                : 'bg-slate-900/60 border-slate-800 hover:border-red-500/50 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Ineligible
              </span>
              <span className="text-lg font-extrabold text-red-400">{ineligibleCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Failed CGPA / Branch / Backlogs</div>
          </button>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, reg no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-srm-500"
          >
            <option value="all">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AI & DS">AI & DS</option>
            <option value="ECE">ECE</option>
            <option value="MCA">MCA</option>
          </select>

          {/* Eligibility Filter */}
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-srm-500"
          >
            <option value="all">All Eligibility</option>
            <option value="eligible">Eligible Only</option>
            <option value="ineligible">Ineligible Only</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-srm-500"
            >
              <option value="score">Sort by: AI Match Score ↓</option>
              <option value="cgpa">Sort by: CGPA ↓</option>
              <option value="experience">Sort by: Experience ↓</option>
              <option value="name">Sort by: Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* View Switcher & Selection Count */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {selectedResultIds.length > 0 && (
            <button
              onClick={() => onBulkShortlist(selectedResultIds)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-glow-gold transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Shortlist Selected ({selectedResultIds.length})</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-srm-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-srm-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedResults.map((result) => {
            const { candidate, eligibility, score, explainable, rank } = result;
            const isSelected = selectedResultIds.includes(result.id);
            const isShortlisted = result.status === 'Shortlisted' || result.status === 'Interview Scheduled' || result.status === 'Interviewed' || result.status === 'Selected';

            return (
              <div
                key={result.id}
                className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all flex flex-col justify-between group ${
                  isSelected 
                    ? 'border-srm-500 bg-slate-900/90 shadow-glow-srm' 
                    : !eligibility.is_eligible
                    ? 'border-red-900/50 bg-slate-950/70 opacity-80'
                    : 'glass-panel-hover'
                }`}
              >
                {/* Top: Rank, Eligibility badge, Checkbox */}
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectResult(result.id)}
                        className="w-4 h-4 rounded text-srm-500 focus:ring-srm-500 bg-slate-800 border-slate-700"
                      />
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                        #{rank}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-srm-400 transition-colors">
                          {candidate.name}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {candidate.reg_number}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Circle / Badge */}
                    <div className="text-right">
                      {eligibility.is_eligible ? (
                        <div className="inline-flex flex-col items-end">
                          <span className={`text-base font-extrabold ${
                            score.overall_match >= 85 ? 'text-emerald-400' : score.overall_match >= 65 ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {score.overall_match}%
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            explainable.verdict === 'Strong Match'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : explainable.verdict === 'Needs Review'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {explainable.verdict}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          Ineligible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Academic Profile Snippet */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <GraduationCap className="w-3.5 h-3.5 text-srm-400" />
                        {candidate.education.degree} ({candidate.education.department})
                      </span>
                      <span className={`font-bold ${candidate.education.cgpa >= currentJob.academic_eligibility.min_cgpa ? 'text-emerald-400' : 'text-red-400'}`}>
                        CGPA: {candidate.education.cgpa.toFixed(2)}
                      </span>
                    </div>

                    {/* Score Breakdown Bars */}
                    {eligibility.is_eligible ? (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="bg-slate-900/80 rounded-lg p-1.5 text-center border border-slate-800">
                          <div className="text-[10px] text-slate-400">Skills</div>
                          <div className="font-bold text-xs text-srm-400">{score.skills}%</div>
                        </div>
                        <div className="bg-slate-900/80 rounded-lg p-1.5 text-center border border-slate-800">
                          <div className="text-[10px] text-slate-400">Experience</div>
                          <div className="font-bold text-xs text-amber-400">{score.experience}%</div>
                        </div>
                        <div className="bg-slate-900/80 rounded-lg p-1.5 text-center border border-slate-800">
                          <div className="text-[10px] text-slate-400">Education</div>
                          <div className="font-bold text-xs text-emerald-400">{score.education}%</div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/40 text-[11px] text-red-300">
                        {eligibility.failure_reasons[0] || 'Did not meet institutional criteria'}
                      </div>
                    )}

                    {/* Skills Chips */}
                    <div className="pt-1">
                      <div className="text-[10px] font-semibold text-slate-400 mb-1">Key Verified Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 4).map((sk, i) => {
                          const isRequired = currentJob.required_skills.some(r => r.toLowerCase() === sk.toLowerCase());
                          return (
                            <span 
                              key={i} 
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                isRequired
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {isRequired && '⭐ '}{sk}
                            </span>
                          );
                        })}
                        {candidate.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{candidate.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenCandidateDetail(result)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-srm-400" />
                    <span>View AI Analysis</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isShortlisted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" /> Shortlisted
                      </span>
                    ) : (
                      <button
                        onClick={() => onShortlistCandidate(result.id)}
                        disabled={!eligibility.is_eligible}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          eligibility.is_eligible
                            ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Shortlist</span>
                      </button>
                    )}

                    <button
                      onClick={() => onScheduleInterview(result)}
                      className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/30 transition-all"
                      title="Schedule Interview Round"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={selectedResultIds.length === sortedResults.length && sortedResults.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-srm-500 bg-slate-800 border-slate-700"
                  />
                </th>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-4">Candidate Profile</th>
                <th className="py-3 px-3">SRM Eligibility</th>
                <th className="py-3 px-3 text-center">Skills Match</th>
                <th className="py-3 px-3 text-center">Exp Match</th>
                <th className="py-3 px-3 text-center">Overall AI Score</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {sortedResults.map((result) => {
                const { candidate, eligibility, score, explainable, rank } = result;
                const isSelected = selectedResultIds.includes(result.id);

                return (
                  <tr key={result.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectResult(result.id)}
                        className="w-4 h-4 rounded text-srm-500 bg-slate-800 border-slate-700"
                      />
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-400">
                      #{rank}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-white hover:text-srm-400 cursor-pointer" onClick={() => onOpenCandidateDetail(result)}>
                          {candidate.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {candidate.reg_number} • {candidate.education.degree} ({candidate.education.department}) • <span className="text-emerald-400 font-medium">CGPA: {candidate.education.cgpa}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {eligibility.is_eligible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold text-[11px]">
                          <Check className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 font-semibold text-[11px]">
                          <X className="w-3 h-3" /> Ineligible
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center font-semibold text-srm-400">
                      {score.skills}%
                    </td>

                    <td className="py-3.5 px-3 text-center font-semibold text-amber-400">
                      {score.experience}%
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`font-extrabold text-sm ${
                          score.overall_match >= 85 ? 'text-emerald-400' : score.overall_match >= 65 ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {score.overall_match}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        result.status === 'Shortlisted'
                          ? 'bg-amber-500/20 text-amber-300'
                          : result.status === 'Interview Scheduled' || result.status === 'Interviewed'
                          ? 'bg-purple-500/20 text-purple-300'
                          : result.status === 'Selected'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {result.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenCandidateDetail(result)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onShortlistCandidate(result.id)}
                          disabled={!eligibility.is_eligible}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold"
                        >
                          Shortlist
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
