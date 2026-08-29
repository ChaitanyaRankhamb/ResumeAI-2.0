import express from "express";
import { checkUsernameRateLimiter } from "../../middlewares/rateLimiter.middleware";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { checkUsernameController } from "./checkUsername.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

/**
 * Route to check username availability (30 req / min for real-time UI typing).
 * Expected query param: ?username=example
 */
router.get("/", checkUsernameRateLimiter, checkUsernameController);

export default router;


