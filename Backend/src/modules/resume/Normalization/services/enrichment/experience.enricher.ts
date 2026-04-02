import { calculateDuration, detectDomains, detectExperienceType, detectRoleLevel, formatDuration } from "../../helpers/enrich.helpers";
import { ResumeStructuredData } from "../../types/normalizedResume";

/**
 * Experience Enrichment Service (Fixed Version)
 */
export function enrichExperience(
  experience: ResumeStructuredData["experience"],
): (ResumeStructuredData["experience"][0] & {
  duration?: string | null;
  durationInMonths?: number | null;
  roleLevel?: string | null;
  domains?: string[];
  techStack?: string;
  type?: string | null;
})[] {
  if (!Array.isArray(experience)) return [];

  return experience.map((exp) => {
    // 🔹 Safe defaults
    const startDate = exp?.startDate;
    const endDate = exp?.endDate;
    const role = exp?.role ?? "";
    const technologies = exp?.technologies ?? [];

    // 🔹 Duration
    let durationInMonths: number | undefined = undefined;

    if (startDate && endDate) {
      const months = calculateDuration(startDate, endDate);
      durationInMonths = months > 0 ? months : undefined;
    }

    return {
      ...exp,

      durationInMonths: durationInMonths ?? null,

      duration: durationInMonths ? formatDuration(durationInMonths) : null,

      roleLevel: role ? detectRoleLevel(role) : null,

      domains: technologies.length ? detectDomains(technologies) : [],

      techStack: technologies.length ? technologies.join(", ") : "",

      type: role ? detectExperienceType(role) : null,
    };
  });
}
