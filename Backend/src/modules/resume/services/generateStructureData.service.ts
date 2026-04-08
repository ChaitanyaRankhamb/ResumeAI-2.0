import fetch from "node-fetch";
import { SYSTEM_PROMPT } from "../../../prompts/structuredData.system.prompt";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { File } from "../../../entities/files/file";

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
    const inputData = `${SYSTEM_PROMPT}\n\nResume Text:\n${parsedText}`;

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: inputData,
      }
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

    let structuredData;
    try {
      structuredData = JSON.parse(text);
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
