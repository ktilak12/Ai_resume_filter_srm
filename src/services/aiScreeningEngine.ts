import { 
  JobRequirement, 
  CandidateProfile, 
  EligibilityResult, 
  ScoreBreakdown, 
  ExplainableAI, 
  SkillEvidence, 
  MatchTier,
  AISettings,
  ScreeningResult
} from '../types';

// Default AI settings
export const DEFAULT_AI_SETTINGS: AISettings = {
  weights: {
    skills: 0.40,
    experience: 0.25,
    education: 0.20,
    projects: 0.10,
    certifications: 0.05
  },
  thresholds: {
    strong_match: 85,
    needs_review: 65
  }
};

/**
 * Loads configured AI weights and thresholds from local persistence or falls back to defaults
 */
export function getStoredAiSettings(): AISettings {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('srm_ai_settings') : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.weights && parsed.thresholds) return parsed;
    }
  } catch (e) {
    console.error('Failed to read srm_ai_settings:', e);
  }
  return DEFAULT_AI_SETTINGS;
}

// Comprehensive Technical Skill Synonyms and Knowledge Graph
export const SKILL_SYNONYMS: Record<string, string[]> = {
  'python': ['python3', 'py', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'scipy', 'pytest', 'celery'],
  'machine learning': ['ml', 'scikit-learn', 'sklearn', 'predictive modeling', 'data science', 'random forest', 'xgboost', 'regression', 'clustering', 'neural networks', 'model evaluation', 'supervised learning'],
  'deep learning': ['dl', 'tensorflow', 'pytorch', 'keras', 'cnn', 'rnn', 'lstm', 'transformer', 'transformers', 'bert', 'llm', 'nlp', 'large language models', 'huggingface'],
  'tensorflow': ['tf', 'keras', 'deep learning'],
  'pytorch': ['torch', 'deep learning', 'transformers', 'torchvision'],
  'sql': ['mysql', 'postgresql', 'postgres', 'pl/sql', 'oracle', 'sqlite', 'rdbms', 'sql server', 't-sql', 'relational database', 'mariadb'],
  'power bi': ['powerbi', 'dax', 'power query', 'bi reporting', 'business intelligence', 'dashboards', 'data modeling'],
  'tableau': ['tableau desktop', 'tableau server', 'data visualization', 'dashboards'],
  'excel': ['advanced excel', 'vlookup', 'xlookup', 'pivot tables', 'macros', 'vba', 'spreadsheets'],
  'react': ['reactjs', 'react.js', 'next.js', 'nextjs', 'redux', 'frontend', 'javascript', 'typescript', 'jsx', 'tsx'],
  'node.js': ['nodejs', 'node', 'express', 'express.js', 'nest.js', 'backend', 'koa'],
  'javascript': ['js', 'es6', 'esnext', 'typescript', 'ts', 'vanilla js'],
  'typescript': ['ts', 'typed javascript', 'react typescript'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloudformation', 'rds', 'dynamodb', 'iam', 'cloudwatch', 'ecs', 'eks', 'sqs', 'sns', 'cloud computing'],
  'azure': ['microsoft azure', 'azure devops', 'blob storage', 'azure functions', 'aks', 'cosmos db', 'cloud computing'],
  'gcp': ['google cloud', 'google cloud platform', 'bigquery', 'gke', 'cloud storage', 'cloud run'],
  'docker': ['containerization', 'containers', 'docker compose', 'dockerfile', 'docker daemon'],
  'kubernetes': ['k8s', 'kube', 'kubectl', 'helm', 'container orchestration', 'cloud native'],
  'git': ['github', 'gitlab', 'version control', 'bitbucket', 'git cli', 'git workflow'],
  'java': ['java 8', 'java 11', 'java 17', 'java 21', 'spring', 'spring boot', 'hibernate', 'jvm', 'j2ee', 'maven', 'gradle'],
  'c++': ['cpp', 'c/c++', 'stl', 'standard template library', 'object oriented programming', 'oop'],
  'c#': ['csharp', 'c#.net', '.net', '.net core', 'asp.net'],
  'statistics': ['statistical analysis', 'hypothesis testing', 'probability', 'inferential statistics', 'a/b testing', 'bayesian'],
  'data structures': ['dsa', 'data structures and algorithms', 'algorithms', 'leetcode', 'competitive programming', 'trees', 'graphs', 'dynamic programming'],
  'algorithms': ['algorithm design', 'dsa', 'graph algorithms', 'sorting', 'searching', 'greedy', 'complexity analysis'],
  'system design': ['high level design', 'low level design', 'hld', 'lld', 'distributed systems', 'scalability', 'microservices architecture', 'caching', 'load balancing'],
  'distributed systems': ['microservices', 'kafka', 'rabbitmq', 'event driven', 'distributed computing', 'redis', 'caching'],
  'rest apis': ['restful', 'rest api', 'api design', 'fastapi', 'express', 'api integration', 'postman', 'swagger'],
  'nosql': ['mongodb', 'cassandra', 'dynamodb', 'documentdb', 'couchdb', 'redis'],
  'linux': ['unix', 'bash', 'shell scripting', 'ubuntu', 'debian', 'linux cli', 'operating systems'],
  'ci/cd': ['continuous integration', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'automated pipelines', 'devops']
};

/**
 * Normalizes text for comparison
 */
export function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[-_]/g, ' ');
}

