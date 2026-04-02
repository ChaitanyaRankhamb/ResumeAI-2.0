import dotenv from 'dotenv';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, cb) => {
      try {
        // extract email from profile
        const email = profile.emails?.[0].value;

        if (!email) {
          return cb(new AppError("No email found in google profile", 500));
        }

        // check user already exist with google provider ID
        let user = await userRepository.findByProvider("google", profile.id);

        if (!user) {
          // find user with email
          user = await userRepository.findUserByEmail(email);

          // if user exist with google email, check if google provider is linked
          if (user) {
            if (!user.hasProvider("google")) {
              user.addProvider(AuthProvider.google(profile.id));
              await userRepository.updateUser(user);
            }
          } else {
            // if not, create a new user
            user = await userRepository.createUser({
              email,
              username: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              emailVerified: true,
              providers: [AuthProvider.google(profile.id)],
            });
          }
        }

        // send user to google callback
        return cb(null, user);
      } catch (error) {
        return cb(error as Error);
      }
    },
  ),
);

export default passport;
