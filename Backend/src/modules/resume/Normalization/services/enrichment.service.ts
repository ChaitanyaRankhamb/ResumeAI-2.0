import {
  ResumeStructuredData,
  EnrichedResumeData,
} from "../types/normalizedResume";

// Import sub-enrichers
import {
  enrichSkills,
  enrichExperience,
  enrichProjects,
  enrichEducation,
  enrichCertifications,
  enrichExtras,
} from "./enrichment";

/**
 * Enrichment Service
 * Adds intelligence and enhancements to standardized resume data
 * Orchestrates all sub-enrichers for complete resume enrichment
 */

/**
 * Enriches standardized resume with additional intelligence
 * @param resume - The standardized resume to enrich
 * @returns Enriched resume with additional intelligence properties
 */
export function enrichResume(resume: ResumeStructuredData): EnrichedResumeData {
  // Get enriched data from sub-enrichers
  const enrichedSkillsData = enrichSkills(resume.skills);
  const enrichedExperienceData = enrichExperience(resume.experience);
  const enrichedProjectsData = enrichProjects(resume.projects);
  const enrichedEducationData = enrichEducation(resume.education);
  const enrichedCertificationsData = enrichCertifications(
    resume.certifications,
  );
  const enrichedExtrasData = enrichExtras(resume.extras);

  return {
    // Keep original normalized data intact
    identity: resume.identity,
    summary: resume.summary,
    skills: resume.skills, // Original skills data
    experience: resume.experience, // Original experience data
    projects: resume.projects, // Original projects data
    education: resume.education, // Original education data
    certifications: resume.certifications, // Original certifications data
    achievements: Array.from(new Set(resume.achievements)), // Remove duplicate achievements
    extras: resume.extras, // Original extras data

    // Add enriched intelligence data
    enrichedSkills: enrichedSkillsData,
    enrichedExperience: enrichedExperienceData,
    enrichedProjects: enrichedProjectsData,
    enrichedEducation: enrichedEducationData,
    enrichedCertifications: enrichedCertificationsData,
    enrichedExtras: enrichedExtrasData,
  };
}
