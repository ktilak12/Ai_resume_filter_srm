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

// Skill Synonyms and Semantic Knowledge Graph
const SKILL_SYNONYMS: Record<string, string[]> = {
  'python': ['python3', 'py', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'scipy'],
  'machine learning': ['ml', 'scikit-learn', 'sklearn', 'predictive modeling', 'data science', 'random forest', 'xgboost', 'regression', 'clustering', 'neural networks'],
  'deep learning': ['dl', 'tensorflow', 'pytorch', 'keras', 'cnn', 'rnn', 'lstm', 'transformer', 'bert', 'llm', 'nlp'],
  'tensorflow': ['tf', 'keras', 'deep learning'],
  'pytorch': ['torch', 'deep learning', 'transformers'],
  'sql': ['mysql', 'postgresql', 'postgres', 'pl/sql', 'oracle', 'sqlite', 'rdbms', 'sql server', 't-sql'],
  'power bi': ['powerbi', 'dax', 'power query', 'bi reporting', 'business intelligence', 'dashboards'],
  'tableau': ['tableau desktop', 'tableau server', 'data visualization'],
  'excel': ['advanced excel', 'vlookup', 'xlookup', 'pivot tables', 'macros', 'vba'],
  'react': ['reactjs', 'react.js', 'next.js', 'nextjs', 'redux', 'frontend', 'javascript', 'typescript'],
  'node.js': ['nodejs', 'node', 'express', 'express.js', 'nest.js', 'backend'],
  'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloudformation', 'rds', 'dynamodb'],
  'docker': ['containerization', 'containers', 'docker compose', 'dockerfile', 'kubernetes', 'k8s'],
  'git': ['github', 'gitlab', 'version control', 'bitbucket', 'git cli'],
  'java': ['java 8', 'java 17', 'spring', 'spring boot', 'hibernate', 'jvm', 'j2ee'],
  'c++': ['cpp', 'c/c++', 'stl', 'object oriented programming'],
  'statistics': ['statistical analysis', 'hypothesis testing', 'probability', 'inferential statistics', 'a/b testing']
};

/**
 * Normalizes text for comparison
 */
function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[-_]/g, ' ');
}

/**
 * Determines if a candidate skill matches a required skill using token exactness or synonym graph
 */
function checkSkillMatch(requiredSkill: string, candidateSkills: string[], resumeText: string): { matches: boolean; evidence: string } {
  const normReq = normalize(requiredSkill);
  const synonyms = SKILL_SYNONYMS[normReq] || [];
  const searchTerms = [normReq, ...synonyms];

  // 1. Direct match in candidate's parsed skills
  for (const candidateSkill of candidateSkills) {
    const normCand = normalize(candidateSkill);
    if (normCand === normReq || normCand.includes(normReq) || normReq.includes(normCand)) {
      return { matches: true, evidence: `Found in skills: "${candidateSkill}"` };
    }
    for (const syn of synonyms) {
      if (normCand === syn || normCand.includes(syn) || syn.includes(normCand)) {
        return { matches: true, evidence: `Related skill verified: "${candidateSkill}" (${requiredSkill})` };
      }
    }
  }

  // 2. Semantic lookup in full resume text (projects, experience, text)
  const normText = normalize(resumeText);
  for (const term of searchTerms) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normText)) {
      return { matches: true, evidence: `Mentioned in projects / work experience: "${term}"` };
    }
  }

  return { matches: false, evidence: 'Not detected in profile or project descriptions' };
}

/**
 * Step 1: Institutional Academic Eligibility Engine
 */
