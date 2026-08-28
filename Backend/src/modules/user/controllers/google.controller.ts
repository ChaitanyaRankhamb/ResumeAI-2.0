import { NextFunction, Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../../../config/cookie.config";
import logger from "../../../config/logger.config";
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
  const log = logger.child({ module: "AUTH", controller: "googleCallbackController" });
  log.info("Processing Google OAuth callback");

  try {
    const user = req.user as User;

    if (!user) {
      log.warn("Passport authentication returned undefined user object");
      throw new AppError("User not found from passport", 400);
    }

    log.info(
      { userId: user.id.toString(), email: user.getEmail() },
      "User authenticated successfully via Google OAuth",
    );

    log.debug({ userId: user.id.toString() }, "Issuing JWT tokens and creating Redis session");
    const { accessToken, refreshToken } = await handleGoogleLoginService(user);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    log.debug({ userId: user.id.toString() }, "Access and refresh token cookies set");

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost/dashboard";
    const redirectUrl = `${frontendUrl}?oauth=success`;

    log.info(
      { userId: user.id.toString(), redirectUrl },
      "Google OAuth login flow completed, redirecting to frontend",
    );

    return res.redirect(redirectUrl);
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message },
      "Exception during Google OAuth callback processing",
    );
    next(error);
  }
};

