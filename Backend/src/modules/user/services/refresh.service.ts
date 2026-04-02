import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { AppError } from "../../../Error/appError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt.utils";
import redisClient from "../../../config/redis.connection";

/**
 * Handles token refresh logic
 * 1. Verifies the provided refresh token
 * 2. Checks if it matches the one in Redis
 * 3. Generates new tokens and updates Redis
 */
export const refreshService = async (refreshToken: string) => {
  try {
    // VERIFY REFRESH TOKEN
    const decoded = verifyRefreshToken(refreshToken);
    const user = await userRepository.findUserById(decoded.userId as string);

    // CHECK IF TOKEN EXISTS IN REDIS AND MATCHES
    const storedToken = await redisClient.get(`refresh:${decoded.userId}`);
    if (!user || storedToken !== refreshToken) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

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
    await redisClient.set(`refresh:${user.id}`, newRefreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }
};
