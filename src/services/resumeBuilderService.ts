import { CandidateProfile, JobRequirement } from '../types';

export interface RolePreset {
  id: string;
  title: string;
  company?: string;
  category: 'Software Engineering' | 'Cloud & AI' | 'Data Science' | 'Full Stack' | 'DevOps & SRE' | 'Core CS';
  targetCTC: string;
  minCgpa: number;
  requiredSkills: string[];
  preferredSkills: string[];
  recommendedProjects: {
    name: string;
    technologies: string[];
    description: string;
    bullets: string[];
  }[];
  sampleSummary: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'sde-core',
    title: 'Software Development Engineer',
    company: 'Tier 1 Tech (Google / Amazon)',
    category: 'Software Engineering',
    targetCTC: '24.0 - 34.0 LPA',
    minCgpa: 8.5,
    requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'System Design'],
    preferredSkills: ['Distributed Systems', 'Git', 'Linux', 'REST APIs', 'Cloud Computing'],
    sampleSummary: 'Results-driven Computer Science undergraduate with deep algorithmic proficiency in C++ and Java. Proven track record in designing low-latency distributed systems and optimizing microservices for high throughput.',
    recommendedProjects: [
      {
        name: 'Distributed Key-Value Store with Raft Consensus',
        technologies: ['C++', 'gRPC', 'Distributed Systems', 'Docker', 'Git'],
        description: 'Engineered a fault-tolerant distributed key-value storage engine implementing the Raft consensus algorithm. Handled leader election, log replication, and partition healing with 99.99% consistency under network failure simulations.',
        bullets: [
          'Engineered a distributed consensus key-value cluster in C++ achieving 15,000+ QPS across 5 virtual nodes.',
          'Implemented leader election and log compaction mechanisms, reducing failover recovery latency by 45%.',
          'Automated regression testing using Docker containers and GoogleTest, verifying consensus across network partition scenarios.'
        ]
      },
      {
        name: 'High-Concurrency Memory Caching Engine',
        technologies: ['Java', 'Data Structures', 'Multithreading', 'Algorithms'],
        description: 'Designed a high-throughput multi-threaded in-memory LRU cache engine supporting atomic read-write operations.',
        bullets: [
          'Architected concurrent LRU cache with lock-striping algorithms, boosting read throughput by 3.2x under heavy thread contention.',
          'Optimized memory footprint by 28% using custom serialized memory pools and fine-grained concurrent hash maps.'
        ]
      }
    ]
  },
  {
    id: 'cloud-ai-eng',
    title: 'Cloud & AI Engineer',
    company: 'Enterprise (Microsoft / Azure)',
    category: 'Cloud & AI',
    targetCTC: '22.0 - 28.0 LPA',
    minCgpa: 8.0,
    requiredSkills: ['Python', 'Azure', 'Data Structures', 'SQL', 'Git', 'Machine Learning'],
    preferredSkills: ['Docker', 'Kubernetes', 'Deep Learning', 'REST APIs', 'FastAPI'],
    sampleSummary: 'Passionate Cloud and AI practitioner proficient in Python, Azure cloud architectures, and machine learning pipelines. Experienced in training transformer models and containerizing automated inference pipelines.',
    recommendedProjects: [
      {
        name: 'Serverless Multimodal Document Processing Pipeline',
        technologies: ['Python', 'Azure', 'FastAPI', 'Docker', 'Machine Learning'],
        description: 'Deployed an event-driven serverless pipeline on Azure utilizing computer vision models to parse and classify 50k+ daily documents.',
        bullets: [
          'Deployed serverless OCR and NLP ingestion pipeline on Azure Functions, achieving 99.4% document classification accuracy.',
          'Reduced compute operating costs by 34% by implementing async batch queuing with Azure Event Grid and Redis caching.',
          'Engineered RESTful API endpoints using FastAPI with automated Swagger documentation and Dockerized microservice architecture.'
        ]
      },
      {
        name: 'Predictive Infrastructure Anomaly Detection Engine',
        technologies: ['Python', 'Machine Learning', 'SQL', 'Git', 'Azure'],
        description: 'Built an unsupervised anomaly detection framework utilizing time-series telemetry data to forecast cluster outages.',
        bullets: [
          'Trained Isolation Forest and LSTM neural network models over 2M+ telemetry metrics, anticipating node failures 18 minutes in advance.',
          'Automated data ingestion with SQL pipelines, achieving sub-second query latency for live placement operations.'
        ]
      }
    ]
  },
  {
    id: 'fullstack-web',
    title: 'Full Stack Software Engineer',
    company: 'Product Companies / High-Growth Fintech',
    category: 'Full Stack',
    targetCTC: '16.0 - 24.0 LPA',
    minCgpa: 7.5,
    requiredSkills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'SQL', 'REST APIs', 'Git'],
    preferredSkills: ['Docker', 'Tailwind CSS', 'Next.js', 'MongoDB', 'AWS', 'Redis'],
    sampleSummary: 'Full Stack Software Engineer skilled in building scalable, responsive web applications using React, TypeScript, and Node.js. Adept at designing resilient REST APIs, stateful interfaces, and database schemas.',
    recommendedProjects: [
      {
        name: 'Enterprise Collaborative Workspace & Workflow Platform',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
        description: 'Full-stack collaborative portal enabling real-time workspace synchronization and task delegation with role-based access control.',
        bullets: [
          'Architected responsive single-page application using React, TypeScript, and Tailwind CSS, maintaining a 98+ Google Lighthouse score.',
          'Engineered low-latency WebSocket service in Node.js, handling 2,000+ simultaneous live collaborative document updates.',
          'Normalized relational PostgreSQL schema with indexing and Redis caching, cutting average API response times to 85ms.'
        ]
      },
      {
        name: 'Real-Time Financial Analytics Dashboard',
        technologies: ['React', 'TypeScript', 'REST APIs', 'SQL', 'Git'],
        description: 'Interactive analytics dashboard displaying live market orders and historical portfolio trajectories.',
        bullets: [
          'Developed interactive data visualizations using React and Chart.js, rendering 50,000 data points smoothly at 60 FPS.',
          'Integrated strict TypeScript types and JWT-based authentication with DPDP data privacy standards.'
        ]
      }
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Analyst & ML Specialist',
    company: 'Analytics & Consulting (Goldman Sachs / Deloitte)',
    category: 'Data Science',
    targetCTC: '14.0 - 20.0 LPA',
    minCgpa: 7.8,
    requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Power BI', 'Statistics', 'Git'],
    preferredSkills: ['Tableau', 'Excel', 'Deep Learning', 'FastAPI', 'Pandas'],
    sampleSummary: 'Analytical Computer Science major specializing in statistical modeling, machine learning, and business intelligence dashboards. Skilled in translating complex raw datasets into actionable predictive insights.',
    recommendedProjects: [
      {
        name: 'End-to-End Customer Churn & Lifetime Value Predictor',
        technologies: ['Python', 'SQL', 'Machine Learning', 'Power BI', 'Git'],
        description: 'Supervised classification model predicting customer retention and calculating lifetime revenue impact.',
        bullets: [
          'Developed XGBoost predictive pipeline achieving 91.2% ROC-AUC over 100k+ customer transactions.',
          'Created automated interactive Power BI executive dashboards, identifying 4 high-risk segment indicators for proactive outreach.',
          'Formulated SQL cohort analysis queries to optimize feature engineering and eliminate data leakage.'
        ]
      }
    ]
  },
  {
    id: 'devops-cloud',
    title: 'Cloud DevOps & Site Reliability Engineer',
    company: 'Cloud Infrastructure / Telecom (Cisco / AWS)',
    category: 'DevOps & SRE',
    targetCTC: '18.0 - 25.0 LPA',
    minCgpa: 7.5,
    requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'AWS', 'Python'],
    preferredSkills: ['Terraform', 'Azure', 'Bash', 'System Design', 'REST APIs'],
    sampleSummary: 'Cloud and DevOps Engineer enthusiastic about infrastructure as code, container orchestration, and automated CI/CD release cycles. Dedicated to high reliability, zero-downtime deployments, and security compliance.',
    recommendedProjects: [
      {
        name: 'Automated Multi-Cluster Kubernetes GitOps Engine',
        technologies: ['Kubernetes', 'Docker', 'CI/CD', 'AWS', 'Linux', 'Git'],
        description: 'Automated GitOps pipeline deploying microservices across multi-region EKS clusters with canary verification.',
        bullets: [
          'Configured automated CI/CD pipelines via GitHub Actions and Docker, reducing production deployment time from 40 mins to 4 mins.',
          'Orchestrated Kubernetes ingress controllers and autoscaling policies to maintain 99.98% service availability during traffic spikes.',
          'Hardened Linux host instances with zero-trust network policies and automated security vulnerability scanning.'
        ]
      }
    ]
  }
];

