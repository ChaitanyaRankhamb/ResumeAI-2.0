import { Request, Response, NextFunction } from "express";
import { checkUsernameService } from "./checkUsername.service";

/**
 * Controller to handle username availability checks.
 */
export const checkUsernameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== "string") {
      res.status(400).json({
        success: false,
        message: "Username is required as a query parameter.",
      });
      return;
    }

    const isAvailable = await checkUsernameService(username);

    res.status(200).json({
      success: true,
      available: isAvailable,
      message: isAvailable ? "Username is available" : "Username is already taken",
    });
  } catch (error) {
    next(error);
  }
};
