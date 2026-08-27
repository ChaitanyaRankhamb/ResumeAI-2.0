import fetch from "node-fetch";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { File } from "../../../entities/files/file";
import { SYSTEM_PROMPT } from "../../../prompts/structuredData.system.prompt";

interface GenerateStructuredDataResponse {
  success: boolean;
  message: string;
  data?: any;
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Generates structured JSON data from parsed resume text using OpenRouter/OpenAI model
 * @param fileId - Unique identifier of the resume file
 * @param parsedText - Raw text extracted from the resume
 * @returns Promise with success status and structured data
 */
export const generateStructuredData = async (
  fileId: string,
  parsedText: string,
): Promise<GenerateStructuredDataResponse> => {
  try {
    // Retrieve the file to ensure it exists and get user context
    const file = await fileRepository.findFileById(fileId);
    if (!file) {
      return {
        success: false,
        message: "File not found",
      };
    }

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
      `[AI:STRUCTURING] Calling AI model "${modelName}" via ${isGemini ? "Google Gemini (Free)" : "OpenRouter"} for fileId: ${fileId} (Input text: ${parsedText.length} chars)`,
    );

    // BUG FIX #2: Previously, SYSTEM_PROMPT was injected TWICE —
    // once as the system role message AND again prepended to the user message.
    // This wasted ~600 tokens per request, shrinking the output budget and
    // causing truncated / incomplete JSON responses (especially for resumes
    // with many projects). Now the system message holds the prompt, and the
    // user message carries ONLY the resume text.
    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Resume Text:\n${parsedText}`,
      },
    ];

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
        temperature: 0,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      }),
    });

    const aiLatency = Date.now() - aiCallStart;
    console.log(`[AI:STRUCTURING] AI API responded in ${aiLatency}ms with HTTP status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[AI:STRUCTURING] API error ${response.status}: ${errorBody}`);
      throw new Error(`AI API error ${response.status}: ${errorBody}`);
    }

    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[AI:STRUCTURING] Failed to parse HTTP response text: ${responseText.substring(0, 200)}`);
      throw new Error(
        `Unexpected response from AI provider: ${responseText.substring(0, 200)}`,
      );
    }
    const text = result?.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      console.error(`[AI:STRUCTURING] Empty response received from AI model choices`);
      return {
        success: false,
        message: "Empty response received from OpenRouter",
      };
    }

    // BUG FIX #1 (CRITICAL): GPT-4o-mini (and most OpenRouter models) wrap
    // their JSON output in markdown code fences by default:
    //   ```json
    //   { "identity": {...}, "projects": [...] }
    //   ```
    // Calling JSON.parse() on fenced text throws a SyntaxError, causing
    // structuredData to stay undefined. The service then returned
    // { success: false, data: undefined }, but resume.service.ts only logged
    // a warning and continued — so validateStructuredData(undefined) silently
    // returned { projects: [], ... }, making projects always empty.
    // Fix: strip any fences before parsing, mirroring what
    // generateResumeAnalyzedData.service.ts already does correctly.
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      console.log(`[AI:STRUCTURING] Stripping \`\`\`json markdown fence from AI output`);
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      console.log(`[AI:STRUCTURING] Stripping \`\`\` markdown fence from AI output`);
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let structuredData;
    try {
      structuredData = JSON.parse(cleanText); // parse the fence-stripped text
      console.log(`[AI:STRUCTURING] JSON parsed successfully from AI output`);
    } catch (parseError) {
      console.error(`[AI:STRUCTURING] Failed to parse AI output as JSON:`, cleanText.substring(0, 200));
      return {
        success: false,
        message: "Failed to parse AI response as JSON",
      };
    }

    console.log(`[DB:MONGODB] Updating file ${fileId} with AI-generated structured data...`);

    // Update the file with the AI-generated structured data
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
      structuredData, // Store the AI-generated structured data
    );

    const updateResult = await fileRepository.updateFile(updatedFile);
    if (!updateResult) {
      console.error(`[DB:MONGODB] Failed to update file document in MongoDB with structured data`);
      return {
        success: false,
        message: "Failed to update file with structured data",
      };
    }

    console.log(`[DB:MONGODB] File ${fileId} updated with structuredData successfully`);

    return {
      success: true,
      message: "Structured data generated and stored successfully",
      data: structuredData,
    };
  } catch (error: any) {
    console.error(`[AI:STRUCTURING] Error: ${error.message}`);
    return {
      success: false,
      message: `Error generating structured data: ${error.message}`,
    };
  }
};
