import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { AppError } from "../../../Error/appError";
import { uploadResumeService } from "../services/resume.service";
import { UserId } from "../../../entities/user/userId";

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

    // 2. Get the uploaded file from Multer
    const resume = req.file; // <-- multer provides the file here
    if (!resume) throw new AppError("Resume file is not received", 400);

    console.log("Received file:", {
      originalname: resume.originalname,
      mimetype: resume.mimetype,
      size: resume.size,
    });

    // Validate file type
    if (!ALLOWED_TYPES.includes(resume.mimetype)) {
      throw new AppError(
        "Invalid file type. Only PDF or Word documents allowed.",
        400,
      );
    }

    // Validate file size
    if (resume.size > MAX_FILE_SIZE) {
      throw new AppError("File size exceeds 10MB limit.", 400);
    }

    // Call service
    const result = await uploadResumeService(
      new UserId(userId.toString()),
      resume,
    );

    // send error response
    if (result && !result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }

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
