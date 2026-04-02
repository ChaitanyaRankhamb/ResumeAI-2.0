import { Experience } from "../../types/normalizedResume";
import { ResumeStructuredData } from "../../types/normalizedResume";
import { SkillMapper } from "../../mappers/skill.mapper";
import { CanonicalResume } from "../canonicalization.service";

/**
 * Experience Standardizer
 * Handles:
 * - Date normalization
 * - Skill normalization (SkillMapper)
 * - Consistent casing
 * - Default values
 */

export function standardizeExperience(
  experience: CanonicalResume["experience"],
): ResumeStructuredData["experience"] {
  const skillMapper = new SkillMapper();

  // Convert string → ISO date (YYYY-MM) or null
  const normalizeDate = (date?: string | null): string | null => {
    if (!date) return null; // if not provided, return null

    const parsed = new Date(date); // attempt to parse date

    if (isNaN(parsed.getTime())) return null; // if invalid date, return null

    // Format as YYYY-MM (2026-04)
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
  };

  // Convert to Title Case
  const toTitleCase = (value?: string | null): string | null => {
    if (!value) return null;
    return value
      .toLowerCase() // convert to lowercase first for consistency
      .split(" ")  // split into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join(" "); // join back into a string  
  };

  return experience.map((exp: Experience) => {
    const start = normalizeDate(exp.startDate);
    const end = normalizeDate(exp.endDate);

    return {
      company: toTitleCase(exp.company),
      role: toTitleCase(exp.role),

      startDate: start,
      endDate: end,

      // If duration missing → simple fallback
      duration:
        exp.duration ||
        (start && end
          ? `${start} to ${end}`
          : null),

      description: exp.description || [],

      // Skill normalization happens HERE
      technologies: Array.from(
        new Set(
          skillMapper
            .normalizeBulk(exp.technologies || [])
            .filter(Boolean)
        )
      ),

      achievements: exp.achievements || [],
    };
  });
}