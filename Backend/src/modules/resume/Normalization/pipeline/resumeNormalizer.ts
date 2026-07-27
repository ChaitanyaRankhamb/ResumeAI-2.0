import {
  canonicalizeResume
} from "../services/canonicalization.service";
import { enrichResume } from "../services/enrichment.service";
import { sanitizeResume } from "../services/sanitization.service";
import { standardizeResume } from "../services/standardization.service";
import { EnrichedResumeData } from "../types/normalizedResume";

/**
 * Resume Normalizer
 * Orchestrates the complete normalization pipeline:
 * Raw Data â†’ Sanitization â†’ Canonicalization â†’ Standardization â†’ Enrichment â†’ Normalized Resume
 */

/**
 * Normalizes raw resume data through the complete pipeline
 * @param rawResume - Raw resume data from any source
 * @returns Fully normalized and enriched resume
 */
export function normalizeResume(rawResume: any): EnrichedResumeData {
  // Step 1: Sanitization protects the rest of the pipeline from unbounded
  // AI/user text and gives production logs/storage a predictable data shape.
  const sanitizedResume = sanitizeResume(rawResume);

  // Step 2: Canonicalization converts clean input into internal forms.
  const canonicalResume = canonicalizeResume(sanitizedResume);

  // Step 3: Standardization (format canonicalized data)
  const standardizedResume = standardizeResume(canonicalResume);

  // Step 4: Enrichment (add intelligence to standardized data)
  const enrichedResume = enrichResume(standardizedResume);

  return enrichedResume; // it will return the normalized resume.
}
