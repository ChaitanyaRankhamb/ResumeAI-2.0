import { Skills } from "../../types/normalizedResume";
import { SkillMapper } from "../../mappers/skill.mapper";
import { canonicalizeSkillArray } from "../../helpers/canonicalization.helper";

/**
 * Skills Canonicalizer
 * Handles normalization of all skill categories
 */

/**
 * Canonicalizes all skill categories using a reusable normalization pipeline:
 * - Technical skills (programming languages, core technologies)
 * - Soft skills (communication, leadership, etc.)
 * - Tools (Git, Docker, Jenkins, etc.)
 * - Frameworks (React, Spring Boot, etc.)
 * - Languages (spoken/programming languages)
 * @param skills - Raw skills object from structured resume data
 * @returns Fully normalized, deduplicated, and clean skills object
 */
export function canonicalizeSkills(skills: any): Skills {
  const skillMapper = new SkillMapper(); // Create an instance of SkillMapper to use for normalization

  return {
    // Technical skills (e.g., programming languages, core tech)
    technical: canonicalizeSkillArray(skills?.technical),

    // Soft skills (e.g., communication, leadership)
    soft: canonicalizeSkillArray(skills?.soft),

    // Tools (e.g., Git, Docker, Jenkins)
    tools: canonicalizeSkillArray(skills?.tools),

    // Frameworks (e.g., React, Spring Boot)
    frameworks: canonicalizeSkillArray(skills?.frameworks),

    // Spoken/programming languages (e.g., English, JavaScript)
    languages: canonicalizeSkillArray(skills?.languages),
  };
}
