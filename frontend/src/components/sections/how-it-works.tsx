import { Card, CardContent } from "@/components/ui/card";
import { Upload, Brain, BarChart3, Download } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload or Create",
    description: "Upload your existing resume or start fresh with our smart builder templates.",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analyzes",
    description: "Our AI analyzes your content, structure, and keywords against industry standards.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Get ATS Score",
    description: "Receive your ATS compatibility score with detailed improvement suggestions.",
  },
  {
    step: "04",
    icon: Download,
    title: "Optimize & Download",
    description: "Apply suggestions, perfect your resume, and download in ATS-friendly format.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Four simple steps to your perfect, job-winning resume.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={step.step} 
              className="relative bg-card border-border hover:border-accent/50 transition-all duration-300 group"
            >
              <CardContent className="pt-8 pb-6 px-6">
                {/* Step number */}
                <div className="absolute -top-4 left-6">
                  <span className="inline-block px-3 py-1 text-xs font-bold bg-accent text-accent-foreground rounded-full">
                    {step.step}
                  </span>
                </div>

                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
                )}

                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                  <step.icon className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
