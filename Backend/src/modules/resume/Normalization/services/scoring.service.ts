import { EnrichedResumeData } from "../types/normalizedResume";

/**
 * Deterministic Resume Scoring Engine
 *
 * All scores are computed in pure TypeScript using clear, auditable rules.
 * Scores are NEVER delegated to the AI — they are computed here and passed
 * to the AI as immutable facts so the AI focuses only on qualitative insights.
 *
 * Score ranges: 0–100 for each section and overall.
 */

export interface ResumeScores {
  skills: number;
  projects: number;
  experience: number;
  overall: number;
}

// ─────────────────────────────────────────────────────────────
// WEIGHTS — must sum to 1.0
// ─────────────────────────────────────────────────────────────
const WEIGHTS = {
  skills: 0.30,
  projects: 0.40,
  experience: 0.30,
} as const;

// ─────────────────────────────────────────────────────────────
// SKILLS SCORE  (0–100)
// ─────────────────────────────────────────────────────────────
function computeSkillScore(data: EnrichedResumeData): number {
  const enriched = data.enrichedSkills;
  const skills = data.skills;

  if (!enriched || !skills) return 0;

  let score = 0;

  // 1. Breadth — total unique skills (cap at 25, worth up to 40 pts)
  const totalSkills = Math.min(enriched.totalSkills ?? 0, 25);
  score += (totalSkills / 25) * 40;

  // 2. Depth — category diversity bonus (up to 20 pts)
  //    Reward candidates who cover multiple categories
  const nonEmptyCategories = [
    skills.technical,
    skills.frameworks,
    skills.tools,
    skills.languages,
    skills.soft,
  ].filter((cat) => cat.length > 0).length;
  score += (nonEmptyCategories / 5) * 20;

  // 3. Frameworks and technical — weighted heavier (up to 25 pts)
  const frameworkCount = Math.min(skills.frameworks.length, 8);
  const technicalCount = Math.min(skills.technical.length, 10);
  score += (frameworkCount / 8) * 15;
  score += (technicalCount / 10) * 10;

  // 4. Domain diversity bonus (up to 15 pts)
  const domainCount = Math.min(enriched.domains?.length ?? 0, 5);
  score += (domainCount / 5) * 15;

  // 5. Profile links bonus (github/linkedin/portfolio signals real activity)
  const identity = data.identity;
  const profileBonus =
    (identity?.github ? 2 : 0) +
    (identity?.linkedin ? 2 : 0) +
    (identity?.portfolio ? 1 : 0);
  score += profileBonus;

  return clamp(Math.round(score));
}

// ─────────────────────────────────────────────────────────────
// PROJECT SCORE  (0–100)
// ─────────────────────────────────────────────────────────────
function computeProjectScore(data: EnrichedResumeData): number {
  const projects = data.projects ?? [];
  const enrichedProjects = data.enrichedProjects ?? [];

  if (projects.length === 0) return 0;

  let score = 0;

  // 1. Volume (up to 20 pts) — cap at 5 projects
  const projectCount = Math.min(projects.length, 5);
  score += (projectCount / 5) * 20;

  // 2. Average complexity score (up to 40 pts)
  //    complexityScore is 1–10 from the enricher
  const avgComplexity =
    enrichedProjects.length > 0
      ? enrichedProjects.reduce(
          (sum, p) => sum + (p.complexityScore ?? 1),
          0,
        ) / enrichedProjects.length
      : 1;
  score += ((avgComplexity - 1) / 9) * 40; // normalize 1-10 → 0-40

  // 3. Tech diversity (up to 20 pts)
  //    Count unique technologies across all projects
  const allTechs = new Set(
    projects.flatMap((p) => p.technologies.map((t) => t.toLowerCase())),
  );
  const uniqueTechCount = Math.min(allTechs.size, 15);
  score += (uniqueTechCount / 15) * 20;

  // 4. Live/GitHub links bonus (up to 10 pts) — signals real deployed work
  const projectsWithLinks = projects.filter(
    (p) => p.github || p.live,
  ).length;
  score += (Math.min(projectsWithLinks, projects.length) / Math.max(projects.length, 1)) * 10;

  // 5. Highlights quality (up to 10 pts)
  //    More bullet points = more detail documented
  const avgHighlights =
    projects.reduce((sum, p) => sum + (p.highlights?.length ?? 0), 0) /
    projects.length;
  score += Math.min(avgHighlights / 4, 1) * 10;

  return clamp(Math.round(score));
}

