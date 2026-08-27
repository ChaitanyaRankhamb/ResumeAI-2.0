import {
  calculateDuration,
  calculateProjectComplexity,
  categorizeInterests,
  detectDomains,
  detectExperienceType,
  detectRoleLevel,
  extractProjectSkills,
  formatDuration,
  normalizeLanguageProficiency,
  validateCertificationExpiry,
} from "./helpers/enrich.helpers";
import { normalizeDegree } from "./mappers/degree.mapper";
import { SkillMapper } from "./mappers/skill.mapper";
import {
  EnrichedResumeData,
  ResumeStructuredData,
} from "./types/normalizedResume";

export interface UnifiedPipelineResponse {
  success: boolean;
  message: string;
  data?: EnrichedResumeData;
}

const skillMapper = new SkillMapper();

/**
 * Classifies a project's type based on its technologies and highlights
 */
function classifyProjectType(technologies: string[], highlights: string[]): string {
  const text = `${technologies.join(" ")} ${highlights.join(" ")}`.toLowerCase();

  if (/(react|angular|vue|html|css|javascript|next|frontend)/.test(text)) {
    return "Web Application";
  }
  if (/(react native|flutter|ios|android|swift|kotlin|mobile)/.test(text)) {
    return "Mobile Application";
  }
  if (/(node|express|api|backend|spring|django|flask|fastapi|postgres|mongo)/.test(text)) {
    return "Backend/API";
  }
  if (/(python|machine learning|deep learning|ai|tensorflow|pytorch|pandas|nlp)/.test(text)) {
    return "Data/AI";
  }
  if (/(docker|kubernetes|aws|gcp|azure|terraform|ci\/cd|devops)/.test(text)) {
    return "DevOps/Infrastructure";
  }

  return "Software Project";
}

/**
 * Unified Single-Pass Resume Normalizer
 * Performs sanitization, canonical mapping, standardization, and enrichment
 * in a single, high-performance pass without multi-layered object cloning.
 */
