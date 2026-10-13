import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  Mail, 
  Phone, 
  Eye, 
  Award, 
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CandidateProfile } from '../types';

interface AllCandidatesViewProps {
  candidates: CandidateProfile[];
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const AllCandidatesView: React.FC<AllCandidatesViewProps> = ({
  candidates,
  onSelectCandidate
}) => {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const filtered = candidates.filter(c => {
    if (selectedDept !== 'all' && !c.education.department.toLowerCase().includes(selectedDept.toLowerCase())) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.reg_number.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <Users className="w-3 h-3 text-white" />
              Student Directory
            </span>
            <span className="text-xs text-zinc-400">
              • SRMIST 2027 Placement Intake Roster
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            Registered Candidate Profiles ({candidates.length})
          </h1>
          <p className="text-xs text-zinc-400">
            Browse verified academic standing, technical skill profiles, and internship history
          </p>
        </div>
      </div>

      {/* Search & Filter toolbar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by student name, RA register number, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science (CSE)</option>
            <option value="Information Technology">Information Technology (IT)</option>
            <option value="AI & Data Science">AI & Data Science</option>
            <option value="ECE">ECE</option>
            <option value="MCA">MCA</option>
          </select>
        </div>

        <div className="text-xs text-zinc-400">
          Showing <strong className="text-white">{filtered.length}</strong> student profiles
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cand) => (
          <div
            key={cand.id}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl p-5 space-y-3 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                    {cand.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {cand.name}
                    </h3>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {cand.reg_number}
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white border border-zinc-700">
                  CGPA: {cand.education.cgpa.toFixed(2)}
                </span>
              </div>

              {/* Education */}
              <div className="mt-3 text-xs text-zinc-300 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <GraduationCap className="w-3.5 h-3.5 text-white" />
                  <span>{cand.education.degree} • {cand.education.department}</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Batch: {cand.education.graduation_year} • Backlogs: {cand.education.active_backlogs}
                </div>
              </div>

              {/* Skills */}
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {cand.skills.slice(0, 5).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-300 text-[10px]">
                      {skill}
                    </span>
                  ))}
                  {cand.skills.length > 5 && (
                    <span className="text-[10px] text-zinc-500 self-center">
                      +{cand.skills.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500 text-[11px]">
                {cand.experience.length > 0 ? `${cand.experience[0].company} (Intern)` : 'Fresher Profile'}
              </span>

              <button
                onClick={() => onSelectCandidate(cand)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Profile</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
