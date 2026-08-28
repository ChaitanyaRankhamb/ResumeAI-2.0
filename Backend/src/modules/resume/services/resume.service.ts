import logger from "../../../config/logger.config";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { UserId } from "../../../entities/user/userId";
import { AppError } from "../../../Error/appError";
import { resumeQueue } from "../../../queues/resume-queue";
import { resumeFileService } from "./file.service";

interface responseData {
  success: boolean;
  message: string;
  data?: any;
}

export const uploadResumeService = async (
  userId: UserId,
  resume: Express.Multer.File,
): Promise<responseData> => {
  const log = logger.child({ module: "RESUME", service: "uploadResumeService" });
  const userIdStr = userId.toString();

  try {
    // user validation
    log.debug({ userId: userIdStr }, "Validating user account in MongoDB");
    const user = await userRepository.findUserById(userIdStr);
    if (!user) {
      log.warn({ userId: userIdStr }, "User validation failed: Account does not exist");
      throw new AppError("User Not Found Error", 400);
    }

    // service that store the resume file in upload folder & create file doc
    const fileResult = await resumeFileService(userId, resume);

    if (!fileResult.success) {
      log.error({ userId: userIdStr, message: fileResult.message }, "resumeFileService failed");
      return {
        success: false,
        message: fileResult.message,
      };
    }

    // get the fileId from the fileResult data to create the job payload for the resume analysis queue
    const fileId = fileResult.data?.fileId;

    log.info(
      { fileId, userId: userIdStr, queue: "resume-analysis" },
      "Enqueuing 'resume-parse' job in BullMQ queue",
    );

    await resumeQueue.add(
      "resume-parse",
      {
        fileId,
        userId: userIdStr,
      },
      {
        jobId: fileId,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    );

    log.info(
      { fileId, userId: userIdStr, status: "processing" },
      "Job enqueued successfully for background worker processing",
    );

    return {
      success: true,
      message: "Resume uploaded successfully. Resume analysis is in progress.",
      data: {
        fileId,
        status: "processing",
      },
    };
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, userId: userIdStr },
      "Error during resume upload orchestration",
    );

    return {
      success: false,
      message: `Resume upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

