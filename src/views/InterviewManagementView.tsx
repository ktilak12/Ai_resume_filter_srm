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
import { Interview, InterviewRound, ScreeningResult, JobRequirement } from '../types';

interface InterviewManagementViewProps {
  interviews: Interview[];
  jobs: JobRequirement[];
  onUpdateInterviewStatus: (id: string, status: Interview['status']) => void;
  onAddInterview: (interview: Interview) => void;
}

export const InterviewManagementView: React.FC<InterviewManagementViewProps> = ({
  interviews,
  jobs,
  onUpdateInterviewStatus,
  onAddInterview
}) => {
  const [filterRound, setFilterRound] = useState<string>('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Interview form state
  const [candName, setCandName] = useState('');
  const [candRegNo, setCandRegNo] = useState('RA2311003010142');
  const [candEmail, setCandEmail] = useState('');
  const [candDept, setCandDept] = useState('CSE');
  const [jobId, setJobId] = useState(jobs[0]?.id || '');
  const [round, setRound] = useState<InterviewRound>('Technical Round 1');
  const [date, setDate] = useState('2026-09-15');
  const [time, setTime] = useState('11:00 AM');
  const [interviewer, setInterviewer] = useState('Dr. R. Venkat (Lead AI Architect)');
  const [venue, setVenue] = useState('SRM Placement Cell - Interview Suite 302');

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
      job_id: job.id,
      job_title: job.title,
      company: job.company,
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
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Interview Operations
            </span>
            <span className="text-xs text-slate-400">
              • SRM Placement Cell Logistics & Evaluation
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            Interview Management & Scheduling
          </h1>
          <p className="text-xs text-slate-300">
            Track multi-round technical and HR interviews, manage panel rooms, and record final placement offers
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs font-bold shadow-md transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Interview</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Scheduled Interviews</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {interviews.filter(i => i.status === 'Scheduled').length}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Cleared / Advanced</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {interviews.filter(i => i.status === 'Cleared').length}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Final Offers Released</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {interviews.filter(i => i.round === 'Final Placement Offer' || i.status === 'Cleared').length + 32}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Active Panel Rooms</div>
          <div className="text-2xl font-bold text-srm-400 mt-1">6 Suites</div>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="glass-panel rounded-2xl p-6 overflow-x-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Upcoming Scheduled Interview Rounds
          </h2>

          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
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
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">Candidate & Reg No</th>
              <th className="py-3 px-3">Company & Role</th>
              <th className="py-3 px-3">Interview Round</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Interviewer & Venue</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-semibold text-white">{item.candidate_name}</div>
                    <div className="text-[11px] text-slate-400">{item.candidate_reg_no} ({item.candidate_dept})</div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-medium text-white">{item.job_title}</div>
                    <div className="text-[11px] text-amber-400">{item.company}</div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold text-[11px]">
                    {item.round}
                  </span>
                </td>

                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-medium text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {item.date}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {item.time}
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <div>
                    <div className="font-medium text-slate-300">{item.interviewer}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-srm-400" /> {item.venue}
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Cleared'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : item.status === 'Scheduled'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.status}
                  </span>
                </td>

                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onUpdateInterviewStatus(item.id, 'Cleared')}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white text-[11px] font-semibold"
                      title="Clear & Advance"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => onUpdateInterviewStatus(item.id, 'Completed')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                    >
                      Done
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-dropdown rounded-2xl border border-slate-700 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Schedule Candidate Interview Round
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SRM Reg Number</label>
                  <input
                    type="text"
                    value={candRegNo}
                    onChange={(e) => setCandRegNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={candDept}
                    onChange={(e) => setCandDept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
                  <label className="block font-semibold text-slate-300 mb-1">Target Placement Drive</label>
                  <select
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Interview Round</label>
                  <select
                    value={round}
                    onChange={(e) => setRound(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
                  <label className="block font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Interviewer Panelist</label>
                <input
                  type="text"
                  value={interviewer}
                  onChange={(e) => setInterviewer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Venue / Online Link</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
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
