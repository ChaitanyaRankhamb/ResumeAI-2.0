import { normalizeResume } from "./resumeNormalizer";
import { EnrichedResumeData, ResumeStructuredData } from "../types/normalizedResume";

/**
 * Pipeline Response Interface
 */
export interface PipelineResponse {
  success: boolean;
  message: string;
  data?: EnrichedResumeData;
}

/**
 * Resume Normalization Pipeline
 * Entry point for normalizing resume data
 * Accepts raw resume data and returns structured response
 */

/**
 * Processes raw resume data through the normalization pipeline
 * @param rawResume - Raw resume data (any format)
 * @returns Pipeline response with success status and normalized data
 */
export const processResume = async (
  rawResume: ResumeStructuredData,
): Promise<PipelineResponse> => {
  try {
    // Validate input
    if (!rawResume) {
      return {
        success: false,
        message: "Invalid input: Resume data is required",
      };
    }

    // Normalize the resume
    const normalizedResume = await normalizeResume(rawResume);

    return {
      success: true,
      message: "Resume normalized successfully",
      data: normalizedResume,
    };
  } catch (error) {
    console.error("Resume normalization error:", error);
    return {
      success: false,
      message: `Normalization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};
