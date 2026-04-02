import express from "express";
import { checkUsernameController } from "./checkUsername.controller";

const router = express.Router();

/**
 * Route to check username availability.
 * Expected query param: ?username=example
 */
router.get("/", checkUsernameController);

export default router;
