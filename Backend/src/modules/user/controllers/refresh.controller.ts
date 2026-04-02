import { Request, Response, NextFunction } from "express";
import { refreshService } from "../services/refresh.service";
import redisClient from "../../../config/redis.connection";
import jwt from "jsonwebtoken";

/**
 * Controller to handle token refresh requests.
 * The refresh token is stored only in Redis (backend-side).
 * We identify the user by their expired access token.
 */
export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get the expired access token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Access token missing" });
    }

    const expiredToken = authHeader.split(" ")[1];

    // 2. Decode the token to get the userId without verifying expiration
    // We still verify the signature to ensure it was issued by us
    const secret = process.env.JWT_ACCESS_SECRET || "access_secret";
    let payload: any;
    
    try {
      payload = jwt.verify(expiredToken, secret, { ignoreExpiration: true });
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid access token" });
    }

    const userId = payload.userId;

    // 3. Fetch the refresh token from Redis using the userId
    const refreshToken = await redisClient.get(`refresh:${userId}`);
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please login again." 
      });
    }

    // 4. Call the service to rotate the tokens
    // The service verifies the refresh token and updates it in Redis
    const { accessToken } = await refreshService(refreshToken);

    // 5. Return only the new access token to the client
    // The new refresh token remains securely on the backend (Redis)
    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};