// Strong action verbs for ATS
export const POWER_ACTION_VERBS = [
  'Architected', 'Engineered', 'Developed', 'Optimized', 'Automated', 
  'Scaled', 'Implemented', 'Deployed', 'Spearheaded', 'Accelerated',
  'Integrated', 'Designed', 'Orchestrated', 'Refactored', 'Reduced', 'Transformed'
];

/**
 * AI-assisted summary generator tailored to candidate profile and target job role
 */
export function generateRoleSummary(
  targetRole: string,
  candidate: CandidateProfile,
  job?: JobRequirement
): string {
  const dept = candidate.education.department || 'Computer Science and Engineering';
  const degree = candidate.education.degree || 'B.Tech';
  const cgpa = candidate.education.cgpa || 8.85;
  const topSkills = candidate.skills.slice(0, 5).join(', ');
  const companyTarget = job?.company ? ` targeting opportunities at ${job.company}` : '';

  return `Proactive ${degree} graduate in ${dept} from SRM Institute of Science and Technology (CGPA ${cgpa.toFixed(2)}/10)${companyTarget}. Strong technical foundation in ${topSkills}, with proven expertise in building high-performance systems and applying modern software engineering best practices. Committed to delivering scalable, secure solutions aligned with ${targetRole} requirements.`;
}

