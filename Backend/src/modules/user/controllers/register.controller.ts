import { NextFunction, Request, Response } from "express";
import logger from "../../../config/logger.config";
import { registerValidation } from "../../../validations/user.register.validation";
import { registerService } from "../services/register.service";

/**
 * Controller to handle user registration requests
 */
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const log = logger.child({ module: "AUTH", controller: "registerController" });
  const { email, username } = req.body || {};

  log.info({ email, username }, "User registration request received");

  try {
    // validate the incoming fields
    const validatedData = await registerValidation(username, email);
    log.debug({ email: validatedData.email }, "Registration input validation passed");

    // call the register service with validated data
    const user = await registerService(validatedData.email, validatedData.username);

    log.info({ email: validatedData.email }, "User registered successfully");

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, email, username },
      "User registration request failed",
    );
    next(error);
  }
};

