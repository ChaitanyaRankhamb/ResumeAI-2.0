import { NextFunction, Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../../../config/cookie.config";
import { User } from "../../../entities/user/user";
import { AppError } from "../../../Error/appError";
import { handleGoogleLoginService } from "../services/google.service";

export interface googleResponse {
  status: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const googleCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as User;

    if (!user) {
      throw new AppError("User not found from passport", 400);
    }

    const { accessToken, refreshToken } = await handleGoogleLoginService(user);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost/dashboard";
    return res.redirect(`${frontendUrl}?oauth=success`);
  } catch (error) {
    next(error);
  }
};
