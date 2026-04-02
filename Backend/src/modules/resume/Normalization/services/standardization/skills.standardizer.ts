import { SkillMapper } from "../../mappers/skill.mapper";
import { ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";

const skillMapper = new SkillMapper();

/**
 * Standardizes skills using SkillMapper
 * Converts canonical skills → standardized skills
 */
export function standardizeSkills(
  skills: CanonicalResume["skills"],
): ResumeStructuredData["skills"] {
  return {
    technical: standardizeArray(skills.technical),
    soft: standardizeArray(skills.soft),
    tools: standardizeArray(skills.tools),
    frameworks: standardizeArray(skills.frameworks),
    languages: standardizeArray(skills.languages),
  };
}

/**
 * Helper to standardize a single skill array
 */
function standardizeArray(input?: string[]): string[] {
  if (!input || !Array.isArray(input)) return [];  // return empty array if input is missing or not an array

  // Step 1: Apply mapper (standardization)
  const mapped = skillMapper.normalizeBulk(input);

  // Step 2: Remove empty values (safety)
  const cleaned = mapped.filter(Boolean);

  // Step 3: Deduplicate again (important after mapping)
  return Array.from(new Set(cleaned));
}