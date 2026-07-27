import express from "express";
import { resendController } from "./resend.controller";
import { verifyController } from "./verify.controller";

const router = express.Router();

// Route to verify user email with a code
// Expected body: { email: string, code: number }
router.post("/", verifyController);

// Route to resend the verification code
// Expected body or query: { email: string }
router.post("/resend-verification-code", resendController);

export default router;
