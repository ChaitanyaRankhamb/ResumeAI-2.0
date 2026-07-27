import { normalizeUrl } from "../../helpers/canonicalization.helper";
import { SkillMapper } from "../../mappers/skill.mapper";
import { Project } from "../../types/normalizedResume";
import { sanitizeArray } from "../sanitization.service";

/**
 * Projects Canonicalizer
 * Handles normalization of project data
 */

/**
 * Canonicalizes projects data:
 * - Cleans project names and descriptions
 * - Normalizes URLs for GitHub and live links
 * - Deduplicates technologies and highlights
 * - Ensures consistent formatting
 * @param projects - Raw projects array from resume
 * @returns Array of cleaned and normalized project entries
 */
export function canonicalizeProjects(projects: any): Project[] {
  const skillMapper = new SkillMapper();

  const sanitized = sanitizeArray(projects);

  // Helper â†’ clean string fields
  const cleanString = (value: any): string | null => {
    if (!value) return null;
    return value.toString().trim().replace(/\s+/g, " ");
  };

  // Helper â†’ normalize URL fields
  const normalizeUrlField = (url: any): string | null => {
    if (!url) return null;
    return normalizeUrl(url);
  };

  // Helper â†’ normalize technologies using SkillMapper
  const normalizeTechnologies = (technologies: any): string[] => {
    return Array.from(
      new Set(
        skillMapper
          .normalizeBulk(sanitizeArray(technologies || []))
          .filter(Boolean)
          .map((tech) => tech.toLowerCase().trim()),
      ),
    );
  };

  // Helper â†’ normalize generic string arrays
  const normalizeArray = (input: any): string[] => {
    return Array.from(
      new Set(
        sanitizeArray(input || [])
          .filter(Boolean)
          .map((item) => item.toString().toLowerCase().trim()),
      ),
    );
  };

  return (
    sanitized
      .map((proj: any) => ({
        // Clean basic fields
        name: cleanString(proj?.name),
        description: cleanString(proj?.description),

        // Normalize URLs
        github: normalizeUrlField(proj?.github),
        live: normalizeUrlField(proj?.live),

        // Normalize arrays using SkillMapper for technologies
        technologies: normalizeTechnologies(proj?.technologies),

        // Normalize highlights
        highlights: normalizeArray(proj?.highlights),
      }))

      // Remove completely useless entries
      .filter(
        (proj) =>
          proj.name ||
          proj.description ||
          proj.technologies.length > 0 ||
          proj.highlights.length > 0,
      )
  );
}
