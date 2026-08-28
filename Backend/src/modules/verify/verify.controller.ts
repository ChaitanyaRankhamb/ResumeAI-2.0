import { NextFunction, Request, Response } from "express";
import logger from "../../config/logger.config";
import { verifyCodeValidation } from "../../validations/verifyCode.validation";
import { verifyService } from "./verify.service";

/**
 * Controller to handle email verification requests.
 * Extracts email and code from request body.
 */
export const verifyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const log = logger.child({ module: "VERIFY", controller: "verifyController" });
  const rawEmail = req.body?.email;

  log.info({ email: rawEmail }, "Email verification request received");

  try {
    const { email, code } = req.body;

    // 1. Validate request body
    const validation = verifyCodeValidation(email, code);
    log.debug({ email: validation.email }, "Verification code input validation passed");

    // 2. Call the verify service to perform logic
    const result = await verifyService(validation.email, validation.code);

    log.info({ email: validation.email }, "Email verification completed successfully");

    // 3. Return a successful response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, email: rawEmail },
      "Email verification request failed",
    );
    // 4. Pass errors to error-handling middleware
    next(error);
  }
};

