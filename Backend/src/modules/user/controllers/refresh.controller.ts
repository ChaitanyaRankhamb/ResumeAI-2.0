import { NextFunction, Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../../../config/cookie.config";
import { refreshService } from "../services/refresh.service";

/**
 * Controller to handle token refresh requests.
 * Reads refreshToken from HttpOnly cookie, rotates tokens,
 * and sets new HttpOnly cookies for accessToken and refreshToken.
 */
export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // Call service to rotate tokens and update Redis
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshService(refreshToken);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};
