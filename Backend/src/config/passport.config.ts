import dotenv from 'dotenv';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import logger from "./logger.config";
import { userRepository } from "../database/mongo/user/userModelRepo";
import { AuthProvider } from "../entities/user/AuthProvider";
import { AppError } from "../Error/appError";

dotenv.config({
  path:
    process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

// registered google strategy in passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, cb) => {
      const log = logger.child({ module: "AUTH:PASSPORT", strategy: "google" });

      try {
        // extract email from profile
        const email = profile.emails?.[0].value;

        if (!email) {
          log.warn({ profileId: profile.id }, "No email found in Google profile payload");
          return cb(new AppError("No email found in google profile", 500));
        }

        log.info({ profileId: profile.id, email }, "Google profile received in Passport strategy");

        // check user already exist with google provider ID
        let user = await userRepository.findByProvider("google", profile.id);

        if (!user) {
          // find user with email
          user = await userRepository.findUserByEmail(email);

          // if user exist with google email, check if google provider is linked
          if (user) {
            if (!user.hasProvider("google")) {
              log.info({ userId: user.id.toString(), email }, "Linking Google provider to existing user account");
              user.addProvider(AuthProvider.google(profile.id));
              await userRepository.updateUser(user);
            }
          } else {
            // if not, create a new user
            log.info({ email, username: profile.displayName }, "Creating new user account from Google profile");
            user = await userRepository.createUser({
              email,
              username: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              emailVerified: true,
              providers: [AuthProvider.google(profile.id)],
            });
          }
        }

        log.info({ userId: user.id.toString(), email: user.getEmail() }, "Passport Google strategy authentication completed");

        // send user to google callback
        return cb(null, user);
      } catch (error) {
        log.error({ err: error }, "Error during Passport Google authentication strategy");
        return cb(error as Error);
      }
    },
  ),
);

export default passport;

