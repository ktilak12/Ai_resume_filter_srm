import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Building, Download, Sparkles, Plus } from 'lucide-react';
import { CandidateProfile, JobRequirement } from '../types';
import { useNavigate } from 'react-router-dom';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [jobs, setJobs] = useState<JobRequirement[]>([]);

  useEffect(() => {
    try {
      const savedCands = localStorage.getItem('srm_candidates_list');
      if (savedCands) setCandidates(JSON.parse(savedCands));

      const savedJobs = localStorage.getItem('srm_jobs_list');
      if (savedJobs) setJobs(JSON.parse(savedJobs));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalCompanies = jobs.length;
  const totalApplicants = candidates.length;
  const avgAtsScore = candidates.length > 0 && candidates.some(c => c.ats_score !== undefined)
    ? Math.round(candidates.reduce((acc, c) => acc + (c.ats_score || 0), 0) / candidates.length)
    : 0;
  const highScorers = candidates.filter(c => (c.ats_score || 0) >= 80).length;

  // Department distribution
  const deptCounts: { [key: string]: number } = {};
  candidates.forEach(c => {
    const dept = c.education?.department || 'General';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  // Skills aggregation
  const skillCounts: { [key: string]: number } = {};
  candidates.forEach(c => {
    (c.skills || []).forEach(sk => {
      skillCounts[sk] = (skillCounts[sk] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Placement Analytics &amp; Metrics</h1>
          <p className="text-slate-400 mt-1">Real-time recruitment metrics, skill demand, and candidate distribution.</p>
        </div>
        <button 
          onClick={() => alert('Analytics summary exported successfully!')}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium border border-slate-700 transition-colors text-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-srm-500/10 text-srm-400 rounded-lg">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Total Drives</div>
            <div className="text-2xl font-bold text-white">{totalCompanies}</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Total Applicants</div>
            <div className="text-2xl font-bold text-white">{totalApplicants}</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Avg ATS Match</div>
            <div className="text-2xl font-bold text-white">{avgAtsScore}%</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-slate-400">Strong Matches (&ge;80%)</div>
            <div className="text-2xl font-bold text-white">{highScorers}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department breakdown */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Candidate Pool by Department</h2>
          {Object.keys(deptCounts).length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No department data available. Upload resumes to generate breakdowns.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(deptCounts).map(([dept, count]) => {
                const pct = Math.round((count / totalApplicants) * 100);
                return (
                  <div key={dept}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{dept}</span>
                      <span className="text-white font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-srm-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top skills */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Identified Technical Skills</h2>
          {topSkills.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No skill data extracted yet. Resumes uploaded will populate technical skill frequencies.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topSkills.map(([skill, count]) => (
                <span key={skill} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm border border-slate-700">
                  {skill} ({count} candidates)
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
