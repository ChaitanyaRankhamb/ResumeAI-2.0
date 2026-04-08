import { Clock, TrendingUp, Sparkles, Brain } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Saves Time",
    description: "Create a polished, professional resume in minutes instead of hours.",
  },
  {
    icon: TrendingUp,
    title: "More Interviews",
    description: "Optimized resumes get 3x more callbacks from recruiters.",
  },
  {
    icon: Sparkles,
    title: "Better Quality",
    description: "AI-powered suggestions improve your content and formatting.",
  },
  {
    icon: Brain,
    title: "Smart Insights",
    description: "Data-driven recommendations based on successful resumes.",
  },
];

export function Benefits() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Why choose Resume AI?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Join thousands of job seekers who have landed their dream jobs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div 
              key={benefit.title} 
              className="text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                <benefit.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
