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
// Default AI settings calibrated for realistic, genuine placement screening
export const DEFAULT_AI_SETTINGS: AISettings = {
  weights: {
    skills: 0.55,
    experience: 0.18,
    education: 0.10,
    projects: 0.17,
    certifications: 0.05
  },
  thresholds: {
    strong_match: 80,
    needs_review: 55
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

// Strict Technical Skill Synonyms and Knowledge Graph (Without cross-technology contamination)
export const SKILL_SYNONYMS: Record<string, string[]> = {
  'python': ['python3', 'py3', 'cpython'],
  'machine learning': ['ml', 'scikit-learn', 'sklearn', 'predictive modeling', 'statistical learning', 'supervised learning'],
  'deep learning': ['dl', 'tensorflow', 'pytorch', 'keras', 'neural networks', 'transformers', 'llm', 'computer vision'],
  'tensorflow': ['tf', 'keras'],
  'pytorch': ['torch', 'torchvision'],
  'sql': ['mysql', 'postgresql', 'postgres', 'sqlite', 'oracle sql', 'pl/sql', 't-sql', 'mariadb'],
  'power bi': ['powerbi', 'dax', 'power query'],
  'tableau': ['tableau desktop', 'tableau server'],
  'excel': ['advanced excel', 'vlookup', 'pivot tables', 'spreadsheets'],
  'react': ['reactjs', 'react.js'],
  'node.js': ['nodejs', 'node.js', 'node js'],
  'javascript': ['js', 'es6', 'ecmascript'],
  'typescript': ['ts'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloudformation', 'dynamodb', 'ecs', 'eks'],
  'azure': ['microsoft azure', 'azure devops', 'blob storage', 'azure functions', 'aks'],
  'gcp': ['google cloud', 'google cloud platform', 'bigquery', 'gke', 'cloud storage'],
  'docker': ['containerization', 'docker compose', 'dockerfile'],
  'kubernetes': ['k8s', 'kubectl'],
  'git': ['github', 'gitlab', 'version control', 'git workflow'],
  'java': ['java 8', 'java 11', 'java 17', 'java 21', 'core java'],
  'c++': ['cpp', 'c/c++'],
  'c#': ['csharp', '.net', '.net core'],
  'statistics': ['statistical analysis', 'probability', 'inferential statistics', 'hypothesis testing'],
  'data structures': ['dsa', 'data structures and algorithms'],
  'algorithms': ['algorithm design', 'graph algorithms', 'dynamic programming'],
  'system design': ['high level design', 'low level design', 'hld', 'lld'],
  'distributed systems': ['microservices architecture', 'distributed computing'],
  'rest apis': ['restful apis', 'restful api', 'rest api', 'api design'],
  'nosql': ['mongodb', 'cassandra', 'dynamodb', 'couchdb', 'redis'],
  'linux': ['unix', 'bash', 'shell scripting', 'ubuntu'],
  'ci/cd': ['continuous integration', 'jenkins', 'github actions', 'gitlab ci']
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
 * Helper to test if a term exists as a strict token/word in a text block
 * Prevents single letters or short abbreviations from matching random English words
 */
export function matchesTokenInText(text: string, term: string): boolean {
  if (!text || !term) return false;
  const cleanTerm = term.trim();
  if (!cleanTerm) return false;

  const escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hasSymbol = /[^a-z0-9\s]/i.test(cleanTerm);
  const pattern = hasSymbol 
    ? `(?:^|[\\s,;./()\\-])${escaped}(?:$|[\\s,;./()\\-])`
    : `\\b${escaped}\\b`;
  
  const regex = new RegExp(pattern, 'i');
  return regex.test(text);
}

/**
 * Determines if two skill tokens match exactly or via recognized synonyms
 * Prevents cross-language collisions (e.g. C vs C++, Java vs JavaScript, SQL vs NoSQL)
 */
function skillTokensEqual(candSkill: string, reqTerm: string): boolean {
  const c = normalize(candSkill);
  const r = normalize(reqTerm);
  if (c === r) return true;

  // Explicit distinct collisions to reject
  const distinctPairs = [
    ['c', 'c++'], ['c', 'c#'], ['java', 'javascript'], ['sql', 'nosql'], 
    ['r', 'react'], ['go', 'django'], ['c', 'cloud computing'], ['git', 'digital signal processing']
  ];
  for (const [p1, p2] of distinctPairs) {
    if ((c === p1 && r === p2) || (c === p2 && r === p1)) return false;
  }

  // Only allow substring matching if both are at least 5 chars long AND one starts with the other
  if (c.length >= 5 && r.length >= 5) {
    if (c.startsWith(r) || r.startsWith(c)) return true;
  }
  return false;
}

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
  const synonyms = (SKILL_SYNONYMS[normReq] || []).map(s => normalize(s));
  const searchTerms = [normReq, ...synonyms];

  // 1. Direct match in candidate's declared technical skills list
  for (const candidateSkill of candidateSkills) {
    for (const term of searchTerms) {
      if (skillTokensEqual(candidateSkill, term)) {
        return { 
          matches: true, 
          evidence: `Declared in skills section: "${candidateSkill}"`,
          confidence: 1.0 
        };
      }
    }
  }

  // 2. Check if demonstrated in practical work experience or internships (strict token boundary)
  for (const exp of candidate.experience) {
    const expText = `${exp.company} ${exp.position} ${exp.responsibilities.join(' ')} ${exp.description || ''}`;
    for (const term of searchTerms) {
      if (matchesTokenInText(expText, term)) {
        return { 
          matches: true, 
          evidence: `Verified in practical experience at ${exp.company} ("${term}")`,
          confidence: 0.95 
        };
      }
    }
  }

  // 3. Check if implemented in project portfolio (strict token boundary)
  for (const proj of candidate.projects) {
    const projText = `${proj.name} ${proj.technologies.join(' ')} ${proj.description}`;
    for (const term of searchTerms) {
      if (matchesTokenInText(projText, term)) {
        return { 
          matches: true, 
          evidence: `Demonstrated in project "${proj.name}" ("${term}")`,
          confidence: 0.90 
        };
      }
    }
  }

  // 4. Semantic lookup across full raw resume text (strict token boundary)
  for (const term of searchTerms) {
    if (matchesTokenInText(resumeText, term)) {
      return { 
        matches: true, 
        evidence: `Mentioned in resume profile: "${term}"`,
        confidence: 0.75 
      };
    }
  }

  return { 
    matches: false, 
    evidence: `Missing mandatory keyword: "${requiredSkill}"`,
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
  // Strip out artificial target role headers or target position labels to prevent circular keyword matching
  const cleanRawText = (candidate.raw_resume_text || '')
    .split('\n')
    .filter(line => !/^(?:target role|applying for|applied role|role:)/i.test(line.trim()))
    .join('\n');

  const resumeText = `${candidate.name} ${candidate.education.degree} ${candidate.education.department} ${candidate.skills.join(' ')} ` +
    candidate.experience.map(e => `${e.position} ${e.company} ${e.responsibilities.join(' ')} ${e.description || ''}`).join(' ') + ' ' +
    candidate.projects.map(p => `${p.name} ${p.technologies.join(' ')} ${p.description}`).join(' ') + ' ' +
    candidate.certifications.join(' ') + ' ' +
    cleanRawText;

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

  // Composite Keyword Score heavily weights mandatory requirements (85% required + 15% preferred)
  let keywordScore: number;
  if (prefCount > 0) {
    keywordScore = Math.round(reqScore * 0.85 + prefScore * 0.15);
  } else {
    keywordScore = Math.round(reqScore);
  }

  if (requiredMatchedCount === reqCount && reqCount > 0) {
    positive_factors.push(`Core Keywords: 100% mandatory skills verified (${job.required_skills.join(', ')})`);
  } else if (requiredMatchedCount > 0) {
    positive_factors.push(`Core Keywords: ${requiredMatchedCount}/${reqCount} mandatory skills matched`);
  }

  if (preferredMatchedCount > 0) {
    positive_factors.push(`Bonus Keywords: Matches ${preferredMatchedCount}/${prefCount} preferred domain competencies`);
  }

  if (missing_skills.length > 0) {
    penalty_factors.push(`Missing mandatory keywords: ${missing_skills.join(', ')}`);
  }

  // --- PILLAR 2: REQUIREMENT & QUALIFICATIONS FIT ---
  // Education & CGPA
  const cgpa = candidate.education.cgpa;
  let eduScore = 70;
  const minCgpa = job.academic_eligibility.min_cgpa;

  if (cgpa >= 9.0) {
    eduScore = 95;
    positive_factors.push(`Academics: High distinction CGPA ${cgpa.toFixed(2)} / 10`);
  } else if (cgpa >= minCgpa + 0.5) {
    eduScore = 85;
    positive_factors.push(`Academics: Strong CGPA ${cgpa.toFixed(2)} (comfortably above cutoff ${minCgpa})`);
  } else if (cgpa >= minCgpa) {
    eduScore = 72;
    positive_factors.push(`Academics: Meets required CGPA cutoff (${cgpa.toFixed(2)} >= ${minCgpa})`);
  } else {
    eduScore = Math.max(20, Math.round((cgpa / (minCgpa || 7.0)) * 50));
    penalty_factors.push(`Academics: CGPA ${cgpa.toFixed(2)} is below drive requirement ${minCgpa}`);
  }

  if (candidate.education.active_backlogs === 0) {
    positive_factors.push(`Institutional Eligibility: 0 active backlogs`);
  } else {
    penalty_factors.push(`Eligibility: ${candidate.education.active_backlogs} active academic backlogs`);
  }

  // Experience fit
  let totalMonthsExp = candidate.experience.reduce((sum, exp) => sum + exp.duration_months, 0);
  let expScore = 45;

  if (job.freshers_accepted) {
    // Check if candidate has internships that actually match the role's skills
    let relevantInternship = false;
    let anyInternship = false;
    for (const exp of candidate.experience) {
      if (exp.is_internship || exp.duration_months >= 2) {
        anyInternship = true;
        const expText = `${exp.position} ${exp.company} ${exp.responsibilities.join(' ')} ${exp.description || ''}`;
        const matchesRole = job.required_skills.some(skill => matchesTokenInText(expText, skill));
        if (matchesRole) {
          relevantInternship = true;
          break;
        }
      }
    }

    if (relevantInternship) {
      expScore = 90;
      positive_factors.push(`Experience: Relevant industry internship demonstrating target tech stack`);
    } else if (anyInternship) {
      expScore = 65;
      positive_factors.push(`Experience: Completed general internship (${candidate.experience.length} internship)`);
    } else if (candidate.projects.length >= 2) {
      expScore = 55;
    } else {
      expScore = 40;
      penalty_factors.push('Experience: No relevant industry internship or work experience recorded');
    }
  } else {
    const requiredMonths = job.min_experience_years * 12;
    if (totalMonthsExp >= requiredMonths) {
      expScore = Math.min(100, Math.round((totalMonthsExp / requiredMonths) * 75) + 25);
      positive_factors.push(`Experience: Meets ${job.min_experience_years}+ years experience requirement`);
    } else {
      expScore = Math.max(15, Math.round((totalMonthsExp / (requiredMonths || 12)) * 60));
      penalty_factors.push(`Experience: Below required ${job.min_experience_years} years`);
    }
  }

  // Projects relevance (Measures how many of THIS JOB's required skills appear in projects)
  let projectScore = 30;
  let demonstratedSkillsInProjects = 0;

  job.required_skills.forEach(skill => {
    const hasInProject = candidate.projects.some(proj => {
      const projText = `${proj.name} ${proj.technologies.join(' ')} ${proj.description}`;
      return matchesTokenInText(projText, skill);
    });
    if (hasInProject) demonstratedSkillsInProjects++;
  });

  if (candidate.projects.length === 0) {
    projectScore = 15;
    penalty_factors.push('Projects: No software or engineering projects listed');
  } else {
    const projectSkillRatio = reqCount > 0 ? demonstratedSkillsInProjects / reqCount : 0.5;
    if (projectSkillRatio >= 0.6) {
      projectScore = Math.min(100, Math.round(75 + projectSkillRatio * 25));
      positive_factors.push(`Projects: High relevance portfolio demonstrating ${demonstratedSkillsInProjects}/${reqCount} role technologies`);
    } else if (demonstratedSkillsInProjects > 0) {
      projectScore = Math.round(45 + projectSkillRatio * 40);
      positive_factors.push(`Projects: Demonstrated ${demonstratedSkillsInProjects} role competencies in project portfolio`);
    } else {
      projectScore = 35;
      penalty_factors.push(`Projects: Existing projects do not utilize role's required tech stack (${job.required_skills.slice(0, 3).join(', ')})`);
    }
  }

  // Certifications
  let certScore = 40;
  if (candidate.certifications.length >= 2) {
    certScore = 90;
    positive_factors.push(`Certifications: Multiple verified technical credentials`);
  } else if (candidate.certifications.length === 1) {
    certScore = 70;
    positive_factors.push(`Certifications: Certified in ${candidate.certifications[0]}`);
  } else {
    certScore = 30;
  }

  // Composite Requirement Score
  const requirementScore = Math.round(eduScore * 0.35 + expScore * 0.35 + projectScore * 0.30);

  // --- PILLAR 3: RESUME LAYOUT & ATS PARSEABILITY ---
  const formatting = evaluateAtsFormatting(resumeText, candidate);
  const formattingScore = formatting.overall_formatting_score;

  if (formatting.layout_tier === 'Optimal ATS Layout') {
    positive_factors.push(`Layout: High ATS parseability with structured headings and action verbs`);
  } else if (formatting.layout_tier === 'Requires Layout Optimization') {
    penalty_factors.push(`Layout: Formatting improvements needed for maximum ATS indexation`);
  }

  // --- OVERALL ATS SCORE (Genuine Multidimensional ATS Engine) ---
  // Skill Relevance is 55%, Projects 18%, Experience 17%, Academics 10%
  let rawMatch = Math.round(
    keywordScore * 0.55 +
    projectScore * 0.18 +
    expScore * 0.17 +
    eduScore * 0.10
  );

  // Formatting acts as a hygiene adjustment (+/- 5 points), NOT 25 free points
  const formattingModifier = Math.round(((formattingScore - 70) / 30) * 5);
  let overall_match = Math.max(10, Math.min(100, rawMatch + formattingModifier));

  // Hard ATS Eligibility Gate: If candidate is missing more than half the mandatory skills,
  // ATS algorithms reject or cap at Low Match / Needs Review
  const mandatorySkillRatio = reqCount > 0 ? requiredMatchedCount / reqCount : 1;
  if (mandatorySkillRatio < 0.4) {
    overall_match = Math.min(48, overall_match);
    penalty_factors.unshift(`Critical Skill Gap: Candidate matches only ${requiredMatchedCount}/${reqCount} mandatory skills (${missing_skills.join(', ')})`);
  } else if (mandatorySkillRatio < 0.65) {
    overall_match = Math.min(68, overall_match);
  } else if (mandatorySkillRatio < 0.85) {
    overall_match = Math.min(82, overall_match);
  }

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
