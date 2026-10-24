import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Plus, 
  ArrowRight, 
  Sparkles,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserRole, CandidateProfile, JobRequirement, Interview } from '../types';
import { useAuth } from '../context/AuthContext';
import { INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_INTERVIEWS } from '../data/srmDataset';
import { JobCreationModal } from '../components/modals/JobCreationModal';
import { SEO } from '../components/common/SEO';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const context = useOutletContext<{ userRole?: UserRole }>() || {};
  const activeRole = currentUser?.role || context.userRole || 'Faculty Coordinator';
  const displayName = currentUser?.name || activeRole;

  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => {
    try {
      const saved = localStorage.getItem('srm_candidates_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_CANDIDATES;
  });

  const [jobs, setJobs] = useState<JobRequirement[]>(() => {
    try {
      const saved = localStorage.getItem('srm_jobs_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_JOBS;
  });

  const [interviews, setInterviews] = useState<Interview[]>(() => {
    try {
      const saved = localStorage.getItem('srm_interviews_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INTERVIEWS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToManage, setJobToManage] = useState<JobRequirement | null>(null);

  const handleSaveJob = (newOrUpdatedJob: JobRequirement) => {
    setJobs(prev => {
      const existsIndex = prev.findIndex(j => j.id === newOrUpdatedJob.id);
      let updated: JobRequirement[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = newOrUpdatedJob;
      } else {
        updated = [newOrUpdatedJob, ...prev];
      }
      localStorage.setItem('srm_jobs_list', JSON.stringify(updated));
      return updated;
    });
    setJobToManage(null);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => {
      const updated = prev.filter(j => j.id !== jobId);
      localStorage.setItem('srm_jobs_list', JSON.stringify(updated));
      return updated;
    });
    setJobToManage(null);
  };

  const handleOpenManage = (job: JobRequirement) => {
    setJobToManage(job);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setJobToManage(null);
    setIsModalOpen(true);
  };

  const totalApplicants = candidates.length;
  const processedResumes = candidates.filter(c => c.ats_score !== undefined || c.raw_resume_text).length;
  const shortlistedCount = candidates.filter(c => (c.ats_score && c.ats_score >= 70) || c.status === 'Shortlisted').length;
  const activeDrivesCount = jobs.filter(j => j.status === 'Active').length;

  const stats = [
    { name: 'Active Job Drives', value: activeDrivesCount.toString(), icon: Briefcase },
    { name: 'Total Applicants', value: totalApplicants.toString(), icon: Users },
    { name: 'Resumes Processed', value: processedResumes.toString(), icon: FileText },
    { name: 'Shortlisted Candidates', value: shortlistedCount.toString(), icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <SEO
        title="Institutional Placement Dashboard | SRM ResumeAI"
        description="Comprehensive placement metrics, applicant volume, active recruitment drives, and shortlisting analytics for SRM Institute of Science and Technology."
        canonical="/dashboard"
        noIndex={true}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, {displayName}</h1>
          <p className="text-zinc-400 text-xs mt-1">Placement &amp; AI Screening Dashboard ({activeRole}).</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/upload')}
            className="flex items-center space-x-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Upload Resume</span>
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold px-3.5 py-2 rounded-lg border border-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Post Drive</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-zinc-950 p-5 rounded-xl border border-zinc-850 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="rounded-lg p-2.5 bg-zinc-900 border border-zinc-800 text-white">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-400">{item.name}</p>
                <p className="text-2xl font-bold font-mono text-white mt-0.5">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Drives */}
        <div className="lg:col-span-2 bg-zinc-950 rounded-xl border border-zinc-850 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-zinc-850 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-white" />
              Active Placement Drives
            </h2>
            <button onClick={() => navigate('/jobs')} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-white">No placement drives created yet</h3>
                <p className="text-xs text-zinc-400 mt-1 mb-4">Create your first campus hiring drive to start AI screening.</p>
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Placement Drive</span>
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-zinc-850">
                <thead className="bg-zinc-950">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Company &amp; Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Min CGPA</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 bg-black">
                  {jobs.map((drive) => (
                    <tr key={drive.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white font-mono font-bold border border-zinc-800 text-xs">
                            {drive.company.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-xs font-semibold text-white">{drive.company}</div>
                            <div className="text-[11px] text-zinc-400">{drive.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-zinc-300">{drive.academic_eligibility?.allowed_departments?.join(', ') || 'All Depts'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-200">
                          ≥ {drive.academic_eligibility?.min_cgpa ?? 6.0} CGPA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenManage(drive)}
                            className="text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                            title={`Manage ${drive.company} Drive`}
                          >
                            <Settings className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Manage</span>
                          </button>
                          <button 
                            onClick={() => navigate('/screening', { state: { selectedJobId: drive.id } })}
                            className="text-black bg-white hover:bg-zinc-200 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                          >
                            Screen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity / Candidate Stream */}
        <div className="bg-zinc-950 rounded-xl border border-zinc-850 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-zinc-850 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white flex items-center">
              <Clock className="mr-2 h-4 w-4 text-white" />
              Recent Applicants
            </h2>
            <button onClick={() => navigate('/candidates')} className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">View Pool</button>
          </div>
          <div className="p-5 flex-1">
            {candidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <FileText className="w-10 h-10 text-zinc-600 mb-2" />
                <p className="text-sm font-medium text-white">No applicants uploaded yet</p>
                <p className="text-xs text-zinc-400 mt-1 mb-4">Upload candidate resumes to check ATS match and build your talent pool.</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upload &amp; Screen Resume</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.slice(0, 5).map((cand) => (
                  <div key={cand.id} className="flex items-center justify-between p-3 rounded-lg bg-black border border-zinc-850 hover:border-zinc-700 transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-white">{cand.name}</div>
                      <div className="text-[11px] text-zinc-500">{cand.education.department} • CGPA {cand.education.cgpa}</div>
                    </div>
                    {cand.ats_score !== undefined ? (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 text-white">
                        {cand.ats_score}% ATS
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500 font-mono">Unscreened</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {candidates.length > 0 && (
            <div className="p-3 border-t border-zinc-850 bg-black">
              <button 
                onClick={() => navigate('/candidates')}
                className="w-full text-center text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <span>View All Candidates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating & Managing Placement Drives */}
      <JobCreationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setJobToManage(null);
        }}
        onSaveJob={handleSaveJob}
        jobToEdit={jobToManage}
        onDeleteJob={handleDeleteJob}
      />
    </div>
  );
};

export default Dashboard;
