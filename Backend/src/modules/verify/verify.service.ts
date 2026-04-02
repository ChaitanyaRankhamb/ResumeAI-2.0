import { userRepository } from "../../database/mongo/user/userModelRepo";
import { AppError } from "../../Error/appError";

/**
 * Handles the email verification logic.
 * @param email The user's email address
 * @param code The verification code provided by the user
 */
export const verifyService = async (email: string, code: number) => {
  // 1. Find user by email
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Check if user is already verified
  if (user.isEmailVerified()) {
    throw new AppError("Email is already verified", 400);
  }

  // 3. Verify the email using the provided code
  const expiry = user.getVerificationExpiry();
  // verify expiry data
  if (!expiry || Date.now() > expiry.getTime()) {
    throw new AppError(
      "Verification code expired. Please request a new one.",
      400,
    );
  }

  // verify code
  if (user.getVerificationCode() !== code) {
    throw new AppError("Please enter valid verification code.", 400);
  }

  // make user verified
  user.setEmailVerified(true);

  // clear verification data
  user.clearVerificationData();

  // 4. Update the user record in the database
  await userRepository.updateUser(user);

  return {
    message: "Email verified successfully",
  };
};
