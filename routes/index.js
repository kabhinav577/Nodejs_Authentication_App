const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/usersController");

router.get("/", userController.signIn);
router.get("/sign-up", userController.signUp);
router.get("/home", userController.home);
router.post("/create", userController.create);
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/" }),
  userController.createSession
);
router.get("/destroy-session", userController.destroySession);
router.get("/reset-password", userController.resetPassword);
router.post(
  "/update-password",
  passport.authenticate("local", { failureRedirect: "back" }),
  userController.updatePassword
);

// Define routes for Google authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//callback from google
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  userController.createSession
);

module.exports = router;
