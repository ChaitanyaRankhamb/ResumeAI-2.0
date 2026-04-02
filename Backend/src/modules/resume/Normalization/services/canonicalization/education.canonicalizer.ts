import { Education } from "../../types/normalizedResume";
import { normalizeDegree } from "../../mappers/degree.mapper";
import { sanitizeArray } from "../sanitization.service";

/**
 * Education Canonicalizer
 * Handles normalization of educational background data
 */

/**
 * Canonicalizes education data:
 * - Normalizes degree names using degree mapper
 * - Cleans institution and field names
 * - Validates education levels
 * - Ensures consistent year formatting
 * @param education - Raw education array from resume
 * @returns Array of cleaned and normalized education entries
 */
export function canonicalizeEducation(education: any): Education[] {
  const sanitized = sanitizeArray(education);

  // Helper → clean string fields
  const cleanString = (value: any): string | null => {
    if (!value) return null;
    return value.toString().trim().replace(/\s+/g, " ");
  };

  // Helper → validate and normalize education level
  const normalizeEducationLevel = (level: any): Education["level"] => {
    if (!level) return null;

    const validLevels: Education["level"][] = [
      "Secondary",
      "Higher Secondary",
      "Diploma",
      "Undergraduate",
      "Postgraduate",
      "PhD",
      "Other",
    ];

    const normalizedLevel = level.toString().trim();

    // Check if it's already a valid level
    if (validLevels.includes(normalizedLevel as any)) {
      return normalizedLevel as Education["level"];
    }

    // Try to map common variations
    const levelMappings: Record<string, Education["level"]> = {
      "secondary school": "Secondary",
      "high school": "Secondary",
      "higher secondary school": "Higher Secondary",
      "12th": "Higher Secondary",
      "10th": "Secondary",
      bachelor: "Undergraduate",
      "bachelor's": "Undergraduate",
      master: "Postgraduate",
      "master's": "Postgraduate",
      "ph.d.": "PhD",
      doctorate: "PhD",
    };

    return levelMappings[normalizedLevel.toLowerCase()] || "Other";
  };

  // Helper → normalize year fields (basic validation only)
  const normalizeYear = (year: any): string | null => {
    if (!year) return null;
    return year.toString().trim();
  };

  return (
    sanitized
      .map((edu: any) => ({
        // Normalize education level
        level: normalizeEducationLevel(edu?.level),

        // Normalize degree using degree mapper
        degree: edu?.degree ? normalizeDegree(edu.degree) : null,

        // Clean other string fields
        fieldOfStudy: cleanString(edu?.fieldOfStudy),
        institution: cleanString(edu?.institution),
        board: cleanString(edu?.board),

        // Normalize years
        startYear: normalizeYear(edu?.startYear),
        endYear: normalizeYear(edu?.endYear),

        // Clean grade
        grade: cleanString(edu?.grade),
      }))

      // Remove completely useless entries
      .filter(
        (edu) => edu.degree || edu.institution || edu.fieldOfStudy || edu.level,
      )
  );
}
