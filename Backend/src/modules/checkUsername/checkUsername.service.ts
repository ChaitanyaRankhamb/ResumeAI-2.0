import { userRepository } from "../../database/mongo/user/userModelRepo";

/**
 * Service to check if a username is available.
 * @param username - The username to check.
 * @returns boolean - true if available, false if already taken.
 */
export const checkUsernameService = async (username: string): Promise<boolean> => {
  const user = await userRepository.findUserByUsername(username);
  // If no user is found, the username is available.
  return !user;
};
