import { Request, Response, NextFunction } from "express";
import { handleGoogleLoginService } from "../services/google.service";
import { User } from "../../../entities/user/user";
import { AppError } from "../../../Error/appError";

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

    // Set refresh token in HTTP-only cookie if desired, but for now just redirect
    // back to the frontend with the access token in the query params.
    // In production, consider a more secure way to pass tokens. maybe cookies!

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

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

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:3000/dashboard";
    return res.redirect(`${frontendUrl}`);
  } catch (error) {
    next(error);
  }
};
