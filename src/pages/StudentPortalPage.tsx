import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_JOBS, INITIAL_CANDIDATES, INITIAL_INTERVIEWS } from '../data/srmDataset';
import { parseResumeFile } from '../services/resumeParser';
import { screenCandidate } from '../services/aiScreeningEngine';
import { CandidateProfile, ScreeningResult, JobRequirement, Interview } from '../types';
import { downloadIcsFile } from '../services/calendarService';
import { ResumeBuilder } from '../components/student/ResumeBuilder';
import { SEO } from '../components/common/SEO';

export const StudentPortalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'eligibility' | 'builder' | 'checker' | 'interviews'>('builder');

  // Candidate data & drives from state/storage
  const [jobs] = useState<JobRequirement[]>(() => {
    try {
      const saved = localStorage.getItem('srm_jobs_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_JOBS;
  });

  const [interviews] = useState<Interview[]>(() => {
    try {
      const saved = localStorage.getItem('srm_interviews_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INTERVIEWS;
  });

  // Student specific details or sensible defaults
  const studentEmail = currentUser?.email || 'tilak.k@srmist.edu.in';
  const studentName = currentUser?.name || 'Tilak K';
  const studentRegNo = currentUser?.regNumber || 'RA2311003010142';
  const studentDept = currentUser?.department || 'Computer Science and Engineering';
  const studentCgpa = 8.85; // Simulated verified SRM academic CGPA
  const studentBacklogs = 0;

  // Filter interviews relevant to current student
  const studentInterviews = interviews.filter(
    i => i.candidate_email.toLowerCase() === studentEmail.toLowerCase() ||
         i.candidate_reg_no.toUpperCase() === studentRegNo.toUpperCase() ||
         i.candidate_name.toLowerCase().includes(studentName.toLowerCase())
  );

  // Resume ATS Checker state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedDriveId, setSelectedDriveId] = useState<string>(jobs[0]?.id || '');
  const [evalResult, setEvalResult] = useState<ScreeningResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsEvaluating(true);
    setEvalResult(null);
    setUploadError(null);

    try {
      const parsedCandidate = await parseResumeFile(file);
      parsedCandidate.name = studentName;
      parsedCandidate.email = studentEmail;
      parsedCandidate.reg_number = studentRegNo;

      const targetJob = jobs.find(j => j.id === selectedDriveId) || jobs[0];
      const result = screenCandidate(parsedCandidate, targetJob);
      setEvalResult(result);
    } catch (err: any) {
      console.error('Error evaluating student resume:', err);
      setUploadError(err.message || 'Error parsing resume file. Please ensure it is a valid PDF, DOCX, or TXT file under 10MB.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <SEO
        title="Student Placement Hub & Application Status | SRM ResumeAI"
        description="Access SRM student placement portal to check campus drive eligibility, test your resume against ATS criteria, and manage interview schedules."
        canonical="/student-portal"
        keywords="SRM student portal, campus recruitment eligibility, student placement status, SRM resume check, interview schedule"
      />
      {/* Student Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-6 lg:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-300 font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
              <span>SRM Candidate Self-Service Hub</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-display">
              Welcome, {studentName}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Track your campus recruitment eligibility, test your resume against live placement drive criteria, 
              and download interview calendar passes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 text-center min-w-[90px]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Verified CGPA</div>
              <div className="text-lg font-bold text-white font-display">{studentCgpa}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 text-center min-w-[90px]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Backlogs</div>
              <div className="text-lg font-bold text-emerald-400 font-display">{studentBacklogs}</div>
            </div>
            <div className="p-3 rounded-xl bg-black/60 border border-zinc-850 text-center min-w-[100px]">
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Interviews</div>
              <div className="text-lg font-bold text-white font-display">{studentInterviews.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-zinc-850 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'builder'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Resume Builder & Tailor</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('eligibility')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'eligibility'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Eligible Placement Drives ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('checker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'checker'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Resume ATS Checker</span>
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'interviews'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>My Interview Passes ({studentInterviews.length})</span>
        </button>
      </div>

      {/* TAB 0: AI RESUME BUILDER & TAILOR */}
      {activeTab === 'builder' && (
        <ResumeBuilder
          initialJobId={selectedDriveId}
          jobs={jobs}
          onNavigateToDrives={() => setActiveTab('eligibility')}
        />
      )}

      {/* TAB 1: ELIGIBILITY & DRIVES */}
      {activeTab === 'eligibility' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const isCgpaEligible = studentCgpa >= (job.academic_eligibility?.min_cgpa || 7.0);
            const isBacklogEligible = studentBacklogs <= (job.academic_eligibility?.max_active_backlogs ?? 0);
            const isEligible = isCgpaEligible && isBacklogEligible;

            return (
              <div
                key={job.id}
                className="rounded-2xl bg-zinc-950 border border-zinc-850 p-5 space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{job.title}</h3>
                      <p className="text-xs text-zinc-400 font-medium">{job.company}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {job.ctc_lpa}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.required_skills?.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Min CGPA Required:</span>
                      <span className="font-semibold text-zinc-200">{job.academic_eligibility?.min_cgpa}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Max Backlogs:</span>
                      <span className="font-semibold text-zinc-200">{job.academic_eligibility?.max_active_backlogs}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Deadline:</span>
                      <span className="font-semibold text-zinc-200">{job.application_deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-850/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {isEligible ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Eligible</span>
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Not Met</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedDriveId(job.id);
                        setActiveTab('builder');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Build and tailor resume specifically for this drive"
                    >
                      <Sparkles className="w-3 h-3 text-black" />
                      <span>Build Resume</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDriveId(job.id);
                        setActiveTab('checker');
                      }}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-0.5 transition-colors px-1.5 py-1"
                    >
                      <span>Test File</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: AI RESUME ATS CHECKER */}
      {activeTab === 'checker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Evaluate Your Resume</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload your latest PDF/DOCX resume to evaluate keyword match percentage, action verb strength, 
                and qualification alignment for the selected drive.
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase text-zinc-400">Target Placement Drive</label>
                <select
                  value={selectedDriveId}
                  onChange={(e) => setSelectedDriveId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.company} — {j.title} ({j.ctc_lpa})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-zinc-900/30">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleResumeUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-white">
                  {uploadedFile ? uploadedFile.name : 'Click to Upload Resume (PDF / DOCX)'}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Instant Explainable ATS Scoring</p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {isEvaluating && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 text-center animate-pulse">
                  Analyzing document tokens & semantic alignment...
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-4">
            {evalResult ? (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-850">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Evaluation Result</span>
                    <h3 className="text-xl font-bold text-white">{evalResult.candidate.name}</h3>
                    <p className="text-xs text-zinc-400">
                      Screened against <strong className="text-zinc-200">{jobs.find(j => j.id === selectedDriveId)?.company}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center min-w-[100px]">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">ATS Match</div>
                      <div className="text-2xl font-bold text-white">{evalResult.score.overall_match}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center min-w-[110px]">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">AI Verdict</div>
                      <div className="text-xs font-bold text-emerald-400">{evalResult.explainable.verdict}</div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Scoring Breakdown</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Technical Skills Coverage</span>
                        <span className="font-bold text-white">{evalResult.score.skills}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${evalResult.score.skills}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Internship & Experience</span>
                        <span className="font-bold text-white">{evalResult.score.experience}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${evalResult.score.experience}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Academic Standing</span>
                        <span className="font-bold text-white">{evalResult.score.education}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${evalResult.score.education}%` }} />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Projects Breadth</span>
                        <span className="font-bold text-white">{evalResult.score.projects}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${evalResult.score.projects}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Optimization Feedback</h4>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2 text-xs">
                    <p className="text-zinc-300">
                      <strong>AI Summary:</strong> {evalResult.explainable.summary}
                    </p>
                    {evalResult.explainable.missing_skills && evalResult.explainable.missing_skills.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800">
                        <span className="text-zinc-400">Missing Key Skills for this Role:</span>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {evalResult.explainable.missing_skills.map((s: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-900/40 text-[10px]">
                              + Add {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-white block">Ready to boost this ATS score?</span>
                        <span className="text-[11px] text-zinc-400">Open the AI Resume Builder tailored specifically for this drive's keywords.</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('builder');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        <span>Build Tailored Resume</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Evaluation Loaded</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Upload your resume file on the left panel to trigger automatic parsing and get an instant explainable ATS report.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTERVIEW PASSES */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {studentInterviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentInterviews.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-zinc-950 border border-zinc-850 p-6 space-y-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{item.company}</span>
                      <h3 className="text-base font-bold text-white">{item.job_title}</h3>
                      <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-850 text-emerald-400 text-[10px] font-semibold">
                        {item.round}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-850 text-white text-xs font-semibold">
                      {item.status}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Date & Time:
                      </span>
                      <span className="font-medium text-white">{item.date} at {item.time}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Interviewer:</span>
                      <span className="font-medium text-white">{item.interviewer}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Venue / Meeting:</span>
                      <span className="font-medium text-zinc-300">{item.venue}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-mono">Issued by SRM Career Centre</span>
                    <button
                      onClick={() => downloadIcsFile(item)}
                      className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5 text-black" />
                      <span>Download Calendar (.ics)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-zinc-950 border border-zinc-850 p-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-semibold text-white">No Scheduled Interviews Yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Once placement coordinators shortlist your profile and assign interview slots, your call letters and calendar passes will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
