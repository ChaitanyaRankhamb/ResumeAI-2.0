/**
 * Enrichment Helper Functions
 * Utility functions for resume enrichment services
 */

import { skillToDomainMap } from "../maps/skillDomainMap";

/**
 * Calculate duration in months between two dates
 * @param start - Start date string
 * @param end - End date string (can be 'present' for current positions)
 * @returns Duration in months
 */
export function calculateDuration(start: string, end: string): number {
  try {
    const startDate = new Date(start);
    const endDate =
      end.toLowerCase() === "present" ? new Date() : new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    return Math.max(0, months);
  } catch {
    return 0;
  }
}

/**
 * Format duration in months to human readable string
 * @param months - Duration in months
 * @returns Formatted duration string
 */
export function formatDuration(months: number): string {
  if (months < 1) return "Less than 1 month";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  } else {
    return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
  }
}

/**
 * Detect role level from job title
 * @param role - Job title/role string
 * @returns Role level classification
 */
export function detectRoleLevel(role: string): string {
  const title = role.toLowerCase();

  // Senior roles
  if (
    title.includes("senior") ||
    title.includes("sr.") ||
    title.includes("lead") ||
    title.includes("principal") ||
    title.includes("staff") ||
    title.includes("architect")
  ) {
    return "Senior";
  }

  // Junior roles
  if (
    title.includes("junior") ||
    title.includes("jr.") ||
    title.includes("intern") ||
    title.includes("trainee") ||
    title.includes("associate") ||
    title.includes("entry")
  ) {
    return "Junior";
  }

  // Mid-level roles
  if (title.includes("mid") || title.includes("intermediate")) {
    return "Mid";
  }

  return "Mid"; // Default to mid-level
}

/**
 * Detect domains from technologies
 * @param technologies - Array of technology strings
 * @returns Array of detected domains
 */
export function detectDomains(technologies: string[]): string[] {
  if (!Array.isArray(technologies) || technologies.length === 0) {
    return [];
  }

  const domains = new Set<string>();

  technologies.forEach((tech) => {
    const techLower = tech.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (skillToDomainMap[techLower]) {
      domains.add(skillToDomainMap[techLower]);
    }
  });

  return Array.from(domains);
}

/**
 * Detect experience type from role
 * @param role - Job title/role string
 * @returns Experience type classification
 */
export function detectExperienceType(role: string): string {
  const title = role.toLowerCase();

  if (title.includes("full") && title.includes("stack")) return "Full Stack";
  if (title.includes("frontend") || title.includes("front-end"))
    return "Frontend";
  if (title.includes("backend") || title.includes("back-end")) return "Backend";
  if (title.includes("mobile")) return "Mobile";
  if (title.includes("devops") || title.includes("infrastructure"))
    return "DevOps";
  if (
    title.includes("data") ||
    title.includes("analyst") ||
    title.includes("scientist")
  )
    return "Data";
  if (
    title.includes("qa") ||
    title.includes("quality") ||
    title.includes("test")
  )
    return "QA";
  if (title.includes("manager") || title.includes("lead")) return "Management";
  if (
    title.includes("designer") ||
    title.includes("ui") ||
    title.includes("ux")
  )
    return "Design";

  return "Development"; // Default
}

/**
 * Validate certification expiry status
 * @param issueDate - Certification issue date
 * @param expiryDate - Certification expiry date
 * @returns Object with expiry status and days remaining
 */
export function validateCertificationExpiry(
  issueDate: string | null,
  expiryDate: string | null,
): {
  isExpired: boolean;
  daysRemaining: number | null;
  status: "valid" | "expiring" | "expired";
} {
  if (!expiryDate) {
    return { isExpired: false, daysRemaining: null, status: "valid" };
  }

  try {
    const expiry = new Date(expiryDate);
    const now = new Date();

    if (isNaN(expiry.getTime())) {
      return { isExpired: false, daysRemaining: null, status: "valid" };
    }

    const daysRemaining = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysRemaining < 0) {
      return { isExpired: true, daysRemaining: 0, status: "expired" };
    } else if (daysRemaining <= 90) {
      // Expiring within 3 months
      return { isExpired: false, daysRemaining, status: "expiring" };
    } else {
      return { isExpired: false, daysRemaining, status: "valid" };
    }
  } catch {
    return { isExpired: false, daysRemaining: null, status: "valid" };
  }
}

