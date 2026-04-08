import { Multer } from 'multer';
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import redisClient from "../config/redis.connection";
import { userRepository } from "../database/mongo/user/userModelRepo";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
  file?: Express.Multer.File
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // take token from cookies
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = verifyAccessToken(token as string);

    if (typeof payload === "string" || !payload.userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);

    if (isBlacklisted) {
      return res.status(401).json({ message: "Token invalidated" });
    }

    // Fetch user and attach to request
    const user = await userRepository.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userId = payload.userId;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};