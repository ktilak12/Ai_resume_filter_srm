import React, { useState } from 'react';
import { 
  UserCheck, 
  Calendar, 
  Download, 
  Search, 
  Eye, 
  Trash2, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { ScreeningResult, JobRequirement, Interview } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { canAccessUnmaskedPII, maskRegNumber, sanitizeCsvField } from '../../services/privacyGuard';

interface ShortlistedViewProps {
  shortlistedResults: ScreeningResult[];
  jobs: JobRequirement[];
  onOpenCandidateDetail: (result: ScreeningResult) => void;
  onScheduleInterview: (result: ScreeningResult) => void;
  onRemoveFromShortlist: (resultId: string) => void;
}

export const ShortlistedView: React.FC<ShortlistedViewProps> = ({
  shortlistedResults,
  jobs,
  onOpenCandidateDetail,
  onScheduleInterview,
  onRemoveFromShortlist
}) => {
  const { currentUser } = useAuth();
  const canViewPII = canAccessUnmaskedPII(currentUser?.role, true);
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = shortlistedResults.filter(res => {
    if (selectedJobFilter !== 'all' && res.job_id !== selectedJobFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        res.candidate.name.toLowerCase().includes(q) ||
        res.candidate.reg_number.toLowerCase().includes(q) ||
        res.candidate.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExport = () => {
    const headers = ['Rank', 'Name', 'Reg Number', 'Department', 'CGPA', 'Job Title', 'Match Score', 'Status'];
    const rows = filtered.map(r => {
      const job = jobs.find(j => j.id === r.job_id);
      const regNo = canViewPII ? r.candidate.reg_number : maskRegNumber(r.candidate.reg_number);
      return [
        r.rank,
        sanitizeCsvField(r.candidate.name),
        sanitizeCsvField(regNo),
        sanitizeCsvField(r.candidate.education.department),
        r.candidate.education.cgpa,
        sanitizeCsvField(job?.title || 'Drive'),
        `${r.score.overall_match}%`,
        sanitizeCsvField(r.status)
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SRM_Shortlisted_Candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-white" />
              Verified Shortlist
            </span>
            <span className="text-xs text-zinc-400">
              • {shortlistedResults.length} Candidates Qualified for Interviews
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            Shortlisted Candidates Management
          </h1>
          <p className="text-xs text-zinc-400">
            Candidates cleared by AI screening and approved by SRM recruitment coordinators
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export Shortlist (CSV)</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search candidate name, reg no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <select
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
          >
            <option value="all">All Placement Drives</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-400">
          Showing <strong className="text-white">{filtered.length}</strong> candidates
        </div>
      </div>

      {/* Shortlisted Candidates Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 overflow-x-auto">
        {filtered.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-4">Candidate Profile</th>
                <th className="py-3 px-3">Recruitment Drive</th>
                <th className="py-3 px-3 text-center">AI Match Score</th>
                <th className="py-3 px-3 text-center">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filtered.map((result) => {
                const { candidate, score, rank } = result;
                const job = jobs.find(j => j.id === result.job_id);

                return (
                  <tr key={result.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-white">
                      #{rank}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-white hover:underline cursor-pointer" onClick={() => onOpenCandidateDetail(result)}>
                          {candidate.name}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {canViewPII ? candidate.reg_number : maskRegNumber(candidate.reg_number)} • {candidate.education.degree} ({candidate.education.department}) • <span className="text-zinc-300 font-medium">CGPA: {candidate.education.cgpa}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div>
                        <div className="font-medium text-white">{job?.title || 'Placement Drive'}</div>
                        <div className="text-[10px] text-zinc-400">{job?.company}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-bold text-sm text-white">
                        {score.overall_match}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        result.status === 'Interview Scheduled'
                          ? 'bg-zinc-800 text-white border-zinc-700'
                          : result.status === 'Selected'
                          ? 'bg-white text-black border-white'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                      }`}>
                        {result.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenCandidateDetail(result)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => onScheduleInterview(result)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule</span>
                        </button>
                        <button
                          onClick={() => onRemoveFromShortlist(result.id)}
                          className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                          title="Remove from shortlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 space-y-2">
            <UserCheck className="w-12 h-12 text-zinc-700 mx-auto" />
            <h3 className="text-base font-semibold text-zinc-300">No Shortlisted Candidates Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Go to the AI Screening Hub to evaluate candidate resumes and click "Shortlist" to add them to this roster.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
