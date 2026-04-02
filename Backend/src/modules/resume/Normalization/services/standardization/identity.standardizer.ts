import { Identity } from "../../types/normalizedResume";
import { ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";

/**
 * Identity Standardizer
 * Handles:
 * - Name casing (Title Case)
 * - Email formatting
 * - Phone number formatting with country code
 * - Location casing
 * - URL formatting
 */

export function standardizeIdentity(
  identity: CanonicalResume["identity"],
): ResumeStructuredData["identity"] {
  return {
    name: standardizeName(identity.name),
    email: standardizeEmail(identity.email),
    phone: standardizePhone(identity.phone),
    location: standardizeLocation(identity.location),
    linkedin: identity.linkedin,
    github: identity.github,
    portfolio: identity.portfolio,
  };
}

// "chaitu rankhamb" == "Chaitu Rankhamb"
function standardizeName(name: string | null): string | null {
  if (!name) return null;

  return name
    .toLowerCase() // make lower case
    .split(" ") // split words of name by spacing
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1)) // make the first char of each word upper case
    .join(" "); // join them
}

function standardizeEmail(email?: string | null): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

// add the +91 number code to the phone number if not exist
function standardizePhone(phone?: string | null): string | null {
  if (!phone) return null;

  // Already has country code
  if (phone.startsWith("+")) {
    return phone;
  }

  // Has country code but missing '+'
  if (phone.startsWith("91")) {
    return `+${phone}`;
  }

  // Default: add +91
  return `+91${phone}`;
}

// make it standard, if the address data is in bad language, make it correct in enrich service.
function standardizeLocation(location?: string | null): string | null {
  if (!location) return null;

  return location
    .toLowerCase() // make it lowercase
    .split(",") // split into words by comma
    .map((part) => part.trim()) // trimmed the each part
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)) // make the first letter of each word uppercase
    .join(", "); // join all of them with comma
}
