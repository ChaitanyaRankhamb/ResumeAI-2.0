import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { resumeProgressController } from "./controllers/resumeProgress.controller";

const router = express.Router();

// Stream resume processing progress to the frontend via SSE.
router.get("/:jobId", authMiddleware, resumeProgressController);

export default router;
