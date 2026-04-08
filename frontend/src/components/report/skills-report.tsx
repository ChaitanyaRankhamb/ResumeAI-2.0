import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeAnalysis } from "./types";

interface SkillsReportProps {
  analysis: ResumeAnalysis;
}

export function SkillsReport({ analysis }: SkillsReportProps) {
  const { skillInsights } = analysis;

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced":
        return "bg-[var(--color-chart-4)]/10 text-[var(--color-chart-4)] border-[var(--color-chart-4)]/20";
      case "intermediate":
        return "bg-[var(--color-chart-2)]/10 text-[var(--color-chart-2)] border-[var(--color-chart-2)]/20";
      case "basic":
        return "bg-[var(--color-muted)]/50 text-[var(--color-muted-foreground)] border-[var(--color-border)]";
      default:
        return "bg-[var(--color-muted)]/50 text-[var(--color-muted-foreground)] border-[var(--color-border)]";
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced":
        return "text-[var(--color-chart-4)]";
      case "intermediate":
        return "text-[var(--color-chart-2)]";
      case "basic":
        return "text-[var(--color-muted-foreground)]";
      default:
        return "text-[var(--color-muted-foreground)]";
    }
  };

  return (
    <div className="space-y-8">
      {/* Technical Stack Section */}
      <Card className="relative overflow-hidden border border-border/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full" />
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Technical Stack
            </h2>
          </div>

          <div className="space-y-6">
            {skillInsights.stacks.map((stack) => (
              <div key={stack} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
                  {stack}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {skillInsights.primarySkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="px-4 py-2 text-sm font-medium bg-secondary/50 hover:bg-secondary border-border/50 transition-colors duration-200"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Skill Levels Section */}
      <Card className="relative overflow-hidden border border-border/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full" />
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Skill Proficiency
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(skillInsights.skillLevels).map(([skill, level]) => (
              <div
                key={skill}
                className="group flex items-center justify-between gap-4 p-4 rounded-3xl border border-border/60 bg-muted/70 shadow-[0_6px_15px_-8px_rgba(0,0,0,0.2)] hover:border-primary/20 hover:bg-muted/80 transition-all duration-300"
              >
                <span className="font-medium text-foreground capitalize text-base">
                  {skill}
                </span>
                <Badge
                  className={`${getLevelColor(level)} border font-medium px-3 py-1.5 transition-all duration-200 group-hover:scale-105`}
                >
                  {level}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Improvement Suggestions Section */}
      <Card className="relative overflow-hidden border border-border/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full" />
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Growth Opportunities
            </h2>
          </div>

          <div className="space-y-4">
            {skillInsights.improvementSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="group flex gap-4 p-4 rounded-3xl border border-border/60 bg-muted/70 shadow-[0_6px_15px_-8px_rgba(0,0,0,0.2)] hover:border-primary/20 hover:bg-muted/80 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-foreground leading-relaxed">
                  {suggestion}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
