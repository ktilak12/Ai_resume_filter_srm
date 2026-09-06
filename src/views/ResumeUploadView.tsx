import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  Layers, 
  Check, 
  Briefcase,
  GraduationCap,
  Zap,
  ArrowRight
} from 'lucide-react';
import { JobRequirement, CandidateProfile, ScreeningResult, UploadBatchItem, AISettings } from '../types';
import { parseResumeFile, extractCandidateEntities } from '../services/resumeParser';
import { screenCandidate } from '../services/aiScreeningEngine';
import { INITIAL_CANDIDATES } from '../data/srmDataset';

interface ResumeUploadViewProps {
  jobs: JobRequirement[];
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  aiSettings: AISettings;
  onUploadComplete: (newCandidates: CandidateProfile[], newResults: ScreeningResult[]) => void;
  onNavigateToScreening: (jobId: string) => void;
}

export const ResumeUploadView: React.FC<ResumeUploadViewProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  aiSettings,
  onUploadComplete,
  onNavigateToScreening
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadBatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processUploadedFiles = async (files: File[]) => {
    if (!currentJob) return;
    setIsProcessing(true);

    const newItems: UploadBatchItem[] = files.map((file, idx) => ({
      id: `up_${Date.now()}_${idx}`,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      status: 'Uploading',
      progress: 20
    }));

    setUploadItems(prev => [...newItems, ...prev]);

    const parsedCandidates: CandidateProfile[] = [];
    const newScreenings: ScreeningResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const itemId = newItems[i].id;

      // Update state: Parsing
      setUploadItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'Parsing', progress: 50 } : item
      ));

      await new Promise(r => setTimeout(r, 400)); // simulated extraction delay

      try {
        const candidate = await parseResumeFile(file);
        
        // Update state: AI Screening
        setUploadItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, candidateName: candidate.name, status: 'AI Screening', progress: 80 } : item
        ));

        await new Promise(r => setTimeout(r, 300));

        const screening = screenCandidate(candidate, currentJob, aiSettings);

        parsedCandidates.push(candidate);
        newScreenings.push(screening);

        // Update state: Completed
        setUploadItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item, 
            status: 'Completed', 
            progress: 100,
            result: screening
          } : item
        ));

      } catch (err: any) {
        setUploadItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, status: 'Failed', error: 'Extraction error' } : item
        ));
      }
    }

    setIsProcessing(false);
    if (parsedCandidates.length > 0) {
      onUploadComplete(parsedCandidates, newScreenings);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processUploadedFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      processUploadedFiles(files);
    }
  };

  // Demo 1-Click SRM Batch simulation
  const handleLoadSampleBatch = async () => {
    if (!currentJob) return;
    setIsProcessing(true);

    const candidatesToSimulate = INITIAL_CANDIDATES.slice(0, 8);
    const batchItems: UploadBatchItem[] = candidatesToSimulate.map((cand, idx) => ({
      id: `sample_${Date.now()}_${idx}`,
      fileName: `${cand.name.replace(/\s+/g, '_')}_Resume.pdf`,
      fileSize: `${Math.floor(180 + Math.random() * 200)} KB`,
      candidateName: cand.name,
      status: 'Uploading',
      progress: 25
    }));

    setUploadItems(prev => [...batchItems, ...prev]);

    const results: ScreeningResult[] = [];

    for (let i = 0; i < candidatesToSimulate.length; i++) {
      const cand = candidatesToSimulate[i];
      const itemId = batchItems[i].id;

      // Parsing
      setUploadItems(prev => prev.map(it => 
        it.id === itemId ? { ...it, status: 'Parsing', progress: 55 } : it
      ));
      await new Promise(r => setTimeout(r, 200));

      // AI Screening
      setUploadItems(prev => prev.map(it => 
        it.id === itemId ? { ...it, status: 'AI Screening', progress: 85 } : it
      ));
      await new Promise(r => setTimeout(r, 200));

      const res = screenCandidate(cand, currentJob, aiSettings);
      results.push(res);

      // Completed
      setUploadItems(prev => prev.map(it => 
        it.id === itemId ? { 
          ...it, 
          status: 'Completed', 
          progress: 100, 
          result: res 
        } : it
      ));
    }

    setIsProcessing(false);
    onUploadComplete(candidatesToSimulate, results);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Job Selector */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-srm-400" />
              Upload & Process Candidate Resumes
            </h1>
            <p className="text-xs text-slate-400">
              Upload PDF or DOCX batches for instant text extraction, SRM academic eligibility verification, and AI semantic matching
            </p>
          </div>

          {/* Job Requirement Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-slate-300">Target Opportunity:</span>
            <select
              value={currentJob.id}
              onChange={(e) => onSelectJob(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-srm-300 focus:outline-none focus:border-srm-500"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.company})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Job Requirement Preview Card */}
        {currentJob && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-srm-600/20 border border-srm-500/30 flex items-center justify-center text-srm-400 font-bold text-xs">
                  {currentJob.company.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{currentJob.title}</span>
                    <span className="text-[10px] text-amber-400 font-normal">({currentJob.company})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Deadline: {currentJob.application_deadline} • Vacancies: {currentJob.open_vacancies}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Min CGPA:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                  ≥ {currentJob.academic_eligibility.min_cgpa}
                </span>
                <span className="text-slate-400 ml-2">Batch:</span>
                <span className="px-2 py-0.5 rounded bg-srm-500/20 text-srm-300 font-bold text-[11px] border border-srm-500/30">
                  {currentJob.academic_eligibility.graduation_year}
                </span>
              </div>
            </div>

            {/* Required and Preferred Skills Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Required Skills:</span>
              {currentJob.required_skills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                  ⭐ {skill}
                </span>
              ))}
              <span className="text-[11px] font-semibold text-slate-400 ml-3 mr-1">Preferred:</span>
              {currentJob.preferred_skills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative glass-panel rounded-2xl p-8 text-center border-2 border-dashed transition-all cursor-pointer group ${
          isDragging
            ? 'border-srm-400 bg-srm-950/40 shadow-glow-srm scale-[1.01]'
            : 'border-slate-700/80 hover:border-srm-500/50 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-srm-600/20 border border-srm-500/30 text-srm-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-glow-srm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Drag & Drop Resumes Here
            </h3>
            <p className="text-xs text-slate-400">
              Supports <strong className="text-slate-300">PDF, DOCX, TXT</strong> files • Batch upload up to 200 resumes simultaneously
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Browse Files from Computer
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSampleBatch();
              }}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Load Sample SRM Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Upload & Processing Pipeline Roster */}
      {uploadItems.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-srm-400" />
                Resume Processing & AI Screening Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Live extraction of personal details, CGPA, skills, projects, and AI match computation
              </p>
            </div>

            <button
              onClick={() => onNavigateToScreening(currentJob.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
            >
              <span>View Ranked Candidates in Screening Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">File / Candidate</th>
                  <th className="py-3 px-3">Pipeline Status</th>
                  <th className="py-3 px-3">SRM Academic Check</th>
                  <th className="py-3 px-3 text-center">AI Match Score</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {uploadItems.map((item) => {
                  const res = item.result;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                            <FileText className="w-4 h-4 text-srm-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {item.candidateName || item.fileName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {item.fileName} • {item.fileSize}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {item.status === 'Completed' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Parsed & Evaluated
                              </span>
                            ) : item.status === 'Failed' ? (
                              <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
                                <AlertTriangle className="w-3.5 h-3.5" /> Extraction Error
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-srm-400 font-semibold text-xs animate-pulse">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                {item.status === 'Uploading' ? 'Uploading File...' : item.status === 'Parsing' ? 'NLP Entity Extraction...' : 'Calculating Match Score...'}
                              </span>
                            )}
                          </div>
                          <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                item.status === 'Completed' ? 'bg-emerald-500' : 'bg-srm-500 animate-shimmer'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {res ? (
                          res.eligibility.is_eligible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-[11px]">
                              <Check className="w-3 h-3" /> Eligible (CGPA: {res.candidate.education.cgpa})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/30 text-red-300 font-medium text-[11px]">
                              <AlertTriangle className="w-3 h-3" /> Ineligible
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">Verifying...</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {res ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`text-sm font-extrabold ${
                              res.score.overall_match >= 85 
                                ? 'text-emerald-400' 
                                : res.score.overall_match >= 65 
                                ? 'text-amber-400' 
                                : 'text-slate-400'
                            }`}>
                              {res.score.overall_match}%
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.explainable.verdict === 'Strong Match'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : res.explainable.verdict === 'Needs Review'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {res.explainable.verdict}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigateToScreening(currentJob.id)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                        >
                          View Ranking
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
