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
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing GEMINI_API_KEY / OPENROUTER_API_KEY in environment variables",
      );
    }

    const isGemini = Boolean(process.env.GEMINI_API_KEY);
    const apiUrl = isGemini
      ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      : process.env.OPENROUTER_URL || "https://openrouter.ai/api/v1/chat/completions";

    const modelName = isGemini
      ? process.env.GEMINI_MODEL || "gemini-3.6-flash"
      : process.env.OPENROUTER_MODEL || "openrouter/free";

    console.log(`\n------------------------------------------------------`);
    console.log(`[NORMALIZATION:OUTPUT] Normalized Resume Payload for fileId: ${fileId}:`);
    console.log(JSON.stringify(normalizedStructuredData, null, 2));
    console.log(`------------------------------------------------------\n`);

    // ── Step 2: Compute scores deterministically ─────────────────────────────
    // Scores are computed in pure TypeScript — never delegated to the AI.
    // This guarantees the same resume always gets the same score, eliminating
    // the non-determinism that caused 40 vs 70 score swings.
    const computedScores: ResumeScores = computeResumeScores(normalizedStructuredData);

    console.log(
      `[ENGINE:SCORING] Deterministic scores computed: overall=${computedScores.overall}, skills=${computedScores.skills}, experience=${computedScores.experience}, projects=${computedScores.projects}`,
    );

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

    console.log(
      `[AI:INSIGHTS] Calling AI model "${modelName}" via ${isGemini ? "Google Gemini (Free)" : "OpenRouter"} for fileId: ${fileId} to generate final report...`,
    );

    // ── Step 4: Call AI API ──────────────────────────────────────────
    const aiCallStart = Date.now();
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0,        // deterministic output
        max_tokens: 8192,
        response_format: { type: "json_object" },
      }),
    });

    const aiLatency = Date.now() - aiCallStart;
    console.log(`[AI:INSIGHTS] AI model responded in ${aiLatency}ms with HTTP status: ${response.status}`);

    // ── Step 5: Handle non-200 responses ─────────────────────────────────────
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[AI:INSIGHTS] API error ${response.status}: ${errorBody}`);
      throw new Error(`AI API error ${response.status}: ${errorBody}`);
    }

    // ── Step 6: Parse API response ───────────────────────────────────────────
    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[AI:INSIGHTS] Failed to parse HTTP response text: ${responseText.substring(0, 200)}`);
      throw new Error(
        `Unexpected response from AI provider: ${responseText.substring(0, 200)}`,
      );
    }

    const text = result?.choices?.[0]?.message?.content;
    if (!text || text.trim().length === 0) {
      console.error(`[AI:INSIGHTS] Empty response received from OpenRouter`);
      throw new Error("Empty response received from OpenRouter");
    }

    // ── Step 7: Strip markdown fences if present ─────────────────────────────
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      console.log(`[AI:INSIGHTS] Stripping \`\`\`json markdown fences from insights output`);
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      console.log(`[AI:INSIGHTS] Stripping \`\`\` markdown fences from insights output`);
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // ── Step 8: Parse JSON from AI ───────────────────────────────────────────
    let parsedData: ResumeUploadResponse;
    try {
      parsedData = JSON.parse(cleanText) as ResumeUploadResponse;
      console.log(`[AI:INSIGHTS] Final insights JSON parsed successfully`);
    } catch (err) {
      console.error("[AI:INSIGHTS] Failed to parse AI JSON response", {
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
        "[AI:INSIGHTS] Invalid analyzed data: missing or invalid skillInsights",
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

    console.log("[AI:INSIGHTS] Enforced deterministic scores on final output object:", parsedData.scores);

    // ── Step 11: Persist to database ─────────────────────────────────────────
    if (fileId) {
      console.log(`[DB:MONGODB] Updating File ${fileId} in MongoDB with final analyzedData...`);
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
        console.log(`[DB:MONGODB] File ${fileId} successfully updated with analyzedData in database`);

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
        console.error(`[DB:MONGODB] File not found for analyzed data update: ${fileId}`);
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
    console.error("[AI:INSIGHTS] Service Error:", {
      fileId,
      error: error?.message || error,
    });

    return {
      success: false,
      message: error?.message || "Failed to generate analyzed data from AI",
    };
  }
};
