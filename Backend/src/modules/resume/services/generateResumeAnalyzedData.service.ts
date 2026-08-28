import fetch from "node-fetch";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { File } from "../../../entities/files/file";
import { AI_RESPONSE_SYSTEM_PROMPT } from "../../../prompts/ai.response.system.prompt";
import { ResumeUploadResponse } from "../../../types/resumeUploadResponse";

export interface ResumeAnalyzedDataResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    hash: string;
    analyzedData: ResumeUploadResponse;
  };
}

/**
 * Clamps a numerical value to an integer between min and max
 */
function clamp(val: any, fallback = 0, min = 0, max = 100): number {
  const num = typeof val === "number" && !isNaN(val) ? val : fallback;
  return Math.min(Math.max(Math.round(num), min), max);
}

export const generateResumeAnalyzedData = async (
  fileId: string,
  parsedText: string,
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

    console.log(
      `[AI:INSIGHTS] Calling single-pass AI model "${modelName}" via ${isGemini ? "Google Gemini (Free)" : "OpenRouter"} for fileId: ${fileId} (Input text: ${parsedText.length} chars)...`,
    );

    const messages = [
      {
        role: "system",
        content: AI_RESPONSE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Resume Text:\n${parsedText}`,
      },
    ];

    // ── Call AI API ──────────────────────────────────────────────────────────
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
        temperature: 0.1,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      }),
    });

    const aiLatency = Date.now() - aiCallStart;
    console.log(`[AI:INSIGHTS] AI model responded in ${aiLatency}ms with HTTP status: ${response.status}`);

    // ── Handle non-200 responses ─────────────────────────────────────────────
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[AI:INSIGHTS] API error ${response.status}: ${errorBody}`);
      throw new Error(`AI API error ${response.status}: ${errorBody}`);
    }

    // ── Parse API response ───────────────────────────────────────────────────
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
      console.error(`[AI:INSIGHTS] Empty response received from AI model choices`);
      throw new Error("Empty response received from AI model");
    }

    // ── Strip markdown fences if present ─────────────────────────────────────
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      console.log(`[AI:INSIGHTS] Stripping \`\`\`json markdown fences from insights output`);
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      console.log(`[AI:INSIGHTS] Stripping \`\`\` markdown fences from insights output`);
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // ── Parse JSON from AI ───────────────────────────────────────────────────
    let parsedData: ResumeUploadResponse;
    try {
      parsedData = JSON.parse(cleanText) as ResumeUploadResponse;
      console.log(`[AI:INSIGHTS] Single-pass analysis JSON parsed successfully`);
    } catch (err) {
      console.error("[AI:INSIGHTS] Failed to parse AI JSON response", {
        fileId,
        responseLength: cleanText.length,
      });
      throw new Error("Invalid JSON format from AI model text response");
    }

    // ── Validate and enforce required structure ──────────────────────────────
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

    // ── Ensure score synchronization and bounds ──────────────────────────────
    parsedData.scores = parsedData.scores || {
      overall: 0,
      skills: 0,
      experience: 0,
      projects: 0,
    };

    parsedData.scores.skills = clamp(
      parsedData.scores.skills ?? parsedData.skillInsights?.score,
      50,
    );
    parsedData.scores.projects = clamp(
      parsedData.scores.projects ?? parsedData.projectInsights?.score,
      50,
    );
    parsedData.scores.experience = clamp(
      parsedData.scores.experience ?? parsedData.experienceInsights?.score,
      50,
    );
    parsedData.scores.overall = clamp(
      parsedData.scores.overall ??
        Math.round(
          parsedData.scores.skills * 0.3 +
            parsedData.scores.projects * 0.4 +
            parsedData.scores.experience * 0.3,
        ),
      Math.round(
        parsedData.scores.skills * 0.3 +
          parsedData.scores.projects * 0.4 +
          parsedData.scores.experience * 0.3,
      ),
    );

    if (parsedData.skillInsights) {
      parsedData.skillInsights.score = parsedData.scores.skills;
    }
    if (parsedData.experienceInsights) {
      parsedData.experienceInsights.score = parsedData.scores.experience;
    }
    if (parsedData.projectInsights) {
      parsedData.projectInsights.score = parsedData.scores.projects;
    }

    // Ensure interview prep arrays exist
    parsedData.interviewPrep = parsedData.interviewPrep || {
      basic: [],
      intermediate: [],
      advanced: [],
    };
    parsedData.interviewPrep.basic = parsedData.interviewPrep.basic || [];
    parsedData.interviewPrep.intermediate = parsedData.interviewPrep.intermediate || [];
    parsedData.interviewPrep.advanced = parsedData.interviewPrep.advanced || [];

    console.log("[AI:INSIGHTS] Final synchronized scores:", parsedData.scores);

    // ── Persist to database ──────────────────────────────────────────────────
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
