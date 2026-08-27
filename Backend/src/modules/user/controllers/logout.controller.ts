import { NextFunction, Response } from "express";
import { CLEAR_COOKIE_OPTIONS } from "../../../config/cookie.config";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { logoutService } from "../services/logout.service";

/**
 * Controller to handle user logout requests
 */
export const logoutController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;

    if (userId) {
      await logoutService(userId);
    }

    // Clear authentication cookies
    res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
