import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  ChevronRight, 
  X, 
  Users, 
  RotateCcw,
  Sliders
} from 'lucide-react';
import { JobRequirement, UserRole } from '../types';
import { INITIAL_JOBS } from '../data/srmDataset';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { JobCreationModal } from '../components/modals/JobCreationModal';
import { SEO } from '../components/common/SEO';

export const JobListing: React.FC = () => {
  const { userRole } = useOutletContext<{ userRole: UserRole }>();
  const navigate = useNavigate();

  // Load jobs from persistent state or clean fallback
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Modal State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToManage, setJobToManage] = useState<JobRequirement | null>(null);

  const handleOpenCreate = () => {
    setJobToManage(null);
    setIsModalOpen(true);
  };

  const handleOpenManage = (job: JobRequirement) => {
    setJobToManage(job);
    setIsModalOpen(true);
  };

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
    setIsModalOpen(false);
    setJobToManage(null);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => {
      const updated = prev.filter(j => j.id !== jobId);
      localStorage.setItem('srm_jobs_list', JSON.stringify(updated));
      return updated;
    });
    setIsModalOpen(false);
    setJobToManage(null);
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
      const matchesSearch = !searchTerm.trim() ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.required_skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedStatus !== 'all' && (job.status || 'Active') !== selectedStatus) {
        return false;
      }

      if (selectedType !== 'all' && !job.job_type.toLowerCase().includes(selectedType.toLowerCase())) {
        return false;
      }

      if (selectedDept !== 'all') {
        const depts = job.academic_eligibility?.allowed_departments || [];
        const hasDept = depts.some(d => d.toLowerCase().includes(selectedDept.toLowerCase()));
        if (!hasDept) return false;
      }

      if (minCgpaFilter !== 'all') {
        const targetMin = parseFloat(minCgpaFilter);
        if ((job.academic_eligibility?.min_cgpa || 0) > targetMin) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, searchTerm, selectedDept, selectedStatus, selectedType, minCgpaFilter]);

  // Google Jobs JobPosting structured data for active placement drives
  const jobPostingSchema = useMemo(() => {
    const activeDrives = jobs.filter(j => j.status === 'Active').slice(0, 6);
    return {
      "@context": "https://schema.org",
      "@graph": activeDrives.map(job => ({
        "@type": "JobPosting",
        "title": job.title,
        "description": job.job_description || `${job.title} campus placement drive at SRM Institute of Science and Technology for ${job.company}. Minimum CGPA: ${job.academic_eligibility?.min_cgpa || 7.0}. Allowed departments: ${(job.academic_eligibility?.allowed_departments || []).join(', ')}.`,
        "identifier": {
          "@type": "PropertyValue",
          "name": job.company,
          "value": job.id
        },
        "datePosted": job.created_at || "2026-08-01",
        "validThrough": job.application_deadline ? `${job.application_deadline}T23:59:59+05:30` : "2026-12-31T23:59:59+05:30",
        "employmentType": job.job_type === 'Internship' ? "INTERN" : "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company,
          "sameAs": "https://www.srmist.edu.in"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "SRM Nagar, Kattankulathur",
            "addressLocality": "Chengalpattu",
            "addressRegion": "Tamil Nadu",
            "postalCode": "603203",
            "addressCountry": "IN"
          }
        },
        "skills": (job.required_skills || []).join(', ')
      }))
    };
  }, [jobs]);

  return (
    <div className="space-y-6 pb-12">
      <SEO
        title="Campus Placement Drives & Engineering Recruitment 2026 | SRM ResumeAI"
        description="Browse active campus recruitment drives, cutoff scores, eligibility matrices, and skill criteria at SRM Institute of Science and Technology."
        canonical="/jobs"
        keywords="SRM placement drives, campus recruitment 2026, software engineer campus jobs, SRM Kattankulathur placements, campus interview drives"
        structuredData={jobPostingSchema}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-white" />
            Placement Drives
          </h1>
          <p className="text-zinc-400 mt-1 text-xs">
            Manage placement criteria, cutoffs, and departmental whitelists.
          </p>
        </div>
        {(userRole === 'Faculty Coordinator' || userRole === 'Super Admin') && (
          <button 
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-semibold transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Drive</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-xl leading-5 bg-zinc-950 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-xs"
              placeholder="Search roles, companies (e.g. Google, Microsoft, Amazon), or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
              isFilterPanelOpen || activeFiltersCount > 0
                ? 'bg-white text-black border-white'
                : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </button>
        </div>

        {/* Expandable Advanced Filters Panel */}
        {isFilterPanelOpen && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-850 text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5 font-mono">
                <Sliders className="w-3.5 h-3.5 text-white" />
                Filter Drives
              </span>
              <button
                onClick={resetFilters}
                className="text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-500 mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="all">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Drive Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Drive Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="all">All Drive Types</option>
                  <option value="Full-time">Full-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Super Dream">Super Dream</option>
                  <option value="Dream">Dream</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">Max CGPA Cutoff</label>
                <select
                  value={minCgpaFilter}
                  onChange={(e) => setMinCgpaFilter(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-zinc-500"
                >
                  <option value="all">Any Cutoff</option>
                  <option value="7.0">CGPA ≤ 7.0</option>
                  <option value="7.5">CGPA ≤ 7.5</option>
                  <option value="8.0">CGPA ≤ 8.0</option>
                  <option value="8.5">CGPA ≤ 8.5</option>
                </select>
              </div>
            </div>

            {/* Quick Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-850 text-[11px] font-mono">
                <span className="text-zinc-500">Active:</span>
                {selectedDept !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Dept: {selectedDept}
                    <button onClick={() => setSelectedDept('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Status: {selectedStatus}
                    <button onClick={() => setSelectedStatus('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Type: {selectedType}
                    <button onClick={() => setSelectedType('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minCgpaFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800">
                    Cutoff: {minCgpaFilter}
                    <button onClick={() => setMinCgpaFilter('all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
            <Briefcase className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-bold text-white">No Placement Drives Match Current Filters</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Try adjusting your search terms or clearing active filters to view all placement opportunities.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold border border-zinc-800 transition-all mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-zinc-950 rounded-2xl border border-zinc-850 overflow-hidden hover:border-zinc-750 transition-all flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-white font-mono font-bold text-base">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{job.title}</h3>
                      <p className="text-xs text-zinc-400 font-mono">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {job.status || 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-zinc-300 mb-5 font-mono">
                  <div className="flex items-center text-zinc-400">
                    <MapPin className="mr-2 h-3.5 w-3.5 text-zinc-500" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-zinc-400">
                    <Briefcase className="mr-2 h-3.5 w-3.5 text-zinc-500" />
                    {job.job_type}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-zinc-500">₹</span>
                    <strong className="text-white">{job.ctc_lpa || 'Competitive'}</strong>
                  </div>
                  <div className="flex items-center text-zinc-400">
                    <Calendar className="mr-2 h-3.5 w-3.5 text-zinc-500" />
                    Deadline: {job.application_deadline}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-2">Academic &amp; Skill Criteria</h4>
                  <div className="flex flex-wrap gap-1.5 mb-3 font-mono">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-white border border-zinc-800">
                      Min CGPA: {job.academic_eligibility?.min_cgpa ?? 7.0}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                      Batch {job.academic_eligibility?.graduation_year ?? 2026}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                      Max Backlogs: {job.academic_eligibility?.max_active_backlogs ?? 0}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 font-mono">
                    {job.required_skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 text-[10px] border border-zinc-800">
                        {s}
                      </span>
                    ))}
                    {job.preferred_skills?.slice(0, 2).map((s, idx) => (
                      <span key={`pref-${idx}`} className="px-2 py-0.5 rounded bg-black text-zinc-500 text-[10px] border border-zinc-850">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-black px-6 py-3 border-t border-zinc-850 flex justify-between items-center gap-3">
                <div className="flex items-center text-xs text-zinc-400 font-mono">
                  <Users className="mr-1.5 h-3.5 w-3.5 text-zinc-500" />
                  <span>Vacancies: <strong className="text-white">{job.open_vacancies}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Manage Drive Button */}
                  <button
                    onClick={() => handleOpenManage(job)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all"
                    title={`Manage & Edit ${job.company} Drive`}
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Manage</span>
                  </button>

                  {/* Screen Candidates Button */}
                  <button 
                    onClick={() => navigate('/screening', { state: { selectedJobId: job.id } })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all"
                  >
                    <span>Screen</span>
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
