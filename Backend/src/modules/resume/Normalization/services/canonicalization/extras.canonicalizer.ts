import { Extras } from "../../types/normalizedResume";
import { sanitizeArray } from "../sanitization.service";

/**
 * Extras Canonicalizer
 * Handles normalization of additional resume information
 */

/**
 * Canonicalizes extras data:
 * - Normalizes languages spoken
 * - Cleans and deduplicates interests
 * - Cleans and deduplicates volunteering activities
 * - Ensures consistent formatting across all arrays
 * @param extras - Raw extras object from resume
 * @returns Cleaned and normalized extras object
 */
export function canonicalizeExtras(extras: any): Extras {
  // Helper → normalize generic string arrays with deduplication
  const normalizeStringArray = (input: any): string[] => {
    return Array.from(
      new Set(
        sanitizeArray(input || [])
          .filter(Boolean) // Remove null/undefined/empty
          .map((item) => item.toString().toLowerCase().trim()) // Normalize
          .filter((item) => item.length > 0), // Remove empty strings after trimming
      ),
    );
  };

  return {
    // Languages spoken (normalized and deduplicated)
    languagesSpoken: normalizeStringArray(extras?.languagesSpoken),

    // Personal interests (normalized and deduplicated)
    interests: normalizeStringArray(extras?.interests),

    // Volunteering activities (normalized and deduplicated)
    volunteering: normalizeStringArray(extras?.volunteering),
  };
}
