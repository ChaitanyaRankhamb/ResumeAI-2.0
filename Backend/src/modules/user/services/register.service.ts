import { Resend } from "resend";
import logger from "../../../config/logger.config";
import { userRepository } from "../../../database/mongo/user/userModelRepo";
import { AuthProvider } from "../../../entities/user/AuthProvider";
import { CreateUserData } from "../../../entities/user/userRepo";
import { AppError } from "../../../Error/appError";
import { generateVerifyCode } from "../../../utils/generateVerifyCode";
import { generateVerifyExpiry } from "../../../utils/generateVerifyExpiry";
import { verificationEmailTemplate } from "../../../utils/verificationCode.structure";

const resend = new Resend(process.env.RESEND_API_KEY);

export const registerService = async (email: string, username: string) => {
  const log = logger.child({ module: "AUTH", service: "registerService" });
  log.debug({ email, username }, "Checking if user already exists in database");

  // check existing user
  const existingUser = await userRepository.findUserByEmail(email);

  if (existingUser) {
    // if exist then check provider and link it
    const hasEmailProvider = existingUser.hasProvider("credentials");
    const hasGoogleProvider = existingUser.hasProvider("google");

    // if user already with same email and credentials provider
    if (hasEmailProvider) {
      log.warn({ email }, "Registration rejected: User with credentials provider already exists");
      throw new AppError("User already exist", 400);
    }

    // if user exist with google account, link credentials provider
    if (!hasEmailProvider && hasGoogleProvider) {
      log.info({ email, userId: existingUser.id.toString() }, "Linking credentials provider to existing Google account");
      existingUser.addProvider(AuthProvider.credentials(email));
      await userRepository.updateUser(existingUser);
      return existingUser;
    }
  } else {
    // create new user from scratch with credentials data
    log.debug({ email }, "Generating verification code and expiry");

    // create random 6 digit number
    const verifyCode = await generateVerifyCode();

    // apply the verification expiry (15 minutes)
    const verifyExpiry = await generateVerifyExpiry();

    // add credentials as auth providers
    const authProvider = AuthProvider.credentials(email);

    // prepare create new user data
    const userData: CreateUserData = {
      email,
      username,
      verificationCode: verifyCode,
      verificationExpiry: verifyExpiry,
      providers: [authProvider],
    };

    log.debug({ email, username }, "Persisting new user to MongoDB");
    const user = await userRepository.createUser(userData);

    if (!user) {
      log.error({ email }, "Database failed to return user document upon creation");
      throw new AppError("Error in user creation. Please try again!", 500);
    }

    log.info({ userId: user.id.toString(), email }, "New user record created in MongoDB");

    // send email to user email with verification Code
    try {
      if (!user.isEmailVerified()) {
        log.info({ email }, "Sending verification email via Resend");
        await resend.emails.send({
          from: "Walefare-Scheme Platform <onboarding@resend.dev>",
          to: email,
          subject: "Verify your account",
          html: verificationEmailTemplate(username, verifyCode),
        });
        log.info({ email }, "Verification email dispatched successfully");
      }
    } catch (error: any) {
      log.error(
        { err: error, message: error?.message, email },
        "Failed to send verification email via Resend",
      );
    }

    return user;
  }
};