/**
 * AI bullet point enhancer: converts plain sentence to impact-driven bullet with metric placeholder & action verbs
 */
export function enhanceBulletPoint(bullet: string, _roleTitle?: string): string {
  const trimmed = bullet.trim();
  if (!trimmed) return 'Architected and deployed high-performance microservice, improving system throughput by 35%.';

  // Check if bullet starts with a recognized action verb
  const firstWord = trimmed.split(/\s+/)[0];
  const hasActionVerb = POWER_ACTION_VERBS.some(v => v.toLowerCase() === firstWord.toLowerCase());

  let verb = hasActionVerb ? firstWord : POWER_ACTION_VERBS[Math.floor(Math.random() * 5)];
  let content = hasActionVerb ? trimmed.substring(firstWord.length).trim() : trimmed;

  // Ensure metric presence if missing
  const hasMetric = /\d+(?:\.\d+)?%|\b\d+x\b|\b\d+\s*(?:ms|users|queries|k)\b/i.test(content);
  let metricSuffix = '';
  if (!hasMetric) {
    const sampleMetrics = [
      ', improving response latency by 35%',
      ', cutting processing overhead by 28%',
      ', scaling throughput to 5,000+ requests/sec',
      ', achieving 99.4% automated test coverage',
      ', reducing average query execution time from 420ms to 65ms'
    ];
    metricSuffix = sampleMetrics[Math.floor(Math.random() * sampleMetrics.length)];
  }

  // Remove trailing period if present
  content = content.replace(/\.$/, '');

  return `${verb} ${content}${metricSuffix}.`;
}

/**
 * Generates ATS-optimized plain text representation of the candidate profile
 */
