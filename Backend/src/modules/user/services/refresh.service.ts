import logger from "../../../config/logger.config";
import redisClient from "../../../config/redis.connection";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { AppError } from "../../../Error/appError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt.utils";

/**
 * Handles token refresh logic
 * 1. Verifies the provided refresh token
 * 2. Checks if it matches the one in Redis
 * 3. Generates new tokens and updates Redis
 */
export const refreshService = async (refreshToken: string) => {
  const log = logger.child({ module: "AUTH", service: "refreshService" });

  try {
    // VERIFY REFRESH TOKEN
    const decoded = verifyRefreshToken(refreshToken);
    const userId = decoded.userId as string;

    log.debug({ userId }, "Verifying refresh token against Redis session store");

    const user = await userRepository.findUserById(userId);
    const storedToken = await redisClient.get(`refresh:${userId}`);

    if (!user || storedToken !== refreshToken) {
      log.warn(
        { userId, hasUser: Boolean(user), tokenMatch: storedToken === refreshToken },
        "Token refresh validation failed: invalid or mismatched token",
      );
      throw new AppError("Invalid or expired refresh token", 401);
    }

    log.debug({ userId }, "Generating rotated access and refresh tokens");

    // GENERATE NEW TOKENS
    const accessToken = generateAccessToken({
      userId: user.id.toString(),
      email: user.getEmail(),
    });
    const newRefreshToken = generateRefreshToken({
      userId: user.id.toString(),
      email: user.getEmail(),
    });

    // UPDATE REFRESH TOKEN IN REDIS
    const ttlSeconds = 7 * 24 * 60 * 60;
    await redisClient.set(`refresh:${user.id}`, newRefreshToken, {
      EX: ttlSeconds,
    });

    log.debug(
      { userId, redisKey: `refresh:${user.id}`, ttl: `${ttlSeconds}s` },
      "Rotated refresh token updated in Redis session store",
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message },
      "Error during token refresh process",
    );
    throw new AppError("Invalid refresh token", 401);
  }
};

