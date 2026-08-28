import { NextFunction, Response } from "express";
import { CLEAR_COOKIE_OPTIONS } from "../../../config/cookie.config";
import logger from "../../../config/logger.config";
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
  const log = logger.child({ module: "AUTH", controller: "logoutController" });
  const userId = req.userId;

  log.info({ userId }, "User logout request received");

  try {
    if (userId) {
      await logoutService(userId);
    }

    // Clear authentication cookies
    res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

    log.info({ userId }, "User logged out successfully, auth cookies cleared");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, userId },
      "User logout request failed",
    );
    next(error);
  }
};

