import logger from "../../config/logger.config";
import { userRepository } from "../../database/mongo/user/userModelRepo";
import { AppError } from "../../Error/appError";

/**
 * Handles the email verification logic.
 * @param email The user's email address
 * @param code The verification code provided by the user
 */
export const verifyService = async (email: string, code: number) => {
  const log = logger.child({ module: "VERIFY", service: "verifyService" });
  log.debug({ email }, "Verifying email code for user");

  // 1. Find user by email
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    log.warn({ email }, "Verification failed: User not found");
    throw new AppError("User not found", 404);
  }

  const userIdStr = user.id.toString();

  // 2. Check if user is already verified
  if (user.isEmailVerified()) {
    log.warn({ email, userId: userIdStr }, "Verification skipped: Email is already verified");
    throw new AppError("Email is already verified", 400);
  }

  // 3. Verify the email using the provided code
  const expiry = user.getVerificationExpiry();
  // verify expiry data
  if (!expiry || Date.now() > expiry.getTime()) {
    log.warn({ email, userId: userIdStr, expiry }, "Verification failed: Code has expired");
    throw new AppError(
      "Verification code expired. Please request a new one.",
      400,
    );
  }

  // verify code
  if (user.getVerificationCode() !== code) {
    log.warn({ email, userId: userIdStr }, "Verification failed: Incorrect verification code provided");
    throw new AppError("Please enter valid verification code.", 400);
  }

  // make user verified
  user.setEmailVerified(true);

  // clear verification data
  user.clearVerificationData();

  // 4. Update the user record in the database
  await userRepository.updateUser(user);
  log.info({ email, userId: userIdStr }, "User email marked as verified in MongoDB");

  return {
    message: "Email verified successfully",
  };
};

