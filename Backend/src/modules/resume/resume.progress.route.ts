import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { resumeAnalysisRateLimiter } from "../../middlewares/rateLimiter.middleware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { resumeProgressController } from "./controllers/resumeProgress.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

// Stream resume processing progress to the frontend via SSE (30 req / min).
router.get(
  "/:jobId",
  authMiddleware,
  resumeAnalysisRateLimiter,
  resumeProgressController,
);

export default router;


