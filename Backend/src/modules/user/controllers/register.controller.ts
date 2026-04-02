import { Request, Response, NextFunction } from "express";
import { registerService } from "../services/register.service";
import { registerValidation } from "../../../validations/user.register.validation";
import { AppError } from "../../../Error/appError";

/**
 * Controller to handle user registration requests
 */
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, username } = req.body;

    // validate the incoming fields
    const validatedData = await registerValidation(username, email);

    // call the register service with validated data
    const user = await registerService(validatedData.email, validatedData.username);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
