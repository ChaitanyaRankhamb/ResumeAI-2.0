import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { resumeProgressService } from "../services/resumeProgress.service";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";

interface Params {
  jobId: string;
}

export const resumeProgressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) throw new AppError("User is Unauthorized", 401);

    const { jobId } = req.params as unknown as Params;
    if (!jobId) throw new AppError("Job ID is required", 400);

    const file = await fileRepository.findFileById(jobId);
    if (!file) throw new AppError("Job not found", 404);
    if (file.userId.toString() !== userId.toString()) {
      throw new AppError("Forbidden", 403);
    }

    // it will send the current progress and listen for future progress updates via SSE
    await resumeProgressService(jobId, res);
  } catch (error) {
    next(error);
  }
};
