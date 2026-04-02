import { Project } from "../../types/normalizedResume";
import { SkillMapper } from "../../mappers/skill.mapper";
import { sanitizeArray } from "../sanitization.service";
import { normalizeUrl } from "../../helpers/canonicalization.helper";

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

  // Helper → clean string fields
  const cleanString = (value: any): string | null => {
    if (!value) return null;
    return value.toString().trim().replace(/\s+/g, " ");
  };

  // Helper → normalize URL fields
  const normalizeUrlField = (url: any, type: string): string | null => {
    if (!url) return null;
    return normalizeUrl(url, type);
  };

  // Helper → normalize technologies using SkillMapper
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

  // Helper → normalize generic string arrays
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
        github: normalizeUrlField(proj?.github, "github"),
        live: normalizeUrlField(proj?.live, "portfolio"),

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
