import React from 'react';
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  GraduationCap, 
  ChevronRight, 
  Building2, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { JobRequirement } from '../types';

interface JobsManagementViewProps {
  jobs: JobRequirement[];
  onOpenNewJob: () => void;
  onScreenJob: (jobId: string) => void;
}

export const JobsManagementView: React.FC<JobsManagementViewProps> = ({
  jobs,
  onOpenNewJob,
  onScreenJob
}) => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-srm-500/20 text-srm-300 border border-srm-500/30 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Recruitment Drives
            </span>
            <span className="text-xs text-slate-400">
              • {jobs.length} Active Placement Opportunities
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            Job Requirements & Eligibility Profiles
          </h1>
          <p className="text-xs text-slate-300">
            Define corporate job openings, target academic eligibility standards, required skills, and deadline milestones
          </p>
        </div>

        <button
          onClick={onOpenNewJob}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white text-xs font-bold shadow-glow-srm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Job Requirement</span>
        </button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job) => (
          <div 
            key={job.id}
            className="glass-panel glass-panel-hover rounded-2xl p-6 space-y-4 relative flex flex-col justify-between"
          >
            <div>
              {/* Company & Type */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-srm-950 border border-slate-700 flex items-center justify-center font-bold text-srm-400 text-lg shadow-sm">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {job.title}
                    </h3>
                    <div className="text-xs text-slate-400">
                      {job.company} • <span className="text-amber-400 font-semibold">{job.ctc_lpa}</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {job.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 mt-3 leading-relaxed">
                {job.job_description}
              </p>

              {/* Eligibility Specs */}
              <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">SRM Min CGPA:</span>
                  <span className="font-bold text-emerald-400">≥ {job.academic_eligibility.min_cgpa.toFixed(1)} / 10</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Eligible Branches:</span>
                  <span className="font-medium text-white truncate max-w-[180px]">
                    {job.academic_eligibility.allowed_departments.join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Batch Year:</span>
                  <span className="font-semibold text-srm-300">{job.academic_eligibility.graduation_year} Batch</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mt-3 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {job.required_skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                      ⭐ {skill}
                    </span>
                  ))}
                  {job.preferred_skills.slice(0, 2).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-srm-400" />
                <span>{job.total_applicants_count || 320} Applicants</span>
              </div>

              <button
                onClick={() => onScreenJob(job.id)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-srm-600 hover:bg-srm-500 text-white font-bold transition-all shadow-glow-srm"
              >
                <span>Launch Screening</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
