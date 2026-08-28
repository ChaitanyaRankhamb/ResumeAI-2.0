import { NextFunction, Request, Response } from "express";
import logger from "../../config/logger.config";
import { resendValidation } from "../../validations/resend.validation";
import { resendService } from "./resend.service";

/**
 * Controller to handle requests for resending verification codes.
 * Extracts email from request body or query parameters.
 */
export const resendController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const log = logger.child({ module: "VERIFY", controller: "resendController" });
  const rawEmail = req.body?.email;

  log.info({ email: rawEmail }, "Resend verification code request received");

  try {
    // 1. Validate request email
    const validation = await resendValidation(rawEmail);
    log.debug({ email: validation.email }, "Resend code input validation passed");

    // 2. Call the resend service
    const result = await resendService(validation.email);

    log.info({ email: validation.email }, "Resend verification code completed successfully");

    // 3. Return a successful response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, email: rawEmail },
      "Resend verification code request failed",
    );
    // 4. Pass errors to error-handling middleware
    next(error);
  }
};

