import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Building, 
  Calendar, 
  Users, 
  Filter, 
  Plus, 
  Search, 
  ChevronRight,
  Settings,
  Sliders,
  Check,
  X,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserRole, JobRequirement } from '../types';
import { INITIAL_JOBS } from '../data/srmDataset';
import { JobCreationModal } from '../views/JobCreationModal';

export const JobListing: React.FC = () => {
  const navigate = useNavigate();
  const context = useOutletContext<{ userRole?: UserRole }>() || {};
  const userRole = context.userRole || 'Placement Officer';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToManage, setJobToManage] = useState<JobRequirement | null>(null);

  const [jobs, setJobs] = useState<JobRequirement[]>(() => {
    const saved = localStorage.getItem('srm_jobs_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_JOBS;
  });

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

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setMinCgpaFilter('all');
  };

  const activeFiltersCount = [
    selectedDept !== 'all',
    selectedStatus !== 'all',
    selectedType !== 'all',
    minCgpaFilter !== 'all'
  ].filter(Boolean).length;

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search
      const matchesSearch = !searchTerm.trim() ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.required_skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Status
      if (selectedStatus !== 'all' && (job.status || 'Active') !== selectedStatus) {
        return false;
      }

      // Job Type
      if (selectedType !== 'all' && !job.job_type.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }

      // Department
      if (selectedDept !== 'all') {
        const depts = job.academic_eligibility?.allowed_departments || [];
        const hasDept = depts.some(d => d.toLowerCase().includes(selectedDept.toLowerCase()));
        if (!hasDept) return false;
      }

      // Min CGPA
      if (minCgpaFilter !== 'all') {
        const targetMin = parseFloat(minCgpaFilter);
        if ((job.academic_eligibility?.min_cgpa || 0) > targetMin) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, searchTerm, selectedDept, selectedStatus, selectedType, minCgpaFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-srm-400" />
            Placement Drives & Job Requirements
          </h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Manage institutional job requirements, eligibility cutoffs, and hiring criteria.
          </p>
        </div>
        {(userRole === 'Placement Officer' || userRole === 'Super Admin') && (
          <button 
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-glow-srm text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Drive</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-srm-500 focus:border-srm-500 transition-colors text-xs"
              placeholder="Search roles, companies (e.g. Google, Microsoft, Amazon), or required skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              isFilterPanelOpen || activeFiltersCount > 0
                ? 'bg-srm-600 text-white border-srm-500 shadow-glow-srm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </button>
        </div>

        {/* Expandable Advanced Filters Panel */}
        {isFilterPanelOpen && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-srm-400" />
                Filter Job Requirements
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Department */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Target Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-srm-500"
                >
                  <option value="all">All Departments</option>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="AI & DS">AI & Data Science (AI & DS)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="MBA">Management Studies (MBA)</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Drive Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-srm-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Job Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-srm-500"
                >
                  <option value="all">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Min CGPA */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Max CGPA Barrier</label>
                <select
                  value={minCgpaFilter}
                  onChange={(e) => setMinCgpaFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-srm-500"
                >
                  <option value="all">Any CGPA</option>
                  <option value="7.0">CGPA ≤ 7.0 Cutoff</option>
                  <option value="7.5">CGPA ≤ 7.5 Cutoff</option>
                  <option value="8.0">CGPA ≤ 8.0 Cutoff</option>
                  <option value="8.5">CGPA ≤ 8.5 Cutoff</option>
                </select>
              </div>
            </div>

            {/* Quick Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-500 font-medium">Active:</span>
                {selectedDept !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-srm-500/20 text-srm-300 border border-srm-500/30">
                    Dept: {selectedDept}
                    <button onClick={() => setSelectedDept('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Status: {selectedStatus}
                    <button onClick={() => setSelectedStatus('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Type: {selectedType}
                    <button onClick={() => setSelectedType('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minCgpaFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Max CGPA Cutoff: {minCgpaFilter}
                    <button onClick={() => setMinCgpaFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
            <Briefcase className="w-6 h-6 text-srm-400" />
          </div>
          <h3 className="text-base font-bold text-white">No Placement Drives Match Current Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms or clearing active filters to view all placement opportunities.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
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
                      <p className="text-xs text-amber-400 font-semibold">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {job.status || 'Active'}
                    </span>
                  </div>
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
                    <strong className="text-emerald-400">{job.ctc_lpa || 'Competitive'}</strong>
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
                      Min CGPA: {job.academic_eligibility?.min_cgpa ?? 7.0}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      Batch {job.academic_eligibility?.graduation_year ?? 2026}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      Max Backlogs: {job.academic_eligibility?.max_active_backlogs ?? 0}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-srm-500/10 text-srm-300 text-[10px] font-semibold border border-srm-500/20">
                        ⭐ {s}
                      </span>
                    ))}
                    {job.preferred_skills?.slice(0, 2).map((s, idx) => (
                      <span key={`pref-${idx}`} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] border border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-950/60 px-6 py-3.5 border-t border-slate-800 flex justify-between items-center gap-3">
                <div className="flex items-center text-xs text-slate-400">
                  <Users className="mr-1.5 h-3.5 w-3.5 text-srm-400" />
                  <span>Vacancies: <strong className="text-white">{job.open_vacancies}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Manage Drive Button */}
                  <button
                    onClick={() => handleOpenManage(job)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:border-slate-600"
                    title={`Manage & Edit ${job.company} Drive`}
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Manage Drive</span>
                  </button>

                  {/* Screen Candidates Button */}
                  <button 
                    onClick={() => navigate('/screening', { state: { selectedJobId: job.id } })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-srm-600 hover:bg-srm-500 text-white text-xs font-bold transition-all shadow-glow-srm"
                  >
                    <span>Screen Candidates</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating & Managing/Editing Placement Drives */}
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
