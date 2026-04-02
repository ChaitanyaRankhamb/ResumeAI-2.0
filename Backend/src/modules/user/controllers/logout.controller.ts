import { Request, Response, NextFunction } from "express";
import { logoutService } from "../services/logout.service";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import redisClient from "../../../config/redis.connection";
import { UserId } from "../../../entities/user/userId";

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

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
