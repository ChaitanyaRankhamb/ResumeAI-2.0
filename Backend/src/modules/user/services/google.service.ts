import { User } from "../../../entities/user/user";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/jwt.utils";
import redisClient from "../../../config/redis.connection";
import { userRepository } from "../../../database/mongo/user/userModelRepo";

/**
 * Handles token generation after successful Google OAuth login
 * 1. Generates tokens
 * 2. Stores refresh token in Redis
 */
export const handleGoogleLoginService = async (user: User) => {
  // GENERATE ACCESS TOKEN (15 min)
  const accessToken = generateAccessToken({
    userId: user.id.toString(),
    email: user.getEmail(),
  });
  // GENERATE REFRESH TOKEN (7 days)
  const refreshToken = generateRefreshToken({
    userId: user.id.toString(),
    email: user.getEmail(),
  });

  // store refresh token in redis instead of MongoDB for better performance and scalability
  // EX sets the expiration to 7 days
  await redisClient.set(`refresh:${user.id}`, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  });

  return { accessToken, refreshToken };
};
