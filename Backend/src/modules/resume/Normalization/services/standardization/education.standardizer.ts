import { Education } from "../../types/normalizedResume";
import { ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";

/**
 * Education Standardizer
 * Handles:
 * - Institution and field name casing (Title Case)
 * - Year formatting
 * - Degree name consistency
 * - Default values
 */

export function standardizeEducation(
  education: CanonicalResume["education"],
): ResumeStructuredData["education"] {
  // Convert to Title Case for names
  const toTitleCase = (value?: string | null): string | null => {
    if (!value) return null;
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format year to 4-digit string
  const formatYear = (year?: string | null): string | null => {
    if (!year) return null;

    // If already 4 digits, return as is
    if (/^\d{4}$/.test(year)) {
      return year;
    }

    // Try to parse and format
    const parsed = parseInt(year);
    if (!isNaN(parsed) && parsed >= 1950 && parsed <= 2030) {
      return parsed.toString();
    }

    return null;
  };

  // Normalize degree names for consistency
  const normalizeDegree = (degree?: string | null): string | null => {
    if (!degree) return null;

    // Common degree name mappings
    const degreeMappings: Record<string, string> = {
      "b.tech": "B.Tech",
      "btech": "B.Tech",
      "m.tech": "M.Tech",
      "mtech": "M.Tech",
      "b.e": "B.E",
      "be": "B.E",
      "m.e": "M.E",
      "me": "M.E",
      "b.sc": "B.Sc",
      "bsc": "B.Sc",
      "m.sc": "M.Sc",
      "msc": "M.Sc",
      "b.com": "B.Com",
      "bcom": "B.Com",
      "m.com": "M.Com",
      "mcom": "M.Com",
      "b.a": "B.A",
      "ba": "B.A",
      "m.a": "M.A",
      "ma": "M.A",
      "bachelor of technology": "B.Tech",
      "master of technology": "M.Tech",
      "bachelor of engineering": "B.E",
      "master of engineering": "M.E",
      "bachelor of science": "B.Sc",
      "master of science": "M.Sc",
      "bachelor of commerce": "B.Com",
      "master of commerce": "M.Com",
      "bachelor of arts": "B.A",
      "master of arts": "M.A",
    };

    const lowerDegree = degree.toLowerCase().trim();
    return degreeMappings[lowerDegree] || toTitleCase(degree);
  };

  return education.map((edu: Education) => ({
    level: edu.level,
    degree: normalizeDegree(edu.degree),
    fieldOfStudy: toTitleCase(edu.fieldOfStudy),
    institution: toTitleCase(edu.institution),
    board: toTitleCase(edu.board),
    startYear: formatYear(edu.startYear),
    endYear: formatYear(edu.endYear),
    grade: edu.grade, // Keep grade as-is, might be standardized in enrichment
  }));
}