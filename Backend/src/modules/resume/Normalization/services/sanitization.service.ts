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

      // Remove HTML tags  <b>bold</b> → bold (also prevents XSS if we ever render this data in a frontend)
      .replace(/<[^>]*>/g, "")

      // Remove invisible characters (zero-width, etc.)  "Hello\u200BWorld" → "HelloWorld"
      .replace(/[\u200B-\u200D\uFEFF]/g, "")

      // Replace multiple spaces/newlines/tabs with single space  "Hello     World\n\n" → "Hello World"
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
