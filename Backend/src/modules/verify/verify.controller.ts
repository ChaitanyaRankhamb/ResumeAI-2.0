import { Request, Response, NextFunction } from "express";
import { verifyService } from "./verify.service";
import { verifyCodeValidation } from "../../validations/verifyCode.validation";

/**
 * Controller to handle email verification requests.
 * Extracts email and code from request body.
 */
export const verifyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code } = req.body;

    // 1. Validate request body
    const validation = verifyCodeValidation(email, code);

    // 2. Call the verify service to perform logic
    const result = await verifyService(validation.email, validation.code);

    // 3. Return a successful response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    // 4. Pass errors to error-handling middleware
    next(error);
  }
};
