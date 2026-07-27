import fetch from "node-fetch";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { File } from "../../../entities/files/file";
import { AI_RESPONSE_SYSTEM_PROMPT } from "../../../prompts/ai.response.system.prompt";
import { ResumeUploadResponse } from "../../../types/resumeUploadResponse";
import { EnrichedResumeData } from "../Normalization/types/normalizedResume";
import {
  computeResumeScores,
  ResumeScores,
} from "../Normalization/services/scoring.service";

export interface ResumeAnalyzedDataResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    hash: string;
    analyzedData: ResumeUploadResponse;
  };
}

// OpenRouter endpoint
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateResumeAnalyzedData = async (
  fileId: string,
  normalizedStructuredData: EnrichedResumeData,
): Promise<ResumeAnalyzedDataResponse> => {
  try {
    // ── Step 1: Validate API key ─────────────────────────────────────────────
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENROUTER_API_KEY / OPENAI_API_KEY in environment variables",
      );
    }

    const modelName = process.env.OPENROUTER_MODEL || "gpt-4o-mini";

    // ── Step 2: Compute scores deterministically ─────────────────────────────
    // Scores are computed in pure TypeScript — never delegated to the AI.
    // This guarantees the same resume always gets the same score, eliminating
    // the non-determinism that caused 40 vs 70 score swings.
    const computedScores: ResumeScores = computeResumeScores(normalizedStructuredData);

    console.info("[generateResumeAnalyzedData] Computed scores:", computedScores);

    // ── Step 3: Build the AI input payload ──────────────────────────────────
    // We pass both the enriched resume data AND the computed scores.
    // The AI receives scores as immutable facts and must copy them into output.
    const inputPayload = {
      resumeData: normalizedStructuredData,
      computedScores,
    };

    const messages = [
      {
        role: "system",
        content: AI_RESPONSE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: JSON.stringify(inputPayload, null, 2),
      },
    ];

    // ── Step 4: Call OpenRouter API ──────────────────────────────────────────
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0,        // deterministic output
        max_tokens: 4000,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
    });

    // ── Step 5: Handle non-200 responses ─────────────────────────────────────
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
    }

    // ── Step 6: Parse API response ───────────────────────────────────────────
    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Unexpected response from OpenRouter: ${responseText.substring(0, 200)}`,
      );
    }

    const text = result?.choices?.[0]?.message?.content;
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response received from OpenRouter");
    }

    // ── Step 7: Strip markdown fences if present ─────────────────────────────
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // ── Step 8: Parse JSON from AI ───────────────────────────────────────────
    let parsedData: ResumeUploadResponse;
    try {
      parsedData = JSON.parse(cleanText) as ResumeUploadResponse;
    } catch (err) {
      console.error("Failed to parse AI JSON response", {
        fileId,
        responseLength: cleanText.length,
      });
      throw new Error("Invalid JSON format from OpenRouter text response");
    }

    // ── Step 9: Validate required fields ─────────────────────────────────────
    if (
      !parsedData.skillInsights ||
      !parsedData.skillInsights.allSkills ||
      !Array.isArray(parsedData.skillInsights.allSkills)
    ) {
      console.error(
          "Invalid analyzed data: missing or invalid skillInsights",
        );
      throw new Error("AI response missing required skillInsights data");
    }

    // ── Step 10: Enforce computed scores in parsed output ────────────────────
    // Even if the AI drifted from the instruction, we hard-override all score
    // fields here so the stored data is always consistent with the engine.
    parsedData.skillInsights.score = computedScores.skills;
    parsedData.experienceInsights.score = computedScores.experience;
    parsedData.projectInsights.score = computedScores.projects;
    parsedData.scores = {
      overall: computedScores.overall,
      skills: computedScores.skills,
      experience: computedScores.experience,
      projects: computedScores.projects,
    };

    console.info("[generateResumeAnalyzedData] Final enforced scores:", parsedData.scores);

    // ── Step 11: Persist to database ─────────────────────────────────────────
    if (fileId) {
      const file = await fileRepository.findFileById(fileId);
      if (file) {
        const updatedFile = new File(
          file.id,
          file.userId,
          file.getName(),
          file.getOriginalName(),
          file.getPath(),
          file.getSize(),
          file.getHash(),
          file.getFormat(),
          file.uploadedAt,
          file.getParseText(),
          file.getStructuredData(),
          parsedData,
        );

        await fileRepository.updateFile(updatedFile);

        return {
          success: true,
          message: "Resume analyzed successfully",
          data: {
            id: file.id,
            hash: file.getHash(),
            analyzedData: parsedData,
          },
        };
      } else {
        return {
          success: false,
          message: "File not found for analyzed data update",
        };
      }
    }

    return {
      success: false,
      message: "File ID not provided, cannot associate analyzed data",
    };
  } catch (error: any) {
    console.error("[generateResumeAnalyzedData] AI Service Error:", {
      fileId,
      error: error?.message || error,
    });

    return {
      success: false,
      message: error?.message || "Failed to generate analyzed data from AI",
    };
  }
};
