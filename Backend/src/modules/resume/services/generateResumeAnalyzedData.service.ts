import { ResumeUploadResponse } from "./../../../../../types/resumeUploadResponse.d";
import { AI_RESPONSE_SYSTEM_PROMPT } from "../../../prompts/ai.response.system.prompt";
import { EnrichedResumeData } from "../Normalization/types/normalizedResume";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ResumeAnalyzedDataResponse {
  success: boolean;
  message: string;
  data?: ResumeUploadResponse;
}

export const generateResumeAnalyzedData = async (
  fileId: string,
  normalizedStructuredData: EnrichedResumeData,
): Promise<ResumeAnalyzedDataResponse> => {
  try {
    // Validate API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    });

    // Convert structured data safely to string
    const inputData = JSON.stringify(normalizedStructuredData, null, 2);

    // Build prompt cleanly
    const prompt = `
${AI_RESPONSE_SYSTEM_PROMPT}
${inputData}
`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = result?.response;
    const text = response?.text();

    // Validate response
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response received from AI");
    }

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    let parsedData: ResumeUploadResponse;
    try {
      parsedData = JSON.parse(jsonMatch[0]) as ResumeUploadResponse;
    } catch (err) {
      throw new Error("Invalid JSON format from AI");
    }

    return {
      success: true,
      message: "Resume analyzed successfully",
      data: parsedData,
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
