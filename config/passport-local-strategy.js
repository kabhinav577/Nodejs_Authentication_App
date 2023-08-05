const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
// For Encryption/ decryption of Password
const bcrypt = require("bcrypt");

// Checking email and Password using localStrategy
const localStrategy = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      // finding the user with given username
      const user = await User.findOne({ email });

      if (!user) {
        console.log("User Not Found");
        return done(null, false, { message: "Incorrect Email" });
      }

      //decrypt and check password from stored one
      const passwordMatch = await bcrypt.compare(password, user.password);

      // if Password not matches
      if (!passwordMatch) {
        console.log("Invalid Username or Password");
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      console.log("Error in Authentication of User");
      return done(err);
    }
  }
);

module.exports = localStrategy;
