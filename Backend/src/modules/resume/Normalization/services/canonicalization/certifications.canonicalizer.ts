import { Certification } from "../../types/normalizedResume";
import { sanitizeArray } from "../sanitization.service";

/**
 * Certifications Canonicalizer
 * Handles normalization of certification data
 */

/**
 * Canonicalizes certifications data:
 * - Cleans certification names and issuer names
 * - Normalizes issue date fields
 * - Removes invalid or incomplete entries
 * @param certifications - Raw certifications array from resume
 * @returns Array of cleaned and normalized certification entries
 */
export function canonicalizeCertifications(
  certifications: any,
): Certification[] {
  const sanitized = sanitizeArray(certifications);

  // Helper → clean string fields
  const cleanString = (value: any): string | null => {
    if (!value) return null;
    return value.toString().trim().replace(/\s+/g, " ");
  };

  // Helper → normalize date fields (basic validation only)
  const normalizeDate = (date: any): string | null => {
    if (!date) return null;
    return date.toString().trim();
  };

  return (
    sanitized
      .map((cert: any) => ({
        // Clean certification name
        name: cleanString(cert?.name),

        // Clean issuer name
        issuer: cleanString(cert?.issuer),

        // Normalize issue date (check multiple possible field names)
        issueDate: normalizeDate(
          cert?.issueDate || cert?.date || cert?.issuedDate || cert?.year,
        ),
      }))

      // Remove completely useless entries
      .filter((cert) => cert.name || cert.issuer)
  );
}
