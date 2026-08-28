import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { resumeProgressController } from "./controllers/resumeProgress.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

// Stream resume processing progress to the frontend via SSE.
router.get("/:jobId", authMiddleware, resumeProgressController);

export default router;

