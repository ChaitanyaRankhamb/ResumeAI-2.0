import redisClient from "../../../config/redis.connection";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { File } from "../../../entities/files/file";
import { UserId } from "../../../entities/user/userId";
import { AppError } from "../../../Error/appError";
import { resumeQueue } from "../../../queues/resume-queue";
import { validateStructuredData } from "../../../validations/resumeStructureData.validation";
import { processResume } from "../Normalization";
import { resumeFileService } from "./file.service";
import { generateResumeAnalyzedData } from "./generateResumeAnalyzedData.service";
import { generateStructuredData } from "./generateStructureData.service";
import { resumeParseService } from "./parse.service";
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
    console.log(`[DB:MONGODB] Validating user in database: ${userId}`);
    const user = await userRepository.findUserById(userId.toString());
    if (!user) {
      console.error(`[DB:MONGODB] User not found: ${userId}`);
      throw new AppError("User Not Found Error", 400);
    }

    // service that store the resume file in upload folder & create file doc
    const fileResult = await resumeFileService(userId, resume);

    if (!fileResult.success) {
      console.error(`[STORAGE:FILE] File service returned failure: ${fileResult.message}`);
      return {
        success: false,
        message: fileResult.message,
      };
    }

    // get the fileId from the fileResult data to create the job payload for the resume analysis queue
    const fileId = await fileResult.data?.fileId;

    console.log(
      `[QUEUE:BULLMQ] Enqueuing 'resume-parse' job in queue 'resume-analysis' with jobId: ${fileId}, userId: ${userId}`,
    );

    await resumeQueue.add(
      "resume-parse",
      {
        fileId,
        userId: userId.toString(),
      },
      {
        jobId: fileId,
        attempts: 3, // retry the job 3 times if it fails and then move it to the failed queue permenently
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100, // only keep latest 100 completed jobs in the queue to save redis memory
        removeOnFail: 1000, // only keep latest 1000 failed jobs in the queue to save redis memory
      },
    );

    console.log(
      `[QUEUE:BULLMQ] Job successfully added to queue. fileId: ${fileId}, status: processing`,
    );

    // The heavy resume-processing flow now runs inside the worker service.

    return {
      success: true,
      message: "Resume uploaded successfully. Resume analysis is in progress.",
      data: {
        fileId,
        status: "processing",
      },
    };
  } catch (error: any) {
    console.error("[SERVICE:RESUME] Error in uploadResumeService:", error?.message || error);

    return {
      success: false,
      message: `Resume upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};
