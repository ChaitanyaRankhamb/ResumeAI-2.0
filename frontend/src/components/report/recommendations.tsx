"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import { ResumeAnalysis } from "./types";

interface RecommendationsProps {
  analysis: ResumeAnalysis;
}

export function Recommendations({ analysis }: RecommendationsProps) {
  const { recommendations } = analysis;

  return (
    <Card className="relative overflow-hidden border border-border/40 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />

      <div className="relative p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-1 w-12 bg-gradient-to-r from-primary to-accent rounded-full" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">
              Growth Recommendations
            </h2>
          </div>
        </div>

        <Tabs defaultValue="improvements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 h-auto!">
            <TabsTrigger
              value="improvements"
              className="gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="improvements" className="mt-6 space-y-4">
            <div className="space-y-4">
              {recommendations.resumeImprovements.map((improvement, idx) => (
                <div
                  key={idx}
                  className="group relative p-5 rounded-xl bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/50 hover:to-muted/70 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="text-foreground leading-relaxed group-hover:text-foreground/90 transition-colors">
                        {improvement}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.skillsToLearn.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="group relative p-4 text-sm font-medium bg-gradient-to-r from-secondary/80 to-secondary hover:from-secondary hover:to-secondary/90 border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-sm hover:scale-[1.02] justify-start h-auto"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span>{skill}</span>
                  </div>
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6 space-y-4">
            <div className="space-y-4">
              {recommendations.projectIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className="group relative p-6 rounded-xl border border-border/50 bg-gradient-to-r from-card to-card/80 hover:from-card hover:to-muted/30 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
                      <Lightbulb className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground leading-relaxed group-hover:text-foreground/90 transition-colors">
                        {idea}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
