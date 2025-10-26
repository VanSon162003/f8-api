const express = require("express");
const router = express.Router();
const authController = require("@/controller/admin/auth.controller");
const validate = require("@/middlewares/validate");
const authValidator = require("@/validator/admin/auth.validator");

router.post("/login", validate(authValidator.login), authController.login);

module.exports = router;
