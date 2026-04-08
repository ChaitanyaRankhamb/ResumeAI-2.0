import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumeAnalysis } from './types';

interface ReportHeaderProps {
  analysis: ResumeAnalysis;
}

export function ReportHeader({ analysis }: ReportHeaderProps) {

  const getProgress = (score: number) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
  };

  const ScoreCircle = ({
    score,
    label,
    color
  }: {
    score: number;
    label: string;
    color: string;
  }) => (
    <div className="group relative p-6 rounded-2xl border border-border/60 bg-muted/70 transition-all duration-300 hover:border-primary/60">
      
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
        {label}
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-28 h-28">
          
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              strokeWidth="8"
              className="text-border/70"
              fill="none"
            />

            {/* Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={getProgress(score)}
              className={`${color} transition-all duration-700 ease-out`}
              strokeLinecap="round"
            />
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${color.replace('stroke', 'text')}`}>
              {score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="relative overflow-hidden border border-border/50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

      <div className="relative p-8 lg:p-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Resume Analysis Report
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            {analysis.skillInsights.predictedRole}
          </h1>

          <p className="text-base lg:text-lg text-muted-foreground max-w-3xl">
            {analysis.summary.profileSummary}
          </p>
        </div>

        {/* Score Circles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreCircle score={analysis.scores.overall} label="Overall" color="stroke-red-500" />
          <ScoreCircle score={analysis.scores.skills} label="Skills" color="stroke-blue-500" />
          <ScoreCircle score={analysis.scores.experience} label="Experience" color="stroke-yellow-500" />
          <ScoreCircle score={analysis.scores.projects} label="Projects" color="stroke-green-500" />
        </div>

        {/* Strengths */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Key Strengths
          </h3>

          <div className="flex flex-wrap gap-2">
            {analysis.summary.strengths.map((strength, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="px-3 py-1.5 text-sm font-medium bg-secondary/80 hover:bg-secondary border-border/50"
              >
                {strength}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}