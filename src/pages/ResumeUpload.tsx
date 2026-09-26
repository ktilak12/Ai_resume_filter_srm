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
  Zap, 
  Download,
  Search,
  ExternalLink
} from 'lucide-react';
import { INITIAL_JOBS, INITIAL_CANDIDATES } from '../data/srmDataset';
import { CandidateProfile, ScreeningResult, JobRequirement } from '../types';
import { parseResumeFile, extractCandidateEntities } from '../services/resumeParser';
import { screenCandidate, evaluateAtsFormatting, AtsFormattingCheck } from '../services/aiScreeningEngine';
import { Link } from 'react-router-dom';

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
    return [DEFAULT_BENCHMARK_JOB];
  });

  const [selectedJobId, setSelectedJobId] = useState<string>(() => jobs[0]?.id || DEFAULT_BENCHMARK_JOB.id);
  const [files, setFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const processResumeEvaluation = async (rawContent?: string, fileObj?: File) => {
    setIsProcessing(true);
    setProgress(15);
    setAtsResult(null);
    setSavedSuccessMsg(null);

    await new Promise(r => setTimeout(r, 250));
    setProgress(45);

    try {
      let candidateProfile: CandidateProfile;
      let rawText = rawContent || '';

      if (fileObj) {
        candidateProfile = await parseResumeFile(fileObj);
        rawText = candidateProfile.raw_resume_text || '';
      } else {
        candidateProfile = extractCandidateEntities(rawContent || '', 'Submitted_Resume.txt');
      }

      setProgress(75);
      await new Promise(r => setTimeout(r, 250));

      const screening = screenCandidate(candidateProfile, selectedJob);
      const formatting = evaluateAtsFormatting(rawText, candidateProfile);

      // Attach ATS score to candidate profile
      candidateProfile.ats_score = screening.score.overall_match;

      // Persist candidate to local storage
      const currentSaved = localStorage.getItem('srm_candidates_list');
      let candidatesList: CandidateProfile[] = [];
      if (currentSaved) {
        try {
          candidatesList = JSON.parse(currentSaved);
        } catch (e) {
          candidatesList = [];
        }
      }
      
      const existingIdx = candidatesList.findIndex(c => c.id === candidateProfile.id || (c.email && c.email === candidateProfile.email));
      if (existingIdx >= 0) {
        candidatesList[existingIdx] = candidateProfile;
      } else {
        candidatesList = [candidateProfile, ...candidatesList];
      }
      localStorage.setItem('srm_candidates_list', JSON.stringify(candidatesList));

      setProgress(100);
      await new Promise(r => setTimeout(r, 200));

      setAtsResult({
        candidate: candidateProfile,
        screening,
        formatting
      });
      setSavedSuccessMsg(`Candidate profile for "${candidateProfile.name}" saved to recruitment pool!`);
    } catch (err) {
      alert('Error parsing resume. Please ensure file contains valid text content.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-srm-400" />
            Resume ATS Score Checker & Evaluator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Submit student resumes to calculate real-time ATS match score, keyword coverage, formatting health, and AI recommendations.
          </p>
        </div>

        {/* Target Job Selector */}
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Target Role:</span>
          <select 
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              if (atsResult) {
                const updatedJob = INITIAL_JOBS.find(j => j.id === e.target.value) || INITIAL_JOBS[0];
                const screening = screenCandidate(atsResult.candidate, updatedJob);
                setAtsResult(prev => prev ? { ...prev, screening } : null);
              }
            }}
            className="bg-slate-800 border border-slate-700 text-white font-medium text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-srm-500"
          >
            {INITIAL_JOBS.map(j => (
              <option key={j.id} value={j.id}>{j.company} — {j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Drive Requirements Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-srm-600/20 border border-srm-500/30 flex items-center justify-center text-srm-400 font-bold">
            {selectedJob.company.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-white">{selectedJob.title}</span>
            <span className="text-slate-400 ml-2">({selectedJob.company})</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Min CGPA:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/20">
            ≥ {selectedJob.academic_eligibility.min_cgpa}
          </span>
          <span className="text-slate-400 ml-2">Required Skills:</span>
          <div className="flex flex-wrap gap-1">
            {selectedJob.required_skills.map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-srm-500/10 text-srm-300 font-medium text-[11px] border border-srm-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Submission Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'upload' 
                ? 'border-srm-500 text-srm-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload File (PDF / DOCX)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'paste' 
                ? 'border-srm-500 text-srm-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
                dragActive ? 'border-srm-500 bg-srm-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                ref={inputRef}
                type="file" 
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700 shadow-sm">
                <UploadCloud className="h-7 w-7 text-srm-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Drag and drop resume file here</h3>
              <p className="text-slate-400 text-xs mb-5">Supports text-based PDF, DOCX, and TXT files</p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => inputRef.current?.click()}
                  className="bg-srm-600 hover:bg-srm-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-glow-srm flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Select Resume File</span>
                </button>
              </div>
            </div>

            {files.length > 0 && (
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-srm-400" />
                  <div>
                    <span className="text-sm font-medium text-white block">{files[0].name}</span>
                    <span className="text-xs text-slate-400">{(files[0].size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button 
                  onClick={() => setFiles([])}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300">Paste Resume Text Content:</label>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw resume text here (Education, Skills, Experience, Projects)..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-srm-500"
            ></textarea>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Instant Institutional NLP Extraction &amp; ATS Scoring</span>
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
            className="w-full sm:w-auto bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-glow-srm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating ATS Score ({progress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Submit &amp; Calculate ATS Score</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COMPREHENSIVE ATS SCORE & ANALYSIS REPORT PANEL          */}
      {/* ========================================================= */}
      {atsResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner Notice */}
          {savedSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{savedSuccessMsg}</span>
              </div>
              <button onClick={() => setSavedSuccessMsg(null)} className="text-slate-400 hover:text-white underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Hero ATS Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-srm-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Overall Score Gauge */}
              <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overall ATS Score</span>
                <div className="relative flex items-center justify-center my-2">
                  <div className={`text-5xl font-extrabold tracking-tight ${
                    atsResult.screening.score.overall_match >= 85 
                      ? 'text-emerald-400' 
                      : atsResult.screening.score.overall_match >= 65 
                      ? 'text-amber-400' 
                      : 'text-rose-400'
                  }`}>
                    {atsResult.screening.score.overall_match}%
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mt-2 ${
                  atsResult.screening.explainable.verdict === 'Strong Match'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : atsResult.screening.explainable.verdict === 'Needs Review'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {atsResult.screening.explainable.verdict}
                </span>
              </div>

              {/* Summary Stats */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{atsResult.candidate.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {atsResult.candidate.reg_number} • {atsResult.candidate.education.degree} in {atsResult.candidate.education.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Academic Status</span>
                    <span className={`text-xs font-bold ${atsResult.screening.eligibility.is_eligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {atsResult.screening.eligibility.is_eligible ? '✓ Eligible (CGPA Cutoff Met)' : '✕ Ineligible'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                  {atsResult.screening.explainable.summary}
                </p>

                {/* Sub-Score Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 text-center">
                    <span className="text-[10px] text-slate-400 block">Skills Score</span>
                    <span className="font-bold text-srm-400">{atsResult.screening.score.skills}%</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 text-center">
                    <span className="text-[10px] text-slate-400 block">Academic Score</span>
                    <span className="font-bold text-emerald-400">{atsResult.screening.score.education}%</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 text-center">
                    <span className="text-[10px] text-slate-400 block">Experience Score</span>
                    <span className="font-bold text-amber-400">{atsResult.screening.score.experience}%</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 text-center">
                    <span className="text-[10px] text-slate-400 block">ATS Formatting</span>
                    <span className="font-bold text-purple-400">{atsResult.formatting.overall_formatting_score}%</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSavedSuccessMsg(`Added ${atsResult.candidate.name} to AI Screening Roster & Candidate Database!`);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Candidate to Database
                  </button>

                  <Link
                    to="/screening"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View in Candidate Rankings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Detailed Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="flex border-b border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveDetailTab('overview')}
                className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'overview' ? 'border-srm-500 text-srm-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                Score Breakdown
              </button>

              <button
                onClick={() => setActiveDetailTab('keywords')}
                className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'keywords' ? 'border-srm-500 text-srm-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-4 h-4" />
                Keywords &amp; Skill Evidence ({atsResult.screening.explainable.skill_evidence.filter(e => e.match_status === 'matched').length} Matched)
              </button>

              <button
                onClick={() => setActiveDetailTab('formatting')}
                className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'formatting' ? 'border-srm-500 text-srm-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                ATS Layout &amp; Parseability Check ({atsResult.formatting.overall_formatting_score}%)
              </button>

              <button
                onClick={() => setActiveDetailTab('tips')}
                className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'tips' ? 'border-srm-500 text-srm-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                AI Optimization Tips
              </button>

              <button
                onClick={() => setActiveDetailTab('profile')}
                className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === 'profile' ? 'border-srm-500 text-srm-400 bg-slate-800/50' : 'border-transparent text-slate-400 hover:text-slate-200'
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Strengths */}
                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                      <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Positives &amp; Strengths Detected
                      </h3>
                      <ul className="space-y-2 text-xs">
                        {atsResult.screening.explainable.positive_factors.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                      <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4" /> ATS Gaps &amp; Missing Requirements
                      </h3>
                      {atsResult.screening.explainable.penalty_factors.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No significant ATS penalties or gaps identified.</p>
                      ) : (
                        <ul className="space-y-2 text-xs">
                          {atsResult.screening.explainable.penalty_factors.map((penalty, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-300">
                              <span className="text-amber-400 font-bold">•</span>
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
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Required &amp; Preferred Skill Keyword Verification
                  </h3>

                  <div className="space-y-3">
                    {atsResult.screening.explainable.skill_evidence.map((evidence, idx) => {
                      const isMatched = evidence.match_status === 'matched';
                      return (
                        <div key={idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{evidence.skill}</span>
                              {evidence.is_required && (
                                <span className="text-[10px] bg-srm-950 text-srm-300 border border-srm-500/30 px-1.5 py-0.5 rounded font-bold">
                                  Mandatory
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 block mt-1">{evidence.candidate_evidence}</span>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                            isMatched
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
                  <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Resume Layout &amp; Parseability Health
                      </h3>
                      <span className="text-sm font-bold text-purple-400">
                        {atsResult.formatting.overall_formatting_score}% Score
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${
                        atsResult.formatting.checks.has_contact_email ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}>
                        <span className="font-bold">Email Header</span>
                        <span className="text-[10px] mt-1">{atsResult.formatting.checks.has_contact_email ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${
                        atsResult.formatting.checks.has_contact_phone ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}>
                        <span className="font-bold">Phone Number</span>
                        <span className="text-[10px] mt-1">{atsResult.formatting.checks.has_contact_phone ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${
                        atsResult.formatting.checks.has_reg_number ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}>
                        <span className="font-bold">Register Number</span>
                        <span className="text-[10px] mt-1">{atsResult.formatting.checks.has_reg_number ? '✓ Present' : '✕ Missing'}</span>
                      </div>

                      <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${
                        atsResult.formatting.checks.has_skills_section ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}>
                        <span className="font-bold">Skills Heading</span>
                        <span className="text-[10px] mt-1">{atsResult.formatting.checks.has_skills_section ? '✓ Present' : '✕ Missing'}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-300">Parser Observations:</h4>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        {atsResult.formatting.formatting_feedback.map((note, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-srm-400">•</span>
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
                  <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" /> Actionable Advice to Boost ATS Score
                    </h3>

                    <div className="space-y-3 text-xs text-slate-300">
                      {atsResult.screening.explainable.missing_skills.length > 0 && (
                        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                          <strong className="text-white block mb-1">1. Add Missing Core Keywords:</strong>
                          Include explicit experience or projects utilizing: <span className="text-amber-400 font-mono">{atsResult.screening.explainable.missing_skills.join(', ')}</span>.
                        </div>
                      )}

                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <strong className="text-white block mb-1">2. Quantify Project &amp; Internship Achievements:</strong>
                        Use measurable metrics (e.g., "Reduced latency by 35%", "Achieved 94% accuracy").
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <strong className="text-white block mb-1">3. Maintain Clean Section Headings:</strong>
                        Ensure standard section names like EDUCATION, TECHNICAL SKILLS, EXPERIENCE, and PROJECTS are used so ATS parsers index entities accurately.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PARSED PROFILE */}
              {activeDetailTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white uppercase text-[11px]">Academic Profile</h4>
                    <div><span className="text-slate-500">College:</span> {atsResult.candidate.education.college}</div>
                    <div><span className="text-slate-500">Degree &amp; Branch:</span> {atsResult.candidate.education.degree} ({atsResult.candidate.education.department})</div>
                    <div><span className="text-slate-500">CGPA:</span> <strong className="text-emerald-400">{atsResult.candidate.education.cgpa} / 10</strong></div>
                    <div><span className="text-slate-500">Batch:</span> {atsResult.candidate.education.graduation_year}</div>
                    <div><span className="text-slate-500">Active Backlogs:</span> {atsResult.candidate.education.active_backlogs}</div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white uppercase text-[11px]">Extracted Skills &amp; Certifications</h4>
                    <div>
                      <span className="text-slate-500 block mb-1">Extracted Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {atsResult.candidate.skills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                    {atsResult.candidate.certifications.length > 0 && (
                      <div>
                        <span className="text-slate-500 block mb-1">Certifications:</span>
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
