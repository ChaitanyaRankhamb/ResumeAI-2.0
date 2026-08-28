import { NextFunction, Response } from "express";
import logger from "../../../config/logger.config";
import { UserId } from "../../../entities/user/userId";
import { AppError } from "../../../Error/appError";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { uploadResumeService } from "../services/resume.service";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadResumeController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const log = logger.child({ module: "RESUME", controller: "uploadResumeController" });

  try {
    // Validate user
    const userId = req.userId;
    if (!userId) {
      log.warn("Upload resume attempt by unauthenticated user");
      throw new AppError("User is Unauthorized", 401);
    }

    // 2. Get the uploaded file from Multer
    const resume = req.file; // <-- multer provides the file here
    if (!resume) {
      log.warn({ userId }, "Upload resume called without file payload");
      throw new AppError("Resume file is not received", 400);
    }

    log.info(
      {
        userId,
        fileName: resume.originalname,
        mimeType: resume.mimetype,
        sizeKb: parseFloat((resume.size / 1024).toFixed(2)),
      },
      "Resume upload request received",
    );

    // Validate file type
    if (!ALLOWED_TYPES.includes(resume.mimetype)) {
      log.warn(
        { userId, fileName: resume.originalname, mimeType: resume.mimetype },
        "Invalid file type uploaded",
      );
      throw new AppError(
        "Invalid file type. Only PDF or Word documents allowed.",
        400,
      );
    }

    // Validate file size
    if (resume.size > MAX_FILE_SIZE) {
      log.warn(
        {
          userId,
          fileName: resume.originalname,
          sizeMb: parseFloat((resume.size / 1024 / 1024).toFixed(2)),
        },
        "File size exceeds 10MB limit",
      );
      throw new AppError("File size exceeds 10MB limit.", 400);
    }

    log.debug({ userId, fileName: resume.originalname }, "File validation passed, delegating to uploadResumeService");

    // Call service
    const result = await uploadResumeService(
      new UserId(userId.toString()),
      resume,
    );

    // send error response
    if (result && !result.success) {
      log.error({ userId, message: result.message }, "uploadResumeService failed");
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    log.info(
      { userId, fileId: result.data?.fileId, status: result.data?.status },
      "Resume upload accepted and enqueued for processing",
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Resume uploaded and analyzed successfully",
      data: result.data,
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, userId: req.userId },
      "Error during resume upload controller execution",
    );
    next(error);
  }
};

