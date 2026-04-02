import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { uploadResumeController } from "./controllers/resume.controller";
import { uploadResumeMiddleware } from "../../middlewares/upload.resume.middleware";

const router = express.Router();

// route to upload resume  it should be protected
router.post("/", authMiddleware, uploadResumeMiddleware, uploadResumeController);

export default router;