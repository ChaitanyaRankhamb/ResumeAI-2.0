import { cn } from "@/lib/utils"

interface SectionWrapperProps {
  children: React.ReactNode
  id?: string
  className?: string
  containerClassName?: string
}

export function SectionWrapper({ children, id, className, containerClassName }: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-20 md:py-32", className)}>
      <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  )
}
