import redisClient from "../../../config/redis.connection";
import minioClient from "../../../config/minio.connection";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { File } from "../../../entities/files/file";
import { UserId } from "../../../entities/user/userId";
import { AppError } from "../../../Error/appError";
import { generateResumeAnalyzedData } from "./generateResumeAnalyzedData.service";
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
  const jobStartTime = Date.now();
  console.log(`\n======================================================`);
  console.log(`[WORKER:PIPELINE] STARTING single-pass resume analysis job`);
  console.log(
    `[WORKER:PIPELINE] Job ID: ${job.id} | File ID: ${fileId} | User ID: ${userId}`,
  );
  console.log(`======================================================`);

  try {
    await job.updateProgress(buildResumeProgressPayload(10));

    // Validate the user before processing the uploaded resume.
    console.log(`[DB:MONGODB] Step 1 (10%): Validating user ${userId}...`);
    const user = await userRepository.findUserById(userId);
    if (!user) {
      console.error(`[DB:MONGODB] User not found for ID: ${userId}`);
      throw new AppError("User Not Found Error", 400);
    }
    console.log(`[DB:MONGODB] User validated successfully: ${userId}`);

    await job.updateProgress(buildResumeProgressPayload(25));

    // Load the stored file metadata so the worker can read the uploaded file.
    console.log(
      `[DB:MONGODB] Step 2 (25%): Fetching file metadata for ${fileId}...`,
    );
    const resumeFile = await fileRepository.findFileById(fileId);
    if (!resumeFile) {
      console.error(`[DB:MONGODB] Resume file not found: ${fileId}`);
      throw new AppError("Resume file not found", 404);
    }
    console.log(
      `[DB:MONGODB] File metadata found: name="${resumeFile.getName()}", hash=${resumeFile.getHash()}`,
    );

    // Reuse cached analysis if it already exists for the same file hash.
    console.log(
      `[CACHE:REDIS] Step 3: Checking Redis cache for key "resume:${resumeFile.getHash()}"...`,
    );
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
        console.log(
          `[CACHE:REDIS] >>> CACHE HIT! Found cached analysis for hash: ${resumeFile.getHash()}. Skipping AI pipeline.`,
        );
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
    console.log(
      `[CACHE:REDIS] >>> CACHE MISS for hash: ${resumeFile.getHash()}. Proceeding with analysis pipeline.`,
    );

    let parsedText: string | undefined;

    // Check if the resume was already parsed previously and stored in MongoDB
    const existingParseText = resumeFile.getParseText();

    if (
      existingParseText &&
      existingParseText.length > 0 &&
      existingParseText[0]?.trim().length > 0
    ) {
      console.log(
        `[DB:MONGODB] Found pre-existing parseText in MongoDB (${existingParseText[0].length} chars). Skipping MinIO download.`,
      );

      parsedText = existingParseText[0];

      await job.updateProgress(buildResumeProgressPayload(40));
    } else {
      // Download the resume bytes from object storage and build the expected file payload.
      const bucketName = process.env.MINIO_BUCKET || "resumes";
      console.log(
        `[STORAGE:MINIO] Step 4: Downloading file stream from MinIO bucket "${bucketName}", path: "${resumeFile.getPath()}"...`,
      );
      const downloadStart = Date.now();

      let fileBuffer: Buffer;
      try {
        const objectStream = await minioClient.getObject(
          bucketName,
          resumeFile.getPath(),
        );
        fileBuffer = await streamToBuffer(objectStream);
        console.log(
          `[STORAGE:MINIO] Downloaded ${fileBuffer.length} bytes in ${Date.now() - downloadStart}ms`,
        );
      } catch (minioErr: any) {
        console.error(
          `[STORAGE:MINIO] Failed to retrieve object from MinIO ("${resumeFile.getPath()}"): ${minioErr.message}`,
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
      console.log(
        `[PARSER] Step 5 (40%): Parsing resume text from buffer (${resumePayload.mimetype})...`,
      );
      const parseResult = await resumeParseService(
        new UserId(userId),
        resumePayload,
      );
      parsedText = parseResult.data?.rawText;

      if (!parseResult.success || !parsedText) {
        console.error(`[PARSER] Parsing failed: ${parseResult.message}`);
        throw new AppError(parseResult.message || "Resume parsing failed", 400);
      }

      console.log(
        `[PARSER] Resume text parsed successfully (${parsedText.length} characters)`,
      );

      if (resumeFile && parseResult.success && parsedText) {
        console.log(
          `[DB:MONGODB] Updating MongoDB file document with parsed text...`,
        );
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
        console.log(`[DB:MONGODB] Saved parseText to file record: ${fileId}`);
      }
    }

    await job.updateProgress(buildResumeProgressPayload(70));

    // Generate the final analyzed resume data directly from parsed text in a single AI call.
    console.log(
      `[AI:INSIGHTS] Step 6 (70%): Generating comprehensive analysis, scores & insights directly from parsed text...`,
    );
    const finalResumeAnalyzedData = await generateResumeAnalyzedData(
      fileId,
      parsedText,
    );

    if (!finalResumeAnalyzedData.success || !finalResumeAnalyzedData.data) {
      console.error(
        `[AI:INSIGHTS] Failed to generate analyzed data: ${finalResumeAnalyzedData.message}`,
      );
      throw new AppError(
        `Failed to generate analyzed data: ${finalResumeAnalyzedData.message}`,
        500,
      );
    }
    console.log(
      `[AI:INSIGHTS] Final analyzed data generated and persisted to MongoDB.`,
    );

    console.log(
      `[CACHE:REDIS] Step 7: Storing final analyzedData in Redis key "resume:${finalResumeAnalyzedData.data?.hash}"...`,
    );
    await redisClient.set(
      `resume:${finalResumeAnalyzedData.data?.hash}`,
      JSON.stringify(finalResumeAnalyzedData.data?.analyzedData),
    );
    console.log(`[CACHE:REDIS] Redis cache write successful.`);

    await job.updateProgress(buildResumeProgressPayload(100));

    const totalDuration = Date.now() - jobStartTime;
    console.log(`======================================================`);
    console.log(
      `[WORKER:PIPELINE] FINISHED single-pass resume analysis for file ${fileId} in ${totalDuration}ms (100% complete)`,
    );
    console.log(`======================================================\n`);

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
      `[WORKER:PIPELINE] ERROR in processResumeAnalysisJob for file ${fileId}:`,
      error?.message || error,
    );

    throw error;
  }
};
