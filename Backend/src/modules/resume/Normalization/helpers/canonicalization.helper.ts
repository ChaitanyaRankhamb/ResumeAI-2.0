import { sanitizeArray, sanitizeString } from "../services/sanitization.service";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhone(phone: string, defaultCountry: "IN" | "US" = "IN"): string | null {
  const cleaned = sanitizeString(phone, "", 80);
  if (!cleaned) return null;

  const parsed = parsePhoneNumberFromString(cleaned, defaultCountry);
  if (parsed?.isValid()) {
    return parsed.number;
  }

  return null;
}

// make it http to https and remove trailing slash
export function normalizeUrl(url: string): string | null {
  const raw = sanitizeString(url, "", 500);
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;

    parsed.protocol = "https:";
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = "";

    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function normalizeLocation(location: string) {
  return sanitizeString(location, "", 300) || null;
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
        .replace(/\s+/g, " ")     // collapse multiple spaces â†’ single space
        .replace(/[-_]/g, " ")    // normalize separators (node-js â†’ node js)
    )

    // Remove empty again after cleanup
    .filter(Boolean);

  // Deduplicate
  return Array.from(new Set(cleaned));  // use set to avoid duplicates and then convert back to array
}
