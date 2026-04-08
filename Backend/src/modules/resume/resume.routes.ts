import express, { Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { uploadResumeController } from "./controllers/resume.controller";
import { getResumeAnalysisController } from "./controllers/getResumeAnalysis.controller";
import { uploadResumeMiddleware } from "../../middlewares/upload.resume.middleware";

const router = express.Router();

// Define params type for progress route
interface ProgressParams {
  fileId: string;
}

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