// SRM Institutional Department Synonym Dictionary
export const DEPT_SYNONYMS: Record<string, string[]> = {
  'cse': ['computer science', 'computer science & engineering', 'computer science and engineering', 'cse', 'software engineering', 'computer technology', 'csbs', 'computer science & business systems'],
  'it': ['information technology', 'infotech', 'it', 'information science'],
  'ece': ['electronics & communication', 'electronics and communication', 'electronics & communication engineering', 'ece', 'electronics'],
  'ai & ds': ['artificial intelligence', 'data science', 'ai and ds', 'ai & ds', 'aids', 'ai', 'artificial intelligence & data science', 'machine learning', 'data analytics'],
  'eee': ['electrical & electronics', 'electrical and electronics', 'eee', 'electrical engineering'],
  'mech': ['mechanical', 'mechanical engineering', 'mech', 'mechatronics'],
  'civil': ['civil engineering', 'civil'],
  'data science': ['data science', 'data analytics', 'ai & ds', 'artificial intelligence & data science'],
  'mca': ['master of computer applications', 'mca', 'computer applications']
};

/**
 * Determines if a candidate skill matches a required skill using token exactness, knowledge graph, and contextual proof
 */
export function checkSkillMatch(
  requiredSkill: string, 
  candidateSkills: string[], 
  candidate: CandidateProfile,
  resumeText: string
): { matches: boolean; evidence: string; confidence: number } {
  const normReq = normalize(requiredSkill);
  const synonyms = SKILL_SYNONYMS[normReq] || [];
  const searchTerms = [normReq, ...synonyms];

  // 1. Check if demonstrated in practical work experience or internships
  for (const exp of candidate.experience) {
    const expText = `${exp.company} ${exp.position} ${exp.responsibilities.join(' ')} ${exp.description || ''}`.toLowerCase();
    for (const term of searchTerms) {
      if (expText.includes(term)) {
        return { 
          matches: true, 
          evidence: `Verified in practical experience at ${exp.company} ("${term}")`,
          confidence: 1.0 
        };
      }
    }
  }

  // 2. Check if implemented in project portfolio
  for (const proj of candidate.projects) {
    const projText = `${proj.name} ${proj.technologies.join(' ')} ${proj.description}`.toLowerCase();
    for (const term of searchTerms) {
      if (projText.includes(term)) {
        return { 
          matches: true, 
          evidence: `Built in project "${proj.name}" using ${term}`,
          confidence: 0.95 
        };
      }
    }
  }

  // 3. Direct match in candidate's parsed skills list
  for (const candidateSkill of candidateSkills) {
    const normCand = normalize(candidateSkill);
    if (normCand === normReq || normCand.includes(normReq) || normReq.includes(normCand)) {
      return { 
        matches: true, 
        evidence: `Listed in technical skills: "${candidateSkill}"`,
        confidence: 0.90 
      };
    }
    for (const syn of synonyms) {
      if (normCand === syn || normCand.includes(syn) || syn.includes(normCand)) {
        return { 
          matches: true, 
          evidence: `Related technology verified: "${candidateSkill}" (${requiredSkill})`,
          confidence: 0.85 
        };
      }
    }
  }

  // 4. Semantic lookup across full raw resume text
  const normText = normalize(resumeText);
  for (const term of searchTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasSymbol = /[^a-z0-9\s]/i.test(term);
    const pattern = hasSymbol 
      ? `(?:^|\\s|[.,/()\\-])${escaped}(?:$|\\s|[.,/()\\-])`
      : `\\b${escaped}\\b`;
    const regex = new RegExp(pattern, 'i');
    if (regex.test(normText)) {
      return { 
        matches: true, 
        evidence: `Mentioned in resume profile: "${term}"`,
        confidence: 0.75 
      };
    }
  }

  return { 
    matches: false, 
    evidence: 'Not detected in profile, projects, or work history',
    confidence: 0 
  };
}

