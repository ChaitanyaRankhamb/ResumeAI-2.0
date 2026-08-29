import express from "express";
import {
  resendCodeRateLimiter,
  verifyCodeRateLimiter,
} from "../../middlewares/rateLimiter.middleware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { resendController } from "./resend.controller";
import { verifyController } from "./verify.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

// Route to verify user email with a code (10 req / min)
// Expected body: { email: string, code: number }
router.post("/", verifyCodeRateLimiter, verifyController);

// Route to resend the verification code (3 req / 2 min)
// Expected body or query: { email: string }
router.post(
  "/resend-verification-code",
  resendCodeRateLimiter,
  resendController,
);

export default router;


