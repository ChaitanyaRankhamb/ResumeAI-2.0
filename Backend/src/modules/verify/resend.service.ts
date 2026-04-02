import { Resend } from "resend";
import { userRepository } from "../../database/mongo/user/userModelRepo";
import { AppError } from "../../Error/appError";
import { verificationEmailTemplate } from "../../utils/verificationCode.structure";
import { generateVerifyExpiry } from "../../utils/generateVerifyExpiry";
import { generateVerifyCode } from "../../utils/generateVerifyCode";


// Initializing Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const resendService = async (email: string) => {
  // 1. Find user by email
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Check if user is already verified
  if (user.isEmailVerified()) {
    throw new AppError("Email is already verified", 400);
  }

  // 3. Generate a new verification code and expiry
  // generate random 6 digit number
  const verifyCode = await generateVerifyCode();

  // apply the verification expiry (15 minutes)
  const verifyExpiry = await generateVerifyExpiry();

  // 4. Update the user entity with new verification data
  user.setVerification(verifyCode, verifyExpiry);

  // 5. Update the user record in the database
  await userRepository.updateUser(user);

  // 6. Send the verification email using Resend
  try {
    await resend.emails.send({
      from: "Welfare-Scheme Platform <onboarding@resend.dev>",
      to: email,
      subject: "Your new verification code",
      html: verificationEmailTemplate(user.getUsername() || "User", verifyCode),
    });
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    // Even if email fails, we don't necessarily want to crash the whole process
    // But we should notify that email failed
    throw new AppError("Failed to send verification email. Please try again.", 500);
  }

  return {
    message: "A new verification code has been sent to your email",
  };
};
