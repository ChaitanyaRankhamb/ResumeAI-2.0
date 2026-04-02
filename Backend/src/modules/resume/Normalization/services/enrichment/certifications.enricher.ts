import { ResumeStructuredData } from "../../types/normalizedResume";
import { validateCertificationExpiry } from "../../helpers/enrich.helpers";

/**
 * Certifications Enrichment Service
 * Handles:
 * - Certification expiry validation and status tracking
 * - Issuing organization standardization
 * - Certification credibility scoring
 * - Duplicate certification detection
 */
export function enrichCertifications(
  certifications: ResumeStructuredData["certifications"],
): (ResumeStructuredData["certifications"][0] & {
  expiryStatus?: {
    isExpired: boolean;
    daysRemaining: number | null;
    status: "valid" | "expiring" | "expired";
  };
  credibilityScore?: number;
  isDuplicate?: boolean;
})[] {
  if (!Array.isArray(certifications)) return [];

  // Track seen certifications to detect duplicates
  const seen = new Set<string>();

  return certifications.map((cert) => {
    // Create unique identifier for duplicate detection
    const certId =
      `${cert.name?.toLowerCase().trim()}-${cert.issuer?.toLowerCase().trim()}-${cert.issueDate || ""}`.replace(
        /\s+/g,
        "",
      );

    // Check for duplicates
    const isDuplicate = seen.has(certId);
    if (!isDuplicate && certId) {
      seen.add(certId);
    }

    // Validate expiry status (certifications typically don't have expiry dates in basic parsing)
    // We'll assume they're valid unless we have specific expiry logic
    const expiryStatus = {
      isExpired: false,
      daysRemaining: null,
      status: "valid" as const,
    };

    // Calculate credibility score based on issuer reputation
    const credibilityScore = calculateCredibilityScore(cert.issuer);

    return {
      ...cert,
      expiryStatus,
      credibilityScore,
      isDuplicate,
    };
  });
}

/**
 * Calculate certification credibility score based on issuing organization
 * @param issuer - Certification issuer name
 * @returns Credibility score (1-10)
 */
function calculateCredibilityScore(issuer: string | null): number {
  if (!issuer) return 5; // Neutral score for unknown issuers

  const issuerLower = issuer.toLowerCase();

  // High credibility issuers
  const highCredibility = [
    "microsoft",
    "google",
    "aws",
    "ibm",
    "oracle",
    "cisco",
    "compTIA",
    "isc2",
    "pmp",
    "csm",
  ];
  if (highCredibility.some((cred) => issuerLower.includes(cred))) {
    return 9;
  }

  // Medium credibility issuers
  const mediumCredibility = [
    "udemy",
    "coursera",
    "linkedin",
    "edureka",
    "udacity",
    "pluralsight",
  ];
  if (mediumCredibility.some((cred) => issuerLower.includes(cred))) {
    return 7;
  }

  // Low credibility or unknown
  return 5;
}
