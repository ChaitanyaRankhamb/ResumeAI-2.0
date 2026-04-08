import fetch from "node-fetch";
import { ResumeUploadResponse } from "./../../../../../types/resumeUploadResponse.d";
import { AI_RESPONSE_SYSTEM_PROMPT } from "../../../prompts/ai.response.system.prompt";
import { EnrichedResumeData } from "../Normalization/types/normalizedResume";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { File } from "../../../entities/files/file";

export interface ResumeAnalyzedDataResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    hash: string;
    analyzedData: ResumeUploadResponse;
  };
}

// open router uri
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateResumeAnalyzedData = async (
  fileId: string,
  normalizedStructuredData: EnrichedResumeData,
): Promise<ResumeAnalyzedDataResponse> => {
  try {
    // Validate API Key: prefer OPENROUTER_API_KEY, fallback to OPENAI_API_KEY
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENROUTER_API_KEY / OPENAI_API_KEY in environment variables",
      );
    }

    // open router ai model
    const modelName = process.env.OPENROUTER_MODEL || "gpt-4o-mini";
    // Prepare the prompt with the normalized structured data
    const inputData = JSON.stringify(normalizedStructuredData, null, 2);

    // Construct messages for OpenRouter
    const messages = [
      {
        role: "system",
        content: AI_RESPONSE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: inputData,
      },
    ];

    // Call OpenRouter API
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName, // name of the model to use
        messages, // the conversation messages
        temperature: 0, // it is used to control the randomness of the output. A value of 0 makes the output more deterministic, while higher values (e.g., 0.5 or 1) make it more random.
        max_tokens: 4000, // max tokens in the output. Adjust based on expected response size and model limits.
        top_p: 1, // it is used to choose next words from the most probable ones. A value of 1 means no filtering, while lower values (e.g., 0.8) will only consider the top 80% most likely next words.
        presence_penalty: 0, // How much the AI should avoid repeating what it already said. A value of 0 means no penalty, while higher values (e.g., 0.5 or 1) will make the AI less likely to repeat itself.
        frequency_penalty: 0, // Reduce repeating the same words too many times. To make the response more structured, I have to set it 0.
      }),
    });

    // handle non-200 responses
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
    }

    // parse the response text
    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        `Unexpected response from OpenRouter: ${responseText.substring(0, 200)}`,
      );
    }

    // Extract the content from the response
    const text = result?.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response received from OpenRouter");
    }

    // Clean the text: remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsedData: ResumeUploadResponse;
    try {
      parsedData = JSON.parse(cleanText) as ResumeUploadResponse;
    } catch (err) {
      console.error("Failed to parse JSON. Clean text:", cleanText);
      throw new Error("Invalid JSON format from OpenRouter text response");
    }

    // Validate the parsed data has required fields
    if (
      !parsedData.skillInsights ||
      !parsedData.skillInsights.allSkills ||
      !Array.isArray(parsedData.skillInsights.allSkills)
    ) {
      console.error(
        "Invalid analyzed data: missing or invalid skillInsights",
        parsedData,
      );
      throw new Error("AI response missing required skillInsights data");
    }

    // save parsedData to database
    if (fileId) {
      const file = await fileRepository.findFileById(fileId);
      if (file) {
        // Create updated file with analyzed data
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
          parsedData, // Update with analyzed data
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
    console.error("AI Service Error:", {
      fileId,
      error: error?.message || error,
    });

    return {
      success: false,
      message: error?.message || "Failed to generate analyzed data from AI",
    };
  }
};
