import { NextFunction, Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../../../config/cookie.config";
import logger from "../../../config/logger.config";
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
  const log = logger.child({ module: "AUTH", controller: "refreshController" });
  log.info("Token refresh request received");

  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      log.warn("Token refresh attempt without refreshToken cookie");
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    log.debug("Rotating tokens via refreshService");

    // Call service to rotate tokens and update Redis
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshService(refreshToken);

    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    log.info("Token rotation completed successfully, new auth cookies set");

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message },
      "Token refresh request failed",
    );
    next(error);
  }
};

