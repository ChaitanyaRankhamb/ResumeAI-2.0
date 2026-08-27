import { NextFunction, Response } from "express";
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
  try {
    // Validate user
    const userId = req.userId;
    if (!userId) throw new AppError("User is Unauthorized", 401);

    console.log(`[UPLOAD-HTTP] Received upload request from userId: ${userId}`);

    // 2. Get the uploaded file from Multer
    const resume = req.file; // <-- multer provides the file here
    if (!resume) throw new AppError("Resume file is not received", 400);

    console.log(`[UPLOAD-HTTP] File received: "${resume.originalname}", type: ${resume.mimetype}, size: ${(resume.size / 1024).toFixed(2)} KB`);

    // Validate file type
    if (!ALLOWED_TYPES.includes(resume.mimetype)) {
      console.warn(`[UPLOAD-HTTP] Invalid file type rejected: ${resume.mimetype}`);
      throw new AppError(
        "Invalid file type. Only PDF or Word documents allowed.",
        400,
      );
    }

    // Validate file size
    if (resume.size > MAX_FILE_SIZE) {
      console.warn(`[UPLOAD-HTTP] File size limit exceeded: ${(resume.size / 1024 / 1024).toFixed(2)} MB`);
      throw new AppError("File size exceeds 10MB limit.", 400);
    }

    console.log(`[UPLOAD-HTTP] Validation passed. Calling uploadResumeService for userId: ${userId}`);

    // Call service
    const result = await uploadResumeService(
      new UserId(userId.toString()),
      resume,
    );

    // send error response
    if (result && !result.success) {
      console.error(`[UPLOAD-HTTP] uploadResumeService failed: ${result.message}`);
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    console.log(`[UPLOAD-HTTP] Upload accepted. Returning response: fileId=${result.data?.fileId}, status=${result.data?.status}`);

    // Send response
    res.status(200).json({
      success: true,
      message: "Resume uploaded and analyzed successfully",
      data: result.data,
    });
  } catch (error) {
    // Forward to global error handler
    next(error);
  }
};
