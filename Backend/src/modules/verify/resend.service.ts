import { Resend } from "resend";
import logger from "../../config/logger.config";
import { userRepository } from "../../database/mongo/user/userModelRepo";
import { AppError } from "../../Error/appError";
import { generateVerifyCode } from "../../utils/generateVerifyCode";
import { generateVerifyExpiry } from "../../utils/generateVerifyExpiry";
import { verificationEmailTemplate } from "../../utils/verificationCode.structure";

// Initializing Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const resendService = async (email: string) => {
  const log = logger.child({ module: "VERIFY", service: "resendService" });
  log.debug({ email }, "Generating and resending verification code");

  // 1. Find user by email
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    log.warn({ email }, "Resend code failed: User not found");
    throw new AppError("User not found", 404);
  }

  const userIdStr = user.id.toString();

  // 2. Check if user is already verified
  if (user.isEmailVerified()) {
    log.warn({ email, userId: userIdStr }, "Resend code skipped: Email is already verified");
    throw new AppError("Email is already verified", 400);
  }

  // 3. Generate a new verification code and expiry
  log.debug({ email, userId: userIdStr }, "Generating fresh 6-digit verification code");
  const verifyCode = await generateVerifyCode();
  const verifyExpiry = await generateVerifyExpiry();

  // 4. Update the user entity with new verification data
  user.setVerification(verifyCode, verifyExpiry);

  // 5. Update the user record in the database
  await userRepository.updateUser(user);
  log.debug({ email, userId: userIdStr }, "Updated user record with new verification code");

  // 6. Send the verification email using Resend
  try {
    log.info({ email, userId: userIdStr }, "Sending new verification code email via Resend");
    await resend.emails.send({
      from: "Welfare-Scheme Platform <onboarding@resend.dev>",
      to: email,
      subject: "Your new verification code",
      html: verificationEmailTemplate(user.getUsername() || "User", verifyCode),
    });
    log.info({ email, userId: userIdStr }, "New verification code email dispatched successfully");
  } catch (error: any) {
    log.error(
      { err: error, message: error?.message, email, userId: userIdStr },
      "Failed to resend verification email via Resend",
    );
    throw new AppError("Failed to send verification email. Please try again.", 500);
  }

  return {
    message: "A new verification code has been sent to your email",
  };
};

