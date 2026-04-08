export interface ResumeAnalysis {
  summary: {
    profileSummary: string;
    skillSummary: {
      topSkills: string[];
      skillLevelOverview: string;
      stacks: string[];
    };
    experienceSummary: {
      seniority: string;
      domains: string[];
      growth: string;
    };
    projectSummary: {
      totalProjects: number;
      complexityLevel: string;
      realWorldVsAcademic: string;
    };
    strengths: string[];
    weaknesses?: string[];
  };
  scores: {
    overall: number;
    skills: number;
    experience: number;
    projects: number;
  };
  skillInsights: {
    predictedRole: string;
    primarySkills: string[];
    allSkills: string[];
    score: number;
    stacks: string[];
    skillLevels: Record<string, string>;
    improvementSuggestions: string[];
  };
  experienceInsights: {
    score: number;
    seniority: string;
    domains: string[];
    growthAnalysis: string;
  };
  projectInsights: {
    score: number;
    projectComplexity: string;
    techStrength: string;
    distribution: {
      realWorld: number;
      academic: number;
    };
  };
  context: {
    targetRole: string;
    domain: string;
    careerStage: string;
  };
  interviewPrep: {
    basic: Array<{ question: string; answer: string }>;
    intermediate: Array<{ question: string; answer: string }>;
    advanced: Array<{ question: string; answer: string }>;
  };
  recommendations: {
    resumeImprovements: string[];
    skillsToLearn: string[];
    projectIdeas: string[];
  };
}
