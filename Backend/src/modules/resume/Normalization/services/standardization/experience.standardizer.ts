import { formatResumeMonth, parseResumeDate } from "../../helpers/date.helper";
import { SkillMapper } from "../../mappers/skill.mapper";
import { Experience, ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";

export function standardizeExperience(
  experience: CanonicalResume["experience"],
): ResumeStructuredData["experience"] {
  const skillMapper = new SkillMapper();

  const normalizeDate = (date?: string | null): string | null => {
    const parsed = parseResumeDate(date);
    return parsed.isPresent ? "present" : formatResumeMonth(date);
  };

  const toDisplayCase = (value?: string | null): string | null => {
    if (!value) return null;
    return value
      .split(" ")
      .map((word) => {
        // Production point: preserve acronyms and mixed-case terms instead of
        // blindly title-casing values like "REST API", "iOS", or "Node.js".
        if (/[A-Z]{2,}|[a-z][A-Z]|\./.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  return experience.map((exp: Experience) => {
    const start = normalizeDate(exp.startDate);
    const end = normalizeDate(exp.endDate);

    return {
      company: toDisplayCase(exp.company),
      role: toDisplayCase(exp.role),
      startDate: start,
      endDate: end,
      duration: exp.duration || (start && end ? `${start} to ${end}` : null),
      description: exp.description || [],
      technologies: Array.from(
        new Set(skillMapper.normalizeBulk(exp.technologies || []).filter(Boolean)),
      ),
      achievements: exp.achievements || [],
    };
  });
}
