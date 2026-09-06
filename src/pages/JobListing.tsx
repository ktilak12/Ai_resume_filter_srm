import React, { useState } from 'react';
import { Briefcase, MapPin, Building, Calendar, Users, Filter, Plus, Search, ChevronRight } from 'lucide-react';
import { INITIAL_JOBS } from '../data/srmDataset';
import { useOutletContext } from 'react-router-dom';
import { UserRole } from '../types';

export const JobListing: React.FC = () => {
  const { userRole } = useOutletContext<{ userRole: UserRole }>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = INITIAL_JOBS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Placement Drives</h1>
          <p className="text-slate-400 mt-1">Manage institutional job requirements and eligibility.</p>
        </div>
        {(userRole === 'Placement Officer' || userRole === 'Super Admin') && (
          <button className="flex items-center space-x-2 bg-srm-600 hover:bg-srm-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-srm-500">
            <Plus className="h-5 w-5" />
            <span>New Drive</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-srm-500 focus:border-srm-500 transition-colors"
            placeholder="Search roles or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden hover:border-slate-700 transition-all flex flex-col group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm group-hover:border-srm-500/50 transition-colors">
                    <Building className="h-6 w-6 text-slate-400 group-hover:text-srm-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-srm-400 transition-colors">{job.title}</h3>
                    <p className="text-slate-400">{job.company}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-slate-300 mb-6">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-slate-500" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-slate-500" />
                  {job.job_type}
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-slate-500 font-medium">₹</span>
                  {job.ctc_lpa || 'Not Disclosed'}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                  Deadline: {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'TBD'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Academic Eligibility</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300">
                    Min CGPA: {job.academic_eligibility.min_cgpa}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300">
                    Max Backlogs: {job.academic_eligibility.max_active_backlogs}
                  </span>
                  {job.academic_eligibility.allowed_degrees.map((deg: string) => (
                    <span key={deg} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300">
                      {deg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-800 flex justify-between items-center">
              <div className="flex items-center text-sm text-slate-400">
                <Users className="mr-2 h-4 w-4" />
                <span><strong className="text-white">125</strong> applied</span>
              </div>
              <button className="flex items-center text-sm font-medium text-srm-400 hover:text-srm-300 transition-colors group-hover:translate-x-1 duration-200">
                Manage Drive <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
