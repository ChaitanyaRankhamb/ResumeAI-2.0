import { cookies } from "next/headers";
import { ResumeAnalysis } from "@/components/report/types";
import { ReportHeader } from "@/components/report/report-header";
import { SkillsReport } from "@/components/report/skills-report";
import { ExperienceReport } from "@/components/report/experience-report";
import { ProjectsReport } from "@/components/report/project-report";
import { Recommendations } from "@/components/report/recommendations";
import { InterviewPrep } from "@/components/report/interview-prepration";
import { se } from "date-fns/locale";

interface ReportPageProps {
  searchParams: {
    fileId?: string;
  };
}

async function fetchResumeAnalysis(
  fileId: string,
): Promise<ResumeAnalysis | null> {
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

  const response = await fetch(
    `http://localhost:5000/resume/analysis/${fileId}`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error(
      `Report fetch failed: ${response.status} ${response.statusText}`,
    );
    return null;
  }

  const json = await response.json();
  return json?.data?.analyzedData || null;
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
