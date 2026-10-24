# 🎓 SRM ResumeAI

### AI-Powered Resume Screening, Candidate Ranking and Recruitment Management Platform for Institutional Placement

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-green.svg)](https://vitest.dev/)
[![CI](https://github.com/ktilak12/Ai_resume_filter_srm/actions/workflows/ci.yml/badge.svg)](https://github.com/ktilak12/Ai_resume_filter_srm/actions)

---

## 📌 Project Overview

**SRM ResumeAI** is an AI-assisted institutional placement and recruitment screening management system designed for **SRM Institute of Science and Technology (SRMIST)**.

When hundreds or thousands of students apply for university placement drives (e.g., 1,200+ applicants), recruiters face severe bottlenecks manually opening every resume and validating eligibility. **SRM ResumeAI** automates the initial screening pipeline using a dual-filter architecture:

1. **Strict SRM Academic Eligibility Filter**: Pre-screens candidates on degree, branch, minimum CGPA cutoff, active backlogs limit, and graduation passing batch.
2. **Explainable AI Semantic Scoring Engine**: Weighted multi-dimensional NLP score evaluating Core Technical Skills (40%), Experience & Internships (25%), Academic Standing (20%), Applied Projects (10%), and Verified Certifications (5%).
3. **Candidate Ranking & Shortlisting Operations**: Automatically ranks candidates from #1 to #N with explainable "Why did this candidate receive X%?" rationale, missing skill warnings, and evidence audit trails.
4. **Human-in-the-Loop Safeguard**: AI recommends and scores; final shortlisting and interview invites remain strictly with human placement officers.

---

## 🚀 Key Modules & Architecture

```mermaid
flowchart TD
    A[Job Requirement / Placement Drive] --> B[Dual-Filter Institutional Engine]
    
    subgraph B [Dual-Filter Institutional Engine]
        C[Academic Eligibility Rules] -->|CGPA, Dept, Degree, Backlogs| D{Strict Eligibility Check}
        D -->|Pass| E[NLP & Semantic Screening Engine]
        D -->|Fail| F[Flagged Ineligible with Reasons]
        
        E --> G[Multi-Factor Weighted Scoring]
        G --> H[Explainable AI Rationale Engine]
    end
    
    H --> I[Ranked Candidate Roster #1..#N]
    I --> J[Recruiter Shortlisting & Bulk Actions]
    J --> K[Multi-Round Interview Operations]
    K --> L[Institutional Analytics & Placement Reports]
```

### ✨ Features
- **Placement Command Center Dashboard**: Real-time KPI metrics, dynamic SVG resume processing trends, conversion funnels, and active corporate recruitment drive tables.
- **Job Requirement Creator**: Specify SRM degree/department eligibility, minimum CGPA, active backlog ceilings, and required (⭐) vs preferred skill taxonomies.
- **Drag & Drop & Batch ZIP Ingestion**: Client-side parsing for `.pdf`, `.docx`, `.txt`, and `.zip` archives with Zip-Slip path traversal and Zip-Bomb mitigation.
- **AI Screening Hub & Ranking**: Ranked cards and tabular views with match score rings, department filters, and eligibility tags.
- **Explainable AI Drawer & Bullet Tailoring**: Positive factor breakdown, penalty/gap analysis, Skill Evidence Matrix, and actionable bullet-level tailoring advice.
- **Interview Rubric Scorecards & Virtual Meet Links**: Structured 4-dimension evaluation scorecards (DSA, Architecture, Problem Solving, Communication) with hiring verdict tracking and Google Meet generator embedded in `.ics` calendar invites.
- **Institutional Analytics & Reports**: Department conversion analysis, skill demand vs student competency heatmaps, and printable placement reports.
- **Customizable AI Weights**: Recruiter-configurable formula weights and threshold sliders.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Build Tool**: Vite 6 (Route code-splitting & manual Rollup vendor chunks)
- **Automated Testing**: Vitest test runner
- **Security & Privacy**: Digital Personal Data Protection (DPDP) Act student PII masking, magic-byte anti-spoofing validation, CSP headers

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation & Commands
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run automated unit test suite
npm test

# 4. Create production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
Developed for SRM Institute of Science and Technology Directorate of Career Centre. 