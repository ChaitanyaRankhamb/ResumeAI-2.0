import { Request, Response, NextFunction } from "express";
import { loginService } from "../services/login.service";
import { loginValidation } from "../../../validations/user.login.validation";

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

    // take user and access token form service
    const { user, accessToken } = await loginService(validation.email);

    // send response to frontend
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    // error handling middleware return the error
    next(error);
  }
};
