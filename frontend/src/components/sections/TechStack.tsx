import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const techCategories = [
  {
    category: "Frontend",
    color: "bg-blue-500",
    items: [
      { name: "Next.js", icon: "▲" },
      { name: "Tailwind CSS", icon: "~" },
      { name: "shadcn/ui", icon: "S" },
    ],
  },
  {
    category: "Backend",
    color: "bg-green-500",
    items: [
      { name: "Node.js", icon: "N" },
      { name: "Express", icon: "E" },
      { name: "MongoDB", icon: "M" },
    ],
  },
  {
    category: "AI",
    color: "bg-accent",
    items: [
      { name: "OpenAI API", icon: "O" },
    ],
  },
  {
    category: "DevOps",
    color: "bg-orange-500",
    items: [
      { name: "Docker", icon: "D" },
      { name: "Redis", icon: "R" },
    ],
  },
];

export function TechStack() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Built with modern tech stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Industry-standard technologies for reliability and performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techCategories.map((category) => (
            <Card 
              key={category.category} 
              className="bg-card border-border hover:border-accent/50 transition-all duration-300 group"
            >
              <CardContent className="p-6">
                <Badge className={`${category.color} text-white mb-4`}>
                  {category.category}
                </Badge>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 group-hover:bg-secondary transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm">
                        {item.icon}
                      </div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
