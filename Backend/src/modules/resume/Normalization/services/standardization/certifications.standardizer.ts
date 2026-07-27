import { Certification, ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";
import { formatResumeMonth, formatResumeYear } from "../../helpers/date.helper";

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
  const toDisplayCase = (value?: string | null): string | null => {
    if (!value) return null;
    return value
      .split(" ")
      .map((word) => {
        if (/[A-Z]{2,}|[a-z][A-Z]|\./.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const formatDate = (date?: string | null): string | null => {
    return formatResumeMonth(date) ?? formatResumeYear(date);
  };

  return certifications.map((cert: Certification) => ({
    name: toDisplayCase(cert.name),
    issuer: toDisplayCase(cert.issuer),
    issueDate: formatDate(cert.issueDate),
  }));
}
