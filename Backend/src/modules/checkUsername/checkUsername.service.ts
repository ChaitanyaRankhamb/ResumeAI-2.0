import logger from "../../config/logger.config";
import { userRepository } from "../../database/mongo/user/userModelRepo";

/**
 * Service to check if a username is available.
 * @param username - The username to check.
 * @returns boolean - true if available, false if already taken.
 */
export const checkUsernameService = async (username: string): Promise<boolean> => {
  const log = logger.child({ module: "USERNAME", service: "checkUsernameService" });
  log.debug({ username }, "Searching user repository for username match");

  const user = await userRepository.findUserByUsername(username);
  const isAvailable = !user;

  log.debug(
    { username, exists: Boolean(user), available: isAvailable },
    "Username database check result",
  );

  return isAvailable;
};

