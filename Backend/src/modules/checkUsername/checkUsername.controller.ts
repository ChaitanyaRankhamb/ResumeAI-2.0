import { NextFunction, Request, Response } from "express";
import logger from "../../config/logger.config";
import { checkUsernameService } from "./checkUsername.service";

/**
 * Controller to handle username availability checks.
 */
export const checkUsernameController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const log = logger.child({ module: "USERNAME", controller: "checkUsernameController" });
  const { username } = req.query;

  try {
    if (!username || typeof username !== "string") {
      log.warn("Username availability check called without valid username query parameter");
      res.status(400).json({
        success: false,
        message: "Username is required as a query parameter.",
      });
      return;
    }

    log.debug({ username }, "Checking username availability");
    const isAvailable = await checkUsernameService(username);

    log.info(
      { username, available: isAvailable },
      `Username "${username}" is ${isAvailable ? "available" : "taken"}`,
    );

    res.status(200).json({
      success: true,
      available: isAvailable,
      message: isAvailable ? "Username is available" : "Username is already taken",
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, username },
      "Error during username availability check",
    );
    next(error);
  }
};

