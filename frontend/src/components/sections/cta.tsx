"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-8">
          <FileText className="w-8 h-8 text-accent" />
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
          Start Building Your AI Resume Today
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          Join thousands of job seekers who have landed their dream jobs with Resume AI. 
          Get started in minutes with our free plan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="h-14 px-10 text-base font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="h-14 px-10 text-base font-medium rounded-full hover:bg-secondary transition-all"
          >
            View Demo
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          No credit card required. Free forever for basic features.
        </p>
      </div>
    </section>
  );
}
