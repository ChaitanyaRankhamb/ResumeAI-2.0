import { NextFunction, Response } from "express";
import logger from "../../../config/logger.config";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { AppError } from "../../../Error/appError";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { resumeProgressService } from "../services/resumeProgress.service";

interface Params {
  jobId: string;
}

export const resumeProgressController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const log = logger.child({ module: "RESUME:SSE", controller: "resumeProgressController" });

  try {
    const userId = req.userId;
    if (!userId) {
      log.warn("Unauthorized attempt to connect to SSE resume progress stream");
      throw new AppError("User is Unauthorized", 401);
    }

    const { jobId } = req.params as unknown as Params;
    if (!jobId) {
      log.warn({ userId }, "Missing jobId in SSE progress request");
      throw new AppError("Job ID is required", 400);
    }

    log.info({ userId, jobId }, "Client initiating SSE resume progress connection");

    const file = await fileRepository.findFileById(jobId);
    if (!file) {
      log.warn({ userId, jobId }, "File not found for SSE progress stream");
      throw new AppError("Job not found", 404);
    }

    if (file.userId.toString() !== userId.toString()) {
      log.warn(
        { userId, fileOwnerId: file.userId.toString(), jobId },
        "Forbidden: SSE progress stream requested by non-owner",
      );
      throw new AppError("Forbidden", 403);
    }

    // it will send the current progress and listen for future progress updates via SSE
    await resumeProgressService(jobId, res);
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, jobId: req.params?.jobId },
      "Error during SSE resume progress controller execution",
    );
    next(error);
  }
};

