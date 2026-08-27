import fs from "fs";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
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
    console.log(`[PARSER] Starting text extraction for file: "${resume.originalname}", format: ${mimeType}`);
    let parsedText: string = "";

    // PDF Parsing
    if (mimeType === "application/pdf") {
      console.log(`[PARSER] Using pdf-parse engine...`);
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
      console.log(`[PARSER] Using mammoth DOCX extraction engine...`);
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
      console.log(`[PARSER] Using textract DOC extraction engine...`);
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
      console.warn(`[PARSER] Unsupported file format encountered: ${mimeType}`);
      return {
        success: false,
        message: "Unsupported file format",
      };
    }

    // BUG FIX #3: The original regex (/\s+/g, " ") collapsed ALL whitespace
    // including newlines into a single space, turning the resume into one
    // flat wall of text. Section headings like "PROJECTS" or "Experience"
    // lost their visual separation, making it much harder for the AI to
    // detect where one section ends and another begins.
    // Fix: only collapse horizontal whitespace (spaces/tabs), preserve newlines,
    // and limit consecutive blank lines to two so structure is readable.
    parsedText = parsedText
      .replace(/[^\S\n]+/g, " ")   // collapse spaces/tabs → single space, keep \n
      .replace(/\n{3,}/g, "\n\n")  // max 2 consecutive blank lines
      .trim();

    const wordCount = parsedText.split(/\s+/).filter(Boolean).length;
    const lineCount = parsedText.split("\n").length;
    console.log(`[PARSER] Extraction complete. Characters: ${parsedText.length}, Words: ${wordCount}, Lines: ${lineCount}`);

    return {
      success: true,
      message: "Resume parsed successfully",
      data: {
        rawText: parsedText,
      },
    };
  } catch (error: any) {
    console.error(`[PARSER] Extraction error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to parse resume",
    };
  }
};

// Note: The parsed text is stored in the File entity's parseText array after successful parsing in resume.service.ts