// ─────────────────────────────────────────────────────────────
// EXPERIENCE SCORE  (0–100)
// ─────────────────────────────────────────────────────────────
function computeExperienceScore(data: EnrichedResumeData): number {
  const experience = data.experience ?? [];
  const enrichedExp = data.enrichedExperience ?? [];

  // Fresher baseline: certifications, education, and projects offset this
  if (experience.length === 0) return computeFresherExperienceScore(data);

  let score = 0;

  // 1. Total months of experience (up to 50 pts — 50 months = 100%, capped)
  const totalMonths = enrichedExp.reduce(
    (sum, e) => sum + (e.durationInMonths ?? 0),
    0,
  );
  score += Math.min(totalMonths / 50, 1) * 50;

  // 2. Role seniority bonus (up to 20 pts)
  //    Senior/Lead = 20, Mid = 10, Junior/Intern = 5
  const seniorityScore = enrichedExp.reduce((best, e) => {
    if (e.roleLevel === "Senior") return Math.max(best, 20);
    if (e.roleLevel === "Mid") return Math.max(best, 10);
    return Math.max(best, 5);
  }, 0);
  score += seniorityScore;

  // 3. Number of employers (up to 15 pts, cap at 3)
  //    Shows progression, not just 1 long stint
  const employerCount = Math.min(experience.length, 3);
  score += (employerCount / 3) * 15;

  // 4. Description quality (up to 15 pts)
  //    More bullet points in descriptions = richer documentation
  const avgDescPoints =
    experience.reduce(
      (sum, e) => sum + (e.description?.length ?? 0),
      0,
    ) / experience.length;
  score += Math.min(avgDescPoints / 5, 1) * 15;

  return clamp(Math.round(score));
}

// Freshers: score them on alternate signals
function computeFresherExperienceScore(data: EnrichedResumeData): number {
  let score = 5; // baseline for no experience (not 0)

  // Certifications add weight
  const certCount = Math.min(data.certifications?.length ?? 0, 5);
  score += (certCount / 5) * 20;

  // Education level
  const hasDegree = data.education?.some(
    (e) => e.level === "Undergraduate" || e.level === "Postgraduate" || e.level === "PhD",
  );
  if (hasDegree) score += 15;

  // Achievements signal extra-curricular effort
  const achieveCount = Math.min(data.achievements?.length ?? 0, 5);
  score += (achieveCount / 5) * 10;

  return clamp(Math.round(score));
}

// ─────────────────────────────────────────────────────────────
// OVERALL SCORE  (weighted average)
// ─────────────────────────────────────────────────────────────
function computeOverallScore(scores: Omit<ResumeScores, "overall">): number {
  const overall =
    scores.skills * WEIGHTS.skills +
    scores.projects * WEIGHTS.projects +
    scores.experience * WEIGHTS.experience;

  return clamp(Math.round(overall));
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

/**
 * Compute all resume scores deterministically.
 * Call this BEFORE sending data to the AI so the AI receives
 * pre-computed scores as immutable facts.
 *
 * @param enrichedData - Fully enriched resume data from the normalization pipeline
 * @returns ResumeScores object with skills, projects, experience, and overall scores
 */
export function computeResumeScores(enrichedData: EnrichedResumeData): ResumeScores {
  const skills = computeSkillScore(enrichedData);
  const projects = computeProjectScore(enrichedData);
  const experience = computeExperienceScore(enrichedData);
  const overall = computeOverallScore({ skills, projects, experience });

  console.info(
    `[ScoringEngine] Computed scores — skills: ${skills}, projects: ${projects}, experience: ${experience}, overall: ${overall}`,
  );

  return { skills, projects, experience, overall };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}
