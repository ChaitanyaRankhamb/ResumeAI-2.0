import logger from "../../../config/logger.config";
import redisClient from "../../../config/redis.connection";
import { User } from "../../../entities/user/user";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwt.utils";

/**
 * Handles token generation after successful Google OAuth login
 * 1. Generates tokens
 * 2. Stores refresh token in Redis
 */
export const handleGoogleLoginService = async (user: User) => {
  const log = logger.child({ module: "AUTH", service: "handleGoogleLoginService" });
  const userIdStr = user.id.toString();

  log.debug({ userId: userIdStr }, "Generating JWT access and refresh tokens");

  // GENERATE ACCESS TOKEN (15 min)
  const accessToken = generateAccessToken({
    userId: userIdStr,
    email: user.getEmail(),
  });

  // GENERATE REFRESH TOKEN (7 days)
  const refreshToken = generateRefreshToken({
    userId: userIdStr,
    email: user.getEmail(),
  });

  // store refresh token in redis instead of MongoDB for better performance and scalability
  // EX sets the expiration to 7 days (604800 seconds)
  const ttlSeconds = 7 * 24 * 60 * 60;
  await redisClient.set(`refresh:${user.id}`, refreshToken, {
    EX: ttlSeconds,
  });

  log.debug(
    { userId: userIdStr, redisKey: `refresh:${user.id}`, ttl: `${ttlSeconds}s` },
    "Refresh token persisted to Redis session store",
  );

  return { accessToken, refreshToken };
};
