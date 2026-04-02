import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "../../../prompts/structuredData.system.prompt";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { File } from "../../../entities/files/file";

interface GenerateStructuredDataResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Generates structured JSON data from parsed resume text using Google Gemini AI
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

    // Initialize Google Gemini AI with API key from environment
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

    // Prepare the prompt with system instructions and parsed text
    const prompt = `${SYSTEM_PROMPT}\n\nResume Text:\n${parsedText}`;

    // Generate structured data using Gemini AI
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the AI response as JSON
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
