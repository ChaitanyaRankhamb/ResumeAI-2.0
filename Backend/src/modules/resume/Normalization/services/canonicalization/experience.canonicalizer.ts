import { Experience } from "../../types/normalizedResume";
import { sanitizeArray } from "../sanitization.service";

/**
 * Experience Canonicalizer
 * ONLY handles:
 * - Cleaning strings
 * - Removing invalid values
 * - Deduplication
 * - Basic normalization (trim, lowercase)
 * 
 * DOES NOT:
 * - Map skills (SkillMapper removed)
 * - Standardize dates (handled later)
 */
export function canonicalizeExperience(experience: any): Experience[] {
  const sanitized = sanitizeArray(experience);

  // Helper → clean string fields
  const cleanString = (value: any): string | null => {
    if (!value) return null;
    return value.toString().trim().replace(/\s+/g, " ");
  };

  // Helper → normalize string arrays
  const normalizeArray = (input: any): string[] => {
    return Array.from(
      new Set(
        sanitizeArray(input || [])
          .filter(Boolean)
          .map((item) => item.toString().toLowerCase().trim())
      )
    );
  };

  return sanitized
    .map((exp: any) => ({
      company: cleanString(exp?.company),
      role: cleanString(exp?.role),

      // Dates untouched (standardization layer responsibility)
      startDate: cleanString(exp?.startDate),
      endDate: cleanString(exp?.endDate),

      duration: cleanString(exp?.duration),

      description: normalizeArray(exp?.description),

      // NO SkillMapper here → just clean raw values
      technologies: normalizeArray(exp?.technologies),

      achievements: normalizeArray(exp?.achievements),
    }))
    .filter(
      (exp) =>
        exp.company ||
        exp.role ||
        exp.description.length > 0 ||
        exp.technologies.length > 0 ||
        exp.achievements.length > 0
    );
}