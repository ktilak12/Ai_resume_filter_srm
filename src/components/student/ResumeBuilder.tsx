import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Trash2, 
  Printer, 
  Copy, 
  Save, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FileText, 
  RefreshCw, 
  Wand2, 
  TrendingUp, 
  Eye, 
  Edit3, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Check, 
  HelpCircle,
  Sliders,
  ChevronRight,
  SplitSquareVertical,
  Maximize2,
  UploadCloud,
  FileCheck,
  X,
  FileUp,
  ClipboardPaste
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { JobRequirement, CandidateProfile, ScreeningResult } from '../../types';
import { screenCandidate, evaluateAtsFormatting, AtsFormattingCheck } from '../../services/aiScreeningEngine';
import { parseResumeFile, extractCandidateEntities } from '../../services/resumeParser';
import { 
  ROLE_PRESETS, 
  RolePreset, 
  TemplateTier,
  generateRoleSummary, 
  enhanceBulletPoint, 
  generateFormattedResumeText, 
  getInitialCandidateProfile, 
  getTopScoringTemplate,
  getProfileFromPreset,
  POWER_ACTION_VERBS
} from '../../services/resumeBuilderService';

interface ResumeBuilderProps {
  initialJobId?: string;
  jobs: JobRequirement[];
  onNavigateToDrives?: () => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ 
  initialJobId, 
  jobs,
  onNavigateToDrives 
}) => {
  const { currentUser } = useAuth();

  // Active Target Role or Job Requirement
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    if (initialJobId && jobs.some(j => j.id === initialJobId)) return initialJobId;
    return jobs[0]?.id || 'job-google-sde';
  });

  const selectedJob = useMemo(() => {
    return jobs.find(j => j.id === selectedJobId) || jobs[0];
  }, [jobs, selectedJobId]);

  // View state: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [activeEditorTab, setActiveEditorTab] = useState<'basics' | 'summary' | 'skills' | 'projects' | 'experience' | 'certifications'>('skills');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<TemplateTier>('baseline');

  // Template Source Mode: 'default' (SRM Default) | 'custom' (Student's Own Resume) | 'preset' (Benchmark Presets)
  const [templateSourceMode, setTemplateSourceMode] = useState<'default' | 'custom' | 'preset'>(() => {
    const saved = localStorage.getItem('srm_builder_template_mode');
    if (saved === 'custom' || saved === 'preset') return saved;
    return 'default';
  });

  // Custom Resume Template State
  const [showImportPanel, setShowImportPanel] = useState<boolean>(false);
  const [customImportTab, setCustomImportTab] = useState<'upload' | 'paste'>('upload');
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(() => {
    return localStorage.getItem('srm_builder_imported_file') || null;
  });
  const [pastedResumeText, setPastedResumeText] = useState<string>('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Candidate Profile State (with migration away from old bloated profiles)
  const [candidate, setCandidate] = useState<CandidateProfile>(() => {
    try {
      const saved = localStorage.getItem('srm_student_builder_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If old profile had all skills preloaded, clear it to start genuine
        if (parsed?.skills?.length >= 8 && parsed?.skills?.includes('C++') && parsed?.skills?.includes('Java') && parsed?.skills?.includes('React')) {
          localStorage.removeItem('srm_student_builder_profile');
        } else {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return getInitialCandidateProfile(currentUser);
  });

  // Role summary state
  const [summary, setSummary] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('srm_student_builder_summary');
      if (saved && localStorage.getItem('srm_student_builder_profile')) return saved;
    } catch (e) {
      console.error(e);
    }
    return generateRoleSummary(selectedJob?.title || 'Software Development Engineer', candidate, selectedJob);
  });

  // Temporary input states
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCertInput, setNewCertInput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Dynamic ATS Screening Calculation in Real Time
  const screeningResult: ScreeningResult = useMemo(() => {
    if (!selectedJob) {
      return screenCandidate(candidate, jobs[0]);
    }
    // inject raw resume text with current summary so engine detects all action verbs & text
    const fullProfile: CandidateProfile = {
      ...candidate,
      raw_resume_text: generateFormattedResumeText(candidate, selectedJob.title, summary)
    };
    return screenCandidate(fullProfile, selectedJob);
  }, [candidate, selectedJob, summary, jobs]);

  // ATS Formatting & Parseability Check in Real Time
  const formattingCheck: AtsFormattingCheck = useMemo(() => {
    const formattedText = generateFormattedResumeText(candidate, selectedJob?.title, summary);
    return evaluateAtsFormatting(formattedText, candidate);
  }, [candidate, selectedJob, summary]);

  // Missing Skills detection
  const missingRequiredSkills = useMemo(() => {
    if (!selectedJob) return [];
    const candSkillsLower = candidate.skills.map(s => s.toLowerCase());
    return selectedJob.required_skills.filter(
      req => !candSkillsLower.some(c => c === req.toLowerCase() || c.includes(req.toLowerCase()))
    );
  }, [selectedJob, candidate.skills]);

  const missingPreferredSkills = useMemo(() => {
    if (!selectedJob) return [];
    const candSkillsLower = candidate.skills.map(s => s.toLowerCase());
    return selectedJob.preferred_skills.filter(
      pref => !candSkillsLower.some(c => c === pref.toLowerCase() || c.includes(pref.toLowerCase()))
    );
  }, [selectedJob, candidate.skills]);

  // Save to localStorage whenever user edits
  const handleSaveProfile = () => {
    try {
      localStorage.setItem('srm_student_builder_profile', JSON.stringify(candidate));
      localStorage.setItem('srm_student_builder_summary', summary);
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Preload top-scoring template tailored for the selected drive
  const handleLoadTopTemplate = () => {
    if (!selectedJob) return;
    const topProfile = getTopScoringTemplate(selectedJob, currentUser);
    setCandidate(topProfile);
    const topSummary = generateRoleSummary(selectedJob.title, topProfile, selectedJob);
    setSummary(topSummary);
  };

  // Load a specific role template
  const handleSelectRolePreset = (presetId: string, tier: TemplateTier = selectedTier) => {
    setActivePresetId(presetId);
    setTemplateSourceMode('preset');
    setShowImportPanel(false);
    localStorage.setItem('srm_builder_template_mode', 'preset');
    const presetProfile = getProfileFromPreset(presetId, currentUser, tier);
    setCandidate(presetProfile);
    const presetSummary = generateRoleSummary(selectedJob?.title || presetProfile.skills.slice(0, 3).join(', '), presetProfile, selectedJob);
    setSummary(presetSummary);
  };

  const handleSelectTier = (tier: TemplateTier) => {
    setSelectedTier(tier);
    const targetPresetId = activePresetId || ROLE_PRESETS[0].id;
    handleSelectRolePreset(targetPresetId, tier);
  };

  // Switch to Default SRM Institutional Template
  const handleSelectDefaultTemplate = () => {
    setActivePresetId(null);
    setTemplateSourceMode('default');
    setShowImportPanel(false);
    setImportError(null);
    setImportFeedback('Switched to Default SRM Fresher Placement Template.');
    setTimeout(() => setImportFeedback(null), 3500);
    localStorage.setItem('srm_builder_template_mode', 'default');
    localStorage.removeItem('srm_builder_imported_file');
    localStorage.removeItem('srm_student_builder_profile');
    localStorage.removeItem('srm_student_builder_summary');
    setImportedFileName(null);
    const initial = getInitialCandidateProfile(currentUser);
    setCandidate(initial);
    setSummary(generateRoleSummary(selectedJob?.title || 'Software Development Engineer', initial, selectedJob));
  };

  // Reset to default authentic SRM fresher profile
  const handleResetProfile = () => {
    handleSelectDefaultTemplate();
  };

  // Switch to Custom / Student's Own Resume Mode
  const handleSelectCustomMode = () => {
    setTemplateSourceMode('custom');
    setActivePresetId(null);
    setShowImportPanel(true);
    localStorage.setItem('srm_builder_template_mode', 'custom');
  };

  // Validate custom file before parsing
  const validateCustomFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'docx', 'doc', 'txt'];
    if (!allowed.includes(ext)) {
      return `File type ".${ext}" is not supported. Please upload a PDF, DOCX, or TXT file.`;
    }
    if (file.size > 10 * 1024 * 1024) {
      return `File exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
    }
    return null;
  };

  // Handle Uploading a Resume File
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const err = validateCustomFile(file);
    if (err) {
      setImportError(err);
      return;
    }

    setIsParsingResume(true);
    setImportError(null);
    setImportFeedback(null);

    try {
      const parsed = await parseResumeFile(file);
      const fullProfile: CandidateProfile = {
        ...parsed,
        name: parsed.name && parsed.name.length > 2 ? parsed.name : (currentUser?.name || 'SRM Candidate'),
        email: parsed.email || currentUser?.email || 'student@srmist.edu.in',
        reg_number: parsed.reg_number || (currentUser as any)?.reg_number || 'RA2211003010001'
      };

      setCandidate(fullProfile);
      setTemplateSourceMode('custom');
      setImportedFileName(file.name);
      setActivePresetId(null);

      const newSummary = generateRoleSummary(selectedJob?.title || 'Software Development Engineer', fullProfile, selectedJob);
      setSummary(newSummary);

      localStorage.setItem('srm_student_builder_profile', JSON.stringify(fullProfile));
      localStorage.setItem('srm_student_builder_summary', newSummary);
      localStorage.setItem('srm_builder_template_mode', 'custom');
      localStorage.setItem('srm_builder_imported_file', file.name);

      setImportFeedback(`Successfully loaded "${file.name}" into Resume Builder! Extracted ${fullProfile.skills.length} skills, ${fullProfile.projects.length} projects, and ${fullProfile.experience.length} experiences.`);
      setShowImportPanel(false);
    } catch (parseErr: any) {
      console.error('Resume parse error in builder:', parseErr);
      setImportError(parseErr.message || 'Failed to extract text from resume. Please ensure it is a text-based PDF/Word file, or paste your resume text directly.');
    } finally {
      setIsParsingResume(false);
    }
  };

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle Pasting Resume Text
  const handlePasteSubmit = () => {
    const trimmed = pastedResumeText.trim();
    if (!trimmed || trimmed.length < 50) {
      setImportError('Please paste sufficient resume text (at least 50 characters) including your education, skills, or projects.');
      return;
    }

    setIsParsingResume(true);
    setImportError(null);
    setImportFeedback(null);

    try {
      const parsed = extractCandidateEntities(trimmed, 'custom_pasted_resume.txt');
      const fullProfile: CandidateProfile = {
        ...parsed,
        name: parsed.name && parsed.name.length > 2 ? parsed.name : (currentUser?.name || 'SRM Candidate'),
        email: parsed.email || currentUser?.email || 'student@srmist.edu.in',
        reg_number: parsed.reg_number || (currentUser as any)?.reg_number || 'RA2211003010001'
      };

      setCandidate(fullProfile);
      setTemplateSourceMode('custom');
      setImportedFileName('Custom Pasted Resume');
      setActivePresetId(null);

      const newSummary = generateRoleSummary(selectedJob?.title || 'Software Development Engineer', fullProfile, selectedJob);
      setSummary(newSummary);

      localStorage.setItem('srm_student_builder_profile', JSON.stringify(fullProfile));
      localStorage.setItem('srm_student_builder_summary', newSummary);
      localStorage.setItem('srm_builder_template_mode', 'custom');
      localStorage.setItem('srm_builder_imported_file', 'Custom Pasted Resume');

      setImportFeedback(`Successfully imported pasted resume text! Extracted ${fullProfile.skills.length} skills, ${fullProfile.projects.length} projects, and ${fullProfile.experience.length} experiences.`);
      setShowImportPanel(false);
      setPastedResumeText('');
    } catch (pasteErr: any) {
      console.error('Paste parse error in builder:', pasteErr);
      setImportError(pasteErr.message || 'Failed to process pasted resume text.');
    } finally {
      setIsParsingResume(false);
    }
  };

  // Add Skill
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (candidate.skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) return;
    setCandidate(prev => ({
      ...prev,
      skills: [...prev.skills, trimmed]
    }));
    setNewSkillInput('');
  };

  // Remove Skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setCandidate(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Quick AI Generate Summary
  const handleGenerateSummary = () => {
    if (!selectedJob) return;
    const gen = generateRoleSummary(selectedJob.title, candidate, selectedJob);
    setSummary(gen);
  };

  // Add Project
  const handleAddProject = () => {
    const newProj = {
      name: 'New Academic / Research Project',
      technologies: selectedJob?.required_skills.slice(0, 3) || ['React', 'TypeScript', 'Node.js'],
      description: 'Architected and deployed full-stack application, optimizing database indexing and reducing query execution latency by 32%.',
      github_link: 'https://github.com/tilak-srm/project'
    };
    setCandidate(prev => ({
      ...prev,
      projects: [newProj, ...prev.projects]
    }));
    setActiveEditorTab('projects');
  };

  // AI Add Role-Targeted Project
  const handleAddRoleTargetedProject = () => {
    const preset = ROLE_PRESETS.find(p => 
      p.title.toLowerCase().includes((selectedJob?.title || '').toLowerCase()) ||
      (selectedJob?.title || '').toLowerCase().includes(p.title.toLowerCase())
    ) || ROLE_PRESETS[0];

    const sample = preset.recommendedProjects[0];
    const newProj = {
      name: sample.name,
      technologies: sample.technologies,
      description: sample.bullets.join(' '),
      github_link: `https://github.com/tilak-srm/${sample.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    };

    setCandidate(prev => ({
      ...prev,
      projects: [newProj, ...prev.projects]
    }));
    setActiveEditorTab('projects');
  };

  // Remove Project
  const handleRemoveProject = (index: number) => {
    setCandidate(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  // Update Project
  const handleUpdateProject = (index: number, field: string, value: any) => {
    setCandidate(prev => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  // AI Enhance Project Bullet
  const handleEnhanceProjectBullet = (index: number) => {
    const currentDesc = candidate.projects[index]?.description || '';
    const enhanced = enhanceBulletPoint(currentDesc, selectedJob?.title);
    handleUpdateProject(index, 'description', enhanced);
  };

  // Add Experience
  const handleAddExperience = () => {
    const newExp = {
      company: 'Tech Innovation Labs',
      position: 'Software Engineering Intern',
      duration_months: 6,
      duration_text: 'Jan 2026 - Present (6 Months)',
      is_internship: true,
      responsibilities: [
        'Engineered responsive web modules using React and TypeScript, boosting page responsiveness by 40%.',
        'Implemented automated unit tests and Dockerized continuous deployment pipelines.'
      ],
      description: 'Engineering internship developing scalable services.'
    };
    setCandidate(prev => ({
      ...prev,
      experience: [newExp, ...prev.experience]
    }));
    setActiveEditorTab('experience');
  };

  // Remove Experience
  const handleRemoveExperience = (index: number) => {
    setCandidate(prev => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== index)
    }));
  };

  // Update Experience
  const handleUpdateExperience = (index: number, field: string, value: any) => {
    setCandidate(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  // Copy Plain Text ATS Resume
  const handleCopyPlainText = () => {
    const plainText = generateFormattedResumeText(candidate, selectedJob?.title, summary);
    navigator.clipboard.writeText(plainText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Print / Export PDF
  const handlePrint = () => {
    window.print();
  };

  // Score badge color helper
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Print-specific style override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ats-resume, #printable-ats-resume * {
            visibility: visible;
          }
          #printable-ats-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP HUB: Role Selector & Action Toolbar */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-6 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Real-Time AI Resume Builder & Role Optimizer</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              Target Job & Live ATS Match Engine
            </h1>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Build your resume tailored specifically for campus placement drives. Your ATS compatibility score,
              keyword saturation, action verb count, and academic eligibility update in real-time with every keystroke.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadTopTemplate}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
              title="Loads high-scoring sample aligned with target role"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto-Fill 95% Match</span>
            </button>

            <button
              onClick={handleSelectCustomMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                templateSourceMode === 'custom'
                  ? 'bg-amber-400 text-black border-amber-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300'
              }`}
              title="Give or upload your own resume template"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{importedFileName ? 'My Resume' : 'Import My Resume'}</span>
            </button>

            <button
              onClick={handleSelectDefaultTemplate}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5 transition-all"
              title="Reset to default SRM fresher template"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Default Template</span>
            </button>

            <button
              onClick={handleSaveProfile}
              className="px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5 text-black" />
              <span>{saveFeedback ? 'Saved to Profile!' : 'Save Resume'}</span>
            </button>

            <button
              onClick={handleCopyPlainText}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-200 flex items-center gap-1.5 transition-all"
              title="Copy clean ATS plain text for portals"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copyFeedback ? 'Copied Text!' : 'Copy ATS Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Target Job Selector Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-850">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-zinc-400" />
              <span>Select SRM Placement Drive / Target Job Role</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-zinc-600"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.company} — {job.title} ({job.ctc_lpa}) • Min CGPA: {job.academic_eligibility?.min_cgpa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Package & Openings</div>
              <div className="font-bold text-white">{selectedJob?.ctc_lpa || '24.0 LPA'}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Min CGPA Cutoff</div>
              <div className="font-bold text-emerald-400">
                {selectedJob?.academic_eligibility?.min_cgpa || 8.0} / 10
              </div>
            </div>
          </div>
        </div>

        {/* TEMPLATE ORIGIN: Default SRM Template vs Student's Own Resume vs Role Benchmark Presets */}
        <div className="pt-4 border-t border-zinc-850 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Resume Template Origin</span>
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Use your own resume template, start with the default SRM institutional format, or test role benchmark presets.
              </p>
            </div>

            {/* Template Source Selector */}
            <div className="flex items-center gap-1 p-1 bg-black/80 border border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={handleSelectDefaultTemplate}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  templateSourceMode === 'default'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="SRM Institutional Default Template"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Default Template</span>
              </button>

              <button
                type="button"
                onClick={handleSelectCustomMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  templateSourceMode === 'custom'
                    ? 'bg-amber-400 text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Upload or paste your own resume to auto-populate builder"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>My Own Resume {importedFileName ? '(Active)' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemplateSourceMode('preset');
                  setShowImportPanel(false);
                  if (!activePresetId) {
                    handleSelectRolePreset(ROLE_PRESETS[0].id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  templateSourceMode === 'preset'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Role-specific benchmark templates and tiers"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Role Presets</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Default Institutional SRM Template Info Card */}
          {templateSourceMode === 'default' && (
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <div className="text-white font-medium">SRM Institutional Placement Template (Active)</div>
                  <div className="text-zinc-400 text-[11px]">
                    Using standard fresher format with university education, projects, skills, and single-column layout. Ready for live editing in the tabs below.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSelectCustomMode}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-medium text-[11px] flex items-center gap-1.5 shrink-0 transition-all border border-amber-500/20"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Your Own Resume Instead</span>
              </button>
            </div>
          )}

          {/* Mode 2: Student's Own Resume Template */}
          {templateSourceMode === 'custom' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-amber-200 font-medium">
                      {importedFileName ? `Active Resume: ${importedFileName}` : 'Student Custom Resume Template'}
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      {importedFileName 
                        ? `Extracted ${candidate.skills.length} skills, ${candidate.projects.length} projects, and ${candidate.experience.length} experiences into builder tabs.`
                        : 'Upload your resume (.pdf, .docx, .txt) or paste text to auto-populate all builder tabs and calculate your real ATS score.'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowImportPanel(prev => !prev)}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-medium text-[11px] flex items-center gap-1.5 transition-all border border-amber-400/30"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{showImportPanel ? 'Close Upload Box' : (importedFileName ? 'Change / Re-upload File' : 'Upload Resume')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectDefaultTemplate}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-all"
                  >
                    Switch to Default Template
                  </button>
                </div>
              </div>

              {/* Upload Dropzone / Paste Area */}
              {(showImportPanel || !importedFileName) && (
                <div className="p-4 rounded-xl bg-black/90 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomImportTab('upload')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          customImportTab === 'upload' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5 inline mr-1" />
                        Upload Document (.pdf, .docx, .txt)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomImportTab('paste')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          customImportTab === 'paste' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 inline mr-1" />
                        Paste Resume Text
                      </button>
                    </div>

                    {importedFileName && (
                      <button
                        type="button"
                        onClick={() => setShowImportPanel(false)}
                        className="text-zinc-400 hover:text-white text-xs p-1"
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {customImportTab === 'upload' ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        dragActive 
                          ? 'border-amber-400 bg-amber-500/10' 
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                          {isParsingResume ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <FileUp className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {isParsingResume ? 'Parsing and extracting entities from resume...' : 'Drop your resume file here or click to browse'}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Supports text-based PDF, DOCX, or TXT up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={pastedResumeText}
                        onChange={(e) => setPastedResumeText(e.target.value)}
                        placeholder="Paste your raw resume text here (education, skills, projects, experience, contact details)..."
                        className="w-full h-36 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-zinc-600 resize-y"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPastedResumeText('')}
                          className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handlePasteSubmit}
                          disabled={isParsingResume || pastedResumeText.trim().length < 50}
                          className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-semibold text-xs transition-all flex items-center gap-1.5"
                        >
                          {isParsingResume ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Parsing...</span>
                            </>
                          ) : (
                            <>
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Import Pasted Text</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Role Benchmark Presets */}
          {templateSourceMode === 'preset' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-zinc-400" />
                  <span>Select Benchmark Preset Role:</span>
                </span>

                {/* Authentic Template Tier Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-black/80 border border-zinc-800 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-mono px-1.5">Tier:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectTier('baseline')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                      selectedTier === 'baseline'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Fresher Starter Profile (~45-55% ATS score with skill gaps to build)"
                  >
                    Fresher Baseline (~48%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTier('intermediate')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                      selectedTier === 'intermediate'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Intermediate Candidate (~70-76% ATS score meeting core requirements)"
                  >
                    Intermediate (~73%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTier('optimized')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
                      selectedTier === 'optimized'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Placement-Ready Benchmark (~88-93% ATS score with verified internship)"
                  >
                    Placement Target (~91%)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {ROLE_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectRolePreset(preset.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-sm'
                          : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:bg-zinc-850 hover:text-white'
                      }`}
                    >
                      <span>{preset.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                        {preset.category}
                      </span>
                    </button>
                  );
                })}
                <button
                  onClick={handleSelectDefaultTemplate}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  title="Reset to default SRM template"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Default Template</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK & ERROR NOTIFICATIONS */}
        {importFeedback && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{importFeedback}</span>
            </div>
            <button
              onClick={() => setImportFeedback(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {importError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{importError}</span>
            </div>
            <button
              onClick={() => setImportError(null)}
              className="text-red-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* LIVE REAL-TIME ATS SCORE COCKPIT */}
        <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl border text-center min-w-[120px] ${getScoreColor(screeningResult.score.overall_match)}`}>
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">ATS Match Score</div>
                <div className="text-3xl font-extrabold font-display">
                  {screeningResult.score.overall_match}%
                </div>
                <div className="text-[10px] font-semibold mt-0.5">
                  {screeningResult.explainable.verdict}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Drive Compatibility Status:</span>
                  {screeningResult.eligibility.is_eligible ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Eligible for Drive
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      <XCircle className="w-3 h-3" /> Cutoff Criteria Not Met
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 max-w-xl">
                  {screeningResult.explainable.summary}
                </p>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'editor' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                Editor
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'split' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5 inline mr-1" />
                Split Screen
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Resume Preview
              </button>
            </div>
          </div>

          {/* 4 Multi-Dimensional Score Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Skills Coverage</span>
                <span className="font-bold text-white">{screeningResult.score.skills}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    screeningResult.score.skills >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} 
                  style={{ width: `${screeningResult.score.skills}%` }} 
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Internship & Exp</span>
                <span className="font-bold text-white">{screeningResult.score.experience}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    screeningResult.score.experience >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} 
                  style={{ width: `${screeningResult.score.experience}%` }} 
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Projects Depth</span>
                <span className="font-bold text-white">{screeningResult.score.projects}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    screeningResult.score.projects >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} 
                  style={{ width: `${screeningResult.score.projects}%` }} 
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">ATS Layout Health</span>
                <span className="font-bold text-white">{formattingCheck.overall_formatting_score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    formattingCheck.overall_formatting_score >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} 
                  style={{ width: `${formattingCheck.overall_formatting_score}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Quick Skill Gap Helper: 1-Click Missing Skills Booster */}
          {missingRequiredSkills.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Missing Mandatory Role Skills:</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Click any skill below to automatically inject it into your resume and boost your ATS score:
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {missingRequiredSkills.map((skill, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddSkill(skill)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add {skill}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Verbs & Metrics Status */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <strong>{formattingCheck.metrics.action_verbs_count}</strong> Action Verbs detected (e.g. {formattingCheck.metrics.action_verbs_detected.slice(0, 3).join(', ') || 'Architected, Engineered'})
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <strong>{formattingCheck.metrics.quantifiable_metrics_count}</strong> Quantifiable metrics detected (% / numbers)
            </span>
            <span className="text-zinc-600">•</span>
            <span>Word count: <strong>{formattingCheck.metrics.word_count}</strong></span>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE: EDITOR & LIVE PREVIEW */}
      <div className={`grid gap-6 ${
        viewMode === 'split' 
          ? 'grid-cols-1 lg:grid-cols-12' 
          : viewMode === 'editor' 
          ? 'grid-cols-1' 
          : 'grid-cols-1'
      }`}>
        
        {/* RESUME BUILDER EDITOR */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'max-w-4xl mx-auto w-full'} space-y-4 no-print`}>
            {/* Editor Sub-Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-zinc-850">
              <button
                onClick={() => setActiveEditorTab('skills')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEditorTab === 'skills' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1. Skills ({candidate.skills.length})
              </button>
              <button
                onClick={() => setActiveEditorTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEditorTab === 'summary' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                2. Summary & Role
              </button>
              <button
                onClick={() => setActiveEditorTab('projects')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEditorTab === 'projects' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                3. Projects ({candidate.projects.length})
              </button>
              <button
                onClick={() => setActiveEditorTab('experience')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEditorTab === 'experience' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                4. Experience ({candidate.experience.length})
              </button>
              <button
                onClick={() => setActiveEditorTab('basics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEditorTab === 'basics' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                5. Education & Contact
              </button>
              <button
                onClick={() => setActiveEditorTab('certifications')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeEditorTab === 'certifications' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                6. Certifications
              </button>
            </div>

            {/* TAB 1: TECHNICAL SKILLS */}
            {activeEditorTab === 'skills' && (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>Technical Competencies & ATS Keywords</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Add programming languages, frameworks, databases, and DevOps tools relevant to {selectedJob?.company || 'the job'}.
                    </p>
                  </div>
                </div>

                {/* Add Skill Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(newSkillInput)}
                    placeholder="Type skill (e.g. C++, Docker, System Design) and press Enter..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Role Recommendations Box */}
                {selectedJob && (
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
                    <div className="text-[11px] font-mono uppercase text-zinc-400 flex items-center justify-between">
                      <span>Keywords Demanded by {selectedJob.company}:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedJob.required_skills.filter(r => candidate.skills.includes(r)).length} / {selectedJob.required_skills.length} matched
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.required_skills.map((skill, idx) => {
                        const isAdded = candidate.skills.some(s => s.toLowerCase() === skill.toLowerCase());
                        return (
                          <button
                            key={idx}
                            onClick={() => !isAdded && handleAddSkill(skill)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                              isAdded
                                ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
                                : 'bg-zinc-850 border border-zinc-700 text-zinc-300 hover:border-zinc-500'
                            }`}
                          >
                            {isAdded ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3" />}
                            <span>{skill}</span>
                          </button>
                        );
                      })}
                      {selectedJob.preferred_skills.map((skill, idx) => {
                        const isAdded = candidate.skills.some(s => s.toLowerCase() === skill.toLowerCase());
                        return (
                          <button
                            key={`pref-${idx}`}
                            onClick={() => !isAdded && handleAddSkill(skill)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                              isAdded
                                ? 'bg-zinc-800 border border-zinc-700 text-zinc-200'
                                : 'bg-zinc-900 border border-dashed border-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            <span>{skill} (Preferred)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Skills List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">
                    Your Current Resume Skills ({candidate.skills.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROLE & PROFESSIONAL SUMMARY */}
            {activeEditorTab === 'summary' && (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Target Role & Professional Summary</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Tailor your introductory summary to emphasize qualifications for {selectedJob?.title}.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-xs text-white font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Tailor Summary</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-zinc-400">Target Role Title</label>
                  <input
                    type="text"
                    value={selectedJob?.title || 'Software Development Engineer'}
                    readOnly
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-mono uppercase text-zinc-400">Professional Summary</label>
                    <span className="text-[10px] text-zinc-500">{summary.length} characters</span>
                  </div>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write a concise 3-4 sentence professional summary highlighting your SRM degree, CGPA, and technical focus..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 leading-relaxed"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-850 text-xs text-zinc-400 space-y-1">
                  <span className="font-semibold text-zinc-200">ATS Best Practice:</span>
                  <p className="text-[11px] text-zinc-400">
                    Include your degree, verified CGPA, department (SRMIST), and 3-4 target keywords from the job description to immediately secure indexing in recruiter searches.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: PROJECTS */}
            {activeEditorTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>Academic & Practical Projects</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      ATS algorithms evaluate project descriptions for required keywords and quantifiable metrics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddRoleTargetedProject}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-white font-semibold flex items-center gap-1.5 transition-all"
                      title="Adds an industry-standard project targeting this role"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Role Project</span>
                    </button>
                    <button
                      onClick={handleAddProject}
                      className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {candidate.projects.map((proj, idx) => (
                    <div key={idx} className="rounded-2xl bg-zinc-950 border border-zinc-850 p-5 space-y-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => handleUpdateProject(idx, 'name', e.target.value)}
                          placeholder="Project Name"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-zinc-600"
                        />
                        <button
                          onClick={() => handleRemoveProject(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400">Technologies (comma separated)</label>
                          <input
                            type="text"
                            value={proj.technologies.join(', ')}
                            onChange={(e) => handleUpdateProject(idx, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="C++, Python, Docker, Redis"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400">GitHub / Live Demo Link</label>
                          <input
                            type="text"
                            value={proj.github_link || ''}
                            onChange={(e) => handleUpdateProject(idx, 'github_link', e.target.value)}
                            placeholder="https://github.com/..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase text-zinc-400">
                            Description & Achievements (Use Action Verbs & Metrics)
                          </label>
                          <button
                            onClick={() => handleEnhanceProjectBullet(idx)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>AI Quantify & Enhance</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={proj.description}
                          onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                          placeholder="Architected distributed cache cluster in C++, cutting response latency by 35%..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-zinc-600 leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WORK EXPERIENCE & INTERNSHIPS */}
            {activeEditorTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <span>Work History & Industry Internships</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Candidates with verified internships gain maximum points in SRM placement screening.
                    </p>
                  </div>
                  <button
                    onClick={handleAddExperience}
                    className="px-3 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Experience</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {candidate.experience.map((exp, idx) => (
                    <div key={idx} className="rounded-2xl bg-zinc-950 border border-zinc-850 p-5 space-y-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                            placeholder="Company / Organization"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-zinc-600"
                          />
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleUpdateExperience(idx, 'position', e.target.value)}
                            placeholder="Job Title / Role (e.g. SDE Intern)"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveExperience(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400">Duration Text</label>
                          <input
                            type="text"
                            value={exp.duration_text}
                            onChange={(e) => handleUpdateExperience(idx, 'duration_text', e.target.value)}
                            placeholder="e.g. Jan 2026 - Present (6 Months)"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                            <input
                              type="checkbox"
                              checked={exp.is_internship}
                              onChange={(e) => handleUpdateExperience(idx, 'is_internship', e.target.checked)}
                              className="rounded bg-zinc-900 border-zinc-700 text-white"
                            />
                            <span>Industry Internship</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-zinc-400">
                          Responsibilities & Achievements (One bullet per line)
                        </label>
                        <textarea
                          rows={3}
                          value={exp.responsibilities.join('\n')}
                          onChange={(e) => handleUpdateExperience(idx, 'responsibilities', e.target.value.split('\n').filter(Boolean))}
                          placeholder="• Engineered microservice in Node.js...\n• Optimized database indexing, cutting latency by 38%..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-zinc-600 leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: EDUCATION & CONTACT */}
            {activeEditorTab === 'basics' && (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SRM Academic Profile & Contact Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={(e) => setCandidate(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400">SRM Register Number</label>
                    <input
                      type="text"
                      value={candidate.reg_number}
                      onChange={(e) => setCandidate(prev => ({ ...prev, reg_number: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400">Institutional Email</label>
                    <input
                      type="email"
                      value={candidate.email}
                      onChange={(e) => setCandidate(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400">Phone</label>
                    <input
                      type="text"
                      value={candidate.phone}
                      onChange={(e) => setCandidate(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-3">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">Academic Standing (SRMIST)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Degree</span>
                      <input
                        type="text"
                        value={candidate.education.degree}
                        onChange={(e) => setCandidate(prev => ({ ...prev, education: { ...prev.education, degree: e.target.value } }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Department</span>
                      <input
                        type="text"
                        value={candidate.education.department}
                        onChange={(e) => setCandidate(prev => ({ ...prev, education: { ...prev.education, department: e.target.value } }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Verified CGPA</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={candidate.education.cgpa}
                        onChange={(e) => setCandidate(prev => ({ ...prev, education: { ...prev.education, cgpa: parseFloat(e.target.value) || 0 } }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Active Backlogs</span>
                      <input
                        type="number"
                        min="0"
                        value={candidate.education.active_backlogs}
                        onChange={(e) => setCandidate(prev => ({ ...prev, education: { ...prev.education, active_backlogs: parseInt(e.target.value) || 0 } }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  {candidate.education.cgpa < (selectedJob?.academic_eligibility?.min_cgpa || 7.0) && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/40 text-[11px] text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Warning: Your CGPA ({candidate.education.cgpa}) is below the required cutoff ({selectedJob?.academic_eligibility?.min_cgpa}) for {selectedJob?.company}.</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={candidate.linkedin || ''}
                      onChange={(e) => setCandidate(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400">GitHub Profile URL</label>
                    <input
                      type="text"
                      value={candidate.github || ''}
                      onChange={(e) => setCandidate(prev => ({ ...prev, github: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: CERTIFICATIONS */}
            {activeEditorTab === 'certifications' && (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Certifications & Competitive Coding</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Cloud certifications (AWS/Azure) and verified coding rankings add valuable bonus points.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCertInput}
                    onChange={(e) => setNewCertInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCertInput.trim()) {
                        setCandidate(prev => ({ ...prev, certifications: [...prev.certifications, newCertInput.trim()] }));
                        setNewCertInput('');
                      }
                    }}
                    placeholder="e.g. AWS Certified Developer, LeetCode 500+ problems, Hackathon 1st Place..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    onClick={() => {
                      if (newCertInput.trim()) {
                        setCandidate(prev => ({ ...prev, certifications: [...prev.certifications, newCertInput.trim()] }));
                        setNewCertInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {candidate.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs text-zinc-200"
                    >
                      <span className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {cert}
                      </span>
                      <button
                        onClick={() => {
                          setCandidate(prev => ({
                            ...prev,
                            certifications: prev.certifications.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIVE ATS RESUME PREVIEW PANEL */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-6' : 'max-w-4xl mx-auto w-full'} space-y-4`}>
            <div className="flex items-center justify-between no-print px-1">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Live ATS Formatted Resume (Print-Ready)</span>
              </span>
              <div className="text-[11px] text-zinc-500 font-mono">
                Standard Institutional 1-Page Format
              </div>
            </div>

            {/* ATS PRINTABLE CANVAS */}
            <div 
              id="printable-ats-resume"
              className="bg-white text-black rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 font-sans text-xs leading-relaxed border border-zinc-200"
              style={{ minHeight: '850px' }}
            >
              {/* Header / Personal info */}
              <div className="text-center space-y-1.5 border-b border-black/80 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-black uppercase font-serif">
                  {candidate.name || 'Candidate Name'}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-700">
                  <span>{candidate.email}</span>
                  <span>•</span>
                  <span>{candidate.phone}</span>
                  <span>•</span>
                  <span>{candidate.location}</span>
                  {candidate.reg_number && (
                    <>
                      <span>•</span>
                      <span className="font-semibold">SRM Reg: {candidate.reg_number}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 text-[10px] text-zinc-600 pt-0.5">
                  {candidate.linkedin && <span>{candidate.linkedin}</span>}
                  {candidate.github && (
                    <>
                      <span>•</span>
                      <span>{candidate.github}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary / Role Objective */}
              {summary && (
                <div className="space-y-1">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider font-serif text-black border-b border-black/30 pb-0.5">
                    Target Role: {selectedJob?.title?.toUpperCase() || 'SOFTWARE DEVELOPMENT ENGINEER'}
                  </h2>
                  <p className="text-[11px] text-zinc-800 leading-normal pt-1">
                    {summary}
                  </p>
                </div>
              )}

              {/* Education */}
              <div className="space-y-1.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider font-serif text-black border-b border-black/30 pb-0.5">
                  Education
                </h2>
                <div className="flex items-start justify-between text-[11px]">
                  <div>
                    <strong className="text-black font-semibold">
                      {candidate.education.college || 'SRM Institute of Science and Technology'}
                    </strong>
                    <div className="text-zinc-700">
                      {candidate.education.degree} in {candidate.education.department}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">
                      CGPA: {candidate.education.cgpa.toFixed(2)} / 10.0
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      Class of {candidate.education.graduation_year} • {candidate.education.active_backlogs === 0 ? '0 Backlogs' : `${candidate.education.active_backlogs} Backlogs`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="space-y-1.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider font-serif text-black border-b border-black/30 pb-0.5">
                  Technical Skills & Competencies
                </h2>
                <div className="text-[11px] text-zinc-800 space-y-1">
                  <div>
                    <span className="font-semibold text-black">Languages & Frameworks: </span>
                    <span>{candidate.skills.slice(0, 8).join(', ')}</span>
                  </div>
                  {candidate.skills.length > 8 && (
                    <div>
                      <span className="font-semibold text-black">Tools, Cloud & Core CS: </span>
                      <span>{candidate.skills.slice(8).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects */}
              {candidate.projects.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider font-serif text-black border-b border-black/30 pb-0.5">
                    Key Projects
                  </h2>
                  <div className="space-y-2.5">
                    {candidate.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-black font-semibold">{proj.name}</strong>
                          <span className="text-[10px] text-zinc-600 font-mono">
                            [{proj.technologies.slice(0, 4).join(', ')}]
                          </span>
                        </div>
                        {proj.github_link && (
                          <div className="text-[10px] text-zinc-500 font-mono">{proj.github_link}</div>
                        )}
                        <p className="text-[11px] text-zinc-800 leading-normal pl-2 border-l border-zinc-300">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {candidate.experience.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider font-serif text-black border-b border-black/30 pb-0.5">
                    Experience & Internships
                  </h2>
                  <div className="space-y-2.5">
                    {candidate.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <div>
                            <strong className="text-black font-semibold">{exp.position}</strong>
                            <span className="text-zinc-600"> — {exp.company}</span>
                          </div>
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {exp.duration_text}
                          </span>
                        </div>
                        {exp.responsibilities && exp.responsibilities.length > 0 ? (
                          <ul className="list-disc list-inside text-[11px] text-zinc-800 space-y-0.5 pl-1">
                            {exp.responsibilities.map((r, rIdx) => (
                              <li key={rIdx}>{r}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-zinc-800">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {candidate.certifications.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider font-serif text-black border-b border-black/30 pb-0.5">
                    Certifications & Honors
                  </h2>
                  <ul className="list-disc list-inside text-[11px] text-zinc-800 space-y-0.5 pl-1">
                    {candidate.certifications.map((cert, idx) => (
                      <li key={idx}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
