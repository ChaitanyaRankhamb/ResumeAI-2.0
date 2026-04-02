import { Certification } from "../../types/normalizedResume";
import { ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";

/**
 * Certifications Standardizer
 * Handles:
 * - Name and issuer casing (Title Case)
 * - Issue date formatting
 * - Default values
 */

export function standardizeCertifications(
  certifications: CanonicalResume["certifications"],
): ResumeStructuredData["certifications"] {
  // Convert to Title Case for names
  const toTitleCase = (value?: string | null): string | null => {
    if (!value) return null;
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format date to ISO string (YYYY-MM-DD) or null
  const formatDate = (date?: string | null): string | null => {
    if (!date) return null;

    // Try to parse the date
    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) return null;

    // Format as YYYY-MM-DD
    return parsed.toISOString().split("T")[0];
  };

  return certifications.map((cert: Certification) => ({
    name: toTitleCase(cert.name),
    issuer: toTitleCase(cert.issuer),
    issueDate: formatDate(cert.issueDate),
  }));
}
