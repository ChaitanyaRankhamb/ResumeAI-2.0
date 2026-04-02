import { Request, Response, NextFunction } from "express";
import { User } from "../../../entities/user/user";

/**
 * Controller to get current user profile
 */
export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user as User;
    res.status(200).json({
      success: true,
      data: {
        id: user.id.toString(),
        email: user.getEmail(),
        username: user.getUsername(),
        avatar: user.getAvatar(),
      },
    });
  } catch (error) {
    next(error);
  }
};
