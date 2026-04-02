import { ResumeStructuredData } from "../../types/normalizedResume";
import { detectDomains } from "../../helpers/enrich.helpers";

/**
 * Skills Enrichment
 * Handles:
 * - Domain Detection
 * - skill count (useful for resume scoring)
 * - category strength analysis
 * - primary skill extraction 
 * - skill tags and level 
 */
export function enrichSkills(
  skills: ResumeStructuredData["skills"],
): ResumeStructuredData["skills"] & {
  totalSkills: number;
  categoryStrength: Record<string, number>;
  primarySkills: string[];
  domains: string[];
} {
  const allSkills = [
  ...(skills.technical ?? []),
  ...(skills.soft ?? []),
  ...(skills.tools ?? []),
  ...(skills.frameworks ?? []),
  ...(skills.languages ?? []),
];

  /**
   * It stores the total number of skills mentioned in the resume
   */
  const totalSkills = allSkills.length;  // count of all skills

  //  Category Strength
  const categoryStrength = {
  technical: skills.technical?.length ?? 0,
  soft: skills.soft?.length ?? 0,
  tools: skills.tools?.length ?? 0,
  frameworks: skills.frameworks?.length ?? 0,
  languages: skills.languages?.length ?? 0,
};

  // Primary Skills (simple heuristic: technical + frameworks priority)
  const primarySkills = [
    ...skills.frameworks,
    ...skills.technical,
  ].slice(0, 5);

  // Domain Detection
  const domains = detectDomains(allSkills);

  return {
    ...skills,
    totalSkills,
    categoryStrength,
    primarySkills,
    domains,
  };
}