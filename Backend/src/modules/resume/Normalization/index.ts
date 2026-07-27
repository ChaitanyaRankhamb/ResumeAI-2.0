// Resume Normalization System
// Main exports for the normalization pipeline

export { processResume } from './pipeline/pipeline';
export type { PipelineResponse } from './pipeline/pipeline';
export { normalizeResume } from './pipeline/resumeNormalizer';
export type { EnrichedResumeData, ResumeStructuredData } from './types/normalizedResume';

// Services
export * from './services/canonicalization.service';
export * from './services/enrichment.service';
export * from './services/sanitization.service';
export * from './services/standardization.service';

// Mappers
export { DEGREE_CANONICAL_MAP, normalizeDegree } from './mappers/degree.mapper';
export { SKILL_CANONICAL_MAP, SkillMapper } from './mappers/skill.mapper';
