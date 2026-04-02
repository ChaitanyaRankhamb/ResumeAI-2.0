// 🔹 Root Type
export interface ResumeStructuredData {
  identity: Identity;
  summary: string | null;
  skills: Skills;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  achievements: string[];
  extras: Extras;
}

// Identity
export interface Identity {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
}

// Skills
export interface Skills {
  technical: string[];
  soft: string[];
  tools: string[];
  frameworks: string[];
  languages: string[];
}

// Experience
export interface Experience {
  company: string | null;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: string | null;
  description: string[];
  technologies: string[];
  achievements: string[];
}

// Projects
export interface Project {
  name: string | null;
  description: string | null;
  technologies: string[];
  github: string | null;
  live: string | null;
  highlights: string[];
}

// Education
export type EducationLevel =
  | "Secondary"
  | "Higher Secondary"
  | "Diploma"
  | "Undergraduate"
  | "Postgraduate"
  | "PhD"
  | "Other";

export interface Education {
  level: EducationLevel | null;
  degree: string | null;
  fieldOfStudy: string | null;
  institution: string | null;
  board: string | null;
  startYear: string | null;
  endYear: string | null;
  grade: string | null;
}

// Certifications
export interface Certification {
  name: string | null;
  issuer: string | null;
  issueDate: string | null;
}

//  Extras
export interface Extras {
  languagesSpoken: string[];
  interests: string[];
  volunteering: string[];
}

export const defaultResumeStructuredData = (): ResumeStructuredData => ({
  identity: {
    name: null,
    email: null,
    phone: null,
    location: null,
    linkedin: null,
    github: null,
    portfolio: null,
  },

  summary: null,

  skills: {
    technical: [],
    soft: [],
    tools: [],
    frameworks: [],
    languages: [],
  },

  experience: [],
  projects: [],
  education: [],
  certifications: [],
  achievements: [],

  extras: {
    languagesSpoken: [],
    interests: [],
    volunteering: [],
  },
});

/**
 * Enriched Resume Data Type
 * Contains both the original normalized data and enriched intelligence data
 */
export interface EnrichedResumeData extends ResumeStructuredData {
  // Enriched Skills Data
  enrichedSkills?: {
    totalSkills: number;
    categoryStrength: Record<string, number>;
    primarySkills: string[];
    domains: string[];
  };

  // Enriched Experience Data (array of enriched experiences)
  enrichedExperience?: Array<{
    duration?: string | null;
    durationInMonths?: number | null;
    roleLevel?: string | null;
    domains?: string[];
    techStack?: string;
    type?: string | null;
  }>;

  // Enriched Projects Data (array of enriched projects)
  enrichedProjects?: Array<{
    complexityScore?: number;
    extractedSkills?: string[];
    projectType?: string;
    isValidTimeline?: boolean;
    durationMonths?: number | null;
  }>;

  // Enriched Education Data (array of enriched education entries)
  enrichedEducation?: Array<{
    durationInYears?: number | null;
    isCurrentlyStudying?: boolean;
    degreeLevel?: string | null;
    normalizedGPA?: number | null;
    academicScoreBand?: string | null;
    hasLowGPA?: boolean;
  }>;

  // Enriched Certifications Data (array of enriched certifications)
  enrichedCertifications?: Array<{
    expiryStatus?: {
      isExpired: boolean;
      daysRemaining: number | null;
      status: "valid" | "expiring" | "expired";
    };
    credibilityScore?: number;
    isDuplicate?: boolean;
  }>;

  // Enriched Extras Data
  enrichedExtras?: {
    languageProficiencies?: Array<{
      language: string;
      proficiency: string;
      score: number;
    }>;
    categorizedInterests?: {
      technical: string[];
      creative: string[];
      professional: string[];
      personal: string[];
    };
    professionalRelevanceScore?: number;
  };
}
