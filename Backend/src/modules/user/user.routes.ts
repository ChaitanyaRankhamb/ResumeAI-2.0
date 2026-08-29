import express from "express";
import passport from "passport";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  authRateLimiter,
  generalApiRateLimiter,
} from "../../middlewares/rateLimiter.middleware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { googleCallbackController } from "./controllers/google.controller";
import { loginController } from "./controllers/login.controller";
import { logoutController } from "./controllers/logout.controller";
import { getMeController } from "./controllers/me.controller";
import { refreshController } from "./controllers/refresh.controller";
import { registerController } from "./controllers/register.controller";

const router = express.Router();

// Apply request logger middleware for all user routes
router.use(requestLogger);

// credentials routes (Protected by 5 req/min Token Bucket rate limiter)
router.post("/register", authRateLimiter, registerController);
router.post("/login", authRateLimiter, loginController);
router.post("/refresh", generalApiRateLimiter, refreshController);

// OAuth google routes
// Starts the Google OAuth flow
router.get(
  "/google", authRateLimiter,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Handles the Google OAuth callback
router.get(
  "/google/callback", authRateLimiter,
  passport.authenticate("google", { session: false }),
  googleCallbackController,
);

// protected routes
// Returns current user profile
router.get("/me", authMiddleware, generalApiRateLimiter, getMeController);

// Handles user logout
router.post("/logout", authMiddleware, generalApiRateLimiter, logoutController);

export default router;

