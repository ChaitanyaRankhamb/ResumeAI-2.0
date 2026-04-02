import { userRepository } from "../../../database/mongo/user/userModelRepo";
import redisClient from "../../../config/redis.connection";
import { UserId } from "../../../entities/user/userId";

/**
 * Handles user logout logic
 * 1. Clears the refresh token from Redis
 */
export const logoutService = async (userId: string) => {
  const user = await userRepository.findUserById(userId);
  if (user) {
    // CLEAR REFRESH TOKEN FROM REDIS
    await redisClient.del(`refresh:${user.id}`);
  }
};
