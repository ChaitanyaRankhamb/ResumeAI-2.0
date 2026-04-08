import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, FileEdit, Search, MessageSquare, Download, GitBranch, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Resume Analysis",
    description: "Get instant, intelligent suggestions to improve your resume based on industry standards.",
  },
  {
    icon: Target,
    title: "ATS Score Checker",
    description: "See exactly how well your resume performs against Applicant Tracking Systems.",
  },
  {
    icon: FileEdit,
    title: "Smart Resume Builder",
    description: "Create professional resumes with pre-built templates optimized for your industry.",
  },
  {
    icon: Search,
    title: "Keyword Optimization",
    description: "Automatically identify and suggest keywords that match job descriptions.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Feedback",
    description: "Receive instant suggestions as you type to improve your content quality.",
  },
  {
    icon: Download,
    title: "Export to PDF",
    description: "Download your polished resume in ATS-friendly PDF format, ready to submit.",
  },
  {
    icon: GitBranch,
    title: "Version Management",
    description: "Save multiple versions of your resume tailored for different job applications.",
  },
  {
    icon: Users,
    title: "Role-based Suggestions",
    description: "Get customized advice whether you are a developer, fresher, or career switcher.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything you need to land your dream job
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Powerful AI-driven features to create, optimize, and perfect your resume.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="group bg-card border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
