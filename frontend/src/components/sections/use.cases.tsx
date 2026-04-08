import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Code2, ArrowRightLeft, Briefcase } from "lucide-react";

const useCases = [
  {
    icon: GraduationCap,
    title: "Students & Freshers",
    description: "Create your first professional resume with AI guidance tailored for entry-level positions.",
    highlight: "No experience? No problem.",
  },
  {
    icon: Code2,
    title: "Developers",
    description: "Showcase your technical skills, projects, and contributions in a format that recruiters love.",
    highlight: "Tech-optimized templates.",
  },
  {
    icon: ArrowRightLeft,
    title: "Job Switchers",
    description: "Highlight transferable skills and reframe your experience for a new industry or role.",
    highlight: "Smooth career transitions.",
  },
  {
    icon: Briefcase,
    title: "Freelancers",
    description: "Build a portfolio-style resume that showcases your diverse projects and client work.",
    highlight: "Stand out from the crowd.",
  },
];

export function UseCases() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Built for everyone
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Whether you are starting out or leveling up, Resume AI adapts to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase) => (
            <Card 
              key={useCase.title} 
              className="bg-card border-border hover:border-accent/50 transition-all duration-300 group overflow-hidden"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                  <useCase.icon className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {useCase.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-accent/10 text-accent rounded-full">
                  {useCase.highlight}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
