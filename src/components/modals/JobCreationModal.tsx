import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Check, 
  Plus, 
  Trash2, 
  Building2, 
  Sparkles
} from 'lucide-react';
import { JobRequirement } from '../../types';

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
      setVacancies(jobToEdit.open_vacancies || 10);
      setStatus(jobToEdit.status || 'Active');
      setJobDescription(jobToEdit.job_description || '');

      if (jobToEdit.academic_eligibility) {
        setAllowedDegrees(jobToEdit.academic_eligibility.allowed_degrees || ['B.Tech']);
        setAllowedDepts(jobToEdit.academic_eligibility.allowed_departments || ['CSE']);
        setMinCgpa(jobToEdit.academic_eligibility.min_cgpa ?? 7.0);
        setMaxBacklogs(jobToEdit.academic_eligibility.max_active_backlogs ?? 0);
        setGradYear(jobToEdit.academic_eligibility.graduation_year ?? 2026);
      }

      setRequiredSkills(jobToEdit.required_skills || ['Python', 'SQL']);
      setPreferredSkills(jobToEdit.preferred_skills || ['AWS', 'Git']);
      setFreshersAccepted(jobToEdit.freshers_accepted ?? true);
      setMinExperienceYears(jobToEdit.min_experience_years ?? 0);
      setInternshipPreferred(jobToEdit.internship_preferred ?? true);
    } else {
      // Default reset
      setTitle('');
      setCompany('');
      setJobType('Full-time');
      setLocation('Chennai / Hybrid');
      setCtcLpa('12.0 - 18.0 LPA');
      setDeadline('2026-11-15');
      setVacancies(10);
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
      setActiveSection('basic');
    }
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
      alert('Please specify Company Name and Role Title.');
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
      status,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850 bg-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{jobToEdit ? `Manage Drive: ${jobToEdit.company}` : 'Create Recruitment Drive'}</span>
                {jobToEdit && (
                  <span className="text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-mono">
                    Edit Mode
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-500">
                Configure eligibility cutoffs, required skills, and drive parameters
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-zinc-850 bg-black px-6">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'basic'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            1. Role Details
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('academic')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'academic'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            2. Academic Cutoffs
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('technical')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'technical'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            3. Skills &amp; Criteria
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* SECTION 1: BASIC DETAILS */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Amazon"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Development Engineer"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Drive Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-time + Internship">Full-time + Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Package / CTC
                  </label>
                  <input
                    type="text"
                    value={ctcLpa}
                    onChange={(e) => setCtcLpa(e.target.value)}
                    placeholder="e.g. 18.0 - 24.0 LPA"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Total Open Vacancies
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={vacancies}
                    onChange={(e) => setVacancies(parseInt(e.target.value, 10))}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai / Bangalore / Hybrid"
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Job Description &amp; Role Summary
                </label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Outline key responsibilities and drive expectations..."
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-zinc-500"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-850">
                {jobToEdit && onDeleteJob ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${jobToEdit.company} drive?`)) {
                        onDeleteJob(jobToEdit.id);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : <div></div>}
                <button
                  type="button"
                  onClick={() => setActiveSection('academic')}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold"
                >
                  Next: Academic Cutoffs →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: ACADEMIC CUTOFFS */}
          {activeSection === 'academic' && (
            <div className="space-y-5 font-mono">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Allowed Degrees
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DEGREES.map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => toggleDegree(deg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        allowedDegrees.includes(deg)
                          ? 'bg-white text-black border-white'
                          : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {deg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Eligible Departments
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_DEPTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDept(dept)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        allowedDepts.includes(dept)
                          ? 'bg-white text-black border-white'
                          : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black border border-zinc-850 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-300">
                    <span>Minimum CGPA</span>
                    <span className="text-white">≥ {minCgpa.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="9.5"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-zinc-850 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-300">
                    <span>Max Backlogs</span>
                    <span className="text-white">{maxBacklogs}</span>
                  </div>
                  <select
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value={0}>0 Backlogs (Strict Zero)</option>
                    <option value={1}>Max 1 Backlog</option>
                    <option value={2}>Max 2 Backlogs</option>
                    <option value={5}>Any Backlogs Allowed</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-black border border-zinc-850 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-300">
                    <span>Graduation Batch</span>
                    <span className="text-white">{gradYear}</span>
                  </div>
                  <select
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value={2026}>Class of 2026</option>
                    <option value={2027}>Class of 2027</option>
                    <option value={2025}>Class of 2025</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setActiveSection('basic')}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs border border-zinc-800"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('technical')}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold"
                >
                  Next: Skills &amp; Criteria →
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: TECHNICAL SKILLS & CRITERIA */}
          {activeSection === 'technical' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Required Mandatory Skills (⭐)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRequiredSkill}
                    onChange={(e) => setNewRequiredSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRequiredSkill(); } }}
                    placeholder="Type skill & press Enter (e.g. Python, React, SQL)..."
                    className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={addRequiredSkill}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono"
                    >
                      <span>⭐ {skill}</span>
                      <button
                        type="button"
                        onClick={() => removeRequiredSkill(skill)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Preferred Skills (Bonus Weight)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPreferredSkill}
                    onChange={(e) => setNewPreferredSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPreferredSkill(); } }}
                    placeholder="e.g. Docker, AWS, Kubernetes..."
                    className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={addPreferredSkill}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black border border-zinc-850 text-zinc-400 text-xs font-mono"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removePreferredSkill(skill)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-zinc-850">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Freshers Accepted</div>
                    <div className="text-[11px] text-zinc-500">Suitable for campus placements</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={freshersAccepted}
                    onChange={(e) => setFreshersAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-black bg-zinc-900 border-zinc-700 accent-white"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-zinc-850">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Prior Internship Preferred</div>
                    <div className="text-[11px] text-zinc-500">Bonus weight for practical experience</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={internshipPreferred}
                    onChange={(e) => setInternshipPreferred(e.target.checked)}
                    className="w-4 h-4 rounded text-black bg-zinc-900 border-zinc-700 accent-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setActiveSection('academic')}
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs border border-zinc-800"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all"
                  >
                    <span>{jobToEdit ? 'Save Changes' : 'Publish Drive'}</span>
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
