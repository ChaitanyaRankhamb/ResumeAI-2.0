import { Extras } from "../../types/normalizedResume";
import { ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";

/**
 * Extras Standardizer
 * Handles:
 * - Language name casing consistency
 * - Interest and volunteering activity casing
 * - Array deduplication and sorting
 * - Default empty arrays
 */

export function standardizeExtras(
  extras: CanonicalResume["extras"],
): ResumeStructuredData["extras"] {
  // Convert to Title Case for proper nouns
  const toTitleCase = (value: string): string => {
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Normalize language names for consistency
  const normalizeLanguage = (language: string): string => {
    const langMappings: Record<string, string> = {
      "english": "English",
      "hindi": "Hindi",
      "spanish": "Spanish",
      "french": "French",
      "german": "German",
      "chinese": "Chinese",
      "japanese": "Japanese",
      "korean": "Korean",
      "arabic": "Arabic",
      "russian": "Russian",
      "portuguese": "Portuguese",
      "italian": "Italian",
      "dutch": "Dutch",
      "swedish": "Swedish",
      "norwegian": "Norwegian",
      "danish": "Danish",
      "finnish": "Finnish",
      "turkish": "Turkish",
      "greek": "Greek",
      "hebrew": "Hebrew",
      "tamil": "Tamil",
      "telugu": "Telugu",
      "kannada": "Kannada",
      "malayalam": "Malayalam",
      "bengali": "Bengali",
      "marathi": "Marathi",
      "gujarati": "Gujarati",
      "punjabi": "Punjabi",
      "urdu": "Urdu",
    };

    const lowerLang = language.toLowerCase().trim();
    return langMappings[lowerLang] || toTitleCase(language);
  };

  // Normalize interest/activity names
  const normalizeInterest = (interest: string): string => {
    // Common interest/activity mappings
    const interestMappings: Record<string, string> = {
      "reading books": "Reading",
      "playing sports": "Sports",
      "watching movies": "Movies",
      "listening to music": "Music",
      "traveling": "Travel",
      "photography": "Photography",
      "cooking": "Cooking",
      "gaming": "Gaming",
      "coding": "Programming",
      "open source": "Open Source",
      "volunteering": "Community Service",
      "teaching": "Teaching",
      "mentoring": "Mentoring",
      "writing": "Writing",
      "blogging": "Blogging",
      "painting": "Painting",
      "drawing": "Drawing",
      "dancing": "Dancing",
      "singing": "Singing",
    };

    const lowerInterest = interest.toLowerCase().trim();
    return interestMappings[lowerInterest] || toTitleCase(interest);
  };

  // Process array with deduplication and normalization
  const processArray = (
    items: string[],
    normalizer: (item: string) => string
  ): string[] => {
    return Array.from(new Set(items.map(normalizer))).sort();
  };

  return {
    languagesSpoken: processArray(extras.languagesSpoken || [], normalizeLanguage),
    interests: processArray(extras.interests || [], normalizeInterest),
    volunteering: processArray(extras.volunteering || [], toTitleCase),
  };
}