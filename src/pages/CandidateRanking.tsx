import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, CheckCircle, ArrowUpDown, ExternalLink, Mail, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { INITIAL_CANDIDATES, INITIAL_JOBS } from '../data/srmDataset';
import { CandidateProfile, JobRequirement } from '../types';
import { screenCandidate, rankScreeningResults } from '../services/aiScreeningEngine';
import { sendShortlistNotification } from '../services/emailService';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkPermission } from '../services/rbac';

export const CandidateRanking: React.FC = () => {
  const { currentUser } = useAuth();
  const canSendEmails = checkPermission(currentUser?.role, 'SEND_BATCH_EMAILS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [batchNotice, setBatchNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load active jobs and candidates from persistent storage or clean state
  const jobs: JobRequirement[] = useMemo(() => {
    const saved = localStorage.getItem('srm_jobs_list');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  }, []);

  const candidates: CandidateProfile[] = useMemo(() => {
    const saved = localStorage.getItem('srm_candidates_list');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  }, []);

  const defaultJob = jobs[0] || {
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

  // Dynamically screen and rank candidates
  const screenedResults = useMemo(() => {
    if (candidates.length === 0) return [];
    const rawScreened = candidates.map(cand => screenCandidate(cand, defaultJob));
    return rankScreeningResults(rawScreened);
  }, [candidates, defaultJob]);

  // Apply Search & Tier Filters
  const filteredResults = useMemo(() => {
    return screenedResults.filter(res => {
      const cand = res.candidate;
      const matchesSearch = 
        !searchTerm.trim() ||
        cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.education.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesTier = true;
      if (statusFilter === 'high') {
        matchesTier = res.explainable.verdict === 'Strong Match';
      } else if (statusFilter === 'medium') {
        matchesTier = res.explainable.verdict === 'Needs Review';
      } else if (statusFilter === 'low') {
        matchesTier = res.explainable.verdict === 'Low Match' || res.explainable.verdict === 'Ineligible';
      }

      return matchesSearch && matchesTier;
    });
  }, [screenedResults, searchTerm, statusFilter]);

  const handleExportCsv = () => {
    // Sanitizes CSV fields to prevent Excel / spreadsheet formula injection attacks
    const sanitizeCsvCell = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      // Prepend a single quote if the field begins with formula trigger characters
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SRM_Candidate_Rankings_${defaultJob.company.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Screening Results</h1>
          <p className="text-slate-400 mt-1">
            Review and manage ranked candidates for <span className="text-srm-300 font-medium">{defaultJob.company} - {defaultJob.title}</span>.
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportCsv}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium border border-slate-700 transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
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
                const res = await sendShortlistNotification(item.candidate, defaultJob);
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-glow-srm ${
              canSendEmails
                ? 'bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white disabled:opacity-50'
                : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            {isSendingBatch ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
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
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          batchNotice.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {batchNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{batchNotice.message}</span>
          </div>
          <button 
            onClick={() => setBatchNotice(null)}
            className="text-slate-400 hover:text-white text-xs underline font-normal"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-srm-500 focus:border-srm-500 transition-colors"
              placeholder="Search by name, register number, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-srm-500 transition-colors text-sm"
            >
              <option value="all">All Tiers ({screenedResults.length})</option>
              <option value="high">Tier 1 (Strong Match)</option>
              <option value="medium">Tier 2 (Needs Review)</option>
              <option value="low">Tier 3 (Low Match / Ineligible)</option>
            </select>
            
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors text-sm">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/80">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-300">
                    <span>Rank</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Candidate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Academic</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-300">
                    <span>AI Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tier</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 border border-slate-700">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-slate-300 text-sm">No Candidate Profiles Found</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Upload student resumes or paste resume text to calculate real-time ATS scores and populate the candidate database.
                    </p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-bold transition-all shadow-glow-srm mt-2"
                    >
                      <span>Upload &amp; Screen Resumes →</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredResults.map((item) => {
                  const candidate = item.candidate;
                  const matchScore = item.score.overall_match;
                  const verdict = item.explainable.verdict;

                  const tierBadgeClass = 
                    verdict === 'Strong Match'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : verdict === 'Needs Review'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                  const progressBarClass = 
                    matchScore >= 85 ? 'bg-emerald-500' : matchScore >= 65 ? 'bg-amber-500' : 'bg-rose-500';

                  return (
                    <tr key={candidate.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-sm">
                          #{item.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-srm-700 to-srm-500 flex items-center justify-center text-white font-bold border border-srm-600/50 text-sm shadow-sm">
                            {candidate.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{candidate.name}</div>
                            <div className="text-xs text-slate-400">{candidate.reg_number} • {candidate.education.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{candidate.education.cgpa.toFixed(2)} CGPA</div>
                        <div className="text-xs text-slate-400">
                          {candidate.education.active_backlogs === 0 ? '0 Backlogs' : `${candidate.education.active_backlogs} Backlog(s)`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-800 rounded-full h-2">
                            <div className={`${progressBarClass} h-2 rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(5, matchScore))}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-white">{matchScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tierBadgeClass}`}>
                          {verdict}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/candidates/${candidate.id}`} className="text-srm-400 hover:text-srm-300 transition-colors bg-srm-400/10 hover:bg-srm-400/20 px-3 py-1.5 rounded-md inline-flex items-center text-xs">
                          View AI Details <ExternalLink className="ml-1.5 h-3 w-3" />
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
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing <span className="font-medium text-white">{filteredResults.length}</span> of <span className="font-medium text-white">{screenedResults.length}</span> candidates
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-slate-700 rounded-md bg-slate-800 text-slate-400 text-xs cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-slate-700 rounded-md bg-slate-800 text-slate-400 text-xs cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
