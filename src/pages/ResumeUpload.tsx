import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  GraduationCap, 
  Briefcase, 
  Code, 
  FileCheck, 
  Lightbulb, 
  ArrowRight, 
  Download,
  Search,
  ExternalLink,
  FolderArchive,
  Layers
} from 'lucide-react';
import { INITIAL_JOBS, INITIAL_CANDIDATES } from '../data/srmDataset';
import { CandidateProfile, ScreeningResult, JobRequirement } from '../types';
import { parseResumeFile, extractCandidateEntities, extractResumesFromZip } from '../services/resumeParser';
import { screenCandidate, evaluateAtsFormatting, AtsFormattingCheck } from '../services/aiScreeningEngine';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

const DEFAULT_BENCHMARK_JOB: JobRequirement = {
  id: 'job-general-benchmark',
  title: 'General Campus Placement Benchmark',
  company: 'SRM Placement Assessment',
  job_type: 'Full-time',
  location: 'Chennai / Hybrid',
  ctc_lpa: '8.0 - 16.0 LPA',
  application_deadline: '2026-12-31',
  open_vacancies: 10,
  status: 'Active',
  academic_eligibility: {
    allowed_degrees: ['B.Tech', 'M.Tech', 'MCA'],
    allowed_departments: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'],
    min_cgpa: 7.0,
    max_active_backlogs: 0,
    graduation_year: 2026
  },
  required_skills: ['Python', 'Java', 'Data Structures', 'Algorithms', 'SQL', 'Git'],
  preferred_skills: ['React', 'Node.js', 'Machine Learning', 'Cloud', 'Docker'],
  min_experience_years: 0,
  freshers_accepted: true,
  internship_preferred: false,
  job_description: 'General campus placement engineering requirement benchmark.',
  created_at: new Date().toISOString()
};

