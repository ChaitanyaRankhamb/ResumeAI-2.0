import {
  getAcademicBand,
  getDegreeLevel,
  getYear,
  normalizeGPA,
} from "../../helpers/enrich.education.helpers";
import { ResumeStructuredData } from "../../types/normalizedResume";

export function enrichEducation(
  education: ResumeStructuredData["education"],
): (ResumeStructuredData["education"][0] & {
  durationInYears?: number | null;
  isCurrentlyStudying?: boolean;
  degreeLevel?: string | null;
  normalizedGPA?: number | null;
  academicScoreBand?: string | null;
  hasLowGPA?: boolean;
})[] {
  return education.map((edu) => {
    const startYear = getYear(edu.startYear);
    const endYear = getYear(edu.endYear);

    const durationInYears = startYear && endYear ? endYear - startYear : null;

    const isCurrentlyStudying = !endYear;

    const degreeLevel = getDegreeLevel(edu.degree);

    const normalizedGPA = normalizeGPA(edu.grade ?? undefined);

    const academicScoreBand = getAcademicBand(normalizedGPA);

    // Risk Signals
    const hasLowGPA = normalizedGPA !== null && normalizedGPA < 6;

    return {
      ...edu,

      // Timeline
      durationInYears,
      isCurrentlyStudying,

      // Academic
      degreeLevel,
      normalizedGPA,
      academicScoreBand,

      // Risk
      hasLowGPA,
    };
  });
}
