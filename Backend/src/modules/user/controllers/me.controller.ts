import { NextFunction, Request, Response } from "express";
import logger from "../../../config/logger.config";
import { User } from "../../../entities/user/user";

/**
 * Controller to get current user profile
 */
export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const log = logger.child({ module: "AUTH", controller: "getMeController" });

  try {
    const user = (req as any).user as User;
    const userId = user?.id?.toString();

    log.debug({ userId }, "Fetching authenticated user profile");

    res.status(200).json({
      success: true,
      data: {
        id: userId,
        email: user.getEmail(),
        username: user.getUsername(),
        avatar: user.getAvatar(),
      },
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message },
      "Failed to fetch authenticated user profile",
    );
    next(error);
  }
};