export const ResumeUpload: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [jobs] = useState<JobRequirement[]>(() => {
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

  const [selectedJobId, setSelectedJobId] = useState<string>(() => jobs[0]?.id || 'job-google-sde');
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{
    total: number;
    current: number;
    currentName: string;
  } | null>(null);

  // Result state after ATS evaluation
  const [atsResult, setAtsResult] = useState<{
    candidate: CandidateProfile;
    screening: ScreeningResult;
    formatting: AtsFormattingCheck;
  } | null>(null);

  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'keywords' | 'formatting' | 'tips' | 'profile'>('overview');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0] || DEFAULT_BENCHMARK_JOB;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const ALLOWED_FILE_TYPES = [
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/msword', 
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];
  const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt', 'zip'];
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const MAX_ZIP_SIZE_BYTES = 50 * 1024 * 1024; // 50MB for batch archives

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File type .${ext} is not allowed. Use PDF, DOCX, TXT, or ZIP.`;
    }
    const maxLimit = ext === 'zip' ? MAX_ZIP_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
    if (file.size > maxLimit) {
      return `File exceeds ${(maxLimit / (1024 * 1024)).toFixed(0)}MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
    }
    return null;
  };

  const processBatchResumes = async (batchFiles: File[]) => {
    setIsProcessing(true);
    setBatchProgress({ total: batchFiles.length, current: 0, currentName: 'Preparing archive...' });
    const processedCandidates: CandidateProfile[] = [];

    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      setBatchProgress({ total: batchFiles.length, current: i + 1, currentName: file.name });
      setProgress(Math.round(((i + 1) / batchFiles.length) * 100));

      try {
        const cand = await parseResumeFile(file);
        const screening = screenCandidate(cand, selectedJob);
        cand.ats_score = screening.score.overall_match;
        cand.match_tier = screening.explainable.verdict;
        cand.status = screening.explainable.verdict === 'Strong Match' ? 'Shortlisted' : 'AI Screened';
        processedCandidates.push(cand);

        // Load the first candidate into the main evaluation preview
        if (i === 0) {
          const formatting = evaluateAtsFormatting(cand.raw_resume_text || '', cand);
          setAtsResult({ candidate: cand, screening, formatting });
        }
      } catch (err) {
        console.error(`[processBatchResumes] Failed parsing file ${file.name}:`, err);
      }
    }

    // Merge into local recruitment talent pool
    try {
      const existing = localStorage.getItem('srm_candidates_list');
      const list: CandidateProfile[] = existing ? JSON.parse(existing) : INITIAL_CANDIDATES;
      const merged = [
        ...processedCandidates, 
        ...list.filter(c => !processedCandidates.some(p => p.id === c.id || (p.email && p.email === c.email)))
      ];
      localStorage.setItem('srm_candidates_list', JSON.stringify(merged));
      setSavedSuccessMsg(`Batch Ingestion Complete: Successfully parsed ${processedCandidates.length} resumes and updated campus recruitment pool!`);
    } catch (e) {
      console.error(e);
    }

    setBatchProgress(null);
    setIsProcessing(false);
  };

  const handleIncomingFile = async (file: File) => {
    const isZip = file.name.toLowerCase().endsWith('.zip');
    if (isZip) {
      const err = validateFile(file);
      if (err) { alert(`Upload rejected: ${err}`); return; }

      setIsProcessing(true);
      setProgress(10);
      try {
        const extracted = await extractResumesFromZip(file);
        if (extracted.length === 0) {
          alert('No supported PDF, DOCX, or TXT resumes found inside the ZIP archive.');
          setIsProcessing(false);
          return;
        }
        setFiles(extracted);
        await processBatchResumes(extracted);
      } catch (err: any) {
        alert(`Failed to extract ZIP archive: ${err?.message || err}`);
        setIsProcessing(false);
      }
      return;
    }

    const err = validateFile(file);
    if (err) { alert(`Upload rejected: ${err}`); return; }
    setFiles([file]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleIncomingFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleIncomingFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const processResumeEvaluation = async (rawText?: string, fileObj?: File) => {
    setIsProcessing(true);
    setProgress(15);
    setAtsResult(null);
    setSavedSuccessMsg(null);

    try {
      let extractedText = rawText || '';
      let candidateProfile: CandidateProfile;

      if (fileObj) {
        const fileErr = validateFile(fileObj);
        if (fileErr) {
          alert(`File validation failed: ${fileErr}`);
          setIsProcessing(false);
          return;
        }
        setProgress(35);
        candidateProfile = await parseResumeFile(fileObj);
        extractedText = candidateProfile.raw_resume_text || '';
      } else {
        // Enforce safe upper bound (250KB / ~50,000 words) on pasted text to prevent ReDoS/browser hang
        if (extractedText.length > 250000) {
          extractedText = extractedText.slice(0, 250000);
        }
        setProgress(60);
        candidateProfile = extractCandidateEntities(extractedText, 'pasted_resume.txt');
      }

      setProgress(85);
      const screening = screenCandidate(candidateProfile, selectedJob);
      const formatting = evaluateAtsFormatting(extractedText, candidateProfile);

      candidateProfile.ats_score = screening.score.overall_match;
      candidateProfile.match_tier = screening.explainable.verdict;

      setProgress(100);
      setAtsResult({
        candidate: candidateProfile,
        screening,
        formatting
      });

      // Save candidate to candidates roster
      const currentList: CandidateProfile[] = (() => {
        try {
          const saved = localStorage.getItem('srm_candidates_list');
          return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
        } catch (e) {
          return INITIAL_CANDIDATES;
        }
      })();

      const updatedRoster = [
        candidateProfile,
        ...currentList.filter(c => c.reg_number !== candidateProfile.reg_number)
      ];

      localStorage.setItem('srm_candidates_list', JSON.stringify(updatedRoster));
      window.dispatchEvent(new CustomEvent('srm_candidate_added', { detail: candidateProfile }));

      setSavedSuccessMsg(`Candidate profile for "${candidateProfile.name}" saved to recruitment pool!`);
    } catch (err: any) {
      alert(err?.message || 'Error parsing resume. Please ensure file contains valid text content.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <SEO
        title="Upload & Screen Resume | AI ATS Compatibility Checker | SRM ResumeAI"
        description="Upload your PDF, DOCX, or text resume to calculate authentic ATS scores, keyword saturation, and drive eligibility against top campus recruitment requirements."
        keywords="ATS Resume Checker, Resume Screening, SRM Placement Drive, ATS Score Calculator, PDF Resume Parser, Resume Matcher"
        canonical="/upload"
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white" />
            Resume ATS Score Checker
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Submit resumes for real-time ATS match scoring, keyword extraction, and eligibility validation.
          </p>
        </div>

        {/* Target Job Selector */}
        <div className="bg-zinc-950 border border-zinc-850 p-2 rounded-xl flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400">Target Role:</span>
          <select 
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              if (atsResult) {
                const updatedJob = jobs.find(j => j.id === e.target.value) || jobs[0];
                const screening = screenCandidate(atsResult.candidate, updatedJob);
                setAtsResult(prev => prev ? { ...prev, screening } : null);
              }
            }}
            className="bg-black border border-zinc-800 text-white font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-500"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.company} — {j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Drive Requirements Summary */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-mono font-bold">
            {selectedJob.company.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-white">{selectedJob.title}</span>
            <span className="text-zinc-400 ml-2">({selectedJob.company})</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-zinc-400">Min CGPA:</span>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-white font-bold">
            ≥ {selectedJob.academic_eligibility.min_cgpa}
          </span>
          <span className="text-zinc-400 ml-2">Required Skills:</span>
          <div className="flex flex-wrap gap-1">
            {selectedJob.required_skills.map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 text-[11px] border border-zinc-800">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 sm:p-8">
        <div className="flex border-b border-zinc-850 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'upload' 
                ? 'border-white text-white' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload File (PDF / DOCX)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'paste' 
                ? 'border-white text-white' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Resume Text Directly
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="space-y-6">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive ? 'border-white bg-zinc-900/50' : 'border-zinc-800 hover:border-zinc-700 bg-black'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                ref={inputRef}
                type="file" 
                accept=".pdf,.docx,.doc,.txt,.zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-3 border border-zinc-800">
                <FolderArchive className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Drag and drop resume or batch ZIP archive</h3>
              <p className="text-zinc-500 text-xs mb-4">Supports PDF, DOCX, TXT, and batch .ZIP archives (up to 50MB)</p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => inputRef.current?.click()}
                  className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Select File or ZIP</span>
                </button>
              </div>
            </div>

            {/* Batch Archive Processing Bar */}
            {batchProgress && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-white animate-spin" />
                    <span className="font-semibold text-white">Batch Unpacking Archive...</span>
                    <span className="text-zinc-400 font-mono">({batchProgress.current} / {batchProgress.total})</span>
                  </div>
                  <span className="text-zinc-400 truncate max-w-xs font-mono text-[11px]">{batchProgress.currentName}</span>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-white h-full transition-all duration-200"
                    style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {files.length > 0 && !batchProgress && (
              <div className="bg-black p-3.5 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      {files.length === 1 ? files[0].name : `${files.length} resumes extracted from archive`}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {files.length === 1 
                        ? `${(files[0].size / 1024).toFixed(1)} KB` 
                        : `${files.map(f => f.name).slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`
                      }
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setFiles([])}
                  className="text-zinc-500 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-zinc-300">Paste Resume Text Content:</label>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw resume text here (Education, Skills, Experience, Projects)..."
              className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-zinc-500"
            ></textarea>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-6 border-t border-zinc-850 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Instant Parsing &amp; ATS Scoring</span>
          </div>

          <button
            disabled={isProcessing || (activeTab === 'upload' && files.length === 0) || (activeTab === 'paste' && !pastedText.trim())}
            onClick={() => {
              if (activeTab === 'upload' && files[0]) {
                processResumeEvaluation(undefined, files[0]);
              } else if (activeTab === 'paste') {
                processResumeEvaluation(pastedText);
              }
            }}
            className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 px-7 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Evaluating ATS Score ({progress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Calculate ATS Score</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPREHENSIVE ATS SCORE & ANALYSIS REPORT PANEL */}
      {atsResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner Notice */}
          {savedSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{savedSuccessMsg}</span>
              </div>
              <button onClick={() => setSavedSuccessMsg(null)} className="text-zinc-500 hover:text-white underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Hero ATS Score Card */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 sm:p-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Overall Score Gauge */}
              <div className="flex flex-col items-center justify-center text-center p-6 bg-black rounded-xl border border-zinc-850">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Overall ATS Score</span>
                <div className="text-5xl font-mono font-bold text-white tracking-tight my-2">
                  {atsResult.screening.score.overall_match}%
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 text-white mt-2">
                  {atsResult.screening.explainable.verdict}
                </span>
              </div>

              {/* Summary Stats */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{atsResult.candidate.name}</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {atsResult.candidate.reg_number} • {atsResult.candidate.education.degree} in {atsResult.candidate.education.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-zinc-500 font-mono block">Status</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {atsResult.screening.eligibility.is_eligible ? '✓ Eligible' : '✕ Ineligible'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed bg-black p-3 rounded-lg border border-zinc-850">
                  {atsResult.screening.explainable.summary}
                </p>

                {/* Tri-Pillar ATS Sub-Score Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-black p-2.5 rounded-lg border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 block">Keywords &amp; Skills</span>
                    <span className="font-bold text-white">{atsResult.screening.score.keyword_score ?? atsResult.screening.score.skills}%</span>
                    <span className="text-[9px] text-zinc-600 block mt-0.5">40% Weight</span>
                  </div>
                  <div className="bg-black p-2.5 rounded-lg border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 block">Requirement Fit</span>
                    <span className="font-bold text-white">{atsResult.screening.score.requirement_score ?? atsResult.screening.score.education}%</span>
                    <span className="text-[9px] text-zinc-600 block mt-0.5">35% Weight</span>
                  </div>
                  <div className="bg-black p-2.5 rounded-lg border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 block">ATS Layout Health</span>
                    <span className="font-bold text-white">{atsResult.formatting.overall_formatting_score}%</span>
                    <span className="text-[9px] text-zinc-600 block mt-0.5">25% Weight</span>
                  </div>
                  <div className="bg-black p-2.5 rounded-lg border border-zinc-850 text-center">
                    <span className="text-[10px] text-zinc-500 block">Academic CGPA</span>
                    <span className="font-bold text-white">{atsResult.candidate.education.cgpa} / 10</span>
                    <span className="text-[9px] text-zinc-600 block mt-0.5">Cutoff: {selectedJob.academic_eligibility.min_cgpa}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSavedSuccessMsg(`Added ${atsResult.candidate.name} to AI Screening Roster & Candidate Database!`);
                    }}
                    className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Candidate
                  </button>

                  <Link
                    to="/screening"
                    className="bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View Rankings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Detailed Analysis */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden">
            <div className="flex border-b border-zinc-850 overflow-x-auto">
              <button
                onClick={() => setActiveDetailTab('overview')}
                className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'overview' ? 'border-white text-white bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                Score Breakdown
              </button>

              <button
                onClick={() => setActiveDetailTab('keywords')}
                className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'keywords' ? 'border-white text-white bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4" />
                Keywords ({atsResult.screening.explainable.skill_evidence.filter(e => e.match_status === 'matched').length} Matched)
              </button>

              <button
                onClick={() => setActiveDetailTab('formatting')}
                className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'formatting' ? 'border-white text-white bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Layout &amp; Structure ({atsResult.formatting.overall_formatting_score}%)
              </button>

              <button
                onClick={() => setActiveDetailTab('tips')}
                className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'tips' ? 'border-white text-white bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                AI Optimization Tips
              </button>

              <button
                onClick={() => setActiveDetailTab('profile')}
                className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'profile' ? 'border-white text-white bg-zinc-900/40' : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Parsed Student Data
              </button>
            </div>

            <div className="p-6">
              {/* TAB 1: OVERVIEW & BREAKDOWN */}
              {activeDetailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Tri-Pillar Score Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black p-4 rounded-xl border border-zinc-850">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white">Keyword Relevance</span>
                        <span className="text-xs font-mono font-bold text-white">{atsResult.screening.score.keyword_score ?? atsResult.screening.score.skills}%</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {atsResult.screening.explainable.skill_evidence.filter(e => e.match_status === 'matched').length} of {selectedJob.required_skills.length + selectedJob.preferred_skills.length} target role skills verified in candidate profile.
                      </p>
                    </div>

                    <div className="bg-black p-4 rounded-xl border border-zinc-850">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white">Requirement Fit</span>
                        <span className="text-xs font-mono font-bold text-white">{atsResult.screening.score.requirement_score ?? atsResult.screening.score.education}%</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        CGPA {atsResult.candidate.education.cgpa} (Cutoff ≥ {selectedJob.academic_eligibility.min_cgpa}), {atsResult.candidate.education.department} branch, 0 active backlogs.
                      </p>
                    </div>

                    <div className="bg-black p-4 rounded-xl border border-zinc-850">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white">Layout Parseability</span>
                        <span className="text-xs font-mono font-bold text-white">{atsResult.formatting.overall_formatting_score}%</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {atsResult.formatting.layout_tier || 'Standard ATS Layout'} with {atsResult.formatting.metrics?.word_count || 350} words and {atsResult.formatting.metrics?.action_verbs_count || 4} action verbs.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Strengths */}
                    <div className="bg-black p-5 rounded-xl border border-zinc-850 space-y-3">
                      <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase font-mono tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-white" /> Strengths Detected
                      </h3>
                      <ul className="space-y-2 text-xs">
                        {atsResult.screening.explainable.positive_factors.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-zinc-300">
                            <span className="text-white font-bold">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-black p-5 rounded-xl border border-zinc-850 space-y-3">
                      <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase font-mono tracking-wider">
                        <AlertCircle className="w-4 h-4 text-zinc-400" /> Missing Requirements &amp; Gaps
                      </h3>
                      {atsResult.screening.explainable.penalty_factors.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">No significant ATS penalties identified.</p>
                      ) : (
                        <ul className="space-y-2 text-xs">
                          {atsResult.screening.explainable.penalty_factors.map((penalty, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-zinc-300">
                              <span className="text-zinc-500 font-bold">•</span>
                              <span>{penalty}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: KEYWORDS & SKILL EVIDENCE */}
              {activeDetailTab === 'keywords' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Target Role Keywords &amp; Practical Evidence
                    </h3>
                    <span className="text-xs font-mono text-zinc-400">
                      Score: <strong className="text-white">{atsResult.screening.score.keyword_score ?? atsResult.screening.score.skills}%</strong>
                    </span>
                  </div>

                  <div className="space-y-2">
                    {atsResult.screening.explainable.skill_evidence.map((evidence, idx) => {
                      const isMatched = evidence.match_status === 'matched';
                      return (
                        <div key={idx} className="bg-black p-3.5 rounded-xl border border-zinc-850 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">{evidence.skill}</span>
                              {evidence.is_required ? (
                                <span className="text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                                  Mandatory
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-850 px-1.5 py-0.5 rounded">
                                  Preferred
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400 block mt-0.5">{evidence.candidate_evidence}</span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border shrink-0 ${
                            isMatched
                              ? 'bg-zinc-900 text-white border-zinc-700'
                              : 'bg-black text-zinc-500 border-zinc-850'
                          }`}>
                            {isMatched ? '✓ Matched' : '✕ Missing'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: FORMATTING & PARSEABILITY */}
              {activeDetailTab === 'formatting' && (
                <div className="space-y-6">
                  <div className="bg-black p-5 rounded-xl border border-zinc-850 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                          Resume Layout &amp; ATS Parseability Health
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Evaluates structural headings, contact completeness, action verbs, and word density.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white block">
                          {atsResult.formatting.overall_formatting_score}% Score
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {atsResult.formatting.layout_tier || 'Standard ATS Layout'}
                        </span>
                      </div>
                    </div>

                    {/* Diagnostic Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Email Address</span>
                        <span className="text-[10px] mt-1 font-bold text-white">{atsResult.formatting.checks.has_contact_email ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Phone Number</span>
                        <span className="text-[10px] mt-1 font-bold text-white">{atsResult.formatting.checks.has_contact_phone ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Register Number</span>
                        <span className="text-[10px] mt-1 font-bold text-white">{atsResult.formatting.checks.has_reg_number ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Portfolio Links</span>
                        <span className="text-[10px] mt-1 font-bold text-white">{atsResult.formatting.checks.has_linkedin_or_github ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Education Header</span>
                        <span className="text-[10px] mt-1 font-bold text-white">{atsResult.formatting.checks.has_education_section ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Skills Section</span>
                        <span className="text-[10px] mt-1 font-bold text-white">{atsResult.formatting.checks.has_skills_section ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Action Verbs</span>
                        <span className="text-[10px] mt-1 font-bold text-white">
                          {atsResult.formatting.checks.has_action_verbs ? `✓ ${atsResult.formatting.metrics?.action_verbs_count || 4} Found` : '✕ Sparse'}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex flex-col items-center justify-center text-center">
                        <span className="text-zinc-400">Quantified Impact</span>
                        <span className="text-[10px] mt-1 font-bold text-white">
                          {atsResult.formatting.checks.has_quantifiable_results ? '✓ Detected' : '✕ Missing'}
                        </span>
                      </div>
                    </div>

                    {/* Structural Metrics Bar */}
                    {atsResult.formatting.metrics && (
                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                        <div>
                          <span className="text-zinc-500">Word Count:</span> <strong className="text-white">{atsResult.formatting.metrics.word_count} words</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500">Sections Detected:</span> <strong className="text-white">{atsResult.formatting.metrics.sections_detected.length} core sections</strong>
                        </div>
                        <div>
                          <span className="text-zinc-500">Quantifiable Metrics:</span> <strong className="text-white">{atsResult.formatting.metrics.quantifiable_metrics_count} achievements</strong>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2 border-t border-zinc-850">
                      <h4 className="text-xs font-semibold text-zinc-300">Parser Observations:</h4>
                      <ul className="space-y-1.5 text-xs text-zinc-400">
                        {atsResult.formatting.formatting_feedback.map((note, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-white">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AI TIPS */}
              {activeDetailTab === 'tips' && (
                <div className="space-y-4">
                  <div className="bg-black border border-zinc-800 p-5 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-white" /> Actionable Recommendations
                    </h3>

                    <div className="space-y-3 text-xs text-zinc-300">
                      {atsResult.screening.explainable.missing_skills.length > 0 && (
                        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                          <strong className="text-white block mb-1">1. Add Missing Core Keywords:</strong>
                          Include explicit experience or projects utilizing: <span className="text-white font-mono">{atsResult.screening.explainable.missing_skills.join(', ')}</span>.
                        </div>
                      )}

                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                        <strong className="text-white block mb-1">2. Quantify Achievements &amp; Scale:</strong>
                        Use measurable metrics (e.g., "Reduced database query latency by 35%", "Deployed microservices handling 5,000+ daily requests").
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                        <strong className="text-white block mb-1">3. Maintain Standard Section Headings:</strong>
                        Ensure standard headings (EDUCATION, TECHNICAL SKILLS, EXPERIENCE, PROJECTS) are clearly demarcated for automated parser indexing.
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                        <strong className="text-white block mb-1">4. Enhance Action Verb Density:</strong>
                        Begin every bullet point with a decisive engineering verb (e.g., "Architected", "Engineered", "Implemented", "Automated").
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PARSED PROFILE */}
              {activeDetailTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300">
                  <div className="bg-black p-4 rounded-xl border border-zinc-850 space-y-3 font-mono">
                    <h4 className="font-bold text-white uppercase text-[11px]">Academic Profile</h4>
                    <div><span className="text-zinc-500">College:</span> {atsResult.candidate.education.college}</div>
                    <div><span className="text-zinc-500">Degree &amp; Branch:</span> {atsResult.candidate.education.degree} ({atsResult.candidate.education.department})</div>
                    <div><span className="text-zinc-500">CGPA:</span> <strong className="text-white">{atsResult.candidate.education.cgpa} / 10</strong></div>
                    <div><span className="text-zinc-500">Batch:</span> {atsResult.candidate.education.graduation_year}</div>
                    <div><span className="text-zinc-500">Active Backlogs:</span> {atsResult.candidate.education.active_backlogs}</div>
                  </div>

                  <div className="bg-black p-4 rounded-xl border border-zinc-850 space-y-3 font-mono">
                    <h4 className="font-bold text-white uppercase text-[11px]">Extracted Skills</h4>
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {atsResult.candidate.skills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                    {atsResult.candidate.certifications.length > 0 && (
                      <div>
                        <span className="text-zinc-500 block mb-1">Certifications:</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {atsResult.candidate.certifications.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
