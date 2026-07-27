import { cookies } from "next/headers";
import { ResumeAnalysis } from "@/components/report/types";
import { ReportHeader } from "@/components/report/report-header";
import { SkillsReport } from "@/components/report/skills-report";
import { ExperienceReport } from "@/components/report/experience-report";
import { ProjectsReport } from "@/components/report/project-report";
import { Recommendations } from "@/components/report/recommendations";
import { InterviewPrep } from "@/components/report/interview-prepration";

interface ReportPageProps {
  searchParams: Promise<{
    fileId?: string;
  }>;
}

const emptyAnalysis: ResumeAnalysis = {
  summary: {
    profileSummary: "Resume analysis is available, but the summary is incomplete.",
    skillSummary: {
      topSkills: [],
      skillLevelOverview: "",
      stacks: [],
    },
    experienceSummary: {
      seniority: "Not available",
      domains: [],
      growth: "",
    },
    projectSummary: {
      totalProjects: 0,
      complexityLevel: "Not available",
      realWorldVsAcademic: "",
    },
    strengths: [],
    weaknesses: [],
  },
  scores: {
    overall: 0,
    skills: 0,
    experience: 0,
    projects: 0,
  },
  skillInsights: {
    predictedRole: "Resume Analysis Report",
    primarySkills: [],
    allSkills: [],
    score: 0,
    stacks: [],
    skillLevels: {},
    improvementSuggestions: [],
  },
  experienceInsights: {
    score: 0,
    seniority: "Not available",
    domains: [],
    growthAnalysis: "",
  },
  projectInsights: {
    score: 0,
    projectComplexity: "Not available",
    techStrength: "",
    distribution: {
      realWorld: 0,
      academic: 0,
    },
  },
  context: {
    targetRole: "",
    domain: "",
    careerStage: "Not available",
  },
  interviewPrep: {
    basic: [],
    intermediate: [],
    advanced: [],
  },
  recommendations: {
    resumeImprovements: [],
    skillsToLearn: [],
    projectIdeas: [],
  },
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeAnalysis(raw: any): ResumeAnalysis | null {
  if (!raw || typeof raw !== "object") return null;

  // Production guard: AI output can be partially missing even after a successful
  // analysis. Normalize it before rendering so one missing nested field does not
  // crash the Next.js server component and show an opaque digest page.
  return {
    summary: {
      ...emptyAnalysis.summary,
      ...(raw.summary ?? {}),
      profileSummary: asString(raw.summary?.profileSummary, emptyAnalysis.summary.profileSummary),
      strengths: asArray<string>(raw.summary?.strengths),
      weaknesses: asArray<string>(raw.summary?.weaknesses),
      skillSummary: {
        ...emptyAnalysis.summary.skillSummary,
        ...(raw.summary?.skillSummary ?? {}),
        topSkills: asArray<string>(raw.summary?.skillSummary?.topSkills),
        stacks: asArray<string>(raw.summary?.skillSummary?.stacks),
      },
      experienceSummary: {
        ...emptyAnalysis.summary.experienceSummary,
        ...(raw.summary?.experienceSummary ?? {}),
        domains: asArray<string>(raw.summary?.experienceSummary?.domains),
      },
      projectSummary: {
        ...emptyAnalysis.summary.projectSummary,
        ...(raw.summary?.projectSummary ?? {}),
      },
    },
    scores: {
      overall: asNumber(raw.scores?.overall),
      skills: asNumber(raw.scores?.skills),
      experience: asNumber(raw.scores?.experience),
      projects: asNumber(raw.scores?.projects),
    },
    skillInsights: {
      ...emptyAnalysis.skillInsights,
      ...(raw.skillInsights ?? {}),
      predictedRole: asString(raw.skillInsights?.predictedRole, emptyAnalysis.skillInsights.predictedRole),
      primarySkills: asArray<string>(raw.skillInsights?.primarySkills),
      allSkills: asArray<string>(raw.skillInsights?.allSkills),
      score: asNumber(raw.skillInsights?.score),
      stacks: asArray<string>(raw.skillInsights?.stacks),
      skillLevels:
        raw.skillInsights?.skillLevels && typeof raw.skillInsights.skillLevels === "object"
          ? raw.skillInsights.skillLevels
          : {},
      improvementSuggestions: asArray<string>(raw.skillInsights?.improvementSuggestions),
    },
    experienceInsights: {
      ...emptyAnalysis.experienceInsights,
      ...(raw.experienceInsights ?? {}),
      score: asNumber(raw.experienceInsights?.score),
      seniority: asString(raw.experienceInsights?.seniority, emptyAnalysis.experienceInsights.seniority),
      domains: asArray<string>(raw.experienceInsights?.domains),
      growthAnalysis: asString(raw.experienceInsights?.growthAnalysis),
    },
    projectInsights: {
      ...emptyAnalysis.projectInsights,
      ...(raw.projectInsights ?? {}),
      score: asNumber(raw.projectInsights?.score),
      projectComplexity: asString(raw.projectInsights?.projectComplexity, emptyAnalysis.projectInsights.projectComplexity),
      techStrength: asString(raw.projectInsights?.techStrength),
      distribution: {
        realWorld: asNumber(raw.projectInsights?.distribution?.realWorld),
        academic: asNumber(raw.projectInsights?.distribution?.academic),
      },
    },
    context: {
      ...emptyAnalysis.context,
      ...(raw.context ?? {}),
      careerStage: asString(raw.context?.careerStage, emptyAnalysis.context.careerStage),
    },
    interviewPrep: {
      basic: asArray<{ question: string; answer: string }>(raw.interviewPrep?.basic),
      intermediate: asArray<{ question: string; answer: string }>(raw.interviewPrep?.intermediate),
      advanced: asArray<{ question: string; answer: string }>(raw.interviewPrep?.advanced),
    },
    recommendations: {
      resumeImprovements: asArray<string>(raw.recommendations?.resumeImprovements),
      skillsToLearn: asArray<string>(raw.recommendations?.skillsToLearn),
      projectIdeas: asArray<string>(raw.recommendations?.projectIdeas),
    },
  };
}

async function fetchResumeAnalysis(
  fileId: string,
): Promise<ResumeAnalysis | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .filter((cookie) => cookie.name && cookie.value)
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const headers = cookieHeader
      ? {
          Cookie: cookieHeader,
        }
      : undefined;

    const apiBaseUrl = process.env.INTERNAL_API_URL || "http://backend1:5000";

    const response = await fetch(`${apiBaseUrl}/resume/analysis/${fileId}`, {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      console.error(`Report fetch failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Report fetch returned non-JSON response", {
        status: response.status,
        contentType,
        preview: text.replace(/\s+/g, " ").slice(0, 160),
      });
      return null;
    }

    const json = await response.json();
    return normalizeAnalysis(json?.data?.analyzedData);
  } catch (error) {
    console.error("Report fetch failed with server-side exception", error);
    return null;
  }
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const fileId = params.fileId;

  if (!fileId) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-background px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto rounded-3xl border border-border/60 bg-card/90 p-8 shadow-lg shadow-primary/5">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Report data unavailable
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground mb-6">
            Report ID is missing. Please open this report from the resume upload
            page.
          </p>
        </div>
      </main>
    );
  }

  const analysis = await fetchResumeAnalysis(fileId);

  if (!analysis || !analysis.skillInsights) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-background px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto rounded-3xl border border-border/60 bg-card/90 p-8 shadow-lg shadow-primary/5">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Report data unavailable
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground mb-6">
            Analysis data not found. Please open the report after analysis is
            complete.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      {/* PRINT CSS */}
      <style>
        {`
  @media print {
    h2 {
      page-break-after: avoid;
    }

    p, li {
      page-break-inside: avoid;
    }

    .card {
      break-inside: avoid;
    }
  }
`}
      </style>

      <div id="report-container" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="section">
          <ReportHeader analysis={analysis} />
        </div>

        <div className="section">
          <h2 className="text-xl font-bold mb-2">Skills Analysis</h2>
          <SkillsReport analysis={analysis} />
        </div>

        <div className="section">
          <h2 className="text-xl font-bold mb-2">Experience Insights</h2>
          <ExperienceReport analysis={analysis} />
        </div>

        <div className="section">
          <h2 className="text-xl font-bold mb-2">Projects Analysis</h2>
          <ProjectsReport analysis={analysis} />
        </div>

        <div className="section">
          <Recommendations analysis={analysis} />
        </div>

        <div className="section">
          <InterviewPrep analysis={analysis} />
        </div>
      </div>
    </main>
  );
}
