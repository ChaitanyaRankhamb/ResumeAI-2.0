import { SkillMapper } from "..";
import { sanitizeArray, sanitizeString } from "../services/sanitization.service";

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "+91");
}

// make it http to https and remove trailing slash
export function normalizeUrl(url: string, type?: string): string {
  let clean = url.trim().toLowerCase();

  if (!clean.startsWith("http")) {
    clean = "https://" + clean;
  }

  clean = clean.replace(/\/+$/, ""); // remove trailing /

  return clean;
}

export function normalizeLocation(location: string) {
  return location.trim();
}

export function normalizeEmail(email: string): string {
  return sanitizeString(email).toLowerCase();
}

// /normalization/services/canonicalization.service.ts

/**
 * Canonicalizes skill array
 * ONLY handles formatting consistency (NOT meaning)
 *
 * Responsibilities:
 * - Ensure valid array
 * - Remove invalid values
 * - Normalize casing
 * - Trim spaces
 * - Normalize separators (optional improvement)
 * - Deduplicate
 */
export function canonicalizeSkillArray(input: any): string[] {
  const cleaned = sanitizeArray(input || [])
    // Remove null, undefined, empty
    .filter(Boolean)

    // Convert everything to string (defensive)
    .map((s) => String(s))

    // Normalize format
    .map((s) =>
      s
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")     // collapse multiple spaces → single space
        .replace(/[-_]/g, " ")    // normalize separators (node-js → node js)
    )

    // Remove empty again after cleanup
    .filter(Boolean);

  // Deduplicate
  return Array.from(new Set(cleaned));  // use set to avoid duplicates and then convert back to array
}