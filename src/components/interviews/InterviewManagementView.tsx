import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  Video, 
  Sparkles,
  Building2,
  ChevronRight,
  Award
} from 'lucide-react';
import { Interview, InterviewRound, ScreeningResult, JobRequirement, CandidateProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { checkPermission } from '../../services/rbac';
import { downloadIcsFile } from '../../services/calendarService';

interface InterviewManagementViewProps {
  interviews: Interview[];
  jobs: JobRequirement[];
  onUpdateInterviewStatus: (id: string, status: Interview['status']) => void;
  onAddInterview: (interview: Interview) => void;
  initialCandidate?: CandidateProfile | null;
  initialJobId?: string | null;
}

export const InterviewManagementView: React.FC<InterviewManagementViewProps> = ({
  interviews,
  jobs,
  onUpdateInterviewStatus,
  onAddInterview,
  initialCandidate,
  initialJobId
}) => {
  const { currentUser } = useAuth();
  const activeRole = currentUser?.role || 'Placement Officer';

  const canSchedule = checkPermission(activeRole, 'SCHEDULE_INTERVIEW');
  const canUpdateStatus = checkPermission(activeRole, 'UPDATE_INTERVIEW_STATUS');

  const [filterRound, setFilterRound] = useState<string>('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(Boolean(initialCandidate));

  // New Interview form state
  const [candName, setCandName] = useState(initialCandidate?.name || '');
  const [candRegNo, setCandRegNo] = useState(initialCandidate?.reg_number || 'RA2311003010142');
  const [candEmail, setCandEmail] = useState(initialCandidate?.email || '');
  const [candDept, setCandDept] = useState(initialCandidate?.education?.department || 'CSE');
  const [jobId, setJobId] = useState(initialJobId || jobs[0]?.id || '');
  const [round, setRound] = useState<InterviewRound>('Technical Round 1');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('11:00 AM');
  const [interviewer, setInterviewer] = useState('Dr. R. Venkat (Lead AI Architect)');
  const [venue, setVenue] = useState('SRM Placement Cell - Interview Suite 302');

  React.useEffect(() => {
    if (initialCandidate) {
      setCandName(initialCandidate.name);
      setCandRegNo(initialCandidate.reg_number);
      setCandEmail(initialCandidate.email);
      setCandDept(initialCandidate.education?.department || 'CSE');
      if (initialJobId) setJobId(initialJobId);
      setIsScheduleModalOpen(true);
    }
  }, [initialCandidate, initialJobId]);

  const filtered = interviews.filter(int => {
    if (filterRound !== 'all' && int.round !== filterRound) return false;
    return true;
  });

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim()) return;

    const job = jobs.find(j => j.id === jobId) || jobs[0];

    const newInt: Interview = {
      id: `int-${Date.now()}`,
      candidate_id: `cand-${Date.now()}`,
      candidate_name: candName.trim(),
      candidate_reg_no: candRegNo.trim(),
      candidate_email: candEmail || `${candName.toLowerCase().replace(/\s+/g, '.')}@srmist.edu.in`,
      candidate_dept: candDept,
      job_id: job?.id || 'job-general',
      job_title: job?.title || 'Campus Placement Drive',
      company: job?.company || 'Recruiting Partner',
      round,
      date,
      time,
      interviewer,
      venue,
      status: 'Scheduled',
      created_at: new Date().toISOString()
    };

    onAddInterview(newInt);
    setIsScheduleModalOpen(false);
    setCandName('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-white" />
              Interview Operations
            </span>
            <span className="text-xs text-zinc-400">
              • SRM Placement Cell Logistics & Evaluation
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            Interview Management & Scheduling
          </h1>
          <p className="text-xs text-zinc-400">
            Track multi-round technical and HR interviews, manage panel rooms, and record final placement offers
          </p>
        </div>

        {canSchedule ? (
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Interview</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
            <span>Scheduling restricted for {activeRole} (Read-only access)</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xs text-zinc-400">Scheduled Interviews</div>
          <div className="text-2xl font-bold text-white mt-1">
            {interviews.filter(i => i.status === 'Scheduled').length}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xs text-zinc-400">Cleared / Advanced</div>
          <div className="text-2xl font-bold text-white mt-1">
            {interviews.filter(i => i.status === 'Cleared').length}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xs text-zinc-400">Final Offers Released</div>
          <div className="text-2xl font-bold text-white mt-1">
            {interviews.filter(i => i.round === 'Final Placement Offer' || i.status === 'Cleared').length + 32}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
          <div className="text-xs text-zinc-400">Active Panel Rooms</div>
          <div className="text-2xl font-bold text-white mt-1">6 Suites</div>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 overflow-x-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white" />
            Upcoming Scheduled Interview Rounds
          </h2>

          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
          >
            <option value="all">All Rounds</option>
            <option value="Technical Round 1">Technical Round 1</option>
            <option value="Technical Round 2">Technical Round 2</option>
            <option value="HR Round">HR Round</option>
            <option value="Final Placement Offer">Final Placement Offer</option>
          </select>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">Candidate & Reg No</th>
              <th className="py-3 px-3">Company & Role</th>
              <th className="py-3 px-3">Interview Round</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Interviewer & Venue</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-semibold text-white">{item.candidate_name}</div>
                    <div className="text-[11px] text-zinc-400">{item.candidate_reg_no} ({item.candidate_dept})</div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-medium text-white">{item.job_title}</div>
                    <div className="text-[11px] text-zinc-400">{item.company}</div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-semibold text-[11px]">
                    {item.round}
                  </span>
                </td>

                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-medium text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" /> {item.date}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" /> {item.time}
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-medium text-zinc-300">{item.interviewer}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" /> {item.venue}
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Cleared'
                      ? 'bg-white text-black font-semibold'
                      : item.status === 'Scheduled'
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {item.status}
                  </span>
                </td>

                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => downloadIcsFile(item)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                      title="Download Calendar (.ics) Invite"
                    >
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      <span>.ICS</span>
                    </button>
                    {canUpdateStatus ? (
                      <>
                        <button
                          onClick={() => onUpdateInterviewStatus(item.id, 'Cleared')}
                          className="px-2.5 py-1 rounded bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold transition-colors"
                          title="Clear & Advance"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => onUpdateInterviewStatus(item.id, 'Completed')}
                          className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] transition-colors"
                        >
                          Done
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-zinc-500 italic">Read-only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white" />
                Schedule Candidate Interview Round
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">SRM Reg Number</label>
                  <input
                    type="text"
                    value={candRegNo}
                    onChange={(e) => setCandRegNo(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Department</label>
                  <select
                    value={candDept}
                    onChange={(e) => setCandDept(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="AI & DS">AI & DS</option>
                    <option value="ECE">ECE</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Target Placement Drive</label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Interview Round</label>
                  <select
                    value={round}
                    onChange={(e) => setRound(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Technical Round 1">Technical Round 1</option>
                    <option value="Technical Round 2">Technical Round 2</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Managerial Round">Managerial Round</option>
                    <option value="Final Placement Offer">Final Placement Offer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Interviewer Panelist</label>
                <input
                  type="text"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Venue / Online Link</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold"
                >
                  Confirm & Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
