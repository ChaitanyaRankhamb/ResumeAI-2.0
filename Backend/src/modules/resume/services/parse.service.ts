import fs from "fs";
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import textract from "textract";
import { UserId } from "../../../entities/user/userId";

interface ResumeParseResponse {
  success: boolean;
  message: string;
  data?: {
    rawText: string;
  };
}

export const resumeParseService = async (
  userId: UserId,
  resume: Express.Multer.File,
): Promise<ResumeParseResponse> => {
  try {
    const mimeType = resume.mimetype;
    let parsedText: string = "";

    // PDF Parsing
    if (mimeType === "application/pdf") {
      const buffer = fs.readFileSync(resume.path);
      const data = await pdfParse(buffer);
      parsedText = data.text;
    }

    // DOCX Parsing
    else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        path: resume.path,
      });
      parsedText = result.value;
    }

    // DOC Parsing
    else if (mimeType === "application/msword") {
      parsedText = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(resume.path, (error, text) => {
          if (error) reject(error);
          else resolve(text);
        });
      });
    }

    // Unsupported Format
    else {
      return {
        success: false,
        message: "Unsupported file format",
      };
    }

    // Optional: clean text
    parsedText = parsedText.replace(/\s+/g, " ").trim();

    return {
      success: true,
      message: "Resume parsed successfully",
      data: {
        rawText: parsedText,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to parse resume",
    };
  }
};

// Note: The parsed text is stored in the File entity's parseText array after successful parsing in resume.service.ts
