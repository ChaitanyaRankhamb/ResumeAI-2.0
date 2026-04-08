import { ResumeStructuredData } from "../modules/resume/Normalization";


export const validateStructuredData = (
  data: any
): ResumeStructuredData => {
  return {
    identity: {
      name: typeof data?.identity?.name === "string" ? data.identity.name : null,
      email: typeof data?.identity?.email === "string" ? data.identity.email : null,
      phone: typeof data?.identity?.phone === "string" ? data.identity.phone : null,
      location: typeof data?.identity?.location === "string" ? data.identity.location : null,
      linkedin: typeof data?.identity?.linkedin === "string" ? data.identity.linkedin : null,
      github: typeof data?.identity?.github === "string" ? data.identity.github : null,
      portfolio: typeof data?.identity?.portfolio === "string" ? data.identity.portfolio : null,
    },

    summary: typeof data?.summary === "string" ? data.summary : null,

    skills: {
      technical: Array.isArray(data?.skills?.technical)
        ? data.skills.technical.filter((s: any) => typeof s === "string")
        : [],
      soft: Array.isArray(data?.skills?.soft)
        ? data.skills.soft.filter((s: any) => typeof s === "string")
        : [],
      tools: Array.isArray(data?.skills?.tools)
        ? data.skills.tools.filter((s: any) => typeof s === "string")
        : [],
      frameworks: Array.isArray(data?.skills?.frameworks)
        ? data.skills.frameworks.filter((s: any) => typeof s === "string")
        : [],
      languages: Array.isArray(data?.skills?.languages)
        ? data.skills.languages.filter((s: any) => typeof s === "string")
        : [],
    },

    experience: Array.isArray(data?.experience)
      ? data.experience.map((exp: any) => ({
          company: typeof exp?.company === "string" ? exp.company : null,
          role: typeof exp?.role === "string" ? exp.role : null,
          startDate: typeof exp?.startDate === "string" ? exp.startDate : null,
          endDate: typeof exp?.endDate === "string" ? exp.endDate : null,
          duration: typeof exp?.duration === "string" ? exp.duration : null,
          description: Array.isArray(exp?.description)
            ? exp.description.filter((d: any) => typeof d === "string")
            : [],
          technologies: Array.isArray(exp?.technologies)
            ? exp.technologies.filter((t: any) => typeof t === "string")
            : [],
          achievements: Array.isArray(exp?.achievements)
            ? exp.achievements.filter((a: any) => typeof a === "string")
            : [],
        }))
      : [],

    projects: Array.isArray(data?.projects)
      ? data.projects.map((proj: any) => ({
          name: typeof proj?.name === "string" ? proj.name : null,
          description: typeof proj?.description === "string" ? proj.description : null,
          technologies: Array.isArray(proj?.technologies)
            ? proj.technologies.filter((t: any) => typeof t === "string")
            : [],
          github: typeof proj?.github === "string" ? proj.github : null,
          live: typeof proj?.live === "string" ? proj.live : null,
          highlights: Array.isArray(proj?.highlights)
            ? proj.highlights.filter((h: any) => typeof h === "string")
            : [],
        }))
      : [],

    education: Array.isArray(data?.education)
      ? data.education.map((edu: any) => ({
          level: typeof edu?.level === "string" ? edu.level : null,
          degree: typeof edu?.degree === "string" ? edu.degree : null,
          fieldOfStudy:
            typeof edu?.fieldOfStudy === "string" ? edu.fieldOfStudy : null,
          institution:
            typeof edu?.institution === "string" ? edu.institution : null,
          board: typeof edu?.board === "string" ? edu.board : null,
          startYear: typeof edu?.startYear === "string" ? edu.startYear : null,
          endYear: typeof edu?.endYear === "string" ? edu.endYear : null,
          grade: typeof edu?.grade === "string" ? edu.grade : null,
        }))
      : [],

    certifications: Array.isArray(data?.certifications)
      ? data.certifications.map((cert: any) => ({
          name: typeof cert?.name === "string" ? cert.name : null,
          issuer: typeof cert?.issuer === "string" ? cert.issuer : null,
          year: typeof cert?.year === "string" ? cert.year : null,
        }))
      : [],

    achievements: Array.isArray(data?.achievements)
      ? data.achievements.filter((a: any) => typeof a === "string")
      : [],

    extras: {
      languagesSpoken: Array.isArray(data?.extras?.languagesSpoken)
        ? data.extras.languagesSpoken.filter((l: any) => typeof l === "string")
        : [],
      interests: Array.isArray(data?.extras?.interests)
        ? data.extras.interests.filter((i: any) => typeof i === "string")
        : [],
      volunteering: Array.isArray(data?.extras?.volunteering)
        ? data.extras.volunteering.filter((v: any) => typeof v === "string")
        : [],
    },
  };
};