import { Project, ResumeStructuredData } from "../../types/normalizedResume";
import { CanonicalResume } from "../canonicalization.service";

/**
 * Projects Standardizer
 * Handles:
 * - Name and description casing (Title Case)
 * - URL formatting
 * - Technology casing consistency
 * - Default values
 */

export function standardizeProjects(
  projects: CanonicalResume["projects"],
): ResumeStructuredData["projects"] {
  const toDisplayCase = (value?: string | null): string | null => {
    if (!value) return null;
    return value
      .split(" ")
      .map((word) => {
        if (/[A-Z]{2,}|[a-z][A-Z]|\./.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  };

  // Ensure URL has proper format
  const formatUrl = (url?: string | null): string | null => {
    if (!url) return null;
    // Remove any trailing slashes and ensure proper format
    return url.replace(/\/+$/, "");
  };

  // Normalize technology names to consistent casing
  const normalizeTechnology = (tech: string): string => {
    // Common tech name mappings for consistency
    const techMappings: Record<string, string> = {
      "js": "JavaScript",
      "ts": "TypeScript",
      "py": "Python",
      "rb": "Ruby",
      "php": "PHP",
      "cs": "C#",
      "cpp": "C++",
      "c++": "C++",
      "reactjs": "React",
      "nodejs": "Node.js",
      "mongodb": "MongoDB",
      "postgresql": "PostgreSQL",
      "mysql": "MySQL",
      "html5": "HTML5",
      "css3": "CSS3",
      "aws": "AWS",
      "docker": "Docker",
      "kubernetes": "Kubernetes",
      "git": "Git",
      "github": "GitHub",
      "linux": "Linux",
      "windows": "Windows",
      "macos": "macOS",
    };

    const lowerTech = tech.toLowerCase();
    return techMappings[lowerTech] || toDisplayCase(tech) || tech;
  };

  return projects.map((proj: Project) => ({
    name: toDisplayCase(proj.name),
    // Production point: descriptions are evidence text; preserve extracted
    // casing instead of rewriting technical acronyms and product names.
    description: proj.description,
    technologies: (proj.technologies || []).map(normalizeTechnology),
    github: formatUrl(proj.github),
    live: formatUrl(proj.live),
    highlights: proj.highlights || [],
  }));
}
