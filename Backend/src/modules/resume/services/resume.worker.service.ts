import redisClient from "../../../config/redis.connection";
import minioClient from "../../../config/minio.connection";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { File } from "../../../entities/files/file";
import { UserId } from "../../../entities/user/userId";
import { AppError } from "../../../Error/appError";
import { validateStructuredData } from "../../../validations/resumeStructureData.validation";
import { processResume } from "../Normalization";
import { generateResumeAnalyzedData } from "./generateResumeAnalyzedData.service";
import { generateStructuredData } from "./generateStructureData.service";
import { resumeParseService } from "./parse.service";
import { Job } from "bullmq";

export interface ResumeProgressPayload {
  progress: number;
  message: string;
}

interface responseData {
  success: boolean;
  message: string;
  data?: any;
}

export const buildResumeProgressPayload = (
  progress: number,
): ResumeProgressPayload => {
  const messages: Record<number, string> = {
    10: "validating resume",
    20: "loading resume",
    30: "parsing resume",
    50: "Structuring resume data",
    60: "Narmalizing resume",
    70: "Analysing information",
    90: "Genarating insgiths",
    100: "Analyzation ready",
  };

  return {
    progress,
    message: messages[progress] ?? "Processing resume",
  };
};

const streamToBuffer = async (stream: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

export const processResumeAnalysisJob = async (
  job: Job,
  userId: string,
  fileId: string,
): Promise<responseData> => {
  try {
    await job.updateProgress(buildResumeProgressPayload(10));

    // Validate the user before processing the uploaded resume.
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new AppError("User Not Found Error", 400);
    }

    await job.updateProgress(buildResumeProgressPayload(20));

    // Load the stored file metadata so the worker can read the uploaded file.
    const resumeFile = await fileRepository.findFileById(fileId);
    if (!resumeFile) {
      throw new AppError("Resume file not found", 404);
    }

    // Reuse cached analysis if it already exists for the same file hash.
    const cachedAnalyzedData = await redisClient.get(
      `resume:${resumeFile.getHash()}`,
    );
    if (cachedAnalyzedData) {
      const parsedAnalyzedData = JSON.parse(cachedAnalyzedData);

      if (
        parsedAnalyzedData.skillInsights &&
        parsedAnalyzedData.skillInsights.allSkills &&
        Array.isArray(parsedAnalyzedData.skillInsights.allSkills)
      ) {
        await job.updateProgress(buildResumeProgressPayload(100));

        return {
          success: true,
          message: "Resume analyzed data retrieved from cache",
          data: {
            fileId,
            hash: resumeFile.getHash(),
            analyzedData: parsedAnalyzedData,
          },
        };
      }
    }

    // Download the resume bytes from object storage and build the expected file payload.
    const objectStream = await minioClient.getObject(
      process.env.MINIO_BUCKET!,
      resumeFile.getPath(),
    );
    const fileBuffer = await streamToBuffer(objectStream);

    const resumePayload = {
      fieldname: "resume",
      originalname: resumeFile.getOriginalName(),
      encoding: "7bit",
      mimetype: resumeFile.getFormat(),
      size: resumeFile.getSize(),
      buffer: fileBuffer,
      path: resumeFile.getPath(),
    } as Express.Multer.File;

    await job.updateProgress(buildResumeProgressPayload(30));

    // Parse the resume content and store the extracted text with the file record.
    const parseResult = await resumeParseService(
      new UserId(userId),
      resumePayload,
    );
    const parsedText = parseResult.data?.rawText;

    console.info("Resume parsed", {
      userId,
      fileId,
      textLength: parsedText?.length ?? 0,
    });

    if (resumeFile && parseResult.success && parsedText) {
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
        [parsedText],
      );
      await fileRepository.updateFile(updatedFile);
    }

    await job.updateProgress(buildResumeProgressPayload(50));

    // Stop early if parsing failed.
    if (!parseResult.success || !parsedText) {
      return {
        success: false,
        message: "Resume parsed failed",
      };
    }

    await job.updateProgress(buildResumeProgressPayload(60));

    // Generate structured data from the parsed text using AI.
    const structuredResultData = await generateStructuredData(
      fileId,
      parsedText,
    );

    if (!structuredResultData.success) {
      console.warn(
        "Failed to generate structured data:",
        structuredResultData.message,
      );
    }

    await job.updateProgress(buildResumeProgressPayload(70));

    // Validate structured data and normalize it before generating analyzed insights.
    const validatedStructuredData = validateStructuredData(
      structuredResultData.data,
    );
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

    await job.updateProgress(buildResumeProgressPayload(90));

    // Generate the final analyzed resume data and cache it for reuse.
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

    await redisClient.set(
      `resume:${finalResumeAnalyzedData.data?.hash}`,
      JSON.stringify(finalResumeAnalyzedData.data?.analyzedData),
    );

    await job.updateProgress(100);

    return {
      success: true,
      message: "Resume analysis completed",
      data: {
        fileId,
        userId,
      },
    };
  } catch (error: any) {
    console.error(
      "Error in processResumeAnalysisJob:",
      error?.message || error,
    );

    return {
      success: false,
      message: `Resume analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};
