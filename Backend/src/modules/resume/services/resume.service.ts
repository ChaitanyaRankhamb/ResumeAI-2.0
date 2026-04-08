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
import redisClient from "../../../config/redis.connection";
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
    console.log("File result:", fileResult);

    if (fileResult.success && fileResult.data?.isDuplicate) {
      // return resume analyzed data from redis
      const cachedAnalyzedData = await redisClient.get(
        `resume:${fileResult.data?.hash}`,
      );
      console.log("Cache lookup for analyzed data:", cachedAnalyzedData);
      if (cachedAnalyzedData) {
        const parsedAnalyzedData = JSON.parse(cachedAnalyzedData);

        // Validate cached data has required fields
        if (
          !parsedAnalyzedData.skillInsights ||
          !parsedAnalyzedData.skillInsights.allSkills ||
          !Array.isArray(parsedAnalyzedData.skillInsights.allSkills)
        ) {
          console.error(
            "Invalid cached analyzed data: missing or invalid skillInsights",
            parsedAnalyzedData,
          );
          // If cached data is invalid, continue to process (don't return invalid data)
        } else {
          // Ensure the file document has the analyzed data
          const file = await fileRepository.findFileById(
            fileResult.data?.fileId,
          );
          if (file) {
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
              parsedAnalyzedData, // Save to file document
            );
            await fileRepository.updateFile(updatedFile);
          }

          return {
            success: true,
            message: "Resume analyzed data retrieved from cache",
            data: {
              fileId: fileResult.data?.fileId,
              hash: fileResult.data?.hash,
              analyzedData: parsedAnalyzedData,
            },
          };
        }
      }
    }

    // parse the resume file and extract info
    const parseResult = await resumeParseService(userId, resume);

    const parsedText = parseResult.data?.rawText;
    console.log("Parsed result:", parsedText);

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
            resumeFile.getHash(),
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
    const normalizationResult = await processResume(validatedStructuredData);


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
      return {
        success: false,
        message: `Failed to generate analyzed data: ${finalResumeAnalyzedData.message}`,
      };
    }

    // save final analyzed data in redis cache
    await redisClient.set(
      `resume:${finalResumeAnalyzedData.data?.hash}`,
      JSON.stringify(finalResumeAnalyzedData.data?.analyzedData),
    );

    return {
      success: true,
      message: "Resume uploaded and processed successfully",
      data: {
        fileId,
        analyzedData: finalResumeAnalyzedData.data?.analyzedData,
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