/**
 * Step 1: Institutional Academic Eligibility Engine
 */
export function evaluateEligibility(candidate: CandidateProfile, job: JobRequirement): EligibilityResult {
  const { academic_eligibility } = job;
  const { education } = candidate;

  const cgpa_met = education.cgpa >= academic_eligibility.min_cgpa;
  
  // Normalize departments and match using department synonym graph
  const normAllowedDepts = academic_eligibility.allowed_departments.map(d => normalize(d));
  const candDeptNorm = normalize(education.department);

  const department_met = normAllowedDepts.some(allowedDept => {
    if (candDeptNorm.includes(allowedDept) || allowedDept.includes(candDeptNorm)) {
      return true;
    }
    const synonyms = DEPT_SYNONYMS[allowedDept] || [];
    return synonyms.some(syn => candDeptNorm.includes(syn) || syn.includes(candDeptNorm));
  });

  const normAllowedDegrees = academic_eligibility.allowed_degrees.map(d => normalize(d));
  const candDegreeNorm = normalize(education.degree);
  const degree_met = normAllowedDegrees.some(deg => 
    candDegreeNorm.includes(deg) || deg.includes(candDegreeNorm)
  );

  const graduation_year_met = education.graduation_year === academic_eligibility.graduation_year || 
    academic_eligibility.graduation_year === 0;

  const backlogs_met = education.active_backlogs <= academic_eligibility.max_active_backlogs;

  const failure_reasons: string[] = [];
  if (!cgpa_met) {
    failure_reasons.push(`CGPA ${education.cgpa} is below mandatory cutoff of ${academic_eligibility.min_cgpa}`);
  }
  if (!department_met) {
    failure_reasons.push(`Department ${education.department} is not in eligible branches (${academic_eligibility.allowed_departments.join(', ')})`);
  }
  if (!degree_met) {
    failure_reasons.push(`Degree ${education.degree} is not in eligible degrees (${academic_eligibility.allowed_degrees.join(', ')})`);
  }
  if (!graduation_year_met) {
    failure_reasons.push(`Graduation batch ${education.graduation_year} does not match required ${academic_eligibility.graduation_year} drive`);
  }
  if (!backlogs_met) {
    failure_reasons.push(`Active backlogs (${education.active_backlogs}) exceed allowed limit (${academic_eligibility.max_active_backlogs})`);
  }

  const is_eligible = cgpa_met && department_met && degree_met && graduation_year_met && backlogs_met;

  return {
    is_eligible,
    checks: {
      cgpa_met,
      department_met,
      degree_met,
      graduation_year_met,
      backlogs_met
    },
    failure_reasons
  };
}

export interface AtsFormattingCheck {
  overall_formatting_score: number;
  layout_tier: 'Optimal ATS Layout' | 'Standard ATS Layout' | 'Requires Layout Optimization';
  checks: {
    has_contact_email: boolean;
    has_contact_phone: boolean;
    has_reg_number: boolean;
    has_linkedin_or_github: boolean;
    has_education_section: boolean;
    has_skills_section: boolean;
    has_experience_section: boolean;
    has_projects_section: boolean;
    has_action_verbs: boolean;
    has_quantifiable_results: boolean;
    is_optimal_length: boolean;
    is_text_readable: boolean;
  };
  metrics: {
    word_count: number;
    action_verbs_count: number;
    action_verbs_detected: string[];
    quantifiable_metrics_count: number;
    sections_detected: string[];
  };
  formatting_feedback: string[];
}

// Action verbs widely favored by modern ATS engines
const ATS_ACTION_VERBS = [
  'developed', 'engineered', 'implemented', 'designed', 'built', 'created',
  'optimized', 'automated', 'architected', 'deployed', 'spearheaded', 'managed',
  'led', 'collaborated', 'integrated', 'refactored', 'reduced', 'improved',
  'analyzed', 'orchestrated', 'maintained', 'resolved', 'trained', 'configured'
];

