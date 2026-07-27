import { Education, ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";
import { formatResumeYear } from "../../helpers/date.helper";

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
  const toDisplayCase = (value?: string | null): string | null => {
    if (!value) return null;
    return value
      .split(" ")
      .map((word) => {
        if (/[A-Z]{2,}|[a-z][A-Z]|\./.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  // Format year to 4-digit string
  const formatYear = (year?: string | null): string | null => {
    return formatResumeYear(year);
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
    return degreeMappings[lowerDegree] || toDisplayCase(degree);
  };

  return education.map((edu: Education) => ({
    level: edu.level,
    degree: normalizeDegree(edu.degree),
    fieldOfStudy: toDisplayCase(edu.fieldOfStudy),
    institution: toDisplayCase(edu.institution),
    board: toDisplayCase(edu.board),
    startYear: formatYear(edu.startYear),
    endYear: formatYear(edu.endYear),
    grade: edu.grade, // Keep grade as-is, might be standardized in enrichment
  }));
}
