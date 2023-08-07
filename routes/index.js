const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/usersController");

router.get("/", userController.signIn);
router.get("/sign-up", userController.signUp);
router.get("/home", userController.home);
router.post("/create", userController.create);

// Create Session and Destroy Session
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/" }),
  userController.createSession
);
router.get("/destroy-session", userController.destroySession);

// Update password when user is already login
router.get("/reset-password", userController.resetPassword);
router.post(
  "/update-password",
  passport.authenticate("local", { failureRedirect: "back" }),
  userController.updatePassword
);

// For Forgot Password Routes
router.get("/forgot-page", userController.forgotPage);
router.post("/forgot-password", userController.forgotPassword);
router.get("/reset-password/:id/:token", userController.forgotResetPassword);
router.post(
  "/reset-password/:id/:token",
  userController.forgotResetPasswordPost
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
