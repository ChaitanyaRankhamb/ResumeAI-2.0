import express from "express";
import { requestLogger } from "../../middlewares/requestLogger.middleware";
import { checkUsernameController } from "./checkUsername.controller";

const router = express.Router();

// Apply HTTP request logging middleware
router.use(requestLogger);

/**
 * Route to check username availability.
 * Expected query param: ?username=example
 */
router.get("/", checkUsernameController);

export default router;

