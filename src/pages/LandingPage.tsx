import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Briefcase, 
  FileText, 
  Users, 
  TrendingUp, 
  Lock, 
  CheckCircle2, 
  Zap, 
  Sliders, 
  Cpu,
  Building2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Award,
  Layers,
  Search,
  HelpCircle,
  BarChart3,
  Calendar,
  LogIn,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const sampleDrives = [
    {
      company: 'Google',
      logoText: 'G',
      logoBg: 'from-blue-500 to-red-500',
      role: 'Software Development Engineer',
      package: '28.5 - 34.0 LPA',
      location: 'Bangalore / Hyderabad',
      type: 'Super Dream',
      dept: 'CSE, IT, AI & DS',
      minCgpa: '8.5'
    },
    {
      company: 'Microsoft',
      logoText: 'M',
      logoBg: 'from-amber-500 to-blue-500',
      role: 'Cloud & AI Engineer',
      package: '22.0 - 26.0 LPA',
      location: 'Hyderabad',
      type: 'Super Dream',
      dept: 'All Computing Branches',
      minCgpa: '8.0'
    },
    {
      company: 'Amazon',
      logoText: 'A',
      logoBg: 'from-amber-500 to-orange-600',
      role: 'AWS Solutions Architect Intern',
      package: '18.0 - 22.5 LPA',
      location: 'Chennai / Bangalore',
      type: 'Dream',
      dept: 'CSE, IT, ECE',
      minCgpa: '7.5'
    },
    {
      company: 'Cisco Systems',
      logoText: 'C',
      logoBg: 'from-cyan-500 to-blue-600',
      role: 'Network & Security Engineer',
      package: '15.0 - 17.5 LPA',
      location: 'Chennai',
      type: 'Dream',
      dept: 'CSE, IT, ECE',
      minCgpa: '7.0'
    }
  ];

  const faqs = [
    {
      question: 'Who can log in to the SRM ResumeAI platform?',
      answer: 'Anyone with a Google account or official SRMIST institutional account (@srmist.edu.in) can sign in. The platform automatically supports placement officers, faculty coordinators, corporate recruiters, and students.'
    },
    {
      question: 'How does the Explainable AI Screening work?',
      answer: 'Unlike generic keyword-matching ATS tools, our engine evaluates candidate profiles across 4 weighted dimensions: Academic Eligibility (CGPA, active backlogs, batch year), Core Technical Skills & Frameworks, Practical Experience / Internships, and Project Complexity with transparent mathematical breakdowns.'
    },
    {
      question: 'Can recruiters and faculty customize scoring weights?',
      answer: 'Yes! Authorized placement officers and department coordinators can adjust scoring weight distributions (e.g. allocating 40% to skills, 25% to experience, 20% to academics, and 15% to projects) in the Settings panel based on each company\'s unique hiring criteria.'
    },
    {
      question: 'How does the system ensure zero bias in candidate selection?',
      answer: 'The platform enforces objective, institutional criteria and transparent match tier categorizations (Tier 1 Strong Match, Needs Review, Low Match). Candidate demographic data is protected, ensuring decisions are purely merit and skill-driven in alignment with SRMIST placement governance.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-srm-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-srm-600/15 via-blue-500/5 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-2/3 -right-48 w-[600px] h-[600px] bg-srm-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Sticky Institutional Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-srm-700 via-srm-500 to-amber-500 p-0.5 shadow-glow-srm flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-srm-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-display">
                  SRM <span className="text-srm-400">ResumeAI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-srm-950 border border-srm-500/30 text-srm-300">
                  Institutional Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Directorate of Career Centre • SRMIST Kattankulathur
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#features" className="hover:text-white transition-colors">AI Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">How It Works</a>
            <a href="#drives" className="hover:text-white transition-colors">Placement Drives</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{currentUser?.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono truncate max-w-[160px]">{currentUser?.email}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-srm-600 hover:bg-srm-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Explore Portal
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-srm-600 to-srm-500 hover:from-srm-500 hover:to-srm-400 text-white text-xs font-semibold shadow-lg shadow-srm-600/20 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sign In (@srmist.edu.in)</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Page Body */}
      <main className="relative z-10 flex-1">
        
        {/* =========================================
            HERO SECTION
           ========================================= */}
        <section id="overview" className="px-4 sm:px-8 lg:px-12 pt-16 pb-20 max-w-7xl mx-auto text-center space-y-8">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-srm-500/10 border border-srm-500/30 text-srm-300 shadow-sm animate-in fade-in slide-in-from-top-3 duration-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Directorate of Career Centre • SRMIST Kattankulathur</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1"></span>
            <span className="text-amber-400 font-mono">@srmist.edu.in Locked</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display max-w-5xl mx-auto leading-[1.12]">
            Next-Gen AI Resume Screening &amp; <br />
            <span className="bg-gradient-to-r from-srm-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Campus Placement Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Empowering placement officers, departmental faculty coordinators, and corporate recruiters with explainable AI candidate ranking, transparent scoring formulas, and zero-bias matching.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-srm-600 via-srm-500 to-amber-500 hover:from-srm-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-srm-600/25 transition-all flex items-center justify-center gap-3 group"
            >
              <span>{isAuthenticated ? 'Open Placement Portal' : 'Sign in with SRMIST Google SSO'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>View Active Placement Season</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Hero Live AI Score Card Preview */}
          <div className="pt-10 max-w-3xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-srm-500 via-amber-400 to-emerald-400"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-srm-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    AK
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Arun Kumar</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-srm-950 border border-srm-500/30 text-srm-300">RA2111003010123</span>
                    </h2>
                    <p className="text-xs text-slate-400">B.Tech Computer Science • CGPA: 9.24 • 0 Backlogs</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-emerald-400 font-display">94.8%</span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">AI Match Score</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Tier 1 Strong Match
                  </span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Academic Criteria</span>
                  <p className="text-sm font-bold text-emerald-400">100% Match</p>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Tech Skills (React/AI)</span>
                  <p className="text-sm font-bold text-srm-400">92% Match</p>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Internship Exp</span>
                  <p className="text-sm font-bold text-amber-400">90% Match</p>
                </div>
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Projects Scope</span>
                  <p className="text-sm font-bold text-indigo-400">95% Match</p>
                </div>
              </div>

            </div>
          </div>

          {/* Institutional Trust & Stats Row */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm text-center">
              <p className="text-2xl lg:text-3xl font-bold text-white font-display">4,800+</p>
              <p className="text-xs text-slate-400 mt-1">Active SRM Students</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm text-center">
              <p className="text-2xl lg:text-3xl font-bold text-amber-400 font-display">98.4%</p>
              <p className="text-xs text-slate-400 mt-1">AI Match Accuracy</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm text-center">
              <p className="text-2xl lg:text-3xl font-bold text-srm-400 font-display">150+</p>
              <p className="text-xs text-slate-400 mt-1">Corporate Recruiters</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm text-center">
              <p className="text-2xl lg:text-3xl font-bold text-emerald-400 font-display">NAAC A++</p>
              <p className="text-xs text-slate-400 mt-1">Institutional Standard</p>
            </div>
          </div>

        </section>

        {/* =========================================
            HOW IT WORKS WORKFLOW SECTION
           ========================================= */}
        <section id="workflow" className="px-4 sm:px-8 lg:px-12 py-20 max-w-7xl mx-auto border-t border-slate-800/80">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-srm-400">
              Institutional Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-white font-display">
              How SRM ResumeAI Accelerates Campus Hiring
            </p>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              From drive announcement to final candidate selection in four streamlined steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative group hover:border-srm-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-srm-500/10 text-srm-400 font-bold flex items-center justify-center mb-4 text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Post Job Drive</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Placement Cell posts company requirements with CTC package, eligibility criteria, department whitelist, and required technical skills.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative group hover:border-amber-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center mb-4 text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">Batch Resume Upload</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coordinators or students upload PDF/DOCX resumes. The parser automatically extracts education, CGPA, projects, and tech stacks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative group hover:border-emerald-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center mb-4 text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Explainable AI Match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The engine calculates weighted scores across skills, experience, and academics, assigning candidates to clear match tiers.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative group hover:border-indigo-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center mb-4 text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-white mb-2">Shortlist &amp; Interview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click candidate shortlisting, bulk CSV exports, and integrated technical round interview scheduling for campus recruiters.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================
            FEATURE HIGHLIGHTS GRID
           ========================================= */}
        <section id="features" className="px-4 sm:px-8 lg:px-12 py-20 max-w-7xl mx-auto border-t border-slate-800/80">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-srm-400">
              Core Innovations
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-white font-display">
              Built for Institutional Placement Excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3 hover:border-srm-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-srm-500/10 text-srm-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Explainable AI Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No black-box algorithms. Every score provides a detailed breakdown of academic match, skill alignment, project relevance, and internship duration.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3 hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">SRMIST Google SSO Lockdown</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict single sign-on restricted strictly to official <span className="text-amber-400 font-mono">@srmist.edu.in</span> accounts, preventing unauthorized external access.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Role Governance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tailored views and action permissions for Placement Officers, Faculty Coordinators, Corporate Recruiters, Super Admins, and Students.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3 hover:border-indigo-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Customizable Weight Tuner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamically adjust scoring weights between skills, internships, and academics per drive to suit different company requirements.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3 hover:border-sky-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Interview Tracking Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Schedule technical interviews, allocate panel venues, and update status from Technical Round 1 to Final Offer Letter.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-3 hover:border-pink-500/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Placement Season Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive departmental statistics, skill distribution charts, and CTC package analytics across graduating batches.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================
            LIVE PLACEMENT DRIVES PREVIEW
           ========================================= */}
        <section id="drives" className="px-4 sm:px-8 lg:px-12 py-20 max-w-7xl mx-auto border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-srm-400">
                Placement Season 2026-2027
              </h2>
              <p className="text-3xl font-bold text-white font-display mt-1">
                Active Campus Recruitment Drives
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-srm-400 hover:text-srm-300 transition-colors"
            >
              <span>View All 12 Active Drives</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleDrives.map((drive, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${drive.logoBg} text-white font-extrabold flex items-center justify-center text-base shadow-sm`}>
                        {drive.logoText}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{drive.company}</h3>
                        <p className="text-xs text-slate-400">{drive.role}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {drive.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[10px]">CTC Package</span>
                      <p className="font-bold text-emerald-400 text-xs">{drive.package}</p>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[10px]">Eligibility</span>
                      <p className="font-semibold text-slate-200 text-xs truncate">Min CGPA {drive.minCgpa}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-400">{drive.dept}</span>
                  <Link
                    to="/dashboard"
                    className="text-srm-400 hover:text-srm-300 font-semibold flex items-center gap-1"
                  >
                    <span>Screen Applicants</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================
            FREQUENTLY ASKED QUESTIONS
           ========================================= */}
        <section id="faqs" className="px-4 sm:px-8 lg:px-12 py-20 max-w-4xl mx-auto border-t border-slate-800/80">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-srm-400">
              Institutional FAQ
            </h2>
            <p className="text-3xl font-bold text-white font-display">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-850 transition-colors"
                  >
                    <span className="text-sm font-semibold text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-srm-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================
            FINAL CTA BANNER
           ========================================= */}
        <section className="px-4 sm:px-8 lg:px-12 py-16 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-srm-900/90 via-slate-900 to-amber-950/40 border border-srm-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="inline-flex p-3 rounded-2xl bg-srm-500/10 text-srm-400 mb-2">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
                Ready to Experience Next-Gen Placement Intelligence?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sign in with your official SRMIST institutional account (<span className="text-amber-300 font-mono">@srmist.edu.in</span>) to access candidate screening, batch uploads, and real-time drive dashboards.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-srm-600 to-amber-500 hover:from-srm-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{isAuthenticated ? 'Enter Portal Dashboard' : 'Sign in with @srmist.edu.in'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Institutional Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/95 px-6 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-slate-300 font-semibold">
              SRM Institute of Science and Technology • Directorate of Career Centre
            </p>
            <p className="text-[11px] text-slate-500">
              Kattankulathur, Chengalpattu District, Tamil Nadu 603203 • Placement &amp; Corporate Relations Cell
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-white transition-colors">Portal Login</Link>
            <span>•</span>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
