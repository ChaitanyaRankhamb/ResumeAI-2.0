import { NextFunction, Response } from "express";
import redisClient from "../../../config/redis.connection";
import { fileRepository } from "../../../database/mongo/files/fileModelRepo";
import { File } from "../../../entities/files/file";
import { AppError } from "../../../Error/appError";
import { AuthRequest } from "../../../middlewares/auth.middleware";

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

    console.log(`[API:GET_ANALYSIS] GET /resume/analysis/${fileId} requested by userId: ${userId}`);

    const file = await fileRepository.findFileById(fileId);
    if (!file) {
      console.warn(`[API:GET_ANALYSIS] File not found in MongoDB: ${fileId}`);
      throw new AppError("File not found", 404);
    }

    if (file.userId.toString() !== userId.toString()) {
      console.warn(`[API:GET_ANALYSIS] Forbidden: file userId (${file.userId}) does not match requester (${userId})`);
      throw new AppError("Forbidden", 403);
    }

    const analyzedData = file.getAnalyzedData();

    if (analyzedData) {
      console.log(`[API:GET_ANALYSIS] Serving analysis data directly from MONGODB for fileId: ${fileId}`);
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
      console.log(`[API:GET_ANALYSIS] Analysis not in MongoDB doc. Checking Redis cache for key: "resume:${file.getHash()}"...`);
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
            "[API:GET_ANALYSIS] Invalid cached analyzed data: missing or invalid skillInsights",
            parsedAnalyzedData,
          );
          cachedAnalyzedData = null; // Treat as not found
        } else {
          // Update the file document with cached data
          console.log(`[API:GET_ANALYSIS] Found valid analysis in Redis. Backfilling MongoDB document...`);
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
      console.warn(`[API:GET_ANALYSIS] Analysis data not available yet for fileId: ${fileId}`);
      res.status(400).json({
        success: false,
        message:
          "Resume analysis is not available yet. Please check back later.",
      });
      return;
    }

    console.log(`[API:GET_ANALYSIS] Serving analysis data from REDIS CACHE for fileId: ${fileId}`);
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
