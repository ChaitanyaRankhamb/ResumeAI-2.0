import { Card, CardContent } from "@/components/ui/card";
import { XCircle, CheckCircle } from "lucide-react";

export function ProblemSolution() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            The Problem with Traditional Resumes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Most job seekers face the same frustrating challenge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <Card className="bg-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">The Problem</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Most resumes fail ATS systems and never reach recruiters.
              </p>
              <ul className="space-y-3">
                {[
                  "75% of resumes are rejected by ATS",
                  "Poor keyword optimization",
                  "Outdated formatting",
                  "No feedback on improvements",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Solution Card */}
          <Card className="bg-accent/5 border-accent/20 hover:border-accent/40 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">The Solution</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Resume AI helps you create optimized resumes that pass ATS and stand out.
              </p>
              <ul className="space-y-3">
                {[
                  "AI-powered ATS optimization",
                  "Smart keyword suggestions",
                  "Modern, recruiter-friendly templates",
                  "Real-time improvement feedback",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
