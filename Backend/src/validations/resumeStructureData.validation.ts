import { z } from "zod";
import { ResumeStructuredData } from "../modules/resume/Normalization";

const nullableString = z.string().trim().max(2000).nullable().catch(null);
const nullableShortString = z.string().trim().max(300).nullable().catch(null);
const stringArray = z.array(z.string().trim().max(500)).max(100).catch([]);

const identitySchema = z
  .object({
    name: nullableShortString,
    email: nullableShortString,
    phone: nullableShortString,
    location: nullableShortString,
    linkedin: nullableShortString,
    github: nullableShortString,
    portfolio: nullableShortString,
  })
  .strip() // removes extra unwanted fields
  .catch({
    name: null,
    email: null,
    phone: null,
    location: null,
    linkedin: null,
    github: null,
    portfolio: null,
  });

const skillsSchema = z
  .object({
    technical: stringArray,
    soft: stringArray,
    tools: stringArray,
    frameworks: stringArray,
    languages: stringArray,
  })
  .strip()
  .catch({
    technical: [],
    soft: [],
    tools: [],
    frameworks: [],
    languages: [],
  });

const experienceSchema = z
  .object({
    company: nullableShortString,
    role: nullableShortString,
    startDate: nullableShortString,
    endDate: nullableShortString,
    duration: nullableShortString,
    description: stringArray,
    technologies: stringArray,
    achievements: stringArray,
  })
  .strip();

const projectSchema = z
  .object({
    name: nullableShortString,
    description: nullableString,
    technologies: stringArray,
    github: nullableShortString,
    live: nullableShortString,
    highlights: stringArray,
  })
  .strip();

const educationSchema = z
  .object({
    level: nullableShortString,
    degree: nullableShortString,
    fieldOfStudy: nullableShortString,
    institution: nullableShortString,
    board: nullableShortString,
    startYear: nullableShortString,
    endYear: nullableShortString,
    grade: nullableShortString,
  })
  .strip();

const certificationSchema = z
  .object({
    name: nullableShortString,
    issuer: nullableShortString,
    issueDate: nullableShortString,
    date: nullableShortString.optional(),
    issuedDate: nullableShortString.optional(),
    year: nullableShortString.optional(),
  })
  .strip()
  .transform((cert) => ({
    name: cert.name,
    issuer: cert.issuer,
    // Production boundary: normalize every upstream date alias into the single
    // field used by the rest of the pipeline so typed data cannot drift.
    issueDate: cert.issueDate ?? cert.issuedDate ?? cert.date ?? cert.year ?? null,
  }));

const extrasSchema = z
  .object({
    languagesSpoken: stringArray,
    interests: stringArray,
    volunteering: stringArray,
  })
  .strip()
  .catch({
    languagesSpoken: [],
    interests: [],
    volunteering: [],
  });

export const resumeStructuredDataSchema = z
  .object({
    identity: identitySchema,
    summary: nullableString,
    skills: skillsSchema,
    experience: z.array(experienceSchema).max(50).catch([]),
    projects: z.array(projectSchema).max(50).catch([]),
    education: z.array(educationSchema).max(30).catch([]),
    certifications: z.array(certificationSchema).max(100).catch([]),
    achievements: stringArray,
    extras: extrasSchema,
  })
  .strip();

export const validateStructuredData = (data: unknown): ResumeStructuredData => {
  return resumeStructuredDataSchema.parse(data ?? {}) as ResumeStructuredData;
};
