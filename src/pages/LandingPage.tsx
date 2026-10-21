import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowRight, 
  Briefcase, 
  FileText, 
  Users, 
  ChevronDown,
  Sparkles,
  Layers,
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_JOBS } from '../data/srmDataset';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const sampleDrives = INITIAL_JOBS.slice(0, 3);

  const faqs = [
    {
      question: 'How does the Explainable AI Screening work?',
      answer: 'Our engine computes transparent weighted scores across core technical skills, internship experience, and academic standing without black-box approximations.'
    },
    {
      question: 'Can recruiters adjust scoring weights?',
      answer: 'Yes. Placement officers and faculty coordinators can customize formula weights (Skills, Experience, CGPA, Projects) to align with specific drive criteria.'
    },
    {
      question: 'How is candidate demographic fairness ensured?',
      answer: 'The evaluation evaluates only verifiable academic data, practical projects, and technical skills while disregarding non-job demographic attributes.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-white selection:text-black flex flex-col justify-between">
      
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-850 px-6 lg:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">
                SRM <span className="font-normal text-zinc-400">ResumeAI</span>
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-400">
                Placement Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#drives" className="hover:text-white transition-colors">Active Drives</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
            <Link to="/privacy" className="hover:text-white transition-colors text-emerald-400">Privacy (DPDP)</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors"
                >
                  <span>Launch Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Directorate of Career Centre • SRMIST</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-display leading-tight">
          AI Resume Screening &amp; Placement Intelligence
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Screen candidate resumes with precision, calculate transparent ATS scores, and streamline campus recruitment drives across engineering branches.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>Open Placement Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/upload"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Upload &amp; Screen Resume</span>
          </Link>
        </div>

        {/* Minimal Metrics Bar */}
        <div className="grid grid-cols-3 gap-4 pt-12 border-t border-zinc-850 max-w-lg mx-auto text-center">
          <div>
            <div className="text-xl font-bold font-mono text-white">100%</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Explainable ATS</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">0%</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Demographic Bias</div>
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">Multi-Tier</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Candidate Match</div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="features" className="px-6 py-16 border-t border-zinc-850 bg-black">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              Core Capabilities
            </h2>
            <p className="text-xs text-zinc-400">
              Structured tools built for SRM recruitment coordinators and campus talent acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Instant Resume Parser</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Extract technical skills, education, GPA, and work experience from PDF and DOCX documents in seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Multi-Factor Matching</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Score applicants using customizable formulas weighing technical skills, work experience, and academic standing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white">Interview Tracking</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Schedule panel interview rounds, notify shortlisted candidates via email, and log final placement offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Drives */}
      <section id="drives" className="px-6 py-16 border-t border-zinc-850 bg-black">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                Active Placement Drives
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Recruitment drives active for the 2026–2027 placement season.
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Drives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleDrives.map((drive) => (
              <div key={drive.id} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-850 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-white">
                      {drive.company.charAt(0)}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                      ≥ {drive.academic_eligibility.min_cgpa} CGPA
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{drive.company}</h3>
                    <p className="text-xs text-zinc-400">{drive.title}</p>
                  </div>
                  <div className="text-xs font-mono text-zinc-300">{drive.ctc_lpa}</div>
                </div>

                <button
                  onClick={() => navigate('/screening', { state: { selectedJobId: drive.id } })}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white transition-colors"
                >
                  Screen Candidates
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="px-6 py-16 border-t border-zinc-850 bg-black">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-400">
              Clear answers on scoring methodologies and placement system operations.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl bg-zinc-950 border border-zinc-850 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white hover:text-zinc-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-850 px-6 py-8 bg-black text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold text-zinc-300">SRM ResumeAI</span>
            <span>• Directorate of Career Centre, SRMIST</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link to="/privacy" className="hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700">
              Privacy Policy (DPDP Act)
            </Link>
            <span>•</span>
            <span>Season 2026–2027 • Institutional Placement Platform</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
