import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  resumeAnalysisRateLimiter,
  resumeUploadRateLimiter,
} from "../../middlewares/rateLimiter.middleware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { uploadResumeMiddleware } from "../../middlewares/upload.resume.middleware";
import { getResumeAnalysisController } from "./controllers/getResumeAnalysis.controller";
import { uploadResumeController } from "./controllers/resume.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

// Route to upload resume (Protected by 10 req/min Token Bucket rate limiter)
router.post(
  "/",
  authMiddleware,
  resumeUploadRateLimiter,
  uploadResumeMiddleware,
  uploadResumeController,
);

// Get analyzed resume report data (30 req / min)
router.get(
  "/analysis/:fileId",
  authMiddleware,
  resumeAnalysisRateLimiter,
  getResumeAnalysisController,
);

export default router;