export function evaluateEligibility(candidate: CandidateProfile, job: JobRequirement): EligibilityResult {
  const { academic_eligibility } = job;
  const { education } = candidate;

  const cgpa_met = education.cgpa >= academic_eligibility.min_cgpa;
  
  // Normalize departments for matching (e.g. "CSE" matches "Computer Science & Engineering", "IT" matches "Information Technology")
  const normAllowedDepts = academic_eligibility.allowed_departments.map(d => normalize(d));
  const candDeptNorm = normalize(education.department);
  const department_met = normAllowedDepts.some(dept => 
    candDeptNorm.includes(dept) || 
    dept.includes(candDeptNorm) ||
    (dept === 'cse' && candDeptNorm.includes('computer')) ||
    (dept === 'it' && candDeptNorm.includes('information')) ||
    (dept === 'ai & ds' && (candDeptNorm.includes('ai') || candDeptNorm.includes('artificial') || candDeptNorm.includes('data science')))
  );

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
    failure_reasons.push(`Graduation year ${education.graduation_year} does not match required batch ${academic_eligibility.graduation_year}`);
  }
  if (!backlogs_met) {
    failure_reasons.push(`Active backlogs (${education.active_backlogs}) exceed allowed maximum (${academic_eligibility.max_active_backlogs})`);
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

/**
 * Step 2: AI Resume Screening & Multi-Dimensional Scoring Engine
 */
export function calculateMatchScore(
  candidate: CandidateProfile, 
  job: JobRequirement,
  settings: AISettings = DEFAULT_AI_SETTINGS
): { score: ScoreBreakdown; explainable: ExplainableAI } {
  const resumeText = `${candidate.name} ${candidate.education.degree} ${candidate.education.department} ${candidate.skills.join(' ')} ` +
    candidate.experience.map(e => `${e.position} ${e.company} ${e.responsibilities.join(' ')}`).join(' ') + ' ' +
    candidate.projects.map(p => `${p.name} ${p.technologies.join(' ')} ${p.description}`).join(' ') + ' ' +
    candidate.certifications.join(' ') + ' ' +
    (candidate.raw_resume_text || '');

  const positive_factors: string[] = [];
  const penalty_factors: string[] = [];
  const missing_skills: string[] = [];
  const skill_evidence: SkillEvidence[] = [];

  // --- 1. Skills Scoring (40%) ---
  let requiredMatchedCount = 0;
  let preferredMatchedCount = 0;

  job.required_skills.forEach(skill => {
    const match = checkSkillMatch(skill, candidate.skills, resumeText);
    if (match.matches) {
      requiredMatchedCount++;
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
        candidate_evidence: 'Not found in candidate profile',
        match_status: 'missing',
        is_required: true
      });
    }
  });

  job.preferred_skills.forEach(skill => {
    const match = checkSkillMatch(skill, candidate.skills, resumeText);
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
        candidate_evidence: 'Preferred skill not identified',
        match_status: 'partial',
        is_required: false
      });
    }
  });

  // Calculate skill score
  const reqWeight = 0.8;
  const prefWeight = 0.2;
  const reqScore = job.required_skills.length > 0 ? (requiredMatchedCount / job.required_skills.length) * 100 : 100;
  const prefScore = job.preferred_skills.length > 0 ? (preferredMatchedCount / job.preferred_skills.length) * 100 : 100;
  const skillsScore = Math.round(reqScore * reqWeight + prefScore * prefWeight);

  if (requiredMatchedCount === job.required_skills.length) {
    positive_factors.push(`Demonstrates 100% of required core skills (${job.required_skills.join(', ')})`);
  } else if (requiredMatchedCount > 0) {
    positive_factors.push(`Possesses ${requiredMatchedCount}/${job.required_skills.length} core technical requirements`);
  }

  if (preferredMatchedCount > 0) {
    positive_factors.push(`Bonus: Matches preferred domain competencies (${preferredMatchedCount} additional skills)`);
  }

  if (missing_skills.length > 0) {
    penalty_factors.push(`Missing mandatory technical skills: ${missing_skills.slice(0, 3).join(', ')}`);
  }

  // --- 2. Experience Scoring (25%) ---
  let totalMonthsExp = candidate.experience.reduce((sum, exp) => sum + exp.duration_months, 0);
  let expScore = 70; // baseline for SRM student candidates

  if (job.freshers_accepted) {
    const hasInternships = candidate.experience.some(e => e.is_internship || e.duration_months >= 2);
    if (hasInternships) {
      expScore = 95;
      positive_factors.push(`Completed ${candidate.experience.length} relevant industrial internship(s)`);
    } else if (candidate.projects.length >= 3) {
      expScore = 85;
      positive_factors.push(`Strong practical foundation demonstrated through extensive project portfolio`);
    } else {
      expScore = 75;
    }
  } else {
    const requiredMonths = job.min_experience_years * 12;
    if (totalMonthsExp >= requiredMonths) {
      expScore = Math.min(100, Math.round((totalMonthsExp / requiredMonths) * 90) + 10);
      positive_factors.push(`Meets minimum experience threshold (${Math.round(totalMonthsExp / 12 * 10) / 10} yrs)`);
    } else {
      expScore = Math.max(30, Math.round((totalMonthsExp / (requiredMonths || 12)) * 80));
      penalty_factors.push(`Experience (${Math.round(totalMonthsExp / 12 * 10) / 10} yrs) below preferred ${job.min_experience_years} years`);
    }
  }

  // --- 3. Education Scoring (20%) ---
  let eduScore = 75;
  const cgpa = candidate.education.cgpa;
  if (cgpa >= 9.0) {
    eduScore = 98;
    positive_factors.push(`Outstanding academic standing with CGPA ${cgpa.toFixed(2)} / 10`);
  } else if (cgpa >= 8.5) {
    eduScore = 92;
    positive_factors.push(`High academic performance (CGPA ${cgpa.toFixed(2)} / 10)`);
  } else if (cgpa >= 7.5) {
    eduScore = 84;
    positive_factors.push(`Meets institutional CGPA benchmark (${cgpa.toFixed(2)} >= 7.5)`);
  } else {
    eduScore = Math.max(40, Math.round((cgpa / 7.5) * 70));
    penalty_factors.push(`Lower academic performance (CGPA ${cgpa.toFixed(2)})`);
  }

  if (candidate.education.active_backlogs === 0) {
    positive_factors.push(`Clean academic track record with 0 active backlogs`);
  } else {
    penalty_factors.push(`Has ${candidate.education.active_backlogs} active academic backlog(s)`);
  }

  // --- 4. Projects Scoring (10%) ---
  let projectScore = 60;
  let relevantProjectsCount = 0;

  candidate.projects.forEach(project => {
    const projText = `${project.name} ${project.technologies.join(' ')} ${project.description}`.toLowerCase();
    const hasRequiredSkill = job.required_skills.some(skill => projText.includes(normalize(skill)));
    if (hasRequiredSkill) {
      relevantProjectsCount++;
    }
  });

  if (relevantProjectsCount >= 2) {
    projectScore = 95;
    positive_factors.push(`Built ${relevantProjectsCount} directly relevant projects with required technology stack`);
  } else if (relevantProjectsCount === 1) {
    projectScore = 85;
    positive_factors.push(`Completed relevant project matching job focus`);
  } else if (candidate.projects.length > 0) {
    projectScore = 75;
  } else {
    projectScore = 40;
    penalty_factors.push(`No practical software or research projects listed`);
  }

  // --- 5. Certifications Scoring (5%) ---
  let certScore = 60;
  if (candidate.certifications.length >= 2) {
    certScore = 95;
    positive_factors.push(`Verified certifications: ${candidate.certifications.slice(0, 2).join(', ')}`);
  } else if (candidate.certifications.length === 1) {
    certScore = 80;
    positive_factors.push(`Certified in: ${candidate.certifications[0]}`);
  } else {
    certScore = 50;
  }

  // --- Overall Match Score Weighted Calculation ---
  const { weights, thresholds } = settings;
  const overall_match = Math.round(
    skillsScore * weights.skills +
    expScore * weights.experience +
    eduScore * weights.education +
    projectScore * weights.projects +
    certScore * weights.certifications
  );

  // Verdict Classification
  let verdict: MatchTier = 'Low Match';
  if (overall_match >= thresholds.strong_match) {
    verdict = 'Strong Match';
  } else if (overall_match >= thresholds.needs_review) {
    verdict = 'Needs Review';
  }

  const summary = verdict === 'Strong Match'
    ? `The candidate meets mandatory academic requirements and demonstrates exceptional alignment (${overall_match}% match) with core technical criteria.`
    : verdict === 'Needs Review'
    ? `Candidate shows moderate alignment (${overall_match}% match). Has solid foundations but requires verification on specific skills or experience.`
    : `Candidate match (${overall_match}%) is below primary threshold due to multiple missing required skills or profile divergence.`;

  const score: ScoreBreakdown = {
    skills: skillsScore,
    experience: expScore,
    education: eduScore,
    projects: projectScore,
    certifications: certScore,
    overall_match
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
  settings: AISettings = DEFAULT_AI_SETTINGS
): ScreeningResult {
  const eligibility = evaluateEligibility(candidate, job);
  const { score, explainable } = calculateMatchScore(candidate, job, settings);

  if (!eligibility.is_eligible) {
    explainable.verdict = 'Ineligible';
    explainable.penalty_factors.unshift(...eligibility.failure_reasons.map(r => `[Eligibility Failed] ${r}`));
  }

  return {
    id: `res_${candidate.id}_${job.id}`,
    candidate_id: candidate.id,
    job_id: job.id,
    candidate,
    eligibility,
    score,
    explainable,
    rank: 1, // Will be computed dynamically when ranking batch
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
  // Sort: Eligible first, then by match score descending, then by CGPA descending
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
