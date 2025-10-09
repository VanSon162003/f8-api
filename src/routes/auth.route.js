const express = require("express");
const router = express.Router();

// Controller
const authController = require("../controller/auth.controller");

// Middleware
const checkAuth = require("../middlewares/checkAuth");

//validator
const {
    registerValidate,
    loginValidate,
} = require("../validator/auth.validator");

// Routes
router.get("/me", checkAuth, authController.getMe);
router.post("/register", registerValidate, authController.register);
router.post("/login", loginValidate, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/refresh-token", authController.refreshToken);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-email", authController.resendEmail);

module.exports = router;
