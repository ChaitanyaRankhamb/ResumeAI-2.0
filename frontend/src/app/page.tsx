import { Navbar } from "@/components/layout/Navbar";
import { AISection } from "@/components/sections/ai.section";
import { Benefits } from "@/components/sections/benefits";
import { CTA } from "@/components/sections/cta";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { ProblemSolution } from "@/components/sections/problem.solution";
import { TechStack } from "@/components/sections/TechStack";
import { Testimonials } from "@/components/sections/testimonial";
import { UseCases } from "@/components/sections/use.cases";


export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <section id="features">
        <Features />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="ai-section">
        <AISection />
      </section>
      <section id="tech-stack">
        <TechStack />
      </section>
      <section id="use-cases">
        <UseCases />
      </section>
      <Benefits />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
