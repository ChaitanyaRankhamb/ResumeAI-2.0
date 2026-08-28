import logger from "../../../config/logger.config";
import redisClient from "../../../config/redis.connection";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { AppError } from "../../../Error/appError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwt.utils";

export const loginService = async (email: string) => {
  const log = logger.child({ module: "AUTH", service: "loginService" });
  log.debug({ email }, "Looking up user in database by email");

  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    log.warn({ email }, "Login failed: No user found with this email");
    throw new AppError("User not found with this email", 401);
  }

  const userIdStr = user.id.toString();
  log.debug({ userId: userIdStr }, "Generating access and refresh tokens");

  // GENERATE TOKENS
  const accessToken = generateAccessToken({
    userId: userIdStr,
    email: user.getEmail(),
  });
  const refreshToken = generateRefreshToken({
    userId: userIdStr,
    email: user.getEmail(),
  });

  // SAVE REFRESH TOKEN TO REDIS (EXPIRES IN 7 DAYS)
  const ttlSeconds = 7 * 24 * 60 * 60;
  try {
    await redisClient.set(`refresh:${user.id}`, refreshToken, {
      EX: ttlSeconds,
    });
    log.debug(
      { userId: userIdStr, redisKey: `refresh:${user.id}`, ttl: `${ttlSeconds}s` },
      "Session refresh token stored in Redis",
    );
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, userId: userIdStr },
      "Redis storage error while persisting refresh token",
    );
    if (error.message.includes("NOAUTH")) {
      throw new AppError("Internal Server Error: Cache authentication failed. Please check Redis configuration.", 500);
    }
    throw new AppError("Failed to initialize session. Please try again.", 500);
  }

  return { user, accessToken, refreshToken };
};

