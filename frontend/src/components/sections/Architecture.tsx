import { ArrowRight, Database, Globe, Server, ShieldCheck, User } from "lucide-react"
import { SectionWrapper } from "@/components/layout/SectionWrapper"

const flow = [
  { icon: User, label: "User", color: "text-blue-500" },
  { icon: Globe, label: "Frontend", color: "text-indigo-500" },
  { icon: Server, label: "Backend", color: "text-violet-500" },
  { icon: Database, label: "Redis/MongoDB", color: "text-emerald-500" },
  { icon: ShieldCheck, label: "JWT Response", color: "text-rose-500" },
]

export function Architecture() {
  return (
    <SectionWrapper id="architecture" className="border-t">
      <div className="mb-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          System Architecture
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          A visual overview of the request flow through the authentication system.
        </p>
      </div>
      
      <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-12">
        {flow.map((item, index) => (
          <div key={item.label} className="flex flex-col md:flex-row items-center gap-8 md:gap-4 lg:gap-12">
            <div className="flex flex-col items-center gap-4 group">
              <div className={`flex h-20 w-20 items-center justify-center rounded-3xl border bg-background shadow-lg transition-all group-hover:-translate-y-2 group-hover:shadow-xl ${item.color}`}>
                <item.icon className="h-10 w-10" />
              </div>
              <span className="font-bold text-sm tracking-wide uppercase text-muted-foreground">{item.label}</span>
            </div>
            
            {index < flow.length - 1 && (
              <div className="flex flex-col items-center justify-center">
                <ArrowRight className="h-8 w-8 text-muted-foreground/30 hidden md:block" />
                <div className="h-8 w-px bg-muted-foreground/30 md:hidden" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-20 rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
        <h3 className="text-3xl font-bold mb-6">Ready to secure your application?</h3>
        <p className="max-w-xl mx-auto text-lg text-primary-foreground/80 mb-10">
          Join thousands of developers building secure applications with AuthFlow.
        </p>
        <button className="rounded-2xl bg-white px-10 py-4 text-lg font-bold text-primary transition-all hover:bg-gray-100 active:scale-95 shadow-xl shadow-white/10">
          Get Started Now
        </button>
      </div>
    </SectionWrapper>
  )
}
