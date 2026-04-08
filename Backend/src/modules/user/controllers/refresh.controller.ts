import { Request, Response, NextFunction } from "express";
import { refreshService } from "../services/refresh.service";
import redisClient from "../../../config/redis.connection";
import jwt from "jsonwebtoken";

/**
 * Controller to handle token refresh requests.
 * The refresh token is stored only in Redis (backend-side).
 * We identify the user by their expired access token.
 */
export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 3. Fetch the refresh token from cookies.
    const refreshToken = await req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // 4. Call the service to rotate the tokens
    // The service verifies the refresh token and updates it in Redis
    const { accessToken } = await refreshService(refreshToken);

    // 5. Store the new access token in the same cookie that authMiddleware reads.
    // Without this, the retried request still sends the old (expired) cookie,
    // and refresh appears to "not work".
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

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};
