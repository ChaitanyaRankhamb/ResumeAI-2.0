import { ResumeStructuredData } from "../../types/normalizedResume";
import {
  normalizeLanguageProficiency,
  categorizeInterests,
} from "../../helpers/enrich.helpers";

/**
 * Extras Enrichment Service
 * Handles:
 * - Language proficiency normalization
 * - Interest categorization
 * - Duplicate removal across all extra fields
 * - Professional relevance scoring
 */
export function enrichExtras(
  extras: ResumeStructuredData["extras"],
): ResumeStructuredData["extras"] & {
  languageProficiencies?: Array<{
    language: string;
    proficiency: string;
    score: number;
  }>;
  categorizedInterests?: {
    technical: string[];
    creative: string[];
    professional: string[];
    personal: string[];
  };
  professionalRelevanceScore?: number;
} {
  // Normalize language proficiencies
  const languageProficiencies =
    extras.languagesSpoken?.map((lang) => {
      // Assume format like "English - Fluent" or just "English"
      const parts = lang.split("-").map((s) => s.trim());
      const language = parts[0];
      const proficiency = parts[1] || null;

      const normalizedProficiency = normalizeLanguageProficiency(proficiency);
      const score = getProficiencyScore(normalizedProficiency);

      return {
        language,
        proficiency: normalizedProficiency,
        score,
      };
    }) || [];

  // Categorize interests
  const categorizedInterests = categorizeInterests(extras.interests || []);

  // Calculate professional relevance score
  const professionalRelevanceScore = calculateProfessionalRelevance(
    languageProficiencies,
    categorizedInterests,
    extras.volunteering || [],
  );

  return {
    // Remove duplicates from original fields
    languagesSpoken: Array.from(new Set(extras.languagesSpoken || [])),
    interests: Array.from(new Set(extras.interests || [])),
    volunteering: Array.from(new Set(extras.volunteering || [])),

    // Add enriched data
    languageProficiencies,
    categorizedInterests,
    professionalRelevanceScore,
  };
}

/**
 * Get numerical score for language proficiency
 * @param proficiency - Normalized proficiency level
 * @returns Score from 1-5
 */
function getProficiencyScore(proficiency: string): number {
  switch (proficiency.toLowerCase()) {
    case "native":
      return 5;
    case "fluent":
      return 4;
    case "intermediate":
      return 3;
    case "basic":
      return 2;
    default:
      return 1;
  }
}

/**
 * Calculate professional relevance score for extras
 * @param languages - Language proficiencies with scores
 * @param interests - Categorized interests
 * @param volunteering - Volunteering activities
 * @returns Relevance score (0-100)
 */
function calculateProfessionalRelevance(
  languages: Array<{ language: string; proficiency: string; score: number }>,
  interests: {
    technical: string[];
    creative: string[];
    professional: string[];
    personal: string[];
  },
  volunteering: string[],
): number {
  let score = 0;

  // Language skills (max 30 points)
  const avgLanguageScore =
    languages.length > 0
      ? languages.reduce((sum, lang) => sum + lang.score, 0) / languages.length
      : 0;
  score += (avgLanguageScore / 5) * 30;

  // Technical interests (max 25 points)
  score += Math.min(interests.technical.length * 5, 25);

  // Professional interests (max 20 points)
  score += Math.min(interests.professional.length * 10, 20);

  // Volunteering activities (max 15 points)
  const relevantVolunteering = volunteering.filter(
    (activity) =>
      activity.toLowerCase().includes("mentor") ||
      activity.toLowerCase().includes("tech") ||
      activity.toLowerCase().includes("community"),
  ).length;
  score += Math.min(relevantVolunteering * 5, 15);

  // Creative interests (max 10 points)
  score += Math.min(interests.creative.length * 2, 10);

  return Math.round(Math.min(score, 100));
}
