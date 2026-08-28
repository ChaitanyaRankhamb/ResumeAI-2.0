import { NextFunction, Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../../../config/cookie.config";
import logger from "../../../config/logger.config";
import { loginValidation } from "../../../validations/user.login.validation";
import { loginService } from "../services/login.service";

/**
 * Controller to handle user login requests and set tokens
 */
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const log = logger.child({ module: "AUTH", controller: "loginController" });
  const rawEmail = req.body?.email;

  log.info({ email: rawEmail }, "User login request received");

  try {
    // validate email
    const validation = await loginValidation(rawEmail);
    log.debug({ email: validation.email }, "Login input validation passed");

    // take user and tokens from service
    const { user, accessToken, refreshToken } = await loginService(
      validation.email,
    );

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    log.info(
      { userId: user.id.toString(), email: user.getEmail() },
      "User logged in successfully, auth cookies set",
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, email: rawEmail },
      "User login request failed",
    );
    next(error);
  }
};

