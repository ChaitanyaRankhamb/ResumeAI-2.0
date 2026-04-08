import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeAnalysis } from "./types";

interface ProjectsReportProps {
  analysis: ResumeAnalysis;
}

export function ProjectsReport({ analysis }: ProjectsReportProps) {
  const { projectInsights } = analysis;

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case "high":
        return "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] border-[var(--color-destructive)]/20";
      case "medium":
        return "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20";
      case "low":
        return "bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success)]/25";
      default:
        return "bg-[var(--color-muted)]/40 text-[var(--color-muted-foreground)] border-[var(--color-border)]";
    }
  };

  return (
    <Card className="relative overflow-hidden border border-border/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]  bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

      <div className="relative p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Projects Insights
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            Project performance and technical impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Projects Score
            </div>
            <div className="text-4xl lg:text-5xl font-bold text-foreground">
              {projectInsights.score}/100
            </div>
            <div className="mt-4 h-2 rounded-full bg-[var(--color-border)]/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${projectInsights.score}%` }}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Complexity Level
            </div>
            <Badge
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${getComplexityColor(projectInsights.projectComplexity)}`}
            >
              {projectInsights.projectComplexity}
            </Badge>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The project complexity rating reflects how advanced and ambitious
              the project scope appears.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Tech Strength
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {projectInsights.techStrength}
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Strength profile
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Project Distribution
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-card/90 p-4 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.12)] ">
              <p className="text-sm text-muted-foreground">
                Real-World Projects
              </p>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {projectInsights.distribution.realWorld}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/90 p-4 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.12)]">
              <p className="text-sm text-muted-foreground">Academic Projects</p>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {projectInsights.distribution.academic}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
