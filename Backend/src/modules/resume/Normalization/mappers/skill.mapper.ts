// /normalization/mappers/skill.mapper.ts

import Fuse from "fuse.js";

/**
 * Canonical skill mapping dictionary
 * Maps different variations → one standard skill
 */
export const SKILL_CANONICAL_MAP: Record<string, string> = {
  // JavaScript Ecosystem
  "js": "javascript",
  "javascript": "javascript",
  "ecmascript": "javascript",

  "node": "node.js",
  "nodejs": "node.js",
  "node.js": "node.js",

  "react": "react",
  "reactjs": "react",
  "react.js": "react",

  "next": "next.js",
  "nextjs": "next.js",

  "vue": "vue.js",
  "vuejs": "vue.js",

  "angular": "angular",

  // Backend
  "spring": "spring",
  "springboot": "spring boot",
  "spring boot": "spring boot",

  "django": "django",
  "flask": "flask",
  "express": "express.js",
  "expressjs": "express.js",

  // Databases
  "mongo": "mongodb",
  "mongodb": "mongodb",
  "mysql": "mysql",
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "redis": "redis",

  // Programming Languages
  "c++": "cpp",
  "cpp": "cpp",
  "c": "c",
  "java": "java",
  "python": "python",
  "typescript": "typescript",
  "ts": "typescript",
  "go": "golang",
  "golang": "golang",
  "rust": "rust",

  // DevOps
  "docker": "docker",
  "k8s": "kubernetes",
  "kubernetes": "kubernetes",

  // Cloud
  "aws": "aws",
  "gcp": "gcp",
  "azure": "azure",

  // AI/ML
  "ml": "machine learning",
  "machine learning": "machine learning",
  "deep learning": "deep learning",
  "nlp": "natural language processing",
};

/**
 * SkillMapper class
 * Responsible for normalizing skills using:
 * 1. Exact mapping
 * 2. Fuzzy matching
 * 3. Unknown handling
 */
export class SkillMapper {
  private fuzzy: Fuse<string>;

  constructor(private skillMap: Record<string, string> = SKILL_CANONICAL_MAP) {
    /**
     * Prepare list of known canonical skills for fuzzy search
     */
    // Create a unique set of canonical skill values (deduplicated)
    const knownSkills = Array.from(new Set(Object.values(this.skillMap)));

    /**
     * Initialize Fuse.js for fuzzy matching
     * threshold:
     * 0 → exact match
     * 1 → very loose match
     * Recommended: 0.3 (balanced)
     */
    this.fuzzy = new Fuse(knownSkills, {
      threshold: 0.3,
    });
  }

  /**
   * Normalize a single skill
   */
  normalize(skill: string): string {
    if (!skill) return "";

    // Step 0: Basic sanitization (defensive)
    const key = skill.toLowerCase().trim();

    // Step 1: Exact match from canonical map
    if (this.skillMap[key]) {
      return this.skillMap[key];
    }

    // Step 2: Fuzzy match (handles typos / variations)
    const result = this.fuzzy.search(key);

    if (result.length && result[0].score !== undefined && result[0].score < 0.3) {
      return result[0].item;
    }

    // Step 3: Unknown skill handling
    this.handleUnknownSkill(key);

    // Return as-is (system learns later)
    return key;
  }

  /**
   * Normalize multiple skills
   * - Applies normalization
   * - Removes duplicates
   */
  normalizeBulk(skills: string[]): string[] {
    if (!skills || !Array.isArray(skills)) return [];

    const normalized = skills.map((skill) => this.normalize(skill));

    // Remove duplicates using Set & return back to array
    return Array.from(new Set(normalized)); 
  }

  /**
   * Handle unknown skills
   * Future scope:
   * - Store in DB
   * - Send to analytics
   * - Admin review
   */
  private handleUnknownSkill(skill: string) {
    console.warn("Unknown skill detected:", skill);

    // Example future implementation:
    // saveToDB({ skill, status: "unverified", timestamp: new Date() });
  }
}