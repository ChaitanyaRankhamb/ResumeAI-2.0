import { normalizeDegree } from "../mappers/degree.mapper";

export function getYear(date?: string | null): number | null {
  if (!date) return null;

  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d.getFullYear();
}

export function getDegreeLevel(degree?: string | null): string | null {
  if (!degree) return null;

  const degreeLower = degree.toLowerCase();

  // check it in deegree mapper
  return normalizeDegree(degreeLower);
}

export function normalizeGPA(gpa?: string | number | null): number | null {
  if (!gpa) return null;

  if (typeof gpa === "number") return gpa;

  const match = gpa.match(/(\d+(\.\d+)?)\s*\/\s*(\d+)/);
  if (!match) return parseFloat(gpa);

  const value = parseFloat(match[1]);
  const scale = parseFloat(match[3]);

  return (value / scale) * 10;
}

export function getAcademicBand(gpa: number | null): string | null {
  if (gpa === null) return null;

  if (gpa >= 8.5) return "high";
  if (gpa >= 7.0) return "medium";
  return "low";
}