/**
 * Step 2: In-depth ATS Formatting, Structural Layout, and Parseability Diagnostics
 */
export function evaluateAtsFormatting(rawText: string, candidate: CandidateProfile): AtsFormattingCheck {
  const normText = (rawText || '').toLowerCase();
  const words = normText.split(/\s+/).filter(Boolean);
  const word_count = words.length;

  // Contact & Identity Checks
  const has_contact_email = Boolean(candidate.email && candidate.email.includes('@'));
  const has_contact_phone = Boolean(candidate.phone && candidate.phone.length >= 8);
  const has_reg_number = Boolean(candidate.reg_number && candidate.reg_number.length >= 5);
  const has_linkedin_or_github = Boolean(
    (candidate.linkedin && candidate.linkedin.includes('linkedin')) ||
    (candidate.github && candidate.github.includes('github')) ||
    normText.includes('linkedin.com') ||
    normText.includes('github.com')
  );

  // Section Headers
  const sections_detected: string[] = [];
  const has_education_section = /education|academic|qualification|b\.tech|m\.tech|degree|cgpa/i.test(normText);
  if (has_education_section) sections_detected.push('Education');

  const has_skills_section = /skills|technologies|technical proficiency|competencies|languages/i.test(normText);
  if (has_skills_section) sections_detected.push('Technical Skills');

  const has_experience_section = /experience|internship|employment|work history|career/i.test(normText) || candidate.experience.length > 0;
  if (has_experience_section) sections_detected.push('Experience & Internships');

  const has_projects_section = /project|key projects|academic projects|portfolio/i.test(normText) || candidate.projects.length > 0;
  if (has_projects_section) sections_detected.push('Projects');

  if (candidate.certifications.length > 0 || /certifications?|licenses?|credentials/i.test(normText)) {
    sections_detected.push('Certifications');
  }

  // Action Verbs Analysis
  const action_verbs_detected = ATS_ACTION_VERBS.filter(verb => {
    const reg = new RegExp(`\\b${verb}\\b`, 'i');
    return reg.test(normText);
  });
  const action_verbs_count = action_verbs_detected.length;
  const has_action_verbs = action_verbs_count >= 3;

  // Quantifiable Achievements Detection (e.g. 35%, 10k, 2x, 500ms, latency, reduced by)
  const metricMatches = normText.match(/\d+(?:\.\d+)?%|\b\d+x\b|\b\d+\s*(?:ms|lpa|k|users|requests)\b|reduced by|increased by/g) || [];
  const quantifiable_metrics_count = metricMatches.length;
  const has_quantifiable_results = quantifiable_metrics_count >= 1;

  // Word Count & Content Density (Ideal 200 - 950 words)
  const is_optimal_length = word_count >= 180 && word_count <= 1100;
  const is_text_readable = word_count >= 50 && !normText.includes('\x00');

  // Scoring weights for ATS Formatting Health (Total 100 points)
  let score = 0;
  const feedback: string[] = [];

  // Contact points (25 pts)
  if (has_contact_email) score += 10; else feedback.push('Email address is missing or improperly formatted.');
  if (has_contact_phone) score += 5; else feedback.push('Direct contact phone number not detected.');
  if (has_reg_number) score += 5; else feedback.push('SRM Student Register Number not present.');
  if (has_linkedin_or_github) score += 5; else feedback.push('Professional portfolio links (GitHub / LinkedIn) recommended.');

  // Standard Section Hierarchy (35 pts)
  if (has_education_section) score += 10; else feedback.push('Standard Education section heading missing.');
  if (has_skills_section) score += 10; else feedback.push('Dedicated Technical Skills section heading missing.');
  if (has_experience_section) score += 8; else feedback.push('Experience or internship details are missing or unlabelled.');
  if (has_projects_section) score += 7; else feedback.push('Projects section heading not clearly identifiable.');

  // Content Quality & Language (25 pts)
  if (has_action_verbs) {
    score += 15;
  } else {
    feedback.push(`Action-oriented bullet verbs are sparse (${action_verbs_count} detected). Use strong verbs like "developed", "architected", "optimized".`);
  }

  if (has_quantifiable_results) {
    score += 10;
  } else {
    feedback.push('Include quantifiable metrics (e.g., "improved latency by 35%", "scaled to 1,000 users") to enhance ATS impact.');
  }

  // Readability & Structure (15 pts)
  if (is_optimal_length) {
    score += 10;
  } else if (word_count < 180) {
    feedback.push(`Resume content is brief (${word_count} words). Recommended density is 250 - 800 words.`);
  } else {
    feedback.push(`Resume is lengthy (${word_count} words). Keep early-career resumes within 1-2 pages.`);
  }

  if (is_text_readable) score += 5; else feedback.push('Resume text encoding or layout parsing was degraded.');

  const overall_formatting_score = Math.min(100, Math.max(20, score));

  let layout_tier: AtsFormattingCheck['layout_tier'] = 'Standard ATS Layout';
  if (overall_formatting_score >= 85) {
    layout_tier = 'Optimal ATS Layout';
  } else if (overall_formatting_score < 70) {
    layout_tier = 'Requires Layout Optimization';
  }

  if (feedback.length === 0) {
    feedback.push('Clean, ATS-standard layout with clear section headers, professional contact info, and strong action verbs.');
  }

  return {
    overall_formatting_score,
    layout_tier,
    checks: {
      has_contact_email,
      has_contact_phone,
      has_reg_number,
      has_linkedin_or_github,
      has_education_section,
      has_skills_section,
      has_experience_section,
      has_projects_section,
      has_action_verbs,
      has_quantifiable_results,
      is_optimal_length,
      is_text_readable
    },
    metrics: {
      word_count,
      action_verbs_count,
      action_verbs_detected,
      quantifiable_metrics_count,
      sections_detected
    },
    formatting_feedback: feedback
  };
}

