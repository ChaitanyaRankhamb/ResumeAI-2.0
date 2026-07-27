import { NextFunction, Request, Response } from "express";
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


    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    // error handling middleware return the error
    next(error);
  }
};
