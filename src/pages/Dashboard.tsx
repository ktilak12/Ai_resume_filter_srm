import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, CheckCircle, TrendingUp, Clock, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserRole, CandidateProfile, JobRequirement, Interview } from '../types';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const context = useOutletContext<{ userRole?: UserRole }>() || {};
  const activeRole = currentUser?.role || context.userRole || 'Placement Officer';
  const displayName = currentUser?.name || activeRole;

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [jobs, setJobs] = useState<JobRequirement[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    try {
      const savedCands = localStorage.getItem('srm_candidates_list');
      if (savedCands) setCandidates(JSON.parse(savedCands));

      const savedJobs = localStorage.getItem('srm_jobs_list');
      if (savedJobs) setJobs(JSON.parse(savedJobs));

      const savedInterviews = localStorage.getItem('srm_interviews_list');
      if (savedInterviews) setInterviews(JSON.parse(savedInterviews));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalApplicants = candidates.length;
  const processedResumes = candidates.filter(c => c.ats_score !== undefined || c.raw_resume_text).length;
  const shortlistedCount = candidates.filter(c => (c.ats_score && c.ats_score >= 70) || c.status === 'Shortlisted').length;
  const activeDrivesCount = jobs.filter(j => j.status === 'Active').length;

  const stats = [
    { name: 'Active Job Drives', value: activeDrivesCount.toString(), icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Total Applicants', value: totalApplicants.toString(), icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { name: 'Resumes Processed', value: processedResumes.toString(), icon: FileText, color: 'text-srm-400', bg: 'bg-srm-400/10' },
    { name: 'Shortlisted Candidates', value: shortlistedCount.toString(), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {displayName}</h1>
          <p className="text-slate-400 mt-1">Institutional Placement &amp; AI Screening Dashboard ({activeRole}).</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/upload')}
            className="flex items-center space-x-2 bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Upload Resume</span>
          </button>
          <button 
            onClick={() => navigate('/jobs')}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Post Drive</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-slate-900 pt-5 px-4 pb-6 sm:pt-6 sm:px-6 rounded-xl border border-slate-800 shadow-sm overflow-hidden hover:border-slate-700 transition-colors">
            <dt>
              <div className={`absolute rounded-lg p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-slate-400 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline sm:pb-3">
              <p className="text-2xl font-semibold text-white">{item.value}</p>
            </dd>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Drives */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-srm-400" />
              Active Placement Drives
            </h2>
            <button onClick={() => navigate('/jobs')} className="text-sm font-medium text-srm-400 hover:text-srm-300 transition-colors">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-white">No placement drives created yet</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Create your first campus hiring drive to start AI screening.</p>
                <button
                  onClick={() => navigate('/jobs')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Placement Drive</span>
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Company &amp; Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Min CGPA</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {jobs.map((drive) => (
                    <tr key={drive.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700">
                            {drive.company.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{drive.company}</div>
                            <div className="text-sm text-slate-400">{drive.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{drive.academic_eligibility?.allowed_departments?.join(', ') || 'All Depts'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">
                          {drive.academic_eligibility?.min_cgpa || 6.0} CGPA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => navigate('/screening')}
                          className="text-srm-400 hover:text-srm-300 transition-colors bg-srm-400/10 hover:bg-srm-400/20 px-3 py-1.5 rounded-md"
                        >
                          Screen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity / Candidate Stream */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="mr-2 h-5 w-5 text-slate-400" />
              Recent Applicants
            </h2>
            <button onClick={() => navigate('/candidates')} className="text-xs text-srm-400 hover:text-srm-300">View Pool</button>
          </div>
          <div className="p-6 flex-1">
            {candidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <FileText className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-white">No applicants uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">Upload candidate resumes to check ATS match and build your talent pool.</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upload &amp; Screen Resume</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {candidates.slice(0, 5).map((cand) => (
                  <div key={cand.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-850/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white">{cand.name}</div>
                      <div className="text-xs text-slate-400">{cand.education.department} • CGPA {cand.education.cgpa}</div>
                    </div>
                    {cand.ats_score !== undefined ? (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cand.ats_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        cand.ats_score >= 60 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {cand.ats_score}% ATS
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Unscreened</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {candidates.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <button 
                onClick={() => navigate('/candidates')}
                className="w-full text-center text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <span>View All Candidates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
