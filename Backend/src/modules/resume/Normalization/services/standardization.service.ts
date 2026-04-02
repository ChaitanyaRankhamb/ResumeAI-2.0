import {
  ResumeStructuredData,
  Experience,
  Project,
  Education,
  Certification,
} from "../types/normalizedResume";
import { CanonicalResume } from "./canonicalization.service";
import { standardizeIdentity } from "./standardization/identity.standardizer";
import { standardizeExperience } from "./standardization/experience.standardizer";
import { standardizeSkills } from "./standardization/skills.standardizer";
import { standardizeProjects } from "./standardization/projects.standardizer";
import { standardizeEducation } from "./standardization/education.standardizer";
import { standardizeCertifications } from "./standardization/certifications.standardizer";
import { standardizeExtras } from "./standardization/extras.standardizer";

/**
 * Standardization Service
 * Formats data into strict schema with consistent structure
 * Orchestrates all sub-standardizers for complete resume standardization
 */

/**
 * Standardizes canonical resume data into strict ResumeStructuredData schema
 * @param canonicalResume - Canonical resume data
 * @returns Standardized resume
 */
export function standardizeResume(
  canonicalResume: CanonicalResume,
): ResumeStructuredData {
  return {
    identity: standardizeIdentity(canonicalResume.identity),
    summary: canonicalResume.summary,
    skills: standardizeSkills(canonicalResume.skills),
    experience: standardizeExperience(canonicalResume.experience),
    projects: standardizeProjects(canonicalResume.projects),
    education: standardizeEducation(canonicalResume.education),
    certifications: standardizeCertifications(canonicalResume.certifications),
    achievements: canonicalResume.achievements || [],
    extras: standardizeExtras(canonicalResume.extras),
  };
}