/**
 * Step 3: Multi-Dimensional ATS Scoring Engine
 * Incorporates:
 * 1. Keyword Relevance & Depth (40%)
 * 2. Job Requirement & Academic Fit (35%)
 * 3. Resume Layout & Parseability Health (25%)
 */
export function calculateMatchScore(
  candidate: CandidateProfile, 
  job: JobRequirement,
  settings: AISettings = DEFAULT_AI_SETTINGS
): { score: ScoreBreakdown; explainable: ExplainableAI } {
  const resumeText = `${candidate.name} ${candidate.education.degree} ${candidate.education.department} ${candidate.skills.join(' ')} ` +
    candidate.experience.map(e => `${e.position} ${e.company} ${e.responsibilities.join(' ')} ${e.description || ''}`).join(' ') + ' ' +
    candidate.projects.map(p => `${p.name} ${p.technologies.join(' ')} ${p.description}`).join(' ') + ' ' +
    candidate.certifications.join(' ') + ' ' +
    (candidate.raw_resume_text || '');

  const positive_factors: string[] = [];
  const penalty_factors: string[] = [];
  const missing_skills: string[] = [];
  const skill_evidence: SkillEvidence[] = [];

  // --- PILLAR 1: KEYWORD MATCHING & SKILLS COVERAGE ---
  let requiredMatchedCount = 0;
  let preferredMatchedCount = 0;
  let weightedSkillPoints = 0;

  job.required_skills.forEach(skill => {
    const match = checkSkillMatch(skill, candidate.skills, candidate, resumeText);
    if (match.matches) {
      requiredMatchedCount++;
      weightedSkillPoints += match.confidence * 100;
      skill_evidence.push({
        skill,
        candidate_evidence: match.evidence,
        match_status: 'matched',
        is_required: true
      });
    } else {
      missing_skills.push(skill);
      skill_evidence.push({
        skill,
        candidate_evidence: 'Keyword not detected in candidate profile',
        match_status: 'missing',
        is_required: true
      });
    }
  });

  job.preferred_skills.forEach(skill => {
    const match = checkSkillMatch(skill, candidate.skills, candidate, resumeText);
    if (match.matches) {
      preferredMatchedCount++;
      skill_evidence.push({
        skill,
        candidate_evidence: match.evidence,
        match_status: 'matched',
        is_required: false
      });
    } else {
      skill_evidence.push({
        skill,
        candidate_evidence: 'Preferred domain keyword not identified',
        match_status: 'partial',
        is_required: false
      });
    }
  });

  const reqCount = job.required_skills.length;
  const prefCount = job.preferred_skills.length;

  const reqScore = reqCount > 0 ? (weightedSkillPoints / (reqCount * 100)) * 100 : 100;
  const prefScore = prefCount > 0 ? (preferredMatchedCount / prefCount) * 100 : 100;

  // Composite Keyword Score
  let keywordScore: number;
  if (prefCount > 0) {
    keywordScore = Math.round(reqScore * 0.80 + prefScore * 0.20);
  } else {
    keywordScore = Math.round(reqScore);
  }

  if (requiredMatchedCount === reqCount && reqCount > 0) {
    positive_factors.push(`Core Keywords: 100% mandatory skills verified (${job.required_skills.join(', ')})`);
  } else if (requiredMatchedCount > 0) {
    positive_factors.push(`Core Keywords: ${requiredMatchedCount}/${reqCount} mandatory skills matched`);
  }

  if (preferredMatchedCount > 0) {
    positive_factors.push(`Bonus Keywords: Matches ${preferredMatchedCount} preferred domain competencies`);
  }

  if (missing_skills.length > 0) {
    penalty_factors.push(`Missing mandatory keywords: ${missing_skills.slice(0, 4).join(', ')}`);
  }

  // --- PILLAR 2: REQUIREMENT & QUALIFICATIONS FIT ---
  // Education & CGPA
  const cgpa = candidate.education.cgpa;
  let eduScore = 75;
  const minCgpa = job.academic_eligibility.min_cgpa;

  if (cgpa >= 9.0) {
    eduScore = 98;
    positive_factors.push(`Academics: High distinction CGPA ${cgpa.toFixed(2)} / 10`);
  } else if (cgpa >= minCgpa + 0.5) {
    eduScore = 90;
    positive_factors.push(`Academics: Strong CGPA ${cgpa.toFixed(2)} (comfortably above cutoff ${minCgpa})`);
  } else if (cgpa >= minCgpa) {
    eduScore = 80;
    positive_factors.push(`Academics: Meets required CGPA cutoff (${cgpa.toFixed(2)} >= ${minCgpa})`);
  } else {
    eduScore = Math.max(35, Math.round((cgpa / (minCgpa || 7.0)) * 70));
    penalty_factors.push(`Academics: CGPA ${cgpa.toFixed(2)} is below drive requirement ${minCgpa}`);
  }

  if (candidate.education.active_backlogs === 0) {
    positive_factors.push(`Institutional Eligibility: 0 active backlogs`);
  } else {
    penalty_factors.push(`Eligibility: ${candidate.education.active_backlogs} active academic backlogs`);
  }

  // Experience fit
  let totalMonthsExp = candidate.experience.reduce((sum, exp) => sum + exp.duration_months, 0);
  let expScore = 70;

  if (job.freshers_accepted) {
    const hasInternships = candidate.experience.some(e => e.is_internship || e.duration_months >= 2);
    if (hasInternships) {
      expScore = 95;
      positive_factors.push(`Experience: Completed ${candidate.experience.length} relevant industry internship(s)`);
    } else if (candidate.projects.length >= 2) {
      expScore = 85;
      positive_factors.push(`Experience: Strong practical skills demonstrated via project portfolio`);
    } else {
      expScore = 75;
    }
  } else {
    const requiredMonths = job.min_experience_years * 12;
    if (totalMonthsExp >= requiredMonths) {
      expScore = Math.min(100, Math.round((totalMonthsExp / requiredMonths) * 90) + 10);
      positive_factors.push(`Experience: Meets ${job.min_experience_years}+ years experience requirement`);
    } else {
      expScore = Math.max(30, Math.round((totalMonthsExp / (requiredMonths || 12)) * 80));
      penalty_factors.push(`Experience: Below preferred ${job.min_experience_years} years`);
    }
  }

  // Projects relevance
  let projectScore = 60;
  let relevantProjectsCount = 0;

  candidate.projects.forEach(project => {
    const projText = `${project.name} ${project.technologies.join(' ')} ${project.description}`.toLowerCase();
    const hasSkill = job.required_skills.some(skill => projText.includes(normalize(skill)));
    if (hasSkill) relevantProjectsCount++;
  });

  if (relevantProjectsCount >= 2) {
    projectScore = 95;
    positive_factors.push(`Projects: Built ${relevantProjectsCount} projects utilizing role's target tech stack`);
  } else if (relevantProjectsCount === 1) {
    projectScore = 85;
    positive_factors.push(`Projects: Practical project directly aligning with role focus`);
  } else if (candidate.projects.length > 0) {
    projectScore = 75;
  } else {
    projectScore = 40;
    penalty_factors.push(`Projects: No practical software or research projects listed`);
  }

  // Certifications
  let certScore = 60;
  if (candidate.certifications.length >= 2) {
    certScore = 95;
    positive_factors.push(`Certifications: Multiple verified technical credentials`);
  } else if (candidate.certifications.length === 1) {
    certScore = 80;
    positive_factors.push(`Certifications: Certified in ${candidate.certifications[0]}`);
  } else {
    certScore = 50;
  }

  // Composite Requirement Score
  const requirementScore = Math.round(eduScore * 0.40 + expScore * 0.35 + projectScore * 0.25);

  // --- PILLAR 3: RESUME LAYOUT & ATS PARSEABILITY ---
  const formatting = evaluateAtsFormatting(resumeText, candidate);
  const formattingScore = formatting.overall_formatting_score;

  if (formatting.layout_tier === 'Optimal ATS Layout') {
    positive_factors.push(`Layout: High ATS parseability with structured headings and action verbs`);
  } else if (formatting.layout_tier === 'Requires Layout Optimization') {
    penalty_factors.push(`Layout: Formatting improvements needed for maximum ATS indexation`);
  }

  // --- OVERALL ATS SCORE (Tri-Pillar Balance) ---
  // 40% Keyword Relevance + 35% Requirement Fit + 25% Layout Parseability
  const overall_match = Math.round(
    keywordScore * 0.40 +
    requirementScore * 0.35 +
    formattingScore * 0.25
  );

  // Verdict Classification
  const { thresholds } = settings;
  let verdict: MatchTier = 'Low Match';
  if (overall_match >= thresholds.strong_match) {
    verdict = 'Strong Match';
  } else if (overall_match >= thresholds.needs_review) {
    verdict = 'Needs Review';
  }

  const summary = verdict === 'Strong Match'
    ? `Strong ATS Compatibility (${overall_match}%): Resume matches core role requirements with clean parseable layout and verified technical keywords.`
    : verdict === 'Needs Review'
    ? `Moderate ATS Compatibility (${overall_match}%): Candidate shows solid potential, but requires keyword reinforcement or minor formatting improvements.`
    : `Low ATS Compatibility (${overall_match}%): Resume has significant gaps in mandatory keywords or does not align with drive criteria.`;

  const score: ScoreBreakdown = {
    skills: keywordScore,
    experience: expScore,
    education: eduScore,
    projects: projectScore,
    certifications: certScore,
    overall_match,
    formatting_score: formattingScore,
    keyword_score: keywordScore,
    requirement_score: requirementScore
  };

  const explainable: ExplainableAI = {
    verdict,
    summary,
    positive_factors,
    penalty_factors,
    missing_skills,
    skill_evidence
  };

  return { score, explainable };
}

