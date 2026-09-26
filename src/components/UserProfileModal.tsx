import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  GraduationCap, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatoryOnboarding?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  isMandatoryOnboarding = false
}) => {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Placement Officer');
  const [regNumber, setRegNumber] = useState('');
  const [campus, setCampus] = useState('Kattankulathur (Main Campus)');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [batchYear, setBatchYear] = useState('2026 Batch');
  const [designation, setDesignation] = useState('Placement Coordinator');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || 'Placement Officer');
      setRegNumber(currentUser.regNumber || '');
      setCampus(currentUser.campus || 'Kattankulathur (Main Campus)');
      setDepartment(currentUser.department || 'Computer Science & Engineering');
      setPhone(currentUser.phone || '');
      setBatchYear(currentUser.batchYear || '2026 Batch');
      setDesignation(currentUser.designation || 'Placement Coordinator');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      role,
      regNumber: regNumber.trim() || undefined,
      campus,
      department,
      phone: phone.trim() || undefined,
      batchYear,
      designation: designation.trim() || undefined,
      isProfileComplete: true
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onClose) onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-srm-500/20 text-srm-400 border border-srm-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                {isMandatoryOnboarding ? 'Welcome to SRM ResumeAI' : 'Institutional Profile'}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Portal
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isMandatoryOnboarding 
                  ? 'Please confirm your institutional details to personalize your placement workspace.' 
                  : 'Manage your active role and university credentials.'}
              </p>
            </div>
          </div>

          {!isMandatoryOnboarding && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tilak K"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-srm-500 focus:ring-1 focus:ring-srm-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Institutional / Work Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@srmist.edu.in"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-srm-500 focus:ring-1 focus:ring-srm-500"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Portal Access Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-srm-500"
            >
              <option value="Placement Officer">Placement Officer (Directorate of Career Centre)</option>
              <option value="Faculty Coordinator">Faculty Coordinator (Department Placement In-Charge)</option>
              <option value="Corporate Recruiter">Corporate Recruiter (Hiring Partner)</option>
              <option value="Super Admin">Super Administrator (Full System Authority)</option>
              <option value="Student Coordinator">Student Coordinator (Student Representative)</option>
            </select>
          </div>

          {/* Reg Number / Staff ID & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                SRM Register No / Employee ID
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. RA2311003010142 or SRM-EMP-9021"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98401 22334"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
                />
              </div>
            </div>
          </div>

          {/* Campus & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                SRM Campus / Office
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-srm-500"
              >
                <option value="Kattankulathur (Main Campus)">Kattankulathur (Main Campus)</option>
                <option value="Vadapalani Campus">Vadapalani Campus</option>
                <option value="Ramapuram Campus">Ramapuram Campus</option>
                <option value="Tiruchirappalli Campus">Tiruchirappalli Campus</option>
                <option value="NCR Delhi Campus">NCR Delhi Campus</option>
                <option value="Corporate Partner Office">Corporate Partner Office</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Department / Specialization
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-srm-500"
              >
                <option value="Computer Science & Engineering">Computer Science &amp; Engineering (CSE)</option>
                <option value="Information Technology">Information Technology (IT)</option>
                <option value="AI & Data Science">AI &amp; Data Science (AI &amp; DS)</option>
                <option value="Electronics & Communication">Electronics &amp; Communication (ECE)</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Management Studies (MBA)">Management Studies (MBA)</option>
                <option value="Directorate of Career Centre">Directorate of Career Centre</option>
              </select>
            </div>
          </div>

          {/* Batch Year or Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Graduation Batch Year
              </label>
              <select
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-srm-500"
              >
                <option value="2026 Batch">2026 Batch</option>
                <option value="2027 Batch">2027 Batch</option>
                <option value="2028 Batch">2028 Batch</option>
                <option value="Faculty / Placement Officer">Faculty / Placement Officer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Title / Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Lead Placement Officer or Student"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-srm-500"
              />
            </div>
          </div>

          {/* Submit / Save Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            {!isMandatoryOnboarding && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSaved}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white font-bold shadow-glow-srm transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Save &amp; Continue to Portal</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
