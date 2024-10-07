const express = require("express");
const passport = require("passport");
const AuthController = require("../controllers/AuthController");
const authRoutes = express.Router();
const authController = new AuthController();

authRoutes.post("/auth/signup", authController.signUp);

authRoutes.post("/auth/login", authController.login);

authRoutes.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.loginGoogle
);

authRoutes.get("/auth/apple", passport.authenticate("apple"));

authRoutes.post("/auth/apple/callback", authController.loginApple);

authRoutes.get("/auth/send/email", authController.sendVerificationEmail);
authRoutes.get("/auth/verify/email", authController.verifyEmail);

authRoutes.post("/auth/send/phone", authController.sendVerificationPhone)
authRoutes.post("/auth/verify/phone", authController.verifyPhone)

module.exports = authRoutes;
