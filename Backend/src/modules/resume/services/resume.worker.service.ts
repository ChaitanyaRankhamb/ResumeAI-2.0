import { Job } from "bullmq";
import logger from "../../../config/logger.config";
import minioClient from "../../../config/minio.connection";
import redisClient from "../../../config/redis.connection";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { File } from "../../../entities/files/file";
import { UserId } from "../../../entities/user/userId";
import { AppError } from "../../../Error/appError";
import { generateResumeAnalyzedData } from "./generateResumeAnalyzedData.service";
import { resumeParseService } from "./parse.service";

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
    25: "loading resume",
    40: "parsing resume",
    70: "analyzing resume & generating insights",
    100: "Analysis ready",
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
  const log = logger.child({ module: "RESUME:WORKER", jobId: job.id, fileId, userId });
  const jobStartTime = Date.now();

  log.info("Starting single-pass resume analysis job");

  try {
    await job.updateProgress(buildResumeProgressPayload(10));

    // Step 1: Validate the user before processing the uploaded resume.
    log.debug("Step 1 (10%): Validating user in database");
    const user = await userRepository.findUserById(userId);
    if (!user) {
      log.error("User not found for processing resume");
      throw new AppError("User Not Found Error", 400);
    }
    log.debug("User validated successfully");

    await job.updateProgress(buildResumeProgressPayload(25));

    // Step 2: Load the stored file metadata so the worker can read the uploaded file.
    log.debug("Step 2 (25%): Fetching file metadata from MongoDB");
    const resumeFile = await fileRepository.findFileById(fileId);
    if (!resumeFile) {
      log.error("Resume file record not found in MongoDB");
      throw new AppError("Resume file not found", 404);
    }
    const fileHash = resumeFile.getHash();
    log.debug(
      { fileName: resumeFile.getName(), fileHash },
      "File metadata loaded from database",
    );

    // Step 3: Reuse cached analysis if it already exists for the same file hash.
    const redisCacheKey = `resume:${fileHash}`;
    log.debug({ redisCacheKey }, "Step 3: Checking Redis cache for existing analysis");
    const cachedAnalyzedData = await redisClient.get(redisCacheKey);

    if (cachedAnalyzedData) {
      const parsedAnalyzedData = JSON.parse(cachedAnalyzedData);

      if (
        parsedAnalyzedData.skillInsights &&
        parsedAnalyzedData.skillInsights.allSkills &&
        Array.isArray(parsedAnalyzedData.skillInsights.allSkills)
      ) {
        log.info(
          { fileHash, redisCacheKey },
          "Redis cache HIT: Reusing cached analysis. Skipping AI pipeline",
        );
        await job.updateProgress(buildResumeProgressPayload(100));

        return {
          success: true,
          message: "Resume analyzed data retrieved from cache",
          data: {
            fileId,
            hash: fileHash,
            analyzedData: parsedAnalyzedData,
          },
        };
      }
    }
    log.debug({ fileHash }, "Redis cache MISS. Proceeding with text extraction and AI analysis");

    let parsedText: string | undefined;

    // Check if the resume was already parsed previously and stored in MongoDB
    const existingParseText = resumeFile.getParseText();

    if (
      existingParseText &&
      existingParseText.length > 0 &&
      existingParseText[0]?.trim().length > 0
    ) {
      log.debug(
        { textLength: existingParseText[0].length },
        "Found pre-existing parseText in MongoDB. Skipping MinIO download",
      );
      parsedText = existingParseText[0];
      await job.updateProgress(buildResumeProgressPayload(40));
    } else {
      // Download the resume bytes from object storage and build the expected file payload.
      const bucketName = process.env.MINIO_BUCKET || "resumes";
      const minioPath = resumeFile.getPath();
      log.debug({ bucketName, minioPath }, "Step 4: Downloading file from MinIO storage");
      const downloadStart = Date.now();

      let fileBuffer: Buffer;
      try {
        const objectStream = await minioClient.getObject(bucketName, minioPath);
        fileBuffer = await streamToBuffer(objectStream);
        log.debug(
          { bytes: fileBuffer.length, downloadMs: Date.now() - downloadStart },
          "File downloaded from MinIO successfully",
        );
      } catch (minioErr: any) {
        log.error(
          { err: minioErr, message: minioErr.message, bucketName, minioPath },
          "Failed to retrieve object from MinIO storage",
        );
        throw new AppError(
          `Resume file bytes not found in storage. Please re-upload the document. (${minioErr.message})`,
          404,
        );
      }

      const resumePayload = {
        fieldname: "resume",
        originalname: resumeFile.getOriginalName(),
        encoding: "7bit",
        mimetype: resumeFile.getFormat(),
        size: resumeFile.getSize(),
        buffer: fileBuffer,
        path: resumeFile.getPath(),
      } as Express.Multer.File;

      await job.updateProgress(buildResumeProgressPayload(40));

      // Parse the resume content and store the extracted text with the file record.
      log.debug("Step 5 (40%): Parsing resume text from buffer");
      const parseResult = await resumeParseService(
        new UserId(userId),
        resumePayload,
      );
      parsedText = parseResult.data?.rawText;

      if (!parseResult.success || !parsedText) {
        log.error({ message: parseResult.message }, "Resume text parsing failed");
        throw new AppError(parseResult.message || "Resume parsing failed", 400);
      }

      log.debug({ charCount: parsedText.length }, "Resume text parsed successfully");

      if (resumeFile && parseResult.success && parsedText) {
        log.debug("Backfilling parseText into MongoDB file record");
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
    }

    await job.updateProgress(buildResumeProgressPayload(70));

    // Generate the final analyzed resume data directly from parsed text in a single AI call.
    log.info("Step 6 (70%): Generating comprehensive AI analysis and insights");
    const finalResumeAnalyzedData = await generateResumeAnalyzedData(
      fileId,
      parsedText,
    );

    if (!finalResumeAnalyzedData.success || !finalResumeAnalyzedData.data) {
      log.error(
        { message: finalResumeAnalyzedData.message },
        "AI analysis generation failed",
      );
      throw new AppError(
        `Failed to generate analyzed data: ${finalResumeAnalyzedData.message}`,
        500,
      );
    }

    log.debug("Step 7: Caching final analysis in Redis");
    await redisClient.set(
      `resume:${finalResumeAnalyzedData.data?.hash}`,
      JSON.stringify(finalResumeAnalyzedData.data?.analyzedData),
    );
    log.debug("Redis cache write completed");

    await job.updateProgress(buildResumeProgressPayload(100));

    const totalDuration = Date.now() - jobStartTime;
    log.info(
      { totalDurationMs: totalDuration, fileId, userId },
      `Single-pass resume analysis completed in ${totalDuration}ms (100%)`,
    );

    return {
      success: true,
      message: "Resume analysis completed",
      data: {
        fileId,
        userId,
      },
    };
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, fileId, userId },
      "Error in processResumeAnalysisJob",
    );

    throw error;
  }
};

