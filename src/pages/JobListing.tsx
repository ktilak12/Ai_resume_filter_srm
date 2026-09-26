import React, { useState } from 'react';
import { Briefcase, MapPin, Building, Calendar, Users, Filter, Plus, Search, ChevronRight } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserRole, JobRequirement } from '../types';
import { JobCreationModal } from '../views/JobCreationModal';

export const JobListing: React.FC = () => {
  const navigate = useNavigate();
  const context = useOutletContext<{ userRole?: UserRole }>() || {};
  const userRole = context.userRole || 'Placement Officer';
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [jobs, setJobs] = useState<JobRequirement[]>(() => {
    const saved = localStorage.getItem('srm_jobs_list');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveJob = (newJob: JobRequirement) => {
    setJobs(prev => {
      const updated = [newJob, ...prev];
      localStorage.setItem('srm_jobs_list', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.required_skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Placement Drives</h1>
          <p className="text-slate-400 mt-1">Manage institutional job requirements, eligibility cutoffs, and hiring criteria.</p>
        </div>
        {(userRole === 'Placement Officer' || userRole === 'Super Admin') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-srm-600 hover:bg-srm-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-glow-srm text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Drive</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-srm-500 focus:border-srm-500 transition-colors text-xs"
            placeholder="Search roles, companies, or required skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
            <Briefcase className="w-6 h-6 text-srm-400" />
          </div>
          <h3 className="text-base font-bold text-white">No Active Placement Drives Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No placement drives have been created yet. Publish a company job requirement to begin automated candidate matching.
          </p>
          {(userRole === 'Placement Officer' || userRole === 'Super Admin') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-bold transition-all shadow-glow-srm mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Placement Drive</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-srm-600/20 flex items-center justify-center border border-srm-500/30 text-srm-400 font-bold shadow-sm group-hover:border-srm-500/50 transition-colors text-lg">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-srm-400 transition-colors">{job.title}</h3>
                      <p className="text-xs text-amber-400">{job.company}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {job.status || 'Active'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-slate-300 mb-6">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-3.5 w-3.5 text-slate-500" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="mr-2 h-3.5 w-3.5 text-slate-500" />
                    {job.job_type}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-slate-500 font-medium">₹</span>
                    {job.ctc_lpa || 'Competitive'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-3.5 w-3.5 text-slate-500" />
                    Deadline: {job.application_deadline}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Academic &amp; Skill Criteria</h4>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Min CGPA: {job.academic_eligibility.min_cgpa}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      Batch {job.academic_eligibility.graduation_year}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      Max Backlogs: {job.academic_eligibility.max_active_backlogs}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-srm-500/10 text-srm-300 text-[10px] font-semibold border border-srm-500/20">
                        ⭐ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-950/60 px-6 py-3.5 border-t border-slate-800 flex justify-between items-center">
                <div className="flex items-center text-xs text-slate-400">
                  <Users className="mr-1.5 h-3.5 w-3.5 text-srm-400" />
                  <span>Vacancies: <strong className="text-white">{job.open_vacancies}</strong></span>
                </div>
                <button 
                  onClick={() => navigate('/screening')}
                  className="flex items-center text-xs font-semibold text-srm-400 hover:text-srm-300 transition-colors group-hover:translate-x-1 duration-200"
                >
                  Screen Candidates <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <JobCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveJob={handleSaveJob}
      />
    </div>
  );
};
