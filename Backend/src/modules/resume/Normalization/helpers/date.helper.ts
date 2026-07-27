export interface NormalizedResumeDate {
  raw: string;
  year: number | null;
  month: number | null;
  normalized: string | null;
  isPresent: boolean;
}

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function expandTwoDigitYear(value: number): number {
  return value >= 50 ? 1900 + value : 2000 + value;
}

/**
 * Production date parser for resume date fragments.
 * Avoid JavaScript's loose Date parsing so values such as "Jan 2024",
 * "05/2022", "2021", and "Present" are deterministic across runtimes.
 */
export function parseResumeDate(input?: string | null): NormalizedResumeDate {
  const raw = (input ?? "").trim();
  const lower = raw.toLowerCase();

  if (!raw) {
    return { raw, year: null, month: null, normalized: null, isPresent: false };
  }

  if (/^(present|current|now|ongoing|till date|to date)$/i.test(lower)) {
    return { raw, year: null, month: null, normalized: "present", isPresent: true };
  }

  const monthWordMatch = lower.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/,
  );
  const yearMatch = lower.match(/\b(19\d{2}|20\d{2}|\d{2})\b/);

  if (monthWordMatch && yearMatch) {
    const yearValue = Number(yearMatch[1]);
    const year = yearValue < 100 ? expandTwoDigitYear(yearValue) : yearValue;
    const month = MONTHS[monthWordMatch[1]];
    return {
      raw,
      year,
      month,
      normalized: `${year}-${String(month).padStart(2, "0")}`,
      isPresent: false,
    };
  }

  const numericMonthYear = lower.match(/\b(0?[1-9]|1[0-2])[\-/\s]+(19\d{2}|20\d{2}|\d{2})\b/);
  if (numericMonthYear) {
    const month = Number(numericMonthYear[1]);
    const yearValue = Number(numericMonthYear[2]);
    const year = yearValue < 100 ? expandTwoDigitYear(yearValue) : yearValue;
    return {
      raw,
      year,
      month,
      normalized: `${year}-${String(month).padStart(2, "0")}`,
      isPresent: false,
    };
  }

  const yearOnly = lower.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    return { raw, year, month: null, normalized: String(year), isPresent: false };
  }

  return { raw, year: null, month: null, normalized: null, isPresent: false };
}

export function formatResumeMonth(input?: string | null): string | null {
  return parseResumeDate(input).normalized;
}

export function formatResumeYear(input?: string | null): string | null {
  const parsed = parseResumeDate(input);
  return parsed.year ? String(parsed.year) : null;
}

export function getDatePartsForDuration(input?: string | null): { year: number; month: number } | null {
  const parsed = parseResumeDate(input);
  if (parsed.isPresent) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  if (!parsed.year) return null;
  return { year: parsed.year, month: parsed.month ?? 1 };
}
