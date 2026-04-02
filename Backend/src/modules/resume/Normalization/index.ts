// Resume Normalization System
// Main exports for the normalization pipeline

export { processResume } from './pipeline/pipeline';
export type { PipelineResponse } from './pipeline/pipeline';
export { normalizeResume } from './pipeline/resumeNormalizer';
export type { ResumeStructuredData, EnrichedResumeData } from './types/normalizedResume';

// Services
export * from './services/sanitization.service';
export * from './services/canonicalization.service';
export * from './services/standardization.service';
export * from './services/enrichment.service';

// Mappers
export { SkillMapper, SKILL_CANONICAL_MAP } from './mappers/skill.mapper';
export { normalizeDegree, DEGREE_CANONICAL_MAP } from './mappers/degree.mapper';