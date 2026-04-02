import bcrypt from "bcryptjs";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { AppError } from "../../../Error/appError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwt.utils";
import redisClient from "../../../config/redis.connection";

export const loginService = async (email: string) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("User not found with this email", 401);
  }

  // GENERATE TOKENS
  const accessToken = generateAccessToken({
    userId: user.id.toString(),
    email: user.getEmail(),
  });
  const refreshToken = generateRefreshToken({
    userId: user.id.toString(),
    email: user.getEmail(),
  });

  // SAVE REFRESH TOKEN TO REDIS (EXPIRES IN 7 DAYS)
  try {
    await redisClient.set(`refresh:${user.id}`, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    });
  } catch (error: any) {
    console.error("Redis storage error:", error);
    if (error.message.includes("NOAUTH")) {
      throw new AppError("Internal Server Error: Cache authentication failed. Please check Redis configuration.", 500);
    }
    // If it's not a NOAUTH error, we might still want to fail or just log it
    // For production, failing is safer if session management depends on Redis
    throw new AppError("Failed to initialize session. Please try again.", 500);
  }

  return { user, accessToken, refreshToken };
};
