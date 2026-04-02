import { Request, Response, NextFunction } from "express";
import { resendService } from "./resend.service";
import { resendValidation } from "../../validations/resend.validation";

/**
 * Controller to handle requests for resending verification codes.
 * Extracts email from request body or query parameters.
 */
export const resendController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract email from body
    const email = req.body.email;

    // 1. Validate request email
    const validation = await resendValidation(email);

    // 2. Call the resend service
    const result = await resendService(validation.email);

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
