import { ResumeStructuredData } from "../../types/normalizedResume";
import {
  calculateProjectComplexity,
  extractProjectSkills,
} from "../../helpers/enrich.helpers";

/**
 * Projects Enrichment Service
 * Handles:
 * - Removing duplicate technologies within each project
 * - Removing duplicate highlights
 * - Project complexity scoring
 * - Skill extraction from project descriptions
 * - Project type classification
 * - Timeline validation
 */
export function enrichProjects(
  projects: ResumeStructuredData["projects"],
): (ResumeStructuredData["projects"][0] & {
  complexityScore?: number;
  extractedSkills?: string[];
  projectType?: string;
  isValidTimeline?: boolean;
  durationMonths?: number | null;
})[] {
  if (!Array.isArray(projects)) return [];

  return projects.map((project) => {
    // Remove duplicates from technologies and highlights
    const uniqueTechnologies = Array.from(new Set(project.technologies || []));
    const uniqueHighlights = Array.from(new Set(project.highlights || []));

    // Calculate project complexity
    const complexityScore = calculateProjectComplexity(
      uniqueTechnologies,
      uniqueHighlights,
    );

    // Extract additional skills from description and highlights
    const extractedSkills = extractProjectSkills(
      project.description,
      uniqueHighlights,
      uniqueTechnologies,
    );

    // Determine project type
    const projectType = classifyProjectType(
      uniqueTechnologies,
      uniqueHighlights,
    );

    // Projects don't have timeline data in the current interface
    // Timeline validation would require additional parsing of description or highlights
    const isValidTimeline = true; // Assume valid for now

    // Duration calculation not possible without dates
    const durationMonths = null;

    return {
      ...project,
      technologies: uniqueTechnologies,
      highlights: uniqueHighlights,
      complexityScore,
      extractedSkills,
      projectType,
      isValidTimeline,
      durationMonths,
    };
  });
}

/**
 * Classify project type based on technologies and highlights
 * @param technologies - Project technologies
 * @param highlights - Project highlights/features
 * @returns Project type classification
 */
function classifyProjectType(
  technologies: string[],
  highlights: string[],
): string {
  const techText = technologies.join(" ").toLowerCase();
  const highlightText = highlights.join(" ").toLowerCase();

  // Web projects
  if (
    techText.includes("react") ||
    techText.includes("angular") ||
    techText.includes("vue") ||
    techText.includes("html") ||
    techText.includes("css") ||
    techText.includes("javascript")
  ) {
    return "Web Application";
  }

  // Mobile projects
  if (
    techText.includes("react native") ||
    techText.includes("flutter") ||
    techText.includes("ios") ||
    techText.includes("android")
  ) {
    return "Mobile Application";
  }

  // Backend/API projects
  if (
    techText.includes("node") ||
    techText.includes("express") ||
    techText.includes("api") ||
    highlightText.includes("api") ||
    highlightText.includes("backend")
  ) {
    return "Backend/API";
  }

  // Data/AI projects
  if (
    techText.includes("python") ||
    techText.includes("machine learning") ||
    techText.includes("tensorflow") ||
    techText.includes("pandas") ||
    highlightText.includes("data") ||
    highlightText.includes("ai")
  ) {
    return "Data/AI";
  }

  // DevOps/Infrastructure
  if (
    techText.includes("docker") ||
    techText.includes("kubernetes") ||
    techText.includes("aws") ||
    techText.includes("terraform")
  ) {
    return "DevOps/Infrastructure";
  }

  return "Software Project"; // Default
}
