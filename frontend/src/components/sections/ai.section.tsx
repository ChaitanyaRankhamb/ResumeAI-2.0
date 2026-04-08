"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Brain, Search, Lightbulb, BarChart } from "lucide-react";

const aiFeatures = [
  {
    icon: Brain,
    title: "NLP-Based Analysis",
    description: "Advanced Natural Language Processing understands context, not just keywords, for deeper resume insights.",
  },
  {
    icon: Search,
    title: "Job Description Matching",
    description: "Compare your resume against specific job descriptions to identify missing keywords and skills.",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description: "Get industry-specific recommendations based on millions of successful resumes in your field.",
  },
  {
    icon: BarChart,
    title: "Resume Scoring",
    description: "Comprehensive scoring system evaluates formatting, content quality, ATS compatibility, and more.",
  },
];

export function AISection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 text-sm font-medium bg-accent/10 text-accent rounded-full mb-4">
            Powered by AI
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            AI That Understands Resumes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our advanced AI goes beyond simple keyword matching to truly understand 
            what makes a resume stand out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {aiFeatures.map((feature) => (
            <Card 
              key={feature.title} 
              className="group bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10"
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 group-hover:from-accent/30 group-hover:to-accent/10 transition-all">
                    <feature.icon className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Visualization */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-accent/10 via-secondary/50 to-background border border-border">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: "10M+", label: "Resumes Analyzed" },
              { value: "500+", label: "Industries Covered" },
              { value: "98%", label: "Accuracy Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-foreground bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
