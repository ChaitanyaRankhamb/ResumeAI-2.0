import { NextFunction, Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../../../config/cookie.config";
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
  try {
    // extract email from req body
    const { email } = req.body;

    // validate email
    const validation = await loginValidation(email);

    console.log("validated Email", validation);

    // take user and tokens from service
    const { accessToken, refreshToken } = await loginService(
      validation.email,
    );

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    // error handling middleware return the error
    next(error);
  }
};
