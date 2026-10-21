import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  Database,
  EyeOff,
  AlertTriangle,
  Mail,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Building2,
  Cpu,
  Clock,
  HelpCircle
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const navigationItems = [
    { id: 'overview', label: '1. Overview & Statutory Context' },
    { id: 'data-collected', label: '2. Personal Data We Collect' },
    { id: 'lawful-basis', label: '3. Lawful Basis & Notice (Sec. 5 & 6)' },
    { id: 'purpose', label: '4. Purpose Limitation & AI Usage' },
    { id: 'data-fiduciary', label: '5. Data Fiduciary & Processing' },
    { id: 'security', label: '6. Storage & Security Safeguards (Sec. 8)' },
    { id: 'retention', label: '7. Data Retention & Erasure' },
    { id: 'rights', label: '8. Rights of Data Principals (Sec. 11–14)' },
    { id: 'grievance', label: '9. Grievance Redressal Officer (GRO)' }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white selection:text-black">
      {/* Header bar */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-850 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                SRM <span className="text-zinc-400 font-normal">Privacy & Data Governance</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DPDP Act (2023 / 2027 In-Force Rules)
            </span>
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all"
            >
              Enter Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="border-b border-zinc-850 bg-gradient-to-b from-zinc-950 to-black px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono mb-4">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Digital Personal Data Protection (DPDP) Compliance Standard</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
            Institutional Privacy Policy & Data Processing Notice
          </h1>
          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
            This document outlines how SRM Institute of Science and Technology (SRMIST) collects, processes, 
            protects, and manages personal data of students, candidates, and placement coordinators within the 
            <strong> SRM In-House AI Resume Screening Platform</strong> in full alignment with the 
            <strong> Digital Personal Data Protection (DPDP) Act</strong> and institutional guidelines.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs text-zinc-500 font-mono">
            <div>Data Fiduciary: <span className="text-zinc-300">SRMIST Career Centre</span></div>
            <div>Jurisdiction: <span className="text-zinc-300">Republic of India</span></div>
            <div>Effective Year: <span className="text-zinc-300">2026–2027</span></div>
            <div>Status: <span className="text-emerald-400 font-bold">Compliant & Active</span></div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Sidebar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-2 bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2 pb-2">
              Policy Table of Contents
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`block px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSection === item.id
                      ? 'bg-white text-black font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-4 mt-4 border-t border-zinc-850">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 leading-snug space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Explainable AI Guarantee</span>
                </div>
                <p>
                  No student application is automatically discarded solely by automated decisions. Human recruitment officers always retain ultimate shortlisting authority.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Body */}
        <div className="lg:col-span-3 space-y-10 text-zinc-300 text-sm leading-relaxed">

          {/* Section 1 */}
          <section id="overview" className="space-y-3 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <Building2 className="w-4 h-4 text-zinc-400" />
              <span>Section 1</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              1. Overview & Statutory Context
            </h2>
            <p>
              Under the Digital Personal Data Protection (DPDP) Act of India, 
              <strong> SRM Institute of Science and Technology (SRMIST)</strong> functions as the 
              <strong> Data Fiduciary</strong>, and enrolled students, applicants, and platform users are the 
              <strong> Data Principals</strong>.
            </p>
            <p>
              The platform facilitates career placement drives, resume parsing, ATS scoring, and interview scheduling. 
              We are strictly committed to lawful processing, purpose limitation, transparency, robust security safeguards, 
              and upholding all statutory rights granted to Data Principals.
            </p>
          </section>

          {/* Section 2 */}
          <section id="data-collected" className="space-y-5 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <Database className="w-4 h-4 text-zinc-400" />
              <span>Section 2</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              2. Personal Data We Collect From You
            </h2>
            <p>
              In accordance with Section 6 of the DPDP Act, we only collect digital personal data that is directly 
              necessary for placement matching, academic verification, and recruitment logistics:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category A */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>A. Candidate / Student Resume Data</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-zinc-200">Identity Details:</strong> Full Name, Student Photo / Avatar (if provided).</li>
                  <li><strong className="text-zinc-200">Contact Details:</strong> Official SRMIST Email address, personal phone number, geographic location.</li>
                  <li><strong className="text-zinc-200">Academic Records:</strong> SRM Register Number (e.g. RA231100301xxxx), Department / Branch, Degree (B.Tech, M.Tech, MCA), CGPA, Passing Batch Year, Active Backlogs count.</li>
                  <li><strong className="text-zinc-200">Professional Qualifications:</strong> Hard & soft skills, internship work history, college and personal projects, certifications, and GitHub / LinkedIn profile links.</li>
                  <li><strong className="text-zinc-200">Uploaded Resume Files:</strong> PDF, DOCX, and text copies uploaded into the ATS parsing engine.</li>
                </ul>
              </div>

              {/* Category B */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>B. Recruiter & Officer Account Data</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-zinc-200">Google SSO Identity:</strong> Google ID token, verified corporate/institutional email (@srmist.edu.in), profile photo.</li>
                  <li><strong className="text-zinc-200">Role & Privileges:</strong> Assigned role (Placement Officer, Faculty Coordinator, Corporate Recruiter, Super Admin).</li>
                  <li><strong className="text-zinc-200">Audit & Session Telemetry:</strong> Login timestamps, shortlisting operations, customized weighting preferences, and exported CSV roster history for security compliance.</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 text-xs text-red-300 flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <strong>Data Minimization Standard:</strong> The platform explicitly does <em>not</em> collect, parse, or evaluate sensitive biometric records, religious beliefs, caste/caste certificates, financial bank data, or political affiliations.
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="lawful-basis" className="space-y-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <FileCheck className="w-4 h-4 text-zinc-400" />
              <span>Section 3</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              3. Lawful Basis for Processing & Notice (Sections 5 & 6)
            </h2>
            <p>
              Under the DPDP Act, personal data is processed exclusively under the following lawful mechanisms:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
                <div className="text-xs font-bold text-white">1. Informed & Affirmative Consent (Section 6)</div>
                <p className="text-xs text-zinc-400">
                  By uploading resumes or applying for placement drives via SRMIST portal credentials, students provide affirmative consent for parsing, semantic scoring, and transmission of profiles to prospective employers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
                <div className="text-xs font-bold text-white">2. Legitimate Uses & Institutional Function (Section 7)</div>
                <p className="text-xs text-zinc-400">
                  Processing academic validation records (CGPA cutoffs, active backlogs, departmental eligibility) is required for institutional administration and verification of genuine credentials to corporate recruiters.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="purpose" className="space-y-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <Cpu className="w-4 h-4 text-zinc-400" />
              <span>Section 4</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              4. Purpose Limitation & Explainable AI Usage
            </h2>
            <p>
              Personal data will <strong>never</strong> be traded, sold, or used for commercial advertising. 
              Processing is confined solely to:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verification of job drive eligibility criteria (CGPA, Branch).</span>
              </li>
              <li className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ATS semantic keyword and project relevance matching.</span>
              </li>
              <li className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interview scheduling and automated call-letter generation.</span>
              </li>
              <li className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-850">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Generating transparent placement audit & accreditation reports.</span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2 mt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Ethical AI & Non-Discrimination Policy
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our screening engine utilizes an explainable scoring matrix (Skills, Experience, CGPA, Projects). 
                The AI does not factor in demographic traits, age, postal addresses, or gender. Furthermore, the system provides 
                detailed breakdowns of why a candidate was recommended or flagged, enabling human officers to verify parity.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="data-fiduciary" className="space-y-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <Building2 className="w-4 h-4 text-zinc-400" />
              <span>Section 5</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              5. Data Fiduciary & Third-Party Processors
            </h2>
            <p>
              Data is shared strictly on a need-to-know basis under binding confidentiality and data protection agreements:
            </p>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
                <span className="font-bold text-white min-w-[130px]">Approved Recruiters:</span>
                <span>Only candidate profiles shortlisted or eligible for the specific company drive are accessible to authorized corporate recruiters.</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
                <span className="font-bold text-white min-w-[130px]">Cloud Providers:</span>
                <span>Encrypted infrastructure located within Indian territory (or approved compliant regions) ensuring sovereignty and strict access controls.</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-850 flex items-start gap-3">
                <span className="font-bold text-white min-w-[130px]">Cross-Border Transfer:</span>
                <span>Personal data is not transferred outside India unless explicitly sanctioned under Central Government DPDP notifications.</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="security" className="space-y-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <Lock className="w-4 h-4 text-zinc-400" />
              <span>Section 6</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              6. Storage & Security Safeguards (Section 8)
            </h2>
            <p>
              In full compliance with Section 8 of the DPDP Act, the platform enforces state-of-the-art security measures to prevent personal data breaches:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
                <div className="font-bold text-white">Encryption at Rest & Transit</div>
                <p className="text-zinc-400 text-[11px]">All API exchanges use TLS 1.3 encryption; resume storage vaults use AES-256 encryption.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
                <div className="font-bold text-white">Role-Based Access Control</div>
                <p className="text-zinc-400 text-[11px]">Strict RBAC isolating Placement Officers, Faculty, and Recruiters with institutional token verification.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1.5">
                <div className="font-bold text-white">Breach Notification Duty</div>
                <p className="text-zinc-400 text-[11px]">Mandatory timely notification to the Data Protection Board of India and affected Principals in event of incident.</p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="retention" className="space-y-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Section 7</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              7. Data Retention & Erasure Schedule
            </h2>
            <p>
              Under the principle of storage limitation (Section 8(7)), personal data is retained only as long as necessary:
            </p>
            <ul className="space-y-2 text-xs text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-200">Active Placement Cycle:</strong> Data is actively processed during the candidate's graduating academic year (e.g. 2026–2027 season).
              </li>
              <li>
                <strong className="text-zinc-200">Post-Placement Archival:</strong> Unselected resumes and parsing cache are expunged or anonymized within <strong>180 days</strong> of drive completion.
              </li>
              <li>
                <strong className="text-zinc-200">Statutory Institutional Records:</strong> Placement statistics and offer records are maintained in anonymized/aggregated form for NAAC/NIRF accreditation.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="rights" className="space-y-4 bg-zinc-950 border border-zinc-850 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase">
              <UserCheck className="w-4 h-4 text-zinc-400" />
              <span>Section 8</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              8. Rights of Data Principals (Sections 11–14)
            </h2>
            <p>
              As a student, applicant, or user, you hold statutory rights under Chapter III of the DPDP Act:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <strong className="text-white">Right to Access Summary (Sec. 11):</strong>
                <p className="text-zinc-400 text-[11px]">Request a summary of all personal data held and the identities of recruiters with whom it was shared.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <strong className="text-white">Right to Correction & Updating (Sec. 12):</strong>
                <p className="text-zinc-400 text-[11px]">Correct outdated skills, project details, updated CGPA scores, or newly cleared backlogs.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <strong className="text-white">Right to Erasure & Deletion (Sec. 12):</strong>
                <p className="text-zinc-400 text-[11px]">Request complete removal of uploaded resume files upon opting out of placement drives.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <strong className="text-white">Right of Grievance Redressal (Sec. 13):</strong>
                <p className="text-zinc-400 text-[11px]">Access to an institutional Grievance Officer before escalating to the Data Protection Board.</p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section id="grievance" className="space-y-4 bg-zinc-950 border border-emerald-900/40 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
              <Mail className="w-4 h-4" />
              <span>Section 9</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              9. Institutional Grievance Redressal Officer (GRO)
            </h2>
            <p>
              In accordance with Section 13(2) of the DPDP Act, SRMIST has appointed a dedicated 
              Data Protection & Grievance Redressal Officer. For inquiries, data erasure requests, or grievances:
            </p>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
              <div className="text-white font-bold text-sm">Directorate of Career Centre & Data Compliance</div>
              <div className="text-zinc-400">SRM Institute of Science and Technology, Kattankulathur, Chengalpattu Dist., Tamil Nadu 603203</div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2 font-mono text-[11px]">
                <div>Email: <a href="mailto:privacy.placements@srmist.edu.in" className="text-emerald-400 underline">privacy.placements@srmist.edu.in</a></div>
                <div>Office: <span className="text-zinc-300">Room 304, Placement & Career Centre</span></div>
                <div>Response SLA: <span className="text-zinc-300">Within 7 business days</span></div>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              If a grievance is not resolved to your satisfaction within statutory timelines, Data Principals 
              reserve the right to file a complaint before the <strong>Data Protection Board of India (DPBI)</strong>.
            </p>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-850 px-6 py-8 bg-black text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-zinc-300">SRM ResumeAI Privacy Office</span>
            <span>• Directorate of Career Centre</span>
          </div>
          <div>Compliant with the Digital Personal Data Protection Act • Version 2026.1</div>
        </div>
      </footer>
    </div>
  );
};
