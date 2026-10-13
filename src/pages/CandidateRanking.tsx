import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  ArrowUpDown, 
  ExternalLink, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Sliders,
  RotateCcw,
  X,
  Sparkles,
  Briefcase,
  Users
} from 'lucide-react';
import { INITIAL_CANDIDATES, INITIAL_JOBS } from '../data/srmDataset';
import { CandidateProfile, JobRequirement } from '../types';
import { screenCandidate, rankScreeningResults } from '../services/aiScreeningEngine';
import { sendShortlistNotification } from '../services/emailService';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkPermission } from '../services/rbac';
import { AllCandidatesView } from '../views/AllCandidatesView';

export const CandidateRanking: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state as { selectedJobId?: string; searchTerm?: string } | null) || null;
  const canSendEmails = checkPermission(currentUser?.role, 'SEND_BATCH_EMAILS');

  const [viewMode, setViewMode] = useState<'screening' | 'directory'>(() => {
    return location.pathname === '/candidates' ? 'directory' : 'screening';
  });

  useEffect(() => {
    if (location.pathname === '/candidates') {
      setViewMode('directory');
    } else if (location.pathname === '/screening') {
      setViewMode('screening');
    }
  }, [location.pathname]);
  
  const [searchTerm, setSearchTerm] = useState(() => navState?.searchTerm || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState('all');
  const [backlogsFilter, setBacklogsFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [batchNotice, setBatchNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load active jobs and candidates from persistent storage or clean state
  const jobs: JobRequirement[] = useMemo(() => {
    const saved = localStorage.getItem('srm_jobs_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_JOBS;
  }, []);

  const [selectedJobId, setSelectedJobId] = useState<string>(() => navState?.selectedJobId || jobs[0]?.id || 'job-google-sde');

  useEffect(() => {
    if (navState?.selectedJobId) {
      setSelectedJobId(navState.selectedJobId);
    }
    if (navState?.searchTerm) {
      setSearchTerm(navState.searchTerm);
    }
  }, [location.state]);

  const candidates: CandidateProfile[] = useMemo(() => {
    const saved = localStorage.getItem('srm_candidates_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_CANDIDATES;
  }, []);

  const activeJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || jobs[0] || {
      id: 'job-general',
      title: 'General Placement Recruitment',
      company: 'SRM Placement Directorate',
      job_type: 'Full-time',
      location: 'Chennai / Hybrid',
      ctc_lpa: '8.0 - 15.0 LPA',
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
      required_skills: ['Python', 'SQL', 'Data Structures'],
      preferred_skills: ['React', 'Git'],
      min_experience_years: 0,
      freshers_accepted: true,
      internship_preferred: true,
      job_description: 'Campus placement drive for engineering and computer application graduates.',
      created_at: new Date().toISOString()
    };
  }, [jobs, selectedJobId]);

  // Dynamically screen and rank candidates
  const screenedResults = useMemo(() => {
    if (candidates.length === 0) return [];
    const rawScreened = candidates.map(cand => screenCandidate(cand, activeJob));
    return rankScreeningResults(rawScreened);
  }, [candidates, activeJob]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDeptFilter('all');
    setMinCgpaFilter('all');
    setBacklogsFilter('all');
    setExperienceFilter('all');
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    deptFilter !== 'all',
    minCgpaFilter !== 'all',
    backlogsFilter !== 'all',
    experienceFilter !== 'all'
  ].filter(Boolean).length;

  // Apply Search, Tier, and Advanced Filters
  const filteredResults = useMemo(() => {
    return screenedResults.filter(res => {
      const cand = res.candidate;
      
      // Search term
      const matchesSearch = 
        !searchTerm.trim() ||
        cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.education.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Tier filter
      if (statusFilter === 'high' && res.explainable.verdict !== 'Strong Match') return false;
      if (statusFilter === 'medium' && res.explainable.verdict !== 'Needs Review') return false;
      if (statusFilter === 'low' && res.explainable.verdict !== 'Low Match' && res.explainable.verdict !== 'Ineligible') return false;

      // Department filter
      if (deptFilter !== 'all' && !cand.education.department.toLowerCase().includes(deptFilter.toLowerCase())) {
        return false;
      }

      // Min CGPA filter
      if (minCgpaFilter !== 'all') {
        const threshold = parseFloat(minCgpaFilter);
        if (cand.education.cgpa < threshold) return false;
      }

      // Backlogs filter
      if (backlogsFilter === '0' && cand.education.active_backlogs > 0) return false;
      if (backlogsFilter === '1' && cand.education.active_backlogs > 1) return false;

      // Experience filter
      if (experienceFilter === 'internship' && (!cand.experience || cand.experience.length === 0)) return false;
      if (experienceFilter === 'fresher' && cand.experience && cand.experience.length > 0) return false;

      return true;
    });
  }, [screenedResults, searchTerm, statusFilter, deptFilter, minCgpaFilter, backlogsFilter, experienceFilter]);

  const handleExportCsv = () => {
    const sanitizeCsvCell = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=+\-@\t\r]/.test(str.trim())) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = ['Rank', 'Name', 'Reg Number', 'Department', 'CGPA', 'Backlogs', 'AI Score (%)', 'Tier', 'Status'];
    const rows = filteredResults.map(r => [
      r.rank,
      sanitizeCsvCell(r.candidate.name),
      sanitizeCsvCell(r.candidate.reg_number),
      sanitizeCsvCell(r.candidate.education.department),
      r.candidate.education.cgpa,
      r.candidate.education.active_backlogs,
      r.score.overall_match,
      sanitizeCsvCell(r.explainable.verdict),
      sanitizeCsvCell(r.status)
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SRM_Candidate_Rankings_${activeJob.company.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (viewMode === 'directory') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => { setViewMode('screening'); navigate('/screening'); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Drive AI Screening</span>
            </button>
            <button
              onClick={() => { setViewMode('directory'); navigate('/candidates'); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black transition-all"
            >
              <Users className="w-3.5 h-3.5 text-black" />
              <span>Student Directory ({candidates.length})</span>
            </button>
          </div>

          <div className="text-xs text-zinc-400">
            Active Drive: <strong className="text-white">{activeJob.company} ({activeJob.title})</strong>
          </div>
        </div>

        <AllCandidatesView
          candidates={candidates}
          onSelectCandidate={(cand) => navigate(`/candidates/${cand.id}`, { state: { jobId: activeJob.id } })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setViewMode('screening'); navigate('/screening'); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>Drive AI Screening</span>
        </button>
        <button
          onClick={() => { setViewMode('directory'); navigate('/candidates'); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-all"
        >
          <Users className="w-3.5 h-3.5 text-zinc-400" />
          <span>Student Directory ({candidates.length})</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-white" />
            AI Candidate Screening & Ranking
          </h1>
          <p className="text-zinc-400 mt-1 text-xs sm:text-sm">
            Ranked candidates for <span className="text-white font-semibold">{activeJob.company} — {activeJob.title}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Placement Drive Selector */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id} className="bg-black text-white">
                  {j.company} ({j.title})
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleExportCsv}
            className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3.5 py-2 rounded-xl font-semibold border border-zinc-800 transition-colors text-xs"
          >
            <Download className="h-4 w-4 text-white" />
            <span>Export CSV</span>
          </button>

          <button 
            disabled={isSendingBatch || !canSendEmails}
            title={!canSendEmails ? 'Email dispatch restricted for your role' : undefined}
            onClick={async () => {
              if (!canSendEmails) return;
              setIsSendingBatch(true);
              setBatchNotice(null);
              const strongMatches = filteredResults.filter(r => r.explainable.verdict === 'Strong Match');
              if (strongMatches.length === 0) {
                setIsSendingBatch(false);
                setBatchNotice({ type: 'error', message: 'No Strong Match candidates found in current filter.' });
                return;
              }
              let successCount = 0;
              let lastError = '';
              for (const item of strongMatches) {
                const res = await sendShortlistNotification(item.candidate, activeJob);
                if (res.success) {
                  successCount++;
                } else {
                  lastError = res.error || 'Failed to send';
                }
              }
              setIsSendingBatch(false);
              if (successCount > 0) {
                setBatchNotice({
                  type: 'success',
                  message: `Successfully emailed ${successCount} shortlisted candidates via Resend!`
                });
              } else {
                setBatchNotice({
                  type: 'error',
                  message: `Email dispatch failed: ${lastError}`
                });
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all text-xs ${
              canSendEmails
                ? 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isSendingBatch ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <Mail className="h-4 w-4 text-black" />
            )}
            <span>
              {canSendEmails 
                ? `Email Shortlisted (${filteredResults.filter(r => r.explainable.verdict === 'Strong Match').length})` 
                : 'Email Dispatch Restricted'}
            </span>
          </button>
        </div>
      </div>

      {/* Batch Resend Notification Banner */}
      {batchNotice && (
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs font-semibold text-zinc-200">
          <div className="flex items-center gap-2">
            {batchNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span>{batchNotice.message}</span>
          </div>
          <button 
            onClick={() => setBatchNotice(null)}
            className="text-zinc-500 hover:text-white text-xs underline font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-zinc-850 bg-black flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-xl leading-5 bg-zinc-950 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-xs"
              placeholder="Search by candidate name, register number (RA...), or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-500 transition-colors text-xs font-medium"
            >
              <option value="all">All Match Tiers ({screenedResults.length})</option>
              <option value="high">Tier 1 (Strong Match ≥85%)</option>
              <option value="medium">Tier 2 (Needs Review 65-84%)</option>
              <option value="low">Tier 3 (Low Match &lt;65%)</option>
            </select>
            
            {/* Functional Candidates -> Filter Button */}
            <button 
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center justify-center space-x-2 px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                isFilterPanelOpen || activeFiltersCount > 0
                  ? 'bg-white text-black border-white'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>
          </div>
        </div>

        {/* Expandable Candidates Advanced Filter Panel */}
        {isFilterPanelOpen && (
          <div className="p-4 border-b border-zinc-800 bg-black space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-white" />
                Advanced Candidate Filters
              </span>
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Department */}
              <div>
                <label className="block text-zinc-400 text-[11px] font-semibold mb-1">Department / Branch</label>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="all">All Departments</option>
                  <option value="Computer Science">Computer Science (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="AI & Data Science">AI & Data Science (AI & DS)</option>
                  <option value="Electronics">Electronics (ECE)</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

              {/* Min CGPA */}
              <div>
                <label className="block text-zinc-400 text-[11px] font-semibold mb-1">Academic CGPA Cutoff</label>
                <select
                  value={minCgpaFilter}
                  onChange={(e) => setMinCgpaFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="all">Any CGPA</option>
                  <option value="7.0">CGPA ≥ 7.0</option>
                  <option value="7.5">CGPA ≥ 7.5</option>
                  <option value="8.0">CGPA ≥ 8.0</option>
                  <option value="8.5">CGPA ≥ 8.5</option>
                  <option value="9.0">CGPA ≥ 9.0 (Top Merit)</option>
                </select>
              </div>

              {/* Backlogs */}
              <div>
                <label className="block text-zinc-400 text-[11px] font-semibold mb-1">Active Backlogs</label>
                <select
                  value={backlogsFilter}
                  onChange={(e) => setBacklogsFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="all">All Candidates</option>
                  <option value="0">0 Backlogs (Strict Zero)</option>
                  <option value="1">Max 1 Active Backlog</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-zinc-400 text-[11px] font-semibold mb-1">Internship Experience</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                >
                  <option value="all">All Profiles</option>
                  <option value="internship">With Prior Internships</option>
                  <option value="fresher">Freshers Only</option>
                </select>
              </div>
            </div>

            {/* Active Filters Tag Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800 text-[11px] font-mono">
                <span className="text-zinc-500 font-medium">Applied Filters:</span>
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Tier: {statusFilter}
                    <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {deptFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Dept: {deptFilter}
                    <button onClick={() => setDeptFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minCgpaFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    CGPA ≥ {minCgpaFilter}
                    <button onClick={() => setMinCgpaFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {backlogsFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Backlogs: ≤ {backlogsFilter}
                    <button onClick={() => setBacklogsFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {experienceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Experience: {experienceFilter}
                    <button onClick={() => setExperienceFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-850">
            <thead className="bg-zinc-950">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Rank</span>
                    <ArrowUpDown className="h-3 w-3 text-zinc-500" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Candidate</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Academic</th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>AI Match Score</span>
                    <ArrowUpDown className="h-3 w-3 text-zinc-500" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tier Verdict</th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 bg-black">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-zinc-300 text-sm">No Candidate Profiles Match Criteria</div>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Adjust your active search query or reset filters to view all candidates in this recruitment drive.
                    </p>
                    <button
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold transition-all border border-zinc-800 mt-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredResults.map((item) => {
                  const candidate = item.candidate;
                  const matchScore = item.score.overall_match;
                  const verdict = item.explainable.verdict;

                  const tierBadgeClass = 
                    verdict === 'Strong Match'
                      ? 'bg-zinc-900 text-white border-zinc-700 font-mono'
                      : verdict === 'Needs Review'
                      ? 'bg-zinc-950 text-zinc-300 border-zinc-800 font-mono'
                      : 'bg-black text-zinc-500 border-zinc-850 font-mono';

                  const progressBarClass = 'bg-white';

                  return (
                    <tr key={candidate.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-7 h-7 rounded bg-zinc-900 border border-zinc-800 text-white font-mono font-semibold text-xs">
                          #{item.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-mono font-bold border border-zinc-800 text-xs">
                            {candidate.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-xs font-semibold text-white">{candidate.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{candidate.reg_number} • {candidate.education.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-semibold font-mono text-white">CGPA: {candidate.education.cgpa.toFixed(2)} / 10</div>
                        <div className="text-[11px] text-zinc-400">
                          {candidate.education.active_backlogs === 0 ? '0 Backlogs' : `${candidate.education.active_backlogs} Backlog(s)`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-zinc-850 rounded-full h-1.5">
                            <div className={`${progressBarClass} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(5, matchScore))}%` }}></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">{matchScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${tierBadgeClass}`}>
                          {verdict}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                        <Link 
                          to={`/candidates/${candidate.id}`} 
                          state={{ jobId: activeJob.id }}
                          className="text-black bg-white hover:bg-zinc-200 transition-colors px-3 py-1.5 rounded-lg inline-flex items-center text-xs font-semibold"
                        >
                          View Details <ExternalLink className="ml-1.5 h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-850 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{filteredResults.length}</span> of <span className="font-semibold text-white">{screenedResults.length}</span> ranked candidates
          </div>
          <div className="text-xs text-slate-500">
            Drive: <strong className="text-slate-300">{activeJob.company} — {activeJob.title}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
