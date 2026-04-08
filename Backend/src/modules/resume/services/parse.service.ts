import fs from "fs";
import { PDFParse } from "pdf-parse";
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
      const sourceBuffer =
        resume.buffer || (resume.path ? fs.readFileSync(resume.path) : null);
      if (!sourceBuffer) {
        throw new Error("No source file buffer or path found for PDF parsing.");
      }

      const parser = new PDFParse({ data: sourceBuffer as Buffer });
      const pdfResult = await parser.getText();
      parsedText = pdfResult.text || "";
      await parser.destroy();
    }

    // DOCX Parsing
    else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      if (resume.buffer) {
        const result = await mammoth.extractRawText({
          buffer: resume.buffer as Buffer,
        });
        parsedText = result.value;
      } else if (resume.path) {
        const result = await mammoth.extractRawText({
          path: resume.path,
        });
        parsedText = result.value;
      } else {
        throw new Error(
          "No source file buffer or path found for DOCX parsing.",
        );
      }
    }

    // DOC Parsing
    else if (mimeType === "application/msword") {
      if (resume.path) {
        parsedText = await new Promise((resolve, reject) => {
          textract.fromFileWithPath(resume.path, (error, text) => {
            if (error) reject(error);
            else resolve(text);
          });
        });
      } else if (resume.buffer) {
        parsedText = await new Promise((resolve, reject) => {
          textract.fromBufferWithMime(
            mimeType,
            resume.buffer as Buffer,
            (error, text) => {
              if (error) reject(error);
              else resolve(text);
            },
          );
        });
      } else {
        throw new Error("No source file buffer or path found for DOC parsing.");
      }
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
