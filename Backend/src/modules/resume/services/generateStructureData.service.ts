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

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENROUTER_API_KEY / OPENAI_API_KEY in environment variables",
      );
    }

    const modelName = process.env.OPENROUTER_MODEL || "gpt-4o-mini";

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
    ]

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0,
        max_tokens: 4000,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
    }

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
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let structuredData;
    try {
      structuredData = JSON.parse(cleanText); // parse the fence-stripped text
    } catch (parseError) {
      return {
        success: false,
        message: "Failed to parse AI response as JSON",
      };
    }

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
      return {
        success: false,
        message: "Failed to update file with structured data",
      };
    }

    return {
      success: true,
      message: "Structured data generated and stored successfully",
      data: structuredData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error generating structured data: ${error.message}`,
    };
  }
};
