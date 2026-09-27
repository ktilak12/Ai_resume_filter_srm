import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Settings,
  Sliders
} from 'lucide-react';
import { JobRequirement } from '../types';

interface JobCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (job: JobRequirement) => void;
  jobToEdit?: JobRequirement | null;
  onDeleteJob?: (jobId: string) => void;
}

const AVAILABLE_DEGREES = ['B.Tech', 'B.E.', 'MCA', 'M.Tech', 'BCA', 'MBA'];
const AVAILABLE_DEPTS = [
  'CSE', 
  'IT', 
  'AI & DS', 
  'ECE', 
  'Software Engineering', 
  'Data Science', 
  'Cyber Security',
  'Mechanical',
  'Management Studies (MBA)'
];

export const JobCreationModal: React.FC<JobCreationModalProps> = ({
  isOpen,
  onClose,
  onSaveJob,
  jobToEdit,
  onDeleteJob
}) => {
  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobType, setJobType] = useState<'Full-time' | 'Internship' | 'Full-time + Internship'>('Full-time');
  const [location, setLocation] = useState('Chennai / Hybrid');
  const [ctcLpa, setCtcLpa] = useState('12.0 - 18.0 LPA');
  const [deadline, setDeadline] = useState('2026-11-15');
  const [vacancies, setVacancies] = useState(15);
  const [status, setStatus] = useState<'Active' | 'Under Review' | 'Closed'>('Active');
  const [jobDescription, setJobDescription] = useState('');

  // Academic Eligibility states
  const [allowedDegrees, setAllowedDegrees] = useState<string[]>(['B.Tech', 'B.E.', 'MCA']);
  const [allowedDepts, setAllowedDepts] = useState<string[]>(['CSE', 'IT', 'AI & DS']);
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [gradYear, setGradYear] = useState<number>(2026);

  // Technical Requirements states
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'SQL', 'Data Structures']);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['AWS', 'Docker', 'Git']);
  const [newPreferredSkill, setNewPreferredSkill] = useState('');

  // Experience
  const [freshersAccepted, setFreshersAccepted] = useState(true);
  const [minExperienceYears, setMinExperienceYears] = useState(0);
  const [internshipPreferred, setInternshipPreferred] = useState(true);

  const [activeSection, setActiveSection] = useState<'basic' | 'academic' | 'technical'>('basic');

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title || '');
      setCompany(jobToEdit.company || '');
      setJobType((jobToEdit.job_type as any) || 'Full-time');
      setLocation(jobToEdit.location || 'Chennai / Hybrid');
      setCtcLpa(jobToEdit.ctc_lpa || '12.0 - 18.0 LPA');
      setDeadline(jobToEdit.application_deadline || '2026-11-15');
      setVacancies(jobToEdit.open_vacancies || 15);
      setStatus((jobToEdit.status as any) || 'Active');
      setJobDescription(jobToEdit.job_description || '');

      if (jobToEdit.academic_eligibility) {
        setAllowedDegrees(jobToEdit.academic_eligibility.allowed_degrees || ['B.Tech', 'MCA']);
        setAllowedDepts(jobToEdit.academic_eligibility.allowed_departments || ['CSE', 'IT']);
        setMinCgpa(jobToEdit.academic_eligibility.min_cgpa ?? 7.5);
        setMaxBacklogs(jobToEdit.academic_eligibility.max_active_backlogs ?? 0);
        setGradYear(jobToEdit.academic_eligibility.graduation_year ?? 2026);
      }

      setRequiredSkills(jobToEdit.required_skills || ['Python', 'SQL']);
      setPreferredSkills(jobToEdit.preferred_skills || ['AWS', 'Git']);
      setFreshersAccepted(jobToEdit.freshers_accepted ?? true);
      setMinExperienceYears(jobToEdit.min_experience_years ?? 0);
      setInternshipPreferred(jobToEdit.internship_preferred ?? true);
    } else {
      setTitle('');
      setCompany('');
      setJobType('Full-time');
      setLocation('Chennai / Hybrid');
      setCtcLpa('12.0 - 18.0 LPA');
      setDeadline('2026-11-15');
      setVacancies(15);
      setStatus('Active');
      setJobDescription('');
      setAllowedDegrees(['B.Tech', 'B.E.', 'MCA']);
      setAllowedDepts(['CSE', 'IT', 'AI & DS']);
      setMinCgpa(7.5);
      setMaxBacklogs(0);
      setGradYear(2026);
      setRequiredSkills(['Python', 'SQL', 'Data Structures']);
      setPreferredSkills(['AWS', 'Docker', 'Git']);
      setFreshersAccepted(true);
      setMinExperienceYears(0);
      setInternshipPreferred(true);
    }
    setActiveSection('basic');
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

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

    const savedJob: JobRequirement = {
      id: jobToEdit?.id || `job-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      job_type: jobType,
      location,
      ctc_lpa: ctcLpa,
      application_deadline: deadline,
      open_vacancies: Number(vacancies),
      status: status,
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
      job_description: jobDescription || `Recruitment drive for ${title} at ${company} for SRM 2026-2027 batch.`,
      total_applicants_count: jobToEdit?.total_applicants_count ?? 0,
      processed_count: jobToEdit?.processed_count ?? 0,
      shortlisted_count: jobToEdit?.shortlisted_count ?? 0,
      created_at: jobToEdit?.created_at || new Date().toISOString().split('T')[0]
    };

    onSaveJob(savedJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-srm-600/30 border border-srm-500/30 flex items-center justify-center text-srm-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                <span>{jobToEdit ? `Manage Placement Drive: ${jobToEdit.company}` : 'Create SRM Recruitment Requirement'}</span>
                {jobToEdit && (
                  <span className="text-[10px] bg-srm-500/20 text-srm-300 border border-srm-500/30 px-2 py-0.5 rounded-full font-mono">
                    Edit Mode
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Configure academic eligibility cutoffs, required vs preferred skills, and hiring criteria
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

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'basic'
                ? 'border-srm-500 text-srm-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            1. Role & Company Details
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('academic')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'academic'
                ? 'border-srm-500 text-srm-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            2. Academic Eligibility
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('technical')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'technical'
                ? 'border-srm-500 text-srm-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            3. Skills & Criteria
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* SECTION 1: BASIC DETAILS */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Amazon"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Development Engineer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-time + Internship">Full-time + Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CTC Package (LPA)
                  </label>
                  <input
                    type="text"
                    value={ctcLpa}
                    onChange={(e) => setCtcLpa(e.target.value)}
                    placeholder="e.g. 28.5 - 34.0 LPA"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Drive Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore / Chennai / Hybrid"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Vacancies
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={vacancies}
                      onChange={(e) => setVacancies(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-srm-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Description & Overview
                </label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Provide role expectations, responsibilities, and team info..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                {jobToEdit && onDeleteJob ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the placement drive for ${jobToEdit.company}?`)) {
                        onDeleteJob(jobToEdit.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Drive</span>
                  </button>
                ) : <div />}
                
                <button
                  type="button"
                  onClick={() => setActiveSection('academic')}
                  className="px-5 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold transition-all"
                >
                  Next: Academic Criteria →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: ACADEMIC ELIGIBILITY */}
          {activeSection === 'academic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Eligible Degrees
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DEGREES.map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => toggleDegree(deg)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        allowedDegrees.includes(deg)
                          ? 'bg-srm-600/30 border-srm-500 text-srm-300 shadow-glow-srm'
                          : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {deg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Eligible Departments / Branches
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DEPTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDept(dept)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        allowedDepts.includes(dept)
                          ? 'bg-srm-600/30 border-srm-500 text-srm-300 shadow-glow-srm'
                          : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Minimum CGPA</span>
                    <span className="text-emerald-400">≥ {minCgpa.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="9.5"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Max Active Backlogs</span>
                    <span className="text-amber-400">{maxBacklogs}</span>
                  </div>
                  <select
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value={0}>0 Backlogs (Strict Zero)</option>
                    <option value={1}>Max 1 Backlog</option>
                    <option value={2}>Max 2 Backlogs</option>
                    <option value={5}>Any / Standing Backlogs Allowed</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Batch Graduation Year</span>
                    <span className="text-srm-300">{gradYear}</span>
                  </div>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value={2026}>2026 Batch</option>
                    <option value={2027}>2027 Batch</option>
                    <option value={2028}>2028 Batch</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
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
                  className="px-5 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold"
                >
                  Next: Required Skills →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: TECHNICAL REQUIREMENTS */}
          {activeSection === 'technical' && (
            <div className="space-y-4">
              
              {/* Mandatory Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Core Mandatory Skills (Key scoring factors)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRequiredSkill}
                    onChange={(e) => setNewRequiredSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRequiredSkill();
                      }
                    }}
                    placeholder="Add skill (e.g. Python, SQL, C++) & press Add"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                  <button
                    type="button"
                    onClick={addRequiredSkill}
                    className="px-3.5 py-1.5 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-srm-950 border border-srm-500/40 text-srm-300 text-xs font-medium"
                    >
                      <span>⭐ {skill}</span>
                      <button
                        type="button"
                        onClick={() => removeRequiredSkill(skill)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred / Good-to-Have Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPreferredSkill}
                    onChange={(e) => setNewPreferredSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPreferredSkill();
                      }
                    }}
                    placeholder="Add preferred skill (e.g. Docker, AWS, Git)"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                  />
                  <button
                    type="button"
                    onClick={addPreferredSkill}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredSkill(skill)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
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

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
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
                    <span>{jobToEdit ? 'Save Changes & Update Drive' : 'Publish Placement Drive'}</span>
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
