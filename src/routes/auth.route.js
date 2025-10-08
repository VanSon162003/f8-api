const express = require("express");
const router = express.Router();

// Controller
const authController = require("../controller/auth.controller");

// Middleware
const checkAuth = require("../middlewares/checkAuth");

//validator
const { registerValidate } = require("../validator/auth.validator");

// Routes
router.get("/me", checkAuth, authController.getMe);
router.post("/register", registerValidate, authController.register);

module.exports = router;