/**
 * Executes the full SRM Screening Engine pipeline on a candidate
 */
export function screenCandidate(
  candidate: CandidateProfile,
  job: JobRequirement,
  settings: AISettings = getStoredAiSettings()
): ScreeningResult {
  const eligibility = evaluateEligibility(candidate, job);
  const { score, explainable } = calculateMatchScore(candidate, job, settings);

  if (!eligibility.is_eligible) {
    explainable.verdict = 'Ineligible';
    explainable.penalty_factors.unshift(
      ...eligibility.failure_reasons.map(r => `[Academic Cutoff Failed] ${r}`)
    );
  }

  return {
    id: `res_${candidate.id}_${job.id}`,
    candidate_id: candidate.id,
    job_id: job.id,
    candidate,
    eligibility,
    score,
    explainable,
    rank: 1,
    status: eligibility.is_eligible 
      ? (score.overall_match >= settings.thresholds.strong_match ? 'AI Screened' : 'Under Review')
      : 'Rejected',
    screened_at: new Date().toISOString()
  };
}

/**
 * Batch ranks a list of screening results with proper rank positions
 */
export function rankScreeningResults(results: ScreeningResult[]): ScreeningResult[] {
  const sorted = [...results].sort((a, b) => {
    if (a.eligibility.is_eligible && !b.eligibility.is_eligible) return -1;
    if (!a.eligibility.is_eligible && b.eligibility.is_eligible) return 1;
    if (b.score.overall_match !== a.score.overall_match) {
      return b.score.overall_match - a.score.overall_match;
    }
    return b.candidate.education.cgpa - a.candidate.education.cgpa;
  });

  return sorted.map((res, index) => ({
    ...res,
    rank: index + 1
  }));
}
