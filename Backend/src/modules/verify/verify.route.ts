import express from "express";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { resendController } from "./resend.controller";
import { verifyController } from "./verify.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

// Route to verify user email with a code
// Expected body: { email: string, code: number }
router.post("/", verifyController);

// Route to resend the verification code
// Expected body or query: { email: string }
router.post("/resend-verification-code", resendController);

export default router;

