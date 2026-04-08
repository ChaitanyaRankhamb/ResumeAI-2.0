import { NextFunction, Response } from "express";
import { AppError } from "../../../Error/appError";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import redisClient from "../../../config/redis.connection";
import { File } from "../../../entities/files/file";

interface Params {
  fileId: string;
}

export const getResumeAnalysisController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) throw new AppError("User is Unauthorized", 401);

    res.setHeader("Cache-Control", "no-store");

    const { fileId } = req.params as unknown as Params;
    if (!fileId) throw new AppError("fileId is required", 400);

    const file = await fileRepository.findFileById(fileId);
    if (!file) throw new AppError("File not found", 404);

    if (file.userId.toString() !== userId.toString()) {
      throw new AppError("Forbidden", 403);
    }

    const analyzedData = file.getAnalyzedData();

    if (analyzedData) {
      res.status(200).json({
        success: true,
        message: "resume analysis data send successfully",
        data: {
          fileId: file.id,
          analyzedData,
        },
      });
      return;
    }

    let cachedAnalyzedData;

    if (!analyzedData) {
      // Check Redis cache for analysis data
      cachedAnalyzedData = await redisClient.get(`resume:${file.getHash()}`);
      if (cachedAnalyzedData) {
        const parsedAnalyzedData = JSON.parse(cachedAnalyzedData);

        // Validate cached data
        if (
          !parsedAnalyzedData.skillInsights ||
          !parsedAnalyzedData.skillInsights.allSkills ||
          !Array.isArray(parsedAnalyzedData.skillInsights.allSkills)
        ) {
          console.error(
            "Invalid cached analyzed data: missing or invalid skillInsights",
            parsedAnalyzedData,
          );
          cachedAnalyzedData = null; // Treat as not found
        } else {
          // Update the file document with cached data
          const updatedFile = new File(
            file.id,
            file.userId,
            file.getName(),
            file.getOriginalName(),
            file.getPath(),
            file.getSize(),
            file.getHash(),
            file.getFormat(),
            file.uploadedAt,
            file.getParseText(),
            file.getStructuredData(),
            parsedAnalyzedData,
          );
          await fileRepository.updateFile(updatedFile);
          cachedAnalyzedData = parsedAnalyzedData;
        }
      }
    }

    if (!cachedAnalyzedData) {
      res.status(400).json({
        success: false,
        message:
          "Resume analysis is not available yet. Please check back later.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "resume analysis data retrieved from cache successfully",
      data: {
        fileId: file.id,
        analyzedData: cachedAnalyzedData,
      },
    });
  } catch (error) {
    next(error);
  }
};
