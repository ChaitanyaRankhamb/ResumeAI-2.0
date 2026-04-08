import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeAnalysis } from "./types";

interface ExperienceReportProps {
  analysis: ResumeAnalysis;
}

export function ExperienceReport({ analysis }: ExperienceReportProps) {
  const { experienceInsights, context } = analysis;

  return (
    <Card className="relative overflow-hidden border border-border/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)]  bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

      <div className="relative p-6 lg:p-8 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-secondary-foreground">
            Experience overview
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Experience Overview
            </h2>
            <p className="max-w-3xl text-sm lg:text-base leading-relaxed text-muted-foreground">
              A premium summary of your career strength, trajectory, and growth
              potential.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Seniority Level
            </div>
            <div className="text-3xl font-bold text-foreground">
              {experienceInsights.seniority}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Experience Score
            </div>
            <div className="text-3xl font-bold text-foreground">
              {experienceInsights.score}/100
            </div>
            <div className="mt-4 h-2 rounded-full bg-[var(--color-border)]/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${experienceInsights.score}%` }}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Career Stage
            </div>
            <div className="text-3xl font-bold text-foreground capitalize">
              {context.careerStage}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Key Domains
              </h3>
              <p className="text-sm text-muted-foreground">
                Top areas that define your expertise.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {experienceInsights.domains.length} domains
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {experienceInsights.domains.map((domain) => (
              <Badge
                key={domain}
                variant="secondary"
                className="px-4 py-2 text-sm font-medium bg-secondary/80 hover:bg-secondary/90 border-border/50"
              >
                {domain}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-muted/70 p-6 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.25)] hover:border-primary transition-all duration-300">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-primary to-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Growth Analysis
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {experienceInsights.growthAnalysis}
          </p>
        </div>
      </div>
    </Card>
  );
}
