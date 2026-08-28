import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { uploadResumeMiddleware } from "../../middlewares/upload.resume.middleware";
import { getResumeAnalysisController } from "./controllers/getResumeAnalysis.controller";
import { uploadResumeController } from "./controllers/resume.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

// route to upload resume  it should be protected
router.post(
  "/",
  authMiddleware,
  uploadResumeMiddleware,
  uploadResumeController,
);

// Get analyzed resume report data (protected)
router.get("/analysis/:fileId", authMiddleware, getResumeAnalysisController);

export default router;
