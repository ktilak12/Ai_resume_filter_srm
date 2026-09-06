import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { JobRequirement } from '../types';

interface JobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (job: JobRequirement) => void;
}

const AVAILABLE_DEGREES = ['B.Tech', 'B.E.', 'MCA', 'M.Tech', 'BCA'];
const AVAILABLE_DEPTS = [
  'CSE', 
  'IT', 
  'AI & DS', 
  'ECE', 
  'Software Engineering', 
  'Data Science', 
  'Cyber Security',
  'Mechanical'
];

export const JobCreationModal: React.FC<JobCreationModalProps> = ({
  isOpen,
  onClose,
  onSaveJob
}) => {
  if (!isOpen) return null;

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobType, setJobType] = useState<'Full-time' | 'Internship' | 'Full-time + Internship'>('Full-time');
  const [location, setLocation] = useState('Chennai / Hybrid');
  const [ctcLpa, setCtcLpa] = useState('12.0 - 18.0 LPA');
  const [deadline, setDeadline] = useState('2026-11-15');
  const [vacancies, setVacancies] = useState(15);
  const [jobDescription, setJobDescription] = useState('');

  // Academic Eligibility states
  const [allowedDegrees, setAllowedDegrees] = useState<string[]>(['B.Tech', 'B.E.', 'MCA']);
  const [allowedDepts, setAllowedDepts] = useState<string[]>(['CSE', 'IT', 'AI & DS']);
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [gradYear, setGradYear] = useState<number>(2027);

  // Technical Requirements states
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'SQL', 'Machine Learning']);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['AWS', 'Docker', 'Git']);
  const [newPreferredSkill, setNewPreferredSkill] = useState('');

  // Experience
  const [freshersAccepted, setFreshersAccepted] = useState(true);
  const [minExperienceYears, setMinExperienceYears] = useState(0);
  const [internshipPreferred, setInternshipPreferred] = useState(true);

  const [activeSection, setActiveSection] = useState<'basic' | 'academic' | 'technical'>('basic');

  const toggleDegree = (deg: string) => {
    setAllowedDegrees(prev => 
      prev.includes(deg) ? prev.filter(d => d !== deg) : [...prev, deg]
    );
  };

  const toggleDept = (dept: string) => {
    setAllowedDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const addRequiredSkill = () => {
    if (newRequiredSkill.trim() && !requiredSkills.includes(newRequiredSkill.trim())) {
      setRequiredSkills([...requiredSkills, newRequiredSkill.trim()]);
      setNewRequiredSkill('');
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const addPreferredSkill = () => {
    if (newPreferredSkill.trim() && !preferredSkills.includes(newPreferredSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPreferredSkill.trim()]);
      setNewPreferredSkill('');
    }
  };

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      alert('Please provide Job Title and Company name.');
      return;
    }

    const newJob: JobRequirement = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      job_type: jobType,
      location,
      ctc_lpa: ctcLpa,
      application_deadline: deadline,
      open_vacancies: Number(vacancies),
      status: 'Active',
      academic_eligibility: {
        allowed_degrees: allowedDegrees,
        allowed_departments: allowedDepts,
        min_cgpa: Number(minCgpa),
        max_active_backlogs: Number(maxBacklogs),
        graduation_year: Number(gradYear)
      },
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      min_experience_years: Number(minExperienceYears),
      freshers_accepted: freshersAccepted,
      internship_preferred: internshipPreferred,
      job_description: jobDescription || `Recruitment drive for ${title} at ${company} for SRM 2027 batch.`,
      total_applicants_count: 0,
      processed_count: 0,
      shortlisted_count: 0,
      created_at: new Date().toISOString().split('T')[0]
    };

    onSaveJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-dropdown rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-srm-600/30 border border-srm-500/30 flex items-center justify-center text-srm-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Create SRM Recruitment Requirement
              </h2>
              <p className="text-xs text-slate-400">
                Configure academic eligibility rules, required vs preferred skills, and hiring criteria
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
          {[
            { id: 'basic', label: '1. Basic Information', icon: Building2 },
            { id: 'academic', label: '2. SRM Academic Eligibility', icon: GraduationCap },
            { id: 'technical', label: '3. Technical & Skills', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-srm-500 text-srm-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: Basic Information */}
          {activeSection === 'basic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Job Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior AI Engineer / Data Analyst"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Technologies / Amazon / Deloitte"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-time + Internship">Full-time + Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Work Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai / Bangalore / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    CTC / Compensation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14.0 - 20.0 LPA"
                    value={ctcLpa}
                    onChange={(e) => setCtcLpa(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Job Description & Roles
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe key responsibilities, team overview, and project scope..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('academic')}
                  className="px-4 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold"
                >
                  Next: Academic Eligibility →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SRM Academic Eligibility */}
          {activeSection === 'academic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="p-3.5 rounded-xl bg-srm-950/60 border border-srm-500/30 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-srm-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Strict Pre-Screening:</strong> Candidates failing academic criteria will be flagged as Ineligible before AI semantic scoring to maintain institutional standards.
                </p>
              </div>

              {/* Degrees */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Eligible Degrees (SRM IST)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DEGREES.map((deg) => {
                    const isSelected = allowedDegrees.includes(deg);
                    return (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => toggleDegree(deg)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-srm-600/30 border-srm-500 text-srm-200'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${isSelected ? 'bg-srm-500 text-white' : 'border border-slate-600'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span>{deg}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Departments */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Eligible Departments
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_DEPTS.map((dept) => {
                    const isSelected = allowedDepts.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleDept(dept)}
                        className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-srm-600/30 border-srm-500 text-srm-200'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <span>{dept}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-srm-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CGPA, Backlogs, Passing Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Minimum CGPA Cutoff
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="5.0"
                      max="10.0"
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 7.5)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                    />
                    <span className="text-xs font-bold text-emerald-400">/ 10</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Active Backlogs Allowed
                  </label>
                  <select
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  >
                    <option value={0}>0 (No Active Backlogs)</option>
                    <option value={1}>1 Active Backlog</option>
                    <option value={2}>2 Active Backlogs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Graduation Passing Year
                  </label>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  >
                    <option value={2027}>2027 (Current Final/Pre-final)</option>
                    <option value={2026}>2026 Batch</option>
                    <option value={2028}>2028 Batch</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('basic')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('technical')}
                  className="px-4 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold"
                >
                  Next: Technical Skills →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Technical Skills & Experience */}
          {activeSection === 'technical' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Required Skills (Must-have) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">Required Skills ⭐</span>
                    <span className="text-[11px] text-slate-400 font-normal">(Core must-have criteria for AI score)</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Python, SQL, Machine Learning..."
                    value={newRequiredSkill}
                    onChange={(e) => setNewRequiredSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequiredSkill(); } }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                  <button
                    type="button"
                    onClick={addRequiredSkill}
                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Required
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span>⭐ {skill}</span>
                      <button
                        type="button"
                        onClick={() => removeRequiredSkill(skill)}
                        className="text-amber-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills (Bonus) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>Preferred / Good-to-Have Skills</span>
                    <span className="text-[11px] text-slate-400 font-normal">(Bonus weight; candidates not heavily penalized)</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. AWS, Docker, Git, Tableau..."
                    value={newPreferredSkill}
                    onChange={(e) => setNewPreferredSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPreferredSkill(); } }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                  <button
                    type="button"
                    onClick={addPreferredSkill}
                    className="px-3.5 py-2 bg-srm-600/30 hover:bg-srm-600/40 text-srm-300 border border-srm-500/40 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Preferred
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredSkill(skill)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Freshers Accepted</div>
                    <div className="text-[11px] text-slate-400">Suitable for campus placements</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={freshersAccepted}
                    onChange={(e) => setFreshersAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-srm-500 focus:ring-srm-500 bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Prior Internship Preferred</div>
                    <div className="text-[11px] text-slate-400">Awards bonus experience points</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={internshipPreferred}
                    onChange={(e) => setInternshipPreferred(e.target.checked)}
                    className="w-4 h-4 rounded text-srm-500 focus:ring-srm-500 bg-slate-800 border-slate-700"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveSection('academic')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white text-xs font-bold shadow-glow-srm transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Publish Placement Drive</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
};
