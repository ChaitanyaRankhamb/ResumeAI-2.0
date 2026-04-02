import { Identity } from "../../types/normalizedResume";
import {
  normalizeEmail,
  normalizePhone,
  normalizeLocation,
  normalizeUrl,
} from "../../helpers/canonicalization.helper";

/**
 * Identity Canonicalizer
 * Handles normalization of personal identity information
 */

/**
 * Canonicalizes identity info:
 * - Cleans and normalizes name (trim, remove extra spaces)
 * - Normalizes email to lowercase
 * - Formats phone numbers
 * - Normalizes location strings
 * - Validates and normalizes URLs for LinkedIn, GitHub, and portfolio
 * @param identity - Raw identity data from resume
 * @returns Cleaned and normalized identity object
 */
export function canonicalizeIdentity(identity: any): Identity {
  return {
    name: identity?.name ? identity.name.trim().replace(/\s+/g, " ") : null,

    email: identity?.email ? normalizeEmail(identity.email.trim()) : null,

    phone: identity?.phone ? normalizePhone(identity.phone) : null,

    location: identity?.location ? normalizeLocation(identity.location) : null,

    linkedin: identity?.linkedin
      ? normalizeUrl(identity.linkedin, "linkedin")
      : null,

    github: identity?.github ? normalizeUrl(identity.github, "github") : null,

    portfolio: identity?.portfolio ? normalizeUrl(identity.portfolio) : null,
  };
}