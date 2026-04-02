import {
  canonicalizeResume,
  CanonicalResume,
} from "../services/canonicalization.service";
import { standardizeResume } from "../services/standardization.service";
import { enrichResume } from "../services/enrichment.service";
import { ResumeStructuredData, EnrichedResumeData } from "../types/normalizedResume";

/**
 * Resume Normalizer
 * Orchestrates the complete normalization pipeline:
 * Raw Data → Sanitization → Canonicalization → Standardization → Enrichment → Normalized Resume
 */

/**
 * Normalizes raw resume data through the complete pipeline
 * @param rawResume - Raw resume data from any source
 * @returns Fully normalized and enriched resume
 */
export function normalizeResume(rawResume: any): EnrichedResumeData {
  // Step 1: Canonicalization (includes sanitization via mappers)
  const canonicalResume = canonicalizeResume(rawResume);

  // Step 2: Standardization (format canonicalized data)
  const standardizedResume = standardizeResume(canonicalResume);

  // Step 3: Enrichment (add intelligence to standardized data)
  const enrichedResume = enrichResume(standardizedResume);

  return enrichedResume; // it will return the normalized resume.
}
