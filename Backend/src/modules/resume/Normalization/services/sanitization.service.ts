/**
 * Sanitization Service
 * Cleans raw input data to prevent unsafe/malformed data
 */

/**
 * Sanitizes a string by trimming and providing safe defaults
 * @param value - The string value to sanitize
 * @param defaultValue - Default value if input is invalid (default: '')
 * @returns Sanitized string
 */
/**
 * Sanitizes a string:
 * - Removes unsafe characters
 * - Normalizes spaces
 * - Trims
 * - Handles null/undefined
 * - Optional length limiting
 */
export function sanitizeString(
  value: any,
  defaultValue: string = "",
  maxLength: number = 500,
): string {
  if (value === null || value === undefined) return defaultValue;

  let str: string;

  try {
    str = String(value);
  } catch {
    return defaultValue;
  }

  return (
    str
      // Normalize unicode (important for consistency)
      .normalize("NFKC")

      // Remove HTML tags  <b>bold</b> â†’ bold (also prevents XSS if we ever render this data in a frontend)
      .replace(/<[^>]*>/g, "")

      // Remove invisible characters (zero-width, etc.)  "Hello\u200BWorld" â†’ "HelloWorld"
      .replace(/[\u200B-\u200D\uFEFF]/g, "")

      // Replace multiple spaces/newlines/tabs with single space  "Hello     World\n\n" â†’ "Hello World"
      .replace(/\s+/g, " ")

      // Trim start and end
      .trim()

      // Limit length
      .slice(0, maxLength) // if string is longer than maxLength, it will be truncated to maxLength characters
  );
}

/**
 * Sanitizes an array by filtering out null/undefined values and ensuring array type
 * @param value - The value to sanitize as array
 * @param defaultValue - Default array if input is invalid (default: [])
 * @returns Sanitized array
 */
export function sanitizeArray(value: any, defaultValue: any[] = []): any[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined);
  }
  if (value === null || value === undefined) {
    return defaultValue;
  }
  // If single value, wrap in array
  return [value].filter((item) => item !== null && item !== undefined);
}

/**
 * Sanitizes an object by removing null/undefined values and ensuring object type
 * @param value - The value to sanitize as object
 * @param defaultValue - Default object if input is invalid (default: {})
 * @returns Sanitized object
 */
export function sanitizeObject(
  value: any,
  defaultValue: Record<string, any> = {},
): Record<string, any> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val !== null && val !== undefined) {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return defaultValue;
}

const MAX_ARRAY_ITEMS = 100;

function sanitizeStringOrNull(value: any, maxLength = 500): string | null {
  const sanitized = sanitizeString(value, "", maxLength);
  return sanitized.length > 0 ? sanitized : null;
}

function sanitizeStringArray(value: any, maxLength = 500): string[] {
  return sanitizeArray(value)
    .slice(0, MAX_ARRAY_ITEMS)
    .map((item) => sanitizeString(item, "", maxLength))
    .filter((item) => item.length > 0);
}

/**
 * Production boundary sanitizer for the whole resume payload.
 * Keep this as the first pipeline stage so every downstream mapper works on
 * bounded, tag-free, normalized strings instead of raw AI output.
 */
export function sanitizeResume(rawResume: any) {
  return {
    identity: {
      name: sanitizeStringOrNull(rawResume?.identity?.name, 200),
      email: sanitizeStringOrNull(rawResume?.identity?.email, 320),
      phone: sanitizeStringOrNull(rawResume?.identity?.phone, 80),
      location: sanitizeStringOrNull(rawResume?.identity?.location, 300),
      linkedin: sanitizeStringOrNull(rawResume?.identity?.linkedin, 500),
      github: sanitizeStringOrNull(rawResume?.identity?.github, 500),
      portfolio: sanitizeStringOrNull(rawResume?.identity?.portfolio, 500),
    },
    summary: sanitizeStringOrNull(rawResume?.summary, 2000),
    skills: {
      technical: sanitizeStringArray(rawResume?.skills?.technical, 120),
      soft: sanitizeStringArray(rawResume?.skills?.soft, 120),
      tools: sanitizeStringArray(rawResume?.skills?.tools, 120),
      frameworks: sanitizeStringArray(rawResume?.skills?.frameworks, 120),
      languages: sanitizeStringArray(rawResume?.skills?.languages, 120),
    },
    experience: sanitizeArray(rawResume?.experience)
      .slice(0, 50)
      .map((exp) => ({
        company: sanitizeStringOrNull(exp?.company, 200),
        role: sanitizeStringOrNull(exp?.role, 200),
        startDate: sanitizeStringOrNull(exp?.startDate, 80),
        endDate: sanitizeStringOrNull(exp?.endDate, 80),
        duration: sanitizeStringOrNull(exp?.duration, 120),
        description: sanitizeStringArray(exp?.description, 700),
        technologies: sanitizeStringArray(exp?.technologies, 120),
        achievements: sanitizeStringArray(exp?.achievements, 700),
      })),
    projects: sanitizeArray(rawResume?.projects)
      .slice(0, 50)
      .map((proj) => ({
        name: sanitizeStringOrNull(proj?.name, 200),
        description: sanitizeStringOrNull(proj?.description, 1000),
        technologies: sanitizeStringArray(proj?.technologies, 120),
        github: sanitizeStringOrNull(proj?.github, 500),
        live: sanitizeStringOrNull(proj?.live, 500),
        highlights: sanitizeStringArray(proj?.highlights, 700),
      })),
    education: sanitizeArray(rawResume?.education)
      .slice(0, 30)
      .map((edu) => ({
        level: sanitizeStringOrNull(edu?.level, 120),
        degree: sanitizeStringOrNull(edu?.degree, 200),
        fieldOfStudy: sanitizeStringOrNull(edu?.fieldOfStudy, 200),
        institution: sanitizeStringOrNull(edu?.institution, 300),
        board: sanitizeStringOrNull(edu?.board, 200),
        startYear: sanitizeStringOrNull(edu?.startYear, 80),
        endYear: sanitizeStringOrNull(edu?.endYear, 80),
        grade: sanitizeStringOrNull(edu?.grade, 80),
      })),
    certifications: sanitizeArray(rawResume?.certifications)
      .slice(0, 100)
      .map((cert) => ({
        name: sanitizeStringOrNull(cert?.name, 300),
        issuer: sanitizeStringOrNull(cert?.issuer, 300),
        issueDate: sanitizeStringOrNull(
          cert?.issueDate ?? cert?.issuedDate ?? cert?.date ?? cert?.year,
          80,
        ),
      })),
    achievements: sanitizeStringArray(rawResume?.achievements, 700),
    extras: {
      languagesSpoken: sanitizeStringArray(rawResume?.extras?.languagesSpoken, 120),
      interests: sanitizeStringArray(rawResume?.extras?.interests, 120),
      volunteering: sanitizeStringArray(rawResume?.extras?.volunteering, 300),
    },
  };
}