/**
 * Calculate project complexity score based on technologies and features
 * @param technologies - Array of technologies used
 * @param highlights - Array of project highlights/features
 * @returns Complexity score (1-10)
 */
export function calculateProjectComplexity(
  technologies: string[],
  highlights: string[],
): number {
  let score = 1; // Base score

  // Technology diversity bonus
  const uniqueTechs = new Set(technologies.map((t) => t.toLowerCase()));
  score += Math.min(uniqueTechs.size * 0.5, 3);

  // Feature complexity bonus
  const featureCount = highlights.length;
  score += Math.min(featureCount * 0.3, 2);

  // Advanced technology bonuses
  const advancedTechs = [
    "machine learning",
    "ai",
    "blockchain",
    "microservices",
    "kubernetes",
    "docker",
  ];
  const hasAdvancedTech = technologies.some((tech) =>
    advancedTechs.some((adv) => tech.toLowerCase().includes(adv)),
  );
  if (hasAdvancedTech) score += 2;

  return Math.min(Math.max(Math.round(score), 1), 10);
}

/**
 * Extract key skills from project description and highlights
 * @param description - Project description
 * @param highlights - Project highlights
 * @param technologies - Known technologies
 * @returns Array of extracted skills
 */
export function extractProjectSkills(
  description: string | null,
  highlights: string[],
  technologies: string[],
): string[] {
  const skills = new Set<string>(technologies);

  // Common skill keywords to look for
  const skillKeywords = [
    "api",
    "database",
    "authentication",
    "authorization",
    "testing",
    "deployment",
    "optimization",
    "scalability",
    "security",
    "performance",
    "ui",
    "ux",
    "responsive",
    "mobile",
    "web",
    "backend",
    "frontend",
    "fullstack",
    "agile",
    "scrum",
  ];

  const text = `${description || ""} ${highlights.join(" ")}`.toLowerCase();

  skillKeywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      skills.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });

  return Array.from(skills);
}

/**
 * Normalize language proficiency levels
 * @param proficiency - Raw proficiency string
 * @returns Normalized proficiency level
 */
export function normalizeLanguageProficiency(
  proficiency: string | null,
): string {
  if (!proficiency) return "Basic";

  const level = proficiency.toLowerCase().trim();

  if (level.includes("native") || level.includes("mother")) return "Native";
  if (level.includes("fluent") || level.includes("advanced")) return "Fluent";
  if (level.includes("intermediate") || level.includes("conversational"))
    return "Intermediate";
  if (level.includes("basic") || level.includes("beginner")) return "Basic";

  return "Intermediate"; // Default
}

/**
 * Categorize interests into professional categories
 * @param interests - Array of interest strings
 * @returns Categorized interests object
 */
export function categorizeInterests(interests: string[]): {
  technical: string[];
  creative: string[];
  professional: string[];
  personal: string[];
} {
  const categories = {
    technical: [] as string[],
    creative: [] as string[],
    professional: [] as string[],
    personal: [] as string[],
  };

  const techKeywords = [
    "programming",
    "coding",
    "technology",
    "software",
    "hardware",
    "ai",
    "machine learning",
  ];
  const creativeKeywords = [
    "art",
    "music",
    "design",
    "photography",
    "writing",
    "painting",
    "drawing",
  ];
  const professionalKeywords = [
    "leadership",
    "mentoring",
    "public speaking",
    "networking",
    "consulting",
  ];

  interests.forEach((interest) => {
    const lower = interest.toLowerCase();

    if (techKeywords.some((keyword) => lower.includes(keyword))) {
      categories.technical.push(interest);
    } else if (creativeKeywords.some((keyword) => lower.includes(keyword))) {
      categories.creative.push(interest);
    } else if (
      professionalKeywords.some((keyword) => lower.includes(keyword))
    ) {
      categories.professional.push(interest);
    } else {
      categories.personal.push(interest);
    }
  });

  return categories;
}