export function normalizeAndEnrichResume(raw: ResumeStructuredData): EnrichedResumeData {
  // ── 1. Skills: Normalize names via canonical mapper & compute enriched intelligence ──
  const normalizedTechnical = skillMapper.normalizeBulk(raw.skills?.technical || []);
  const normalizedTools = skillMapper.normalizeBulk(raw.skills?.tools || []);
  const normalizedFrameworks = skillMapper.normalizeBulk(raw.skills?.frameworks || []);
  const normalizedSoft = Array.from(new Set((raw.skills?.soft || []).map((s) => s.trim()).filter(Boolean)));
  const normalizedLanguages = Array.from(new Set((raw.skills?.languages || []).map((l) => l.trim()).filter(Boolean)));

  const normalizedSkills = {
    technical: normalizedTechnical,
    soft: normalizedSoft,
    tools: normalizedTools,
    frameworks: normalizedFrameworks,
    languages: normalizedLanguages,
  };

  const allSkillsList = [
    ...normalizedTechnical,
    ...normalizedFrameworks,
    ...normalizedTools,
    ...normalizedLanguages,
    ...normalizedSoft,
  ];

  const enrichedSkills = {
    totalSkills: allSkillsList.length,
    categoryStrength: {
      technical: normalizedTechnical.length,
      soft: normalizedSoft.length,
      tools: normalizedTools.length,
      frameworks: normalizedFrameworks.length,
      languages: normalizedLanguages.length,
    },
    primarySkills: [...normalizedFrameworks, ...normalizedTechnical].slice(0, 5),
    domains: detectDomains(allSkillsList),
  };

  // ── 2. Experience: Clean dates, calculate durations & detect seniority ──
  const normalizedExperience = (raw.experience || []).map((exp) => {
    const startDate = exp?.startDate?.trim() || null;
    const endDate = exp?.endDate?.trim() || null;
    const role = exp?.role?.trim() || null;
    const technologies = skillMapper.normalizeBulk(exp?.technologies || []);

    let durationInMonths: number | null = null;
    if (startDate && endDate) {
      const months = calculateDuration(startDate, endDate);
      durationInMonths = months > 0 ? months : null;
    }

    return {
      company: exp?.company?.trim() || null,
      role,
      startDate,
      endDate,
      duration: durationInMonths ? formatDuration(durationInMonths) : exp?.duration?.trim() || null,
      durationInMonths,
      description: (exp?.description || []).map((d) => d.trim()).filter(Boolean),
      technologies,
      achievements: (exp?.achievements || []).map((a) => a.trim()).filter(Boolean),
      roleLevel: role ? detectRoleLevel(role) : "Mid",
      domains: detectDomains(technologies),
      techStack: technologies.join(", "),
      type: role ? detectExperienceType(role) : "Development",
    };
  });

  const enrichedExperience = normalizedExperience.map((exp) => ({
    duration: exp.duration,
    durationInMonths: exp.durationInMonths,
    roleLevel: exp.roleLevel,
    domains: exp.domains,
    techStack: exp.techStack,
    type: exp.type,
  }));

  // ── 3. Projects: Deduplicate tech, calculate complexity & extract skills ──
  const normalizedProjects = (raw.projects || []).map((proj) => {
    const technologies = skillMapper.normalizeBulk(proj?.technologies || []);
    const highlights = (proj?.highlights || []).map((h) => h.trim()).filter(Boolean);
    const description = proj?.description?.trim() || null;

    const complexityScore = calculateProjectComplexity(technologies, highlights);
    const extractedSkills = extractProjectSkills(description, highlights, technologies);
    const projectType = classifyProjectType(technologies, highlights);

    return {
      name: proj?.name?.trim() || null,
      description,
      technologies,
      github: proj?.github?.trim() || null,
      live: proj?.live?.trim() || null,
      highlights,
      complexityScore,
      extractedSkills,
      projectType,
      isValidTimeline: true,
      durationMonths: null,
    };
  });

  const enrichedProjects = normalizedProjects.map((proj) => ({
    complexityScore: proj.complexityScore,
    extractedSkills: proj.extractedSkills,
    projectType: proj.projectType,
    isValidTimeline: proj.isValidTimeline,
    durationMonths: proj.durationMonths,
  }));

  // ── 4. Education: Map canonical degrees & study durations ──
  const normalizedEducation = (raw.education || []).map((edu) => {
    const rawDegree = edu?.degree?.trim() || null;
    const canonicalDegree = rawDegree ? normalizeDegree(rawDegree) : null;
    const startYear = parseInt(edu?.startYear || "0", 10);
    const endYear = parseInt(edu?.endYear || "0", 10);
    const durationInYears = startYear && endYear && endYear >= startYear ? endYear - startYear : null;

    return {
      level: edu?.level || null,
      degree: canonicalDegree || rawDegree,
      fieldOfStudy: edu?.fieldOfStudy?.trim() || null,
      institution: edu?.institution?.trim() || null,
      board: edu?.board?.trim() || null,
      startYear: edu?.startYear?.trim() || null,
      endYear: edu?.endYear?.trim() || null,
      grade: edu?.grade?.trim() || null,
      durationInYears,
      isCurrentlyStudying: !edu?.endYear || edu.endYear.toLowerCase().includes("present"),
      degreeLevel: edu?.level || null,
    };
  });

  const enrichedEducation = normalizedEducation.map((edu) => ({
    durationInYears: edu.durationInYears,
    isCurrentlyStudying: edu.isCurrentlyStudying,
    degreeLevel: edu.degreeLevel,
    normalizedGPA: null,
    academicScoreBand: null,
    hasLowGPA: false,
  }));

  // ── 5. Certifications: Expiry & validation ──
  const normalizedCertifications = (raw.certifications || []).map((cert) => {
    const issueDate = cert?.issueDate?.trim() || null;
    const expiryStatus = validateCertificationExpiry(issueDate);

    return {
      name: cert?.name?.trim() || null,
      issuer: cert?.issuer?.trim() || null,
      issueDate,
      expiryStatus,
      credibilityScore: 7,
      isDuplicate: false,
    };
  });

  const enrichedCertifications = normalizedCertifications.map((cert) => ({
    expiryStatus: cert.expiryStatus,
    credibilityScore: cert.credibilityScore,
    isDuplicate: cert.isDuplicate,
  }));

  // ── 6. Extras: Categorized interests & languages ──
  const languagesSpoken = (raw.extras?.languagesSpoken || []).map((l) => l.trim()).filter(Boolean);
  const interests = (raw.extras?.interests || []).map((i) => i.trim()).filter(Boolean);
  const volunteering = (raw.extras?.volunteering || []).map((v) => v.trim()).filter(Boolean);

  const enrichedExtras = {
    languageProficiencies: languagesSpoken.map((lang) => ({
      language: lang,
      proficiency: normalizeLanguageProficiency(lang),
      score: 8,
    })),
    categorizedInterests: categorizeInterests(interests),
    professionalRelevanceScore: 7,
  };

  // ── Final Normalized & Enriched Resume Object ──
  return {
    identity: {
      name: raw.identity?.name?.trim() || null,
      email: raw.identity?.email?.trim() || null,
      phone: raw.identity?.phone?.trim() || null,
      location: raw.identity?.location?.trim() || null,
      linkedin: raw.identity?.linkedin?.trim() || null,
      github: raw.identity?.github?.trim() || null,
      portfolio: raw.identity?.portfolio?.trim() || null,
    },
    summary: raw.summary?.trim() || null,
    skills: normalizedSkills,
    experience: normalizedExperience.map(({ roleLevel, domains, techStack, type, ...rest }) => rest),
    projects: normalizedProjects.map(({ complexityScore, extractedSkills, projectType, isValidTimeline, durationMonths, ...rest }) => rest),
    education: normalizedEducation.map(({ durationInYears, isCurrentlyStudying, degreeLevel, ...rest }) => rest),
    certifications: normalizedCertifications.map(({ expiryStatus, credibilityScore, isDuplicate, ...rest }) => rest),
    achievements: Array.from(new Set((raw.achievements || []).map((a) => a.trim()).filter(Boolean))),
    extras: {
      languagesSpoken,
      interests,
      volunteering,
    },

    // Enriched intelligence blocks for Scoring Engine & AI Insights
    enrichedSkills,
    enrichedExperience,
    enrichedProjects,
    enrichedEducation,
    enrichedCertifications,
    enrichedExtras,
  };
}

/**
 * Entry point wrapper matching the PipelineResponse signature
 */
export async function processResumeUnified(
  rawResume: ResumeStructuredData,
): Promise<UnifiedPipelineResponse> {
  try {
    if (!rawResume) {
      return {
        success: false,
        message: "Invalid input: Resume data is required",
      };
    }

    const normalizedData = normalizeAndEnrichResume(rawResume);

    return {
      success: true,
      message: "Resume normalized and enriched successfully (Unified Single-Pass)",
      data: normalizedData,
    };
  } catch (error: any) {
    console.error("[UNIFIED_NORMALIZER] Normalization error:", error);
    return {
      success: false,
      message: `Unified normalization failed: ${error?.message || error}`,
    };
  }
}
