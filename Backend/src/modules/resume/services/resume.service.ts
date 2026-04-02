import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { UserId } from "../../../entities/user/userId";
import { AppError } from "../../../Error/appError";
import { resumeFileService } from "./file.service";
import { Multer } from "multer";
import { resumeParseService } from "./parse.service";
import { File } from "../../../entities/files/file";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { generateStructuredData } from "./generateStructureData.service";
import { generateResumeAnalyzedData } from "./generateResumeAnalyzedData.service";
import { validateStructuredData } from "../../../validations/resumeStructureData.validation";
import { processResume } from "../Normalization";
interface responseData {
  success: boolean;
  message: string;
  data?: any;
}

export const uploadResumeService = async (
  userId: UserId,
  resume: Express.Multer.File,
): Promise<responseData> => {
  try {
    // user validation
    const user = await userRepository.findUserById(userId.toString());
    if (!user) {
      throw new AppError("User Not Found Error", 400);
    }

    // service that store the resume file in upload folder & create file doc
    const fileResult = await resumeFileService(userId, resume);

    // parse the resume file and extract info
    const parseResult = await resumeParseService(userId, resume);

    const parsedText = parseResult.data?.rawText;

    // Update the file with parsed text if parsing was successful
    if (fileResult.success) {
      const fileId = fileResult.data?.fileId;
      if (fileId) {
        const resumeFile = await fileRepository.findFileById(fileId);
        if (resumeFile && parseResult.success && parsedText) {
          // Create a new File instance with updated parseText
          const updatedFile = new File(
            resumeFile.id,
            resumeFile.userId,
            resumeFile.getName(),
            resumeFile.getOriginalName(),
            resumeFile.getPath(),
            resumeFile.getSize(),
            resumeFile.getFormat(),
            resumeFile.uploadedAt,
            [parsedText], // Store parsed text as array with the full text
          );
          await fileRepository.updateFile(updatedFile);
        }
      }
    }

    // Stop early if parsing failed
    if (!parseResult.success || !parsedText) {
      return {
        success: false,
        message: "Resume parsed failed",
      };
    }

    const fileId = fileResult.data?.fileId;

    // Generate structured data from the parsed text using AI
    const structuredResultData = await generateStructuredData(
      fileId,
      parsedText,
    );

    if (!structuredResultData.success) {
      // Log warning but don't fail the upload
      console.warn(
        "Failed to generate structured data:",
        structuredResultData.message,
      );
    }

    // validate structured data and generate analyzed data if valid
    const validatedStructuredData = validateStructuredData(
      structuredResultData.data,
    );

    // normalize the validated structured data. call the pipeline function here
    const normalizationResult = await processResume(
      validatedStructuredData,
    );

    if (!normalizationResult.success) {
      return {
        success: false,
        message: `Resume normalization failed: ${normalizationResult.message}`,
      };
    }

    const normalizedStructuredData = normalizationResult.data;

    if (!normalizedStructuredData) {
      return {
        success: false,
        message: "Normalization failed: No data returned",
      };
    }

    // generate analyzed data from the normalized structured data using AI
    const finalResumeAnalyzedData = await generateResumeAnalyzedData(
      fileId,
      normalizedStructuredData,
    );

    if (!finalResumeAnalyzedData.success) {
      return  {
        success: false,
        message: `Failed to generate analyzed data: ${finalResumeAnalyzedData.message}`,
      }
    }


    return {
      success: true,
      message: "Resume uploaded and processed successfully",
      data: {
        fileId,
        structuredData: normalizedStructuredData,
        analyzedData: finalResumeAnalyzedData,
      },
    };
  } catch (error: any) {
    console.error("Error in uploadResumeService:", error);

    return {
      success: false,
      message: `Resume upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};
