import { sanitizeArray } from "./sanitization.service";
import { ResumeStructuredData } from "../types/normalizedResume";

// Import sub-canonicalizers
import {
  canonicalizeIdentity,
  canonicalizeSkills,
  canonicalizeExperience,
  canonicalizeProjects,
  canonicalizeEducation,
  canonicalizeCertifications,
  canonicalizeExtras,
} from "./canonicalization";

/**
 * Canonicalization Service
 * Converts data into consistent internal representation
 * Orchestrates all sub-canonicalizers for complete resume normalization
 */

export type CanonicalResume = ResumeStructuredData;

/**
 * Canonicalizes raw resume data into consistent internal representation
 * @param rawResume - Raw resume data from any source
 * @returns Fully canonicalized resume with normalized fields
 */
export function canonicalizeResume(rawResume: any): CanonicalResume {
  // Helper → clean summary text
  const cleanSummary = (summary: any): string | null => {
    if (!summary) return null;

    const cleaned = summary.toString().trim().replace(/\s+/g, " ");

    // Return null if summary is too short or just whitespace
    return cleaned.length < 10 ? null : cleaned;
  };

  // Helper → normalize achievements array
  const normalizeAchievements = (achievements: any): string[] => {
    return Array.from(
      new Set(
        sanitizeArray(achievements || [])
          .filter(Boolean)
          .map((achievement) => achievement.toString().trim())
          .filter((achievement) => achievement.length > 0),
      ),
    );
  };

  return {
    // Identity information (name, email, phone, etc.)
    identity: canonicalizeIdentity(rawResume?.identity),

    // Professional summary (cleaned and validated)
    summary: cleanSummary(rawResume?.summary),

    // Skills across all categories (technical, soft, tools, frameworks, languages)
    skills: canonicalizeSkills(rawResume?.skills),

    // Work experience (multiple companies/roles)
    experience: canonicalizeExperience(rawResume?.experience),

    // Personal/academic projects
    projects: canonicalizeProjects(rawResume?.projects),

    // Educational background
    education: canonicalizeEducation(rawResume?.education),

    // Professional certifications
    certifications: canonicalizeCertifications(rawResume?.certifications),

    // Key achievements and accomplishments
    achievements: normalizeAchievements(rawResume?.achievements),

    // Additional information (languages, interests, volunteering)
    extras: canonicalizeExtras(rawResume?.extras),
  };
}
