import logger from "../../../config/logger.config";
import redisClient from "../../../config/redis.connection";
import { userRepository } from "../../../database/mongo/user/userModelRepo";

/**
 * Handles user logout logic
 * 1. Clears the refresh token from Redis
 */
export const logoutService = async (userId: string) => {
  const log = logger.child({ module: "AUTH", service: "logoutService" });

  try {
    const user = await userRepository.findUserById(userId);
    if (user) {
      log.info({ userId }, "Removing session refresh token from Redis");
      await redisClient.del(`refresh:${user.id}`);
    } else {
      log.warn({ userId }, "Logout called for non-existent user");
    }
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, userId },
      "Failed to delete session refresh token from Redis during logout",
    );
  }
};

