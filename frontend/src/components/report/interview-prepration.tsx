"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ChevronDown, Sparkles, BookOpen, Layers } from "lucide-react";
import { ResumeAnalysis } from "./types";

interface InterviewPrepProps {
  analysis: ResumeAnalysis;
}

interface ExpandedState {
  [key: string]: boolean;
}

export function InterviewPrep({ analysis }: InterviewPrepProps) {
  const { interviewPrep } = analysis;
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderQuestions = (questions: typeof interviewPrep.basic) => {
    return questions.map((item, idx) => {
      const key = `${item.question}-${idx}`;
      const isExpanded = expanded[key];

      return (
        <div
          key={key}
          className="overflow-hidden rounded-xl border border-border bg-background shadow-sm transition hover:shadow-md hover:border-border"
        >
          <button
            onClick={() => toggleExpanded(key)}
            className="w-full px-5 py-4 flex items-center justify-between gap-3 bg-card hover:bg-muted/50 transition-colors"
          >
            <span className="text-left text-sm font-medium text-foreground">
              {item.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {isExpanded && (
            <div className="border-t border-border/50 bg-muted/40 px-5 py-4 transition-all duration-300 ease-in-out">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="relative overflow-hidden border border-border/50 bg-card shadow-sm">
      <div className="relative p-5 lg:p-6 space-y-6 lg:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs uppercase tracking-wider text-secondary-foreground">
            <Sparkles className="w-4 h-4" />
            interview prep
          </div>

          <div className="space-y-1">
            <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">
              Interview Preparation
            </h2>
            <p className="max-w-3xl text-sm lg:text-base leading-relaxed text-muted-foreground">
              Quick access to curated questions and polished answers to help you
              prepare confidently for interview discussions.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full flex items-center gap-2 rounded-md border border-border/50 bg-muted/50 p-1 h-auto!">
            <TabsTrigger
              value="basic"
              className="flex-1 gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="w-4 h-4" />
              Basics
            </TabsTrigger>

            <TabsTrigger
              value="intermediate"
              className="flex-1 gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Layers className="w-4 h-4" />
              Intermediate
            </TabsTrigger>

            <TabsTrigger
              value="advanced"
              className="flex-1 gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6 space-y-4">
            {renderQuestions(interviewPrep.basic)}
          </TabsContent>

          <TabsContent value="intermediate" className="mt-6 space-y-4">
            {renderQuestions(interviewPrep.intermediate)}
          </TabsContent>

          <TabsContent value="advanced" className="mt-6 space-y-4">
            {renderQuestions(interviewPrep.advanced)}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}