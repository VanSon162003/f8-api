const express = require("express");
const router = express.Router();

// Controller
const usersController = require("@/controller/admin/users.controller");

// Middleware
const checkAuthAdmin = require("@/middlewares/admin/checkAuthAdmin");
//validator

// Routes
router.get("/", checkAuthAdmin, usersController.getAll);
router.patch("/:id", checkAuthAdmin, usersController.updateUser);

module.exports = router;
