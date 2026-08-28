import fs from "fs";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import textract from "textract";
import logger from "../../../config/logger.config";
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
  const log = logger.child({ module: "RESUME:PARSER", service: "resumeParseService" });

  try {
    const mimeType = resume.mimetype;
    const originalName = resume.originalname;
    log.info(
      { userId: userId.toString(), fileName: originalName, mimeType },
      "Starting resume text extraction",
    );

    let parsedText: string = "";

    // PDF Parsing
    if (mimeType === "application/pdf") {
      log.debug({ fileName: originalName }, "Using pdf-parse extraction engine");
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
      log.debug({ fileName: originalName }, "Using mammoth DOCX extraction engine");
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
      log.debug({ fileName: originalName }, "Using textract legacy DOC extraction engine");
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
      log.warn({ fileName: originalName, mimeType }, "Unsupported file format for text extraction");
      return {
        success: false,
        message: "Unsupported file format",
      };
    }

    // Preserve structure: collapse horizontal spaces, retain line breaks
    parsedText = parsedText
      .replace(/[^\S\n]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const wordCount = parsedText.split(/\s+/).filter(Boolean).length;
    const lineCount = parsedText.split("\n").length;

    log.info(
      {
        fileName: originalName,
        charCount: parsedText.length,
        wordCount,
        lineCount,
      },
      "Resume text extraction completed successfully",
    );

    return {
      success: true,
      message: "Resume parsed successfully",
      data: {
        rawText: parsedText,
      },
    };
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, fileName: resume?.originalname },
      "Error during resume text extraction",
    );
    return {
      success: false,
      message: error.message || "Failed to parse resume",
    };
  }
};

