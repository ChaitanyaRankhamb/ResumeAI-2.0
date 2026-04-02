export interface ResumeUploadResponse {
  skillInsights: {
    allSkills: string[];
    primarySkills: string[];
    skillLevels: Record<string, "beginner" | "intermediate" | "advanced">;
    stacks: string[];
    predictedRole: string;
    score: number;
    improvementSuggestions: string[];
  };

  experienceInsights: {
    seniority: "intern" | "fresher" | "junior" | "mid" | "senior";
    domains: string[];
    growthAnalysis: string;
    score: number;
  };

  projectInsights: {
    projectComplexity: "low" | "medium" | "high";
    distribution: {
      realWorld: number;
      academic: number;
    };
    techStrength: string;
    score: number;
  };

  context: {
    domain: string;
    targetRole: string;
    careerStage: "student" | "fresher" | "experienced";
  };

  scores: {
    overall: number;
    skills: number;
    experience: number;
    projects: number;
  };

  summary: {
    profileSummary: string;
    strengths: string[];
    weaknesses: string[];

    projectSummary: {
      totalProjects: number;
      complexityLevel: "low" | "medium" | "high";
      realWorldVsAcademic: string;
    };

    experienceSummary: {
      seniority: string;
      domains: string[];
      growth: string;
    };

    skillSummary: {
      topSkills: string[];
      stacks: string[];
      skillLevelOverview: string;
    };
  };

  recommendations: {
    resumeImprovements: string[];
    skillsToLearn: string[];
    projectIdeas: string[];
  };

  interviewPrep: {
    basic: {
      question: string;
      answer: string;
    }[];
    intermediate: {
      question: string;
      answer: string;
    }[];
    advanced: {
      question: string;
      answer: string;
    }[];
  };
}