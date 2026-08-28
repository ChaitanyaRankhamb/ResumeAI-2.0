import { NextFunction, Response } from "express";
import logger from "../../../config/logger.config";
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
  const log = logger.child({ module: "RESUME", controller: "getResumeAnalysisController" });

  try {
    const userId = req.userId;
    if (!userId) {
      log.warn("Unauthorized attempt to get resume analysis");
      throw new AppError("User is Unauthorized", 401);
    }

    res.setHeader("Cache-Control", "no-store");

    const { fileId } = req.params as unknown as Params;
    if (!fileId) {
      log.warn({ userId }, "Missing fileId parameter in resume analysis request");
      throw new AppError("fileId is required", 400);
    }

    log.info({ userId, fileId }, "Fetching resume analysis report");

    const file = await fileRepository.findFileById(fileId);
    if (!file) {
      log.warn({ userId, fileId }, "Resume file document not found in MongoDB");
      throw new AppError("File not found", 404);
    }

    if (file.userId.toString() !== userId.toString()) {
      log.warn(
        { userId, fileOwnerId: file.userId.toString(), fileId },
        "Forbidden access: requester is not file owner",
      );
      throw new AppError("Forbidden", 403);
    }

    const analyzedData = file.getAnalyzedData();

    if (analyzedData) {
      log.info({ fileId, source: "mongodb" }, "Serving resume analysis directly from MongoDB document");
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
      const redisKey = `resume:${file.getHash()}`;
      log.debug({ fileId, redisKey }, "Analysis not in MongoDB document, querying Redis cache");
      cachedAnalyzedData = await redisClient.get(redisKey);

      if (cachedAnalyzedData) {
        const parsedAnalyzedData = JSON.parse(cachedAnalyzedData);

        // Validate cached data
        if (
          !parsedAnalyzedData.skillInsights ||
          !parsedAnalyzedData.skillInsights.allSkills ||
          !Array.isArray(parsedAnalyzedData.skillInsights.allSkills)
        ) {
          log.warn({ fileId, redisKey }, "Invalid cached analysis data structure in Redis");
          cachedAnalyzedData = null; // Treat as not found
        } else {
          // Update the file document with cached data
          log.info({ fileId, redisKey }, "Found valid analysis in Redis. Backfilling MongoDB file document");
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
      log.warn({ fileId }, "Resume analysis not yet ready or available");
      res.status(400).json({
        success: false,
        message:
          "Resume analysis is not available yet. Please check back later.",
      });
      return;
    }

    log.info({ fileId, source: "redis_cache" }, "Serving resume analysis retrieved from Redis cache");
    res.status(200).json({
      success: true,
      message: "resume analysis data retrieved from cache successfully",
      data: {
        fileId: file.id,
        analyzedData: cachedAnalyzedData,
      },
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, fileId: req.params?.fileId },
      "Error fetching resume analysis",
    );
    next(error);
  }
};