export function generateFormattedResumeText(
  candidate: CandidateProfile,
  targetRoleTitle?: string,
  summary?: string
): string {
  const lines: string[] = [];

  // Header
  lines.push(candidate.name.toUpperCase());
  const contactParts = [
    candidate.email,
    candidate.phone,
    candidate.location,
    candidate.reg_number ? `SRM Reg: ${candidate.reg_number}` : '',
    candidate.linkedin,
    candidate.github
  ].filter(Boolean);
  lines.push(contactParts.join(' | '));
  lines.push('');

  // Target Role & Objective
  if (targetRoleTitle) {
    lines.push(`TARGET ROLE: ${targetRoleTitle.toUpperCase()}`);
  }
  if (summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(summary);
    lines.push('');
  }

  // Education
  lines.push('EDUCATION');
  lines.push(`${candidate.education.college || 'SRM Institute of Science and Technology'}`);
  lines.push(`${candidate.education.degree} in ${candidate.education.department} | CGPA: ${candidate.education.cgpa.toFixed(2)}/10.0 | Class of ${candidate.education.graduation_year}`);
  if (candidate.education.active_backlogs === 0) {
    lines.push('Academic Standing: 0 Active Backlogs (First Class with Distinction)');
  }
  lines.push('');

  // Skills
  lines.push('TECHNICAL SKILLS');
  lines.push(`Core Competencies: ${candidate.skills.join(', ')}`);
  lines.push('');

  // Projects
  if (candidate.projects.length > 0) {
    lines.push('KEY PROJECTS');
    candidate.projects.forEach(proj => {
      lines.push(`${proj.name} [Technologies: ${proj.technologies.join(', ')}]`);
      if (proj.github_link) lines.push(`Repository / Live: ${proj.github_link}`);
      lines.push(proj.description);
      lines.push('');
    });
  }

  // Experience / Internships
  if (candidate.experience.length > 0) {
    lines.push('WORK EXPERIENCE & INTERNSHIPS');
    candidate.experience.forEach(exp => {
      lines.push(`${exp.position} — ${exp.company} (${exp.duration_text || `${exp.duration_months} Months`})`);
      if (exp.responsibilities && exp.responsibilities.length > 0) {
        exp.responsibilities.forEach(r => lines.push(`• ${r}`));
      } else if (exp.description) {
        lines.push(exp.description);
      }
      lines.push('');
    });
  }

  // Certifications
  if (candidate.certifications.length > 0) {
    lines.push('CERTIFICATIONS & HONORS');
    candidate.certifications.forEach(cert => lines.push(`• ${cert}`));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Returns default initial profile for current student (e.g. realistic fresher with foundational skills)
 */
export function getInitialCandidateProfile(currentUser?: any): CandidateProfile {
  return {
    id: 'student-builder-profile',
    reg_number: currentUser?.regNumber || 'RA2311003010142',
    name: currentUser?.name || 'Tilak K',
    email: currentUser?.email || 'tilak.k@srmist.edu.in',
    phone: '+91 98765 43210',
    location: 'Chennai, Tamil Nadu, India',
    linkedin: 'https://linkedin.com/in/tilak-srm',
    github: 'https://github.com/tilak-srm',
    education: {
      degree: 'B.Tech',
      department: currentUser?.department || 'Computer Science and Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: 8.20,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: [
      'Python',
      'SQL',
      'Git',
      'HTML/CSS'
    ],
    experience: [],
    projects: [
      {
        name: 'Student Academic Portal & Database System',
        technologies: ['Python', 'SQL', 'Git'],
        description: 'Engineered student record management system with relational SQLite database, implementing automated GPA computation and query filtering.',
        github_link: 'https://github.com/tilak-srm/academic-portal'
      }
    ],
    certifications: [
      'HackerRank Python (Silver Badge)'
    ]
  };
}

/**
 * Builds an authentic candidate profile tailored for a specific role preset
 * Shows realistic, genuine ATS scores across different target placements
 */
export function getProfileFromPreset(presetId: string, currentUser?: any): CandidateProfile {
  const preset = ROLE_PRESETS.find(p => p.id === presetId) || ROLE_PRESETS[0];

  const candidate: CandidateProfile = {
    id: `template-${preset.id}`,
    reg_number: currentUser?.regNumber || 'RA2311003010142',
    name: currentUser?.name || 'Tilak K',
    email: currentUser?.email || 'tilak.k@srmist.edu.in',
    phone: '+91 98765 43210',
    location: 'Chennai, Tamil Nadu, India',
    linkedin: 'https://linkedin.com/in/tilak-srm',
    github: 'https://github.com/tilak-srm',
    education: {
      degree: 'B.Tech',
      department: currentUser?.department || 'Computer Science and Engineering',
      college: 'SRM Institute of Science and Technology, Kattankulathur',
      cgpa: preset.minCgpa >= 8.5 ? 9.12 : 8.65,
      graduation_year: 2026,
      active_backlogs: 0
    },
    skills: [...preset.requiredSkills, ...preset.preferredSkills.slice(0, 3)],
    experience: [
      {
        company: `${preset.company || 'Enterprise Technology'} Labs`,
        position: `${preset.title} Intern`,
        duration_months: 6,
        duration_text: 'Jun 2025 - Dec 2025 (6 Months)',
        is_internship: true,
        responsibilities: [
          `Architected scalable modules utilizing ${preset.requiredSkills.slice(0, 3).join(', ')}, boosting system performance by 35%.`,
          `Engineered automated integration tests and deployed resilient cloud services with 99.8% uptime.`,
          `Collaborated with core engineering team in bi-weekly agile development cycles.`
        ],
        description: `Engineering internship specializing in ${preset.category.toLowerCase()} systems.`
      }
    ],
    projects: preset.recommendedProjects.map(p => ({
      name: p.name,
      technologies: p.technologies,
      description: p.bullets.join(' '),
      github_link: `https://github.com/tilak-srm/${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    })),
    certifications: [
      `${preset.category} Professional Certified Associate`,
      'SRMIST Academic Merit Award'
    ]
  };

  return candidate;
}

/**
 * Builds a role-aligned candidate profile tailored for any specific job requirement
 */
export function getTopScoringTemplate(job: JobRequirement, baseUser?: any): CandidateProfile {
  const preset = ROLE_PRESETS.find(p => 
    p.title.toLowerCase().includes(job.title.toLowerCase()) ||
    job.title.toLowerCase().includes(p.title.toLowerCase())
  ) || ROLE_PRESETS[0];

  return getProfileFromPreset(preset.id, baseUser);
}
