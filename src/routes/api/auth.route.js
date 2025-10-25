const express = require("express");
const router = express.Router();

// Controller
const authController = require("../../controller/api/auth.controller");

// Middleware
const checkAuth = require("../../middlewares/checkAuth");
const checkAuth0 = require("../../middlewares/checkAuth0");
const upload = require("../../middlewares/upload");

//validator
const {
    registerValidate,
    loginValidate,
} = require("../../validator/auth.validator");
const { changePasswordValidate } = require("../../validator/auth.validator");

// Routes
router.get("/me", checkAuth, authController.getMe);
router.post("/register", registerValidate, authController.register);
router.post("/login", loginValidate, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/refresh-token", authController.refreshToken);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-email", authController.resendEmail);

// Update current user (accepts multipart/form-data with optional image + fields)
router.put(
    "/update",
    checkAuth,
    upload.single("image"),
    authController.updateUser
);

// Change password (only allowed for non-Facebook/Github social accounts or gmail)
router.put(
    "/change-password",
    checkAuth,
    changePasswordValidate,
    authController.changePassword
);

// Two-factor auth (TOTP) endpoints
router.get("/2fa/setup", checkAuth, authController.twoFactorSetup);
router.post("/2fa/verify", checkAuth, authController.twoFactorVerify);
router.post("/2fa/disable", checkAuth, authController.twoFactorDisable);

router.post("/protected", checkAuth0, authController.authenticateAuth0);
router.get("/:username", authController.getUserProfile);
router.post("/login/2fa", authController.login2fa);
// Follow / Unfollow
router.post("/:username/follow", checkAuth, authController.followUser);
router.delete("/:username/follow", checkAuth, authController.unfollowUser);

module.exports = router;
