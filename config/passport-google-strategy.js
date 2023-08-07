const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("crypto");
const User = require("../models/user");

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const user = await User.findOne({
          email: profile.emails[0].value,
        });

        if (user) {
          // If Found return from request
          return done(null, user);
        } else {
          // if not found, create the user and set it as req.user
          const newUser = User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: crypto.randomBytes(20).toString("hex"),
          });

          await newUser.save();

          return done(null, newUser);
        }
      } catch (err) {
        console.log("error in google strategy-passport", err);
        return done(err);
      }
    }
  )
);

module.exports = passport;
